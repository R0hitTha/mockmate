import { prisma } from "@/lib/prisma";
import {
  CUET_EXAM_YEARS,
  CUET_SUBJECT_CATEGORIES,
  CUET_SUBJECTS_CATALOG,
} from "./syllabus-data";

export interface SubjectListItem {
  id: string;
  code: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  examYears: number[];
  hasVerifiedSyllabus: boolean;
  syllabusStatus: "PUBLISHED" | "UNVERIFIED" | "IN_PROGRESS";
  totalUnits: number;
  totalTopics: number;
  isSelected?: boolean;
}

export interface DetailedSubject extends SubjectListItem {
  syllabus?: {
    version: string;
    status: string;
    sourceDocument: string;
    sourceUrl: string;
    verifiedAt: string;
    units: {
      id: string;
      unitNumber: number;
      title: string;
      description?: string;
      topics: {
        id: string;
        order: number;
        title: string;
        subtopics: {
          id: string;
          order: number;
          title: string;
        }[];
      }[];
    }[];
  };
}

/**
 * Ensures initial database seed for CUET exam years, categories, subjects, and syllabi.
 * Runs idempotently: if records exist, does not duplicate.
 */
export async function seedSyllabusDatabase() {
  try {
    // 1. Seed Exam Years
    for (const year of CUET_EXAM_YEARS) {
      await prisma.examYear.upsert({
        where: { year },
        update: { status: "ACTIVE" },
        create: {
          year,
          name: `CUET UG ${year}`,
          isDefault: year === 2026,
          status: "ACTIVE",
        },
      });
    }

    // 2. Seed Categories
    for (const cat of CUET_SUBJECT_CATEGORIES) {
      await prisma.subjectCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: {
          name: cat.name,
          slug: cat.slug,
          code: cat.slug.toUpperCase().replace(/-/g, "_"),
          description: cat.description,
        },
      });
    }

    // Fetch categories and years for foreign keys
    const categories = await prisma.subjectCategory.findMany();
    const catMap = new Map(categories.map((c) => [c.slug, c.id]));

    const examYearRecords = await prisma.examYear.findMany();
    const yearMap = new Map(examYearRecords.map((y) => [y.year, y.id]));

    // 3. Seed Subjects & Syllabi
    for (const item of CUET_SUBJECTS_CATALOG) {
      const categoryId = catMap.get(item.categorySlug);
      if (!categoryId) continue;

      const subject = await prisma.subject.upsert({
        where: { slug: item.slug },
        update: {
          code: item.code,
          name: item.name,
          description: item.description,
          categoryId,
          status: "ACTIVE",
        },
        create: {
          code: item.code,
          name: item.name,
          slug: item.slug,
          description: item.description,
          categoryId,
          status: "ACTIVE",
        },
      });

      // 4. Seed Syllabus if available
      if (item.syllabus) {
        const syl = item.syllabus;
        const year2026Id = yearMap.get(2026);
        if (!year2026Id) continue;

        // Check if syllabus version exists
        let version = await prisma.syllabusVersion.findFirst({
          where: {
            subjectId: subject.id,
            examYearId: year2026Id,
            version: syl.version,
          },
        });

        if (!version) {
          version = await prisma.syllabusVersion.create({
            data: {
              subjectId: subject.id,
              examYearId: year2026Id,
              version: syl.version,
              status: syl.status,
              sourceName: syl.sourceDocument,
              sourceUrl: syl.sourceUrl,
              verifiedAt: new Date(syl.verifiedAt),
            },
          });

          // Create units, topics, subtopics
          for (const u of syl.units) {
            const unit = await prisma.syllabusUnit.create({
              data: {
                syllabusVersionId: version.id,
                unitNumber: u.unitNumber,
                title: u.title,
                description: u.description || null,
              },
            });

            for (const t of u.topics) {
              const topic = await prisma.syllabusTopic.create({
                data: {
                  unitId: unit.id,
                  order: t.order,
                  title: t.title,
                },
              });

              for (const st of t.subtopics) {
                await prisma.syllabusSubtopic.create({
                  data: {
                    topicId: topic.id,
                    order: st.order,
                    title: st.title,
                  },
                });
              }
            }
          }
        }
      }
    }
  } catch (error) {
    // Non-fatal error during runtime if DB is offline; log warning
    console.warn("[seedSyllabusDatabase] Database unavailable or skipped:", error instanceof Error ? error.message : error);
  }
}

/**
 * Get available CUET exam years
 */
export async function getExamYears() {
  try {
    const years = await prisma.examYear.findMany({
      where: { status: "ACTIVE" },
      orderBy: { year: "asc" },
    });
    if (years.length > 0) {
      return years.map((y) => ({
        id: y.id,
        year: y.year,
        label: y.name,
        isDefault: y.isDefault,
      }));
    }
  } catch {
    // DB fallback
  }

  return CUET_EXAM_YEARS.map((year) => ({
    id: `year-${year}`,
    year,
    label: `CUET UG ${year}`,
    isDefault: year === 2026,
  }));
}

/**
 * Get all subject categories
 */
export async function getSubjectCategories() {
  try {
    const categories = await prisma.subjectCategory.findMany({
      orderBy: { order: "asc" },
    });
    if (categories.length > 0) {
      return categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
      }));
    }
  } catch {
    // DB fallback
  }

  return CUET_SUBJECT_CATEGORIES.map((cat, idx) => ({
    id: `cat-${idx + 1}`,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
  }));
}

/**
 * Get list of subjects filtered by exam year, category, search, and student enrollment
 */
export async function getSubjects(options: {
  year?: number;
  categorySlug?: string;
  search?: string;
  studentProfileId?: string;
} = {}): Promise<SubjectListItem[]> {
  const targetYear = options.year || 2026;
  const enrolledSubjectIds = new Set<string>();

  // Fetch student selections if profile provided
  if (options.studentProfileId) {
    try {
      const studentSubjects = await prisma.studentSubject.findMany({
        where: {
          studentProfileId: options.studentProfileId,
          examYear: { year: targetYear },
        },
        select: { subjectId: true, subject: { select: { slug: true } } },
      });
      studentSubjects.forEach((s) => {
        enrolledSubjectIds.add(s.subjectId);
        enrolledSubjectIds.add(s.subject.slug);
      });
    } catch {
      // Fallback
    }
  }

  try {
    // Attempt DB query
    const dbSubjects = await prisma.subject.findMany({
      where: {
        status: "ACTIVE",
        ...(options.categorySlug && options.categorySlug !== "all"
          ? { category: { slug: options.categorySlug } }
          : {}),
        ...(options.search
          ? {
              OR: [
                { name: { contains: options.search, mode: "insensitive" } },
                { code: { contains: options.search, mode: "insensitive" } },
                { slug: { contains: options.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        syllabusVersions: {
          where: {
            status: "PUBLISHED",
            examYear: { year: targetYear },
          },
          include: {
            units: {
              include: {
                topics: true,
              },
            },
          },
        },
      },
      orderBy: [{ categoryId: "asc" }, { code: "asc" }],
    });

    if (dbSubjects.length > 0) {
      return dbSubjects.map((sub) => {
        const publishedSyllabus = sub.syllabusVersions[0];
        const totalUnits = publishedSyllabus?.units.length ?? 0;
        const totalTopics =
          publishedSyllabus?.units.reduce((acc, u) => acc + u.topics.length, 0) ?? 0;
        const isSelected = enrolledSubjectIds.has(sub.id) || enrolledSubjectIds.has(sub.slug);

        return {
          id: sub.id,
          code: sub.code,
          name: sub.name,
          slug: sub.slug,
          categorySlug: sub.category.slug,
          categoryName: sub.category.name,
          description: sub.description || "",
          examYears: [2026, 2027],
          hasVerifiedSyllabus: Boolean(publishedSyllabus),
          syllabusStatus: publishedSyllabus ? "PUBLISHED" : "UNVERIFIED",
          totalUnits,
          totalTopics,
          isSelected,
        };
      });
    }
  } catch {
    // If DB query fails, seamlessly fall through to built-in in-memory catalog
  }

  // Fallback to built-in verified catalog
  let filtered = CUET_SUBJECTS_CATALOG.filter((item) => item.examYears.includes(targetYear));

  if (options.categorySlug && options.categorySlug !== "all") {
    filtered = filtered.filter((item) => item.categorySlug === options.categorySlug);
  }

  if (options.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
    );
  }

  return filtered.map((item) => {
    const hasSyllabus = Boolean(item.syllabus && item.syllabus.status === "PUBLISHED");
    const totalUnits = item.syllabus?.units.length ?? 0;
    const totalTopics =
      item.syllabus?.units.reduce((acc, u) => acc + u.topics.length, 0) ?? 0;

    return {
      id: `sub-${item.code}`,
      code: item.code,
      name: item.name,
      slug: item.slug,
      categorySlug: item.categorySlug,
      categoryName: item.categoryName,
      description: item.description,
      examYears: item.examYears,
      hasVerifiedSyllabus: hasSyllabus,
      syllabusStatus: hasSyllabus ? "PUBLISHED" : "UNVERIFIED",
      totalUnits,
      totalTopics,
      isSelected: enrolledSubjectIds.has(item.slug) || enrolledSubjectIds.has(`sub-${item.code}`),
    };
  });
}

/**
 * Get full subject details with syllabus breakdown by slug and year
 */
export async function getSubjectBySlug(
  slug: string,
  year = 2026,
  studentProfileId?: string
): Promise<DetailedSubject | null> {
  let isSelected = false;

  if (studentProfileId) {
    try {
      const studentSub = await prisma.studentSubject.findFirst({
        where: {
          studentProfileId,
          subject: { slug },
          examYear: { year },
        },
      });
      if (studentSub) {
        isSelected = true;
      }
    } catch {
      // Fallback
    }
  }

  // Try DB first
  try {
    const sub = await prisma.subject.findUnique({
      where: { slug },
      include: {
        category: true,
        syllabusVersions: {
          where: {
            status: "PUBLISHED",
            examYear: { year },
          },
          include: {
            units: {
              orderBy: { unitNumber: "asc" },
              include: {
                topics: {
                  orderBy: { order: "asc" },
                  include: {
                    subtopics: {
                      orderBy: { order: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (sub) {
      const publishedSyl = sub.syllabusVersions[0];
      const totalUnits = publishedSyl?.units.length ?? 0;
      const totalTopics =
        publishedSyl?.units.reduce((acc, u) => acc + u.topics.length, 0) ?? 0;

      return {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        slug: sub.slug,
        categorySlug: sub.category.slug,
        categoryName: sub.category.name,
        description: sub.description || "",
        examYears: [2026, 2027],
        hasVerifiedSyllabus: Boolean(publishedSyl),
        syllabusStatus: publishedSyl ? "PUBLISHED" : "UNVERIFIED",
        totalUnits,
        totalTopics,
        isSelected,
        syllabus: publishedSyl
          ? {
              version: publishedSyl.version,
              status: publishedSyl.status,
              sourceDocument: publishedSyl.sourceName || "Official NTA CUET (UG) Information Bulletin",
              sourceUrl: publishedSyl.sourceUrl || "https://exams.nta.ac.in/CUET-UG/",
              verifiedAt: publishedSyl.verifiedAt?.toISOString() || new Date().toISOString(),
              units: publishedSyl.units.map((u) => ({
                id: u.id,
                unitNumber: u.unitNumber,
                title: u.title,
                description: u.description || undefined,
                topics: u.topics.map((t) => ({
                  id: t.id,
                  order: t.order,
                  title: t.title,
                  subtopics: t.subtopics.map((st) => ({
                    id: st.id,
                    order: st.order,
                    title: st.title,
                  })),
                })),
              })),
            }
          : undefined,
      };
    }
  } catch {
    // DB fallback
  }

  // Fallback to built-in catalog
  const found = CUET_SUBJECTS_CATALOG.find((s) => s.slug === slug);
  if (!found) return null;

  const hasSyllabus = Boolean(found.syllabus && found.syllabus.status === "PUBLISHED");
  const totalUnits = found.syllabus?.units.length ?? 0;
  const totalTopics =
    found.syllabus?.units.reduce((acc, u) => acc + u.topics.length, 0) ?? 0;

  return {
    id: `sub-${found.code}`,
    code: found.code,
    name: found.name,
    slug: found.slug,
    categorySlug: found.categorySlug,
    categoryName: found.categoryName,
    description: found.description,
    examYears: found.examYears,
    hasVerifiedSyllabus: hasSyllabus,
    syllabusStatus: hasSyllabus ? "PUBLISHED" : "UNVERIFIED",
    totalUnits,
    totalTopics,
    isSelected,
    syllabus: found.syllabus
      ? {
          version: found.syllabus.version,
          status: found.syllabus.status,
          sourceDocument: found.syllabus.sourceDocument,
          sourceUrl: found.syllabus.sourceUrl,
          verifiedAt: found.syllabus.verifiedAt,
          units: found.syllabus.units.map((u, uIdx) => ({
            id: `unit-${uIdx + 1}`,
            unitNumber: u.unitNumber,
            title: u.title,
            description: u.description,
            topics: u.topics.map((t, tIdx) => ({
              id: `topic-${uIdx + 1}-${tIdx + 1}`,
              order: t.order,
              title: t.title,
              subtopics: t.subtopics.map((st, stIdx) => ({
                id: `subtopic-${uIdx + 1}-${tIdx + 1}-${stIdx + 1}`,
                order: st.order,
                title: st.title,
              })),
            })),
          })),
        }
      : undefined,
  };
}
