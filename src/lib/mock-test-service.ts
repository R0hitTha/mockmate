import prisma from "@/lib/prisma";
import { SAMPLE_MOCK_TESTS } from "./mock-test-sample-data";

export interface MockTestFilterOptions {
  search?: string;
  status?: string;
  testType?: string;
  difficulty?: string;
  examYear?: number;
  page?: number;
  pageSize?: number;
}

export interface MockTestStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  archived: number;
  totalAttempts: number;
}

/**
 * Retrieves aggregate summary metrics for the Mock Test Library.
 */
export async function getMockTestStats(): Promise<MockTestStats> {
  try {
    const [total, published, draft, inReview, archived, attemptsAggregate] =
      await Promise.all([
        prisma.mockTest.count(),
        prisma.mockTest.count({ where: { status: "PUBLISHED" } }),
        prisma.mockTest.count({ where: { status: "DRAFT" } }),
        prisma.mockTest.count({ where: { status: "IN_REVIEW" } }),
        prisma.mockTest.count({ where: { status: "ARCHIVED" } }),
        prisma.mockTest.aggregate({
          _sum: {
            attemptsCount: true,
          },
        }),
      ]);

    if (total > 0) {
      return {
        total,
        published,
        draft,
        inReview,
        archived,
        totalAttempts: attemptsAggregate._sum.attemptsCount || 0,
      };
    }
  } catch (error) {
    console.warn("Prisma error in getMockTestStats, falling back to sample dataset:", error);
  }

  // Sample data fallback
  const tests = SAMPLE_MOCK_TESTS;
  return {
    total: tests.length,
    published: tests.filter((t) => t.status === "PUBLISHED").length,
    draft: tests.filter((t) => t.status === "DRAFT").length,
    inReview: tests.filter((t) => t.status === "IN_REVIEW").length,
    archived: tests.filter((t) => t.status === "ARCHIVED").length,
    totalAttempts: tests.reduce((acc, t) => acc + t.attemptsCount, 0),
  };
}

/**
 * Administrative Mock Test search and filter query.
 */
export async function getAdminMockTests(options: MockTestFilterOptions = {}) {
  const {
    search = "",
    status,
    testType,
    difficulty,
    examYear,
    page = 1,
    pageSize = 10,
  } = options;

  try {
    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (testType && testType !== "ALL") {
      where.testType = testType;
    }
    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }
    if (examYear) {
      where.examYear = { year: examYear };
    }
    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { testCode: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [total, dbTests] = await Promise.all([
      prisma.mockTest.count({ where }),
      prisma.mockTest.findMany({
        where,
        include: {
          examYear: true,
          sections: {
            include: {
              subject: true,
              _count: {
                select: { questions: true },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    if (total > 0 || dbTests.length > 0) {
      return {
        tests: dbTests.map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          testCode: t.testCode,
          description: t.description,
          examYear: t.examYear.year,
          testType: t.testType,
          status: t.status,
          difficulty: t.difficulty,
          instructions: t.instructions,
          totalDuration: t.totalDuration,
          totalMarks: t.totalMarks,
          totalQuestions: t.totalQuestions,
          questionsToAttempt: t.sections.reduce((acc, s) => acc + s.questionsToAttempt, 0) || t.totalQuestions,
          isOfficialPattern: t.isOfficialPattern,
          attemptsCount: t.attemptsCount,
          publishedAt: t.publishedAt?.toISOString() || null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          sectionsCount: t.sections.length,
          subjects: Array.from(new Set(t.sections.map((s) => s.subject.name))),
          sections: t.sections.map((s) => ({
            id: s.id,
            title: s.title,
            subjectCode: s.subject.code,
            subjectName: s.subject.name,
            sectionType: s.sectionType as "COMPULSORY" | "OPTIONAL",
            description: s.description || undefined,
            order: s.order,
            duration: s.duration || undefined,
            totalMarks: s.totalMarks,
            totalQuestions: s.totalQuestions,
            questionsToAttempt: s.questionsToAttempt,
            questionCodes: [],
          })),
        })),
        total,
        page,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }
  } catch (error) {
    console.warn("Prisma query failed in getAdminMockTests, falling back to sample dataset:", error);
  }

  // Sample data fallback with filtering
  let filtered = [...SAMPLE_MOCK_TESTS];

  if (status && status !== "ALL") {
    filtered = filtered.filter((t) => t.status === status);
  }
  if (testType && testType !== "ALL") {
    filtered = filtered.filter((t) => t.testType === testType);
  }
  if (difficulty && difficulty !== "ALL") {
    filtered = filtered.filter((t) => t.difficulty === difficulty);
  }
  if (examYear) {
    filtered = filtered.filter((t) => t.examYear === examYear);
  }
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.testCode.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    tests: paginated.map((t) => ({
      ...t,
      sectionsCount: t.sections.length,
      subjects: Array.from(new Set(t.sections.map((s) => s.subjectName))),
    })),
    total,
    page,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Student-facing Mock Test Library query.
 * STRICT SECURITY: Only returns PUBLISHED tests, never leaks answer keys or question details.
 */
export async function getStudentMockTests(options: Omit<MockTestFilterOptions, "status"> = {}) {
  const {
    search = "",
    testType,
    difficulty,
    examYear,
    page = 1,
    pageSize = 12,
  } = options;

  try {
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (testType && testType !== "ALL") {
      where.testType = testType;
    }
    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }
    if (examYear) {
      where.examYear = { year: examYear };
    }
    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { testCode: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [total, dbTests] = await Promise.all([
      prisma.mockTest.count({ where }),
      prisma.mockTest.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          testCode: true,
          description: true,
          testType: true,
          difficulty: true,
          totalDuration: true,
          totalMarks: true,
          totalQuestions: true,
          isOfficialPattern: true,
          attemptsCount: true,
          publishedAt: true,
          examYear: {
            select: { year: true },
          },
          sections: {
            select: {
              id: true,
              title: true,
              totalQuestions: true,
              questionsToAttempt: true,
              totalMarks: true,
              subject: {
                select: { id: true, name: true, code: true, slug: true },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    if (total > 0 || dbTests.length > 0) {
      return {
        tests: dbTests.map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          testCode: t.testCode,
          description: t.description,
          examYear: t.examYear.year,
          testType: t.testType,
          difficulty: t.difficulty,
          totalDuration: t.totalDuration,
          totalMarks: t.totalMarks,
          totalQuestions: t.totalQuestions,
          questionsToAttempt: t.sections.reduce((acc, s) => acc + s.questionsToAttempt, 0) || t.totalQuestions,
          isOfficialPattern: t.isOfficialPattern,
          attemptsCount: t.attemptsCount,
          publishedAt: t.publishedAt?.toISOString() || null,
          subjects: Array.from(new Set(t.sections.map((s) => s.subject.name))),
          sectionsCount: t.sections.length,
          sections: t.sections.map((s) => ({
            id: s.id,
            title: s.title,
            subjectName: s.subject.name,
            subjectCode: s.subject.code,
            totalQuestions: s.totalQuestions,
            questionsToAttempt: s.questionsToAttempt,
            totalMarks: s.totalMarks,
          })),
        })),
        total,
        page,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }
  } catch (error) {
    console.warn("Prisma query failed in getStudentMockTests, falling back to sample dataset:", error);
  }

  // Fallback to sample dataset
  let published = SAMPLE_MOCK_TESTS.filter((t) => t.status === "PUBLISHED");

  if (testType && testType !== "ALL") {
    published = published.filter((t) => t.testType === testType);
  }
  if (difficulty && difficulty !== "ALL") {
    published = published.filter((t) => t.difficulty === difficulty);
  }
  if (examYear) {
    published = published.filter((t) => t.examYear === examYear);
  }
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    published = published.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.testCode.toLowerCase().includes(q)
    );
  }

  const total = published.length;
  const paginated = published.slice((page - 1) * pageSize, page * pageSize);

  return {
    tests: paginated.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      testCode: t.testCode,
      description: t.description,
      examYear: t.examYear,
      testType: t.testType,
      difficulty: t.difficulty,
      totalDuration: t.totalDuration,
      totalMarks: t.totalMarks,
      totalQuestions: t.totalQuestions,
      questionsToAttempt: t.questionsToAttempt,
      isOfficialPattern: t.isOfficialPattern,
      attemptsCount: t.attemptsCount,
      publishedAt: t.publishedAt,
      subjects: Array.from(new Set(t.sections.map((s) => s.subjectName))),
      sectionsCount: t.sections.length,
      sections: t.sections.map((s) => ({
        id: s.id,
        title: s.title,
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        totalQuestions: s.totalQuestions,
        questionsToAttempt: s.questionsToAttempt,
        totalMarks: s.totalMarks,
      })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Loads a single mock test by ID or slug.
 * If isStudent is true, security sanitization is applied (removes isCorrect, explanation, and reviewer notes).
 */
export async function getMockTestById(idOrSlug: string, isStudent: boolean = false) {
  try {
    const dbTest = await prisma.mockTest.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }, { testCode: idOrSlug }],
      },
      include: {
        examYear: true,
        createdBy: {
          select: { name: true, email: true },
        },
        sections: {
          include: {
            subject: true,
            questions: {
              include: {
                question: {
                  include: {
                    options: true,
                    passage: true,
                  },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (dbTest) {
      // If student requests an unverified/draft test, deny
      if (isStudent && dbTest.status !== "PUBLISHED") {
        return null;
      }

      return {
        id: dbTest.id,
        title: dbTest.title,
        slug: dbTest.slug,
        testCode: dbTest.testCode,
        description: dbTest.description,
        examYear: dbTest.examYear.year,
        examYearId: dbTest.examYearId,
        testType: dbTest.testType,
        status: dbTest.status,
        difficulty: dbTest.difficulty,
        instructions: dbTest.instructions,
        totalDuration: dbTest.totalDuration,
        totalMarks: dbTest.totalMarks,
        totalQuestions: dbTest.totalQuestions,
        questionsToAttempt:
          dbTest.sections.reduce((acc, s) => acc + s.questionsToAttempt, 0) || dbTest.totalQuestions,
        isOfficialPattern: dbTest.isOfficialPattern,
        attemptsCount: dbTest.attemptsCount,
        publishedAt: dbTest.publishedAt?.toISOString() || null,
        createdAt: dbTest.createdAt.toISOString(),
        updatedAt: dbTest.updatedAt.toISOString(),
        creatorName: dbTest.createdBy?.name || "System Admin",
        sections: dbTest.sections.map((section) => ({
          id: section.id,
          title: section.title,
          subjectId: section.subjectId,
          subjectName: section.subject.name,
          subjectCode: section.subject.code,
          sectionType: section.sectionType,
          description: section.description,
          order: section.order,
          duration: section.duration,
          totalMarks: section.totalMarks,
          totalQuestions: section.totalQuestions,
          questionsToAttempt: section.questionsToAttempt,
          questions: section.questions.map((mq) => {
            const q = mq.question;
            return {
              id: q.id,
              mockQuestionId: mq.id,
              questionCode: q.questionCode,
              questionNumber: mq.questionNumber,
              order: mq.order,
              marks: mq.marks,
              negativeMarks: mq.negativeMarks,
              questionType: q.questionType,
              questionText: q.questionText,
              passage: q.passage ? { title: q.passage.title, passageText: q.passage.passageText } : null,
              // SANITIZATION FOR STUDENTS:
              explanation: isStudent ? null : q.explanation,
              options: q.options
                .map((opt) => ({
                  id: opt.id,
                  optionLabel: opt.optionLabel,
                  optionText: opt.optionText,
                  order: opt.order,
                  // SANITIZATION FOR STUDENTS: never leak isCorrect
                  isCorrect: isStudent ? undefined : opt.isCorrect,
                }))
                .sort((a, b) => a.order - b.order),
            };
          }),
        })),
      };
    }
  } catch (error) {
    console.warn("Prisma error in getMockTestById, falling back to sample dataset:", error);
  }

  // Fallback to sample dataset
  const sample = SAMPLE_MOCK_TESTS.find(
    (t) => t.id === idOrSlug || t.slug === idOrSlug || t.testCode === idOrSlug
  );

  if (!sample) return null;
  if (isStudent && sample.status !== "PUBLISHED") return null;

  return {
    ...sample,
    examYearId: "sample-exam-year-id",
    creatorName: "MockMate Academic Editorial Team",
    sections: sample.sections.map((s) => ({
      ...s,
      subjectId: "sample-subject-id",
      questions: s.questionCodes.map((code, idx) => ({
        id: `mock-q-${code}`,
        mockQuestionId: `mq-link-${code}`,
        questionCode: code,
        questionNumber: idx + 1,
        order: idx + 1,
        marks: 5.0,
        negativeMarks: 1.0,
        questionType: "MCQ_SINGLE",
        questionText: `Sample question representation for ${code}`,
        passage: null,
        explanation: isStudent ? null : "Sample detailed step-by-step explanation.",
        options: [
          { id: "opt-1", optionLabel: "A", optionText: "Option A", isCorrect: isStudent ? undefined : true, order: 1 },
          { id: "opt-2", optionLabel: "B", optionText: "Option B", isCorrect: isStudent ? undefined : false, order: 2 },
          { id: "opt-3", optionLabel: "C", optionText: "Option C", isCorrect: isStudent ? undefined : false, order: 3 },
          { id: "opt-4", optionLabel: "D", optionText: "Option D", isCorrect: isStudent ? undefined : false, order: 4 },
        ],
      })),
    })),
  };
}

/**
 * Searches published questions available in the question bank for adding to a mock test section.
 */
export async function getAvailableQuestionsForTestBuilder(options: {
  subjectId?: string;
  examYearId?: string;
  search?: string;
  difficulty?: string;
  questionType?: string;
  excludedQuestionIds?: string[];
  limit?: number;
}) {
  const {
    subjectId,
    examYearId,
    search = "",
    difficulty,
    questionType,
    excludedQuestionIds = [],
    limit = 30,
  } = options;

  try {
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (examYearId) {
      where.examYearId = examYearId;
    }
    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }
    if (questionType && questionType !== "ALL") {
      where.questionType = questionType;
    }
    if (excludedQuestionIds.length > 0) {
      where.id = { notIn: excludedQuestionIds };
    }
    if (search.trim()) {
      where.OR = [
        { questionCode: { contains: search.trim(), mode: "insensitive" } },
        { questionText: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        questionCode: true,
        questionType: true,
        difficulty: true,
        questionText: true,
        marks: true,
        negativeMarks: true,
        subject: { select: { id: true, name: true, code: true } },
        unit: { select: { unitNumber: true, title: true } },
        topic: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (questions.length > 0) {
      return questions.map((q) => ({
        id: q.id,
        questionCode: q.questionCode,
        questionType: q.questionType,
        difficulty: q.difficulty,
        questionText: q.questionText,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        subjectName: q.subject.name,
        subjectCode: q.subject.code,
        unitTitle: q.unit ? `Unit ${q.unit.unitNumber}: ${q.unit.title}` : null,
        topicTitle: q.topic?.title || null,
      }));
    }
  } catch (error) {
    console.warn("Prisma error in getAvailableQuestionsForTestBuilder:", error);
  }

  // Fallback sample questions from question bank
  return [
    {
      id: "sample-q-phy-1",
      questionCode: "Q-PHY-2026-001",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      questionText: "Two point charges +3μC and +8μC repel each other with a force of 40 N...",
      marks: 5.0,
      negativeMarks: 1.0,
      subjectName: "Physics",
      subjectCode: "314",
      unitTitle: "Unit 1: Electrostatics",
      topicTitle: "Electric Charges and Fields",
    },
    {
      id: "sample-q-che-2",
      questionCode: "Q-CHE-2026-002",
      questionType: "ASSERTION_REASON",
      difficulty: "MEDIUM",
      questionText: "Assertion: Boiling point elevation is a colligative property...",
      marks: 5.0,
      negativeMarks: 1.0,
      subjectName: "Chemistry",
      subjectCode: "306",
      unitTitle: "Unit 1: Solutions",
      topicTitle: "Colligative Properties",
    },
    {
      id: "sample-q-mat-3",
      questionCode: "Q-MAT-2026-003",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      questionText: "If A is an invertible square matrix of order 3, what is |adj(A)|...",
      marks: 5.0,
      negativeMarks: 1.0,
      subjectName: "Mathematics",
      subjectCode: "319",
      unitTitle: "Unit 2: Matrices and Determinants",
      topicTitle: "Inverses & Adjoints",
    },
    {
      id: "sample-q-gen-5",
      questionCode: "Q-GEN-2026-005",
      questionType: "MCQ_SINGLE",
      difficulty: "EASY",
      questionText: "Identify the missing number in the numerical series: 3, 7, 15, 31, 63, ?",
      marks: 5.0,
      negativeMarks: 1.0,
      subjectName: "General Test",
      subjectCode: "501",
      unitTitle: "Unit 2: General Mental Ability",
      topicTitle: "Number Series",
    },
  ];
}
