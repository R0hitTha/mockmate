import { prisma } from "@/lib/prisma";
import { SAMPLE_QUESTIONS, SampleQuestion } from "./question-sample-data";

export interface QuestionListItem {
  id: string;
  questionCode: string;
  questionText: string;
  examYear: number;
  subjectName: string;
  subjectCode: string;
  subjectSlug: string;
  unitNumber?: number;
  unitTitle?: string;
  topicTitle?: string;
  questionType: string;
  difficulty: string;
  status: string;
  marks: number;
  negativeMarks: number;
  usageCount: number;
  optionsCount: number;
  correctAnswerPreview?: string;
  hasPassage: boolean;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  authorName?: string;
}

export interface DetailedQuestionRecord extends QuestionListItem {
  explanation?: string;
  passage?: {
    id: string;
    title: string;
    passageText: string;
  };
  options: {
    id: string;
    optionLabel: string;
    optionText: string;
    isCorrect: boolean;
    order: number;
  }[];
  reviews: {
    id: string;
    reviewStatus: string;
    feedback?: string;
    reviewerName?: string;
    reviewedAt: string;
  }[];
  syllabusInfo?: {
    unitNumber: number;
    unitTitle: string;
    topicOrder: number;
    topicTitle: string;
    subtopicTitle?: string;
  };
}

export interface QuestionBankStats {
  total: number;
  published: number;
  draft: number;
  inReview: number;
  approved: number;
  rejected: number;
  archived: number;
  totalPassages: number;
}

/**
 * Idempotently seeds initial benchmark sample questions into the database.
 */
export async function seedQuestionBankDatabase() {
  try {
    const existingCount = await prisma.question.count();
    if (existingCount > 0) return;

    for (const sample of SAMPLE_QUESTIONS) {
      // Find or create exam year
      let examYear = await prisma.examYear.findUnique({
        where: { year: sample.examYear },
      });
      if (!examYear) {
        examYear = await prisma.examYear.create({
          data: {
            year: sample.examYear,
            name: `CUET UG ${sample.examYear}`,
            isDefault: sample.examYear === 2026,
          },
        });
      }

      // Find subject
      const subject = await prisma.subject.findUnique({
        where: { slug: sample.subjectSlug },
        include: {
          syllabusVersions: {
            where: { examYearId: examYear.id, status: "PUBLISHED" },
            include: {
              units: {
                where: { unitNumber: sample.unitNumber },
                include: {
                  topics: {
                    where: { order: sample.topicOrder },
                    include: { subtopics: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!subject) continue;

      const syllabusVersion = subject.syllabusVersions[0];
      const unit = syllabusVersion?.units[0];
      const topic = unit?.topics[0];
      const subtopic = sample.subtopicOrder ? topic?.subtopics[sample.subtopicOrder - 1] : undefined;

      // Handle passage
      let passageId: string | undefined = undefined;
      if (sample.passage) {
        const passage = await prisma.questionPassage.create({
          data: {
            title: sample.passage.title,
            passageText: sample.passage.passageText,
            subjectId: subject.id,
          },
        });
        passageId = passage.id;
      }

      // Create question
      const question = await prisma.question.create({
        data: {
          questionCode: sample.questionCode,
          examYearId: examYear.id,
          subjectId: subject.id,
          syllabusVersionId: syllabusVersion?.id,
          unitId: unit?.id,
          topicId: topic?.id,
          subtopicId: subtopic?.id,
          passageId,
          questionType: sample.questionType,
          questionText: sample.questionText,
          difficulty: sample.difficulty,
          explanation: sample.explanation,
          marks: sample.marks,
          negativeMarks: sample.negativeMarks,
          status: sample.status,
          publishedAt: sample.status === "PUBLISHED" ? new Date() : null,
          options: {
            create: sample.options.map((opt) => ({
              optionLabel: opt.optionLabel,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              order: opt.order,
            })),
          },
        },
      });

      // Handle tags
      for (const tagName of sample.tags) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const tag = await prisma.questionTag.upsert({
          where: { slug },
          update: {},
          create: { name: tagName, slug },
        });

        await prisma.questionTagRelation.create({
          data: {
            questionId: question.id,
            tagId: tag.id,
          },
        });
      }
    }
  } catch (error) {
    console.warn("[seedQuestionBankDatabase] Skipped or offline DB:", error instanceof Error ? error.message : error);
  }
}

/**
 * Retrieve database metrics and counts for the Question Bank admin dashboard
 */
export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  try {
    const [total, published, draft, inReview, approved, rejected, archived, totalPassages] =
      await Promise.all([
        prisma.question.count(),
        prisma.question.count({ where: { status: "PUBLISHED" } }),
        prisma.question.count({ where: { status: "DRAFT" } }),
        prisma.question.count({ where: { status: "IN_REVIEW" } }),
        prisma.question.count({ where: { status: "APPROVED" } }),
        prisma.question.count({ where: { status: "REJECTED" } }),
        prisma.question.count({ where: { status: "ARCHIVED" } }),
        prisma.questionPassage.count(),
      ]);

    if (total > 0) {
      return { total, published, draft, inReview, approved, rejected, archived, totalPassages };
    }
  } catch {
    // Fallback below
  }

  // Fallback to sample dataset
  const total = SAMPLE_QUESTIONS.length;
  const published = SAMPLE_QUESTIONS.filter((q) => q.status === "PUBLISHED").length;
  const inReview = SAMPLE_QUESTIONS.filter((q) => q.status === "IN_REVIEW").length;
  const draft = SAMPLE_QUESTIONS.filter((q) => q.status === "DRAFT").length;
  const totalPassages = SAMPLE_QUESTIONS.filter((q) => Boolean(q.passage)).length;

  return {
    total,
    published,
    draft,
    inReview,
    approved: 0,
    rejected: 0,
    archived: 0,
    totalPassages,
  };
}

/**
 * Get paginated, filtered questions for the question bank admin table
 */
export async function getQuestions(options: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  subjectSlug?: string;
  examYear?: number;
  difficulty?: string;
  questionType?: string;
}): Promise<{
  questions: QuestionListItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 10));
  const skip = (page - 1) * limit;

  try {
    const whereClause: Record<string, unknown> = {
      ...(options.status && options.status !== "ALL" ? { status: options.status } : {}),
      ...(options.difficulty && options.difficulty !== "ALL" ? { difficulty: options.difficulty } : {}),
      ...(options.questionType && options.questionType !== "ALL" ? { questionType: options.questionType } : {}),
      ...(options.examYear ? { examYear: { year: options.examYear } } : {}),
      ...(options.subjectSlug && options.subjectSlug !== "ALL" ? { subject: { slug: options.subjectSlug } } : {}),
      ...(options.search
        ? {
            OR: [
              { questionCode: { contains: options.search, mode: "insensitive" } },
              { questionText: { contains: options.search, mode: "insensitive" } },
              { explanation: { contains: options.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [dbQuestions, total] = await Promise.all([
      prisma.question.findMany({
        where: whereClause,
        include: {
          subject: true,
          examYear: true,
          unit: true,
          topic: true,
          passage: true,
          options: true,
          tags: { include: { tag: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.question.count({ where: whereClause }),
    ]);

    if (dbQuestions.length > 0 || total > 0) {
      const items: QuestionListItem[] = dbQuestions.map((q) => {
        const correctOpt = q.options.find((o) => o.isCorrect);
        return {
          id: q.id,
          questionCode: q.questionCode,
          questionText: q.questionText,
          examYear: q.examYear.year,
          subjectName: q.subject.name,
          subjectCode: q.subject.code,
          subjectSlug: q.subject.slug,
          unitNumber: q.unit?.unitNumber,
          unitTitle: q.unit?.title,
          topicTitle: q.topic?.title,
          questionType: q.questionType,
          difficulty: q.difficulty,
          status: q.status,
          marks: q.marks,
          negativeMarks: q.negativeMarks,
          usageCount: q.usageCount,
          optionsCount: q.options.length,
          correctAnswerPreview: correctOpt ? `${correctOpt.optionLabel}: ${correctOpt.optionText.slice(0, 30)}` : undefined,
          hasPassage: Boolean(q.passage),
          tags: q.tags.map((t) => t.tag.name),
          updatedAt: q.updatedAt.toISOString(),
          createdAt: q.createdAt.toISOString(),
          authorName: q.createdBy?.name || "System Admin",
        };
      });

      return {
        questions: items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }
  } catch {
    // Fallback to sample data
  }

  // Filter sample data
  let filtered = [...SAMPLE_QUESTIONS];

  if (options.status && options.status !== "ALL") {
    filtered = filtered.filter((q) => q.status === options.status);
  }
  if (options.difficulty && options.difficulty !== "ALL") {
    filtered = filtered.filter((q) => q.difficulty === options.difficulty);
  }
  if (options.questionType && options.questionType !== "ALL") {
    filtered = filtered.filter((q) => q.questionType === options.questionType);
  }
  if (options.examYear) {
    filtered = filtered.filter((q) => q.examYear === options.examYear);
  }
  if (options.subjectSlug && options.subjectSlug !== "ALL") {
    filtered = filtered.filter((q) => q.subjectSlug === options.subjectSlug);
  }
  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.questionCode.toLowerCase().includes(q) ||
        item.questionText.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  const items: QuestionListItem[] = paginated.map((q, idx) => {
    const correctOpt = q.options.find((o) => o.isCorrect);
    return {
      id: `sample-${idx + 1}`,
      questionCode: q.questionCode,
      questionText: q.questionText,
      examYear: q.examYear,
      subjectName: q.subjectSlug.toUpperCase(),
      subjectCode: "CUET",
      subjectSlug: q.subjectSlug,
      unitNumber: q.unitNumber,
      unitTitle: `Unit ${q.unitNumber}`,
      topicTitle: `Topic ${q.topicOrder}`,
      questionType: q.questionType,
      difficulty: q.difficulty,
      status: q.status,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      usageCount: 0,
      optionsCount: q.options.length,
      correctAnswerPreview: correctOpt ? `${correctOpt.optionLabel}: ${correctOpt.optionText.slice(0, 30)}` : undefined,
      hasPassage: Boolean(q.passage),
      tags: q.tags,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      authorName: "Content Administrator",
    };
  });

  return {
    questions: items,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Retrieve a detailed question by ID with all options, audit logs, and syllabus hierarchy
 */
export async function getQuestionById(id: string): Promise<DetailedQuestionRecord | null> {
  try {
    const q = await prisma.question.findUnique({
      where: { id },
      include: {
        subject: true,
        examYear: true,
        unit: true,
        topic: true,
        subtopic: true,
        passage: true,
        options: { orderBy: { order: "asc" } },
        tags: { include: { tag: true } },
        reviews: {
          include: { reviewer: { select: { name: true } } },
          orderBy: { reviewedAt: "desc" },
        },
        createdBy: { select: { name: true } },
      },
    });

    if (q) {
      const correctOpt = q.options.find((o) => o.isCorrect);
      return {
        id: q.id,
        questionCode: q.questionCode,
        questionText: q.questionText,
        examYear: q.examYear.year,
        subjectName: q.subject.name,
        subjectCode: q.subject.code,
        subjectSlug: q.subject.slug,
        unitNumber: q.unit?.unitNumber,
        unitTitle: q.unit?.title,
        topicTitle: q.topic?.title,
        questionType: q.questionType,
        difficulty: q.difficulty,
        status: q.status,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        usageCount: q.usageCount,
        optionsCount: q.options.length,
        correctAnswerPreview: correctOpt ? `${correctOpt.optionLabel}: ${correctOpt.optionText.slice(0, 30)}` : undefined,
        hasPassage: Boolean(q.passage),
        tags: q.tags.map((t) => t.tag.name),
        updatedAt: q.updatedAt.toISOString(),
        createdAt: q.createdAt.toISOString(),
        authorName: q.createdBy?.name || "System Admin",
        explanation: q.explanation || undefined,
        passage: q.passage
          ? {
              id: q.passage.id,
              title: q.passage.title,
              passageText: q.passage.passageText,
            }
          : undefined,
        options: q.options.map((opt) => ({
          id: opt.id,
          optionLabel: opt.optionLabel,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          order: opt.order,
        })),
        reviews: q.reviews.map((r) => ({
          id: r.id,
          reviewStatus: r.reviewStatus,
          feedback: r.feedback || undefined,
          reviewerName: r.reviewer?.name || "Anonymous Reviewer",
          reviewedAt: r.reviewedAt.toISOString(),
        })),
        syllabusInfo: {
          unitNumber: q.unit?.unitNumber || 1,
          unitTitle: q.unit?.title || "Syllabus Unit",
          topicOrder: q.topic?.order || 1,
          topicTitle: q.topic?.title || "Topic",
          subtopicTitle: q.subtopic?.title,
        },
      };
    }
  } catch {
    // Fallback
  }

  // Fallback to sample data search
  const found = SAMPLE_QUESTIONS.find((s) => s.questionCode === id || id.includes(s.questionCode));
  if (!found) {
    // return first sample as fallback if sample id passed
    const first = SAMPLE_QUESTIONS[0];
    if (id.startsWith("sample-")) {
      const idx = parseInt(id.replace("sample-", ""), 10) - 1;
      const target = SAMPLE_QUESTIONS[idx] || first;
      return mapSampleToDetailed(target, id);
    }
    return null;
  }

  return mapSampleToDetailed(found, id);
}

function mapSampleToDetailed(s: SampleQuestion, id: string): DetailedQuestionRecord {
  const correctOpt = s.options.find((o) => o.isCorrect);
  return {
    id,
    questionCode: s.questionCode,
    questionText: s.questionText,
    examYear: s.examYear,
    subjectName: s.subjectSlug.toUpperCase(),
    subjectCode: "CUET",
    subjectSlug: s.subjectSlug,
    unitNumber: s.unitNumber,
    unitTitle: `Unit ${s.unitNumber}`,
    topicTitle: `Topic ${s.topicOrder}`,
    questionType: s.questionType,
    difficulty: s.difficulty,
    status: s.status,
    marks: s.marks,
    negativeMarks: s.negativeMarks,
    usageCount: 0,
    optionsCount: s.options.length,
    correctAnswerPreview: correctOpt ? `${correctOpt.optionLabel}: ${correctOpt.optionText.slice(0, 30)}` : undefined,
    hasPassage: Boolean(s.passage),
    tags: s.tags,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    authorName: "Content Administrator",
    explanation: s.explanation,
    passage: s.passage
      ? {
          id: "p-sample",
          title: s.passage.title,
          passageText: s.passage.passageText,
        }
      : undefined,
    options: s.options.map((opt, oIdx) => ({
      id: `opt-${oIdx + 1}`,
      optionLabel: opt.optionLabel,
      optionText: opt.optionText,
      isCorrect: opt.isCorrect,
      order: opt.order,
    })),
    reviews: [
      {
        id: "rev-1",
        reviewStatus: "APPROVED",
        feedback: "Verified against NCERT Class 12 Syllabus and NTA pattern.",
        reviewerName: "Academic Review Team",
        reviewedAt: new Date().toISOString(),
      },
    ],
    syllabusInfo: {
      unitNumber: s.unitNumber,
      unitTitle: `Unit ${s.unitNumber}`,
      topicOrder: s.topicOrder,
      topicTitle: `Topic ${s.topicOrder}`,
      subtopicTitle: s.subtopicOrder ? `Subtopic ${s.subtopicOrder}` : undefined,
    },
  };
}

/**
 * Returns cascaded syllabus hierarchy for the dynamic question creator
 */
export async function getSyllabusCascade(options: {
  examYear?: number;
  subjectSlug?: string;
  unitNumber?: number;
}) {
  const currentYear = options.examYear || 2026;

  // 1. Exam Years
  const examYears = [
    { year: 2026, label: "CUET UG 2026" },
    { year: 2027, label: "CUET UG 2027" },
  ];

  // 2. Fetch Subjects
  const { CUET_SUBJECTS_CATALOG } = await import("./syllabus-data");
  const subjects = CUET_SUBJECTS_CATALOG.filter((s) => s.examYears.includes(currentYear)).map((s) => ({
    slug: s.slug,
    name: s.name,
    code: s.code,
    categoryName: s.categoryName,
    hasSyllabus: Boolean(s.syllabus && s.syllabus.status === "PUBLISHED"),
  }));

  // 3. Fetch Units for selected subject
  let units: { unitNumber: number; title: string; description?: string }[] = [];
  let topics: { order: number; title: string }[] = [];
  const subtopics: { order: number; title: string }[] = [];

  const selectedSubject = CUET_SUBJECTS_CATALOG.find((s) => s.slug === options.subjectSlug);
  if (selectedSubject?.syllabus) {
    units = selectedSubject.syllabus.units.map((u) => ({
      unitNumber: u.unitNumber,
      title: u.title,
      description: u.description,
    }));

    if (options.unitNumber) {
      const selectedUnit = selectedSubject.syllabus.units.find((u) => u.unitNumber === options.unitNumber);
      if (selectedUnit) {
        topics = selectedUnit.topics.map((t) => ({
          order: t.order,
          title: t.title,
        }));
      }
    }
  }

  return {
    examYears,
    subjects,
    units,
    topics,
    subtopics,
  };
}
