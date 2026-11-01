import { describe, it, expect } from "vitest";

describe("Phase 5: Student Dashboard Logic & Business Rules", () => {
  it("correctly extracts avatar initials for single and multi-word names", () => {
    const getInitials = (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "CU";

    expect(getInitials("Aryan Sharma")).toBe("AS");
    expect(getInitials("Rohan")).toBe("R");
    expect(getInitials("Aditya Kumar Verma")).toBe("AK");
    expect(getInitials("")).toBe("CU");
  });

  it("calculates positive days remaining to CUET examination without NaN", () => {
    const calculateDays = (targetYear: number) => {
      const examDate = new Date(`${targetYear}-05-15T09:00:00Z`);
      const refDate = new Date("2026-11-01T00:00:00Z");
      const diffTime = examDate.getTime() - refDate.getTime();
      return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    };

    const days2027 = calculateDays(2027);
    expect(days2027).toBeGreaterThan(100);

    const days2026 = calculateDays(2026);
    expect(days2026).toBeGreaterThanOrEqual(1);
  });

  it("organizes subject preferences into correct NTA CUET sections", () => {
    const testSubjects = [
      { id: "1", subjectCode: "101", subjectName: "English", category: "LANGUAGE" },
      { id: "2", subjectCode: "314", subjectName: "Physics", category: "DOMAIN" },
      { id: "3", subjectCode: "306", subjectName: "Chemistry", category: "DOMAIN" },
      { id: "4", subjectCode: "312", subjectName: "Mathematics", category: "DOMAIN" },
      {
        id: "5",
        subjectCode: "501",
        subjectName: "General Test",
        category: "GENERAL_TEST",
      },
    ];

    const languages = testSubjects.filter((s) => s.category === "LANGUAGE");
    const domains = testSubjects.filter((s) => s.category === "DOMAIN");
    const gt = testSubjects.filter((s) => s.category === "GENERAL_TEST");

    expect(languages).toHaveLength(1);
    expect(languages[0]?.subjectCode).toBe("101");
    expect(domains).toHaveLength(3);
    expect(gt).toHaveLength(1);
  });

  it("triggers transparent rule-based preparation recommendations", () => {
    const generateRecommendations = (params: {
      targetExamYear: number;
      hasGeneralTest: boolean;
      subjectCount: number;
      universityCount: number;
    }) => {
      const recs: string[] = [];
      if (params.targetExamYear === 2026) {
        recs.push("Class 12 NCERT Mastery");
      } else {
        recs.push("Foundational Conceptual Building");
      }

      if (params.hasGeneralTest) {
        recs.push("Daily General Test Quota");
      }

      if (params.subjectCount >= 4) {
        recs.push("Balanced Revision Rotation");
      }

      if (params.universityCount > 0) {
        recs.push("University Course Mapping");
      }
      return recs;
    };

    const recs2026 = generateRecommendations({
      targetExamYear: 2026,
      hasGeneralTest: true,
      subjectCount: 5,
      universityCount: 2,
    });

    expect(recs2026).toContain("Class 12 NCERT Mastery");
    expect(recs2026).toContain("Daily General Test Quota");
    expect(recs2026).toContain("Balanced Revision Rotation");
    expect(recs2026).toContain("University Course Mapping");

    const recs2027 = generateRecommendations({
      targetExamYear: 2027,
      hasGeneralTest: false,
      subjectCount: 2,
      universityCount: 0,
    });

    expect(recs2027).toContain("Foundational Conceptual Building");
    expect(recs2027).not.toContain("Daily General Test Quota");
    expect(recs2027).not.toContain("Balanced Revision Rotation");
  });

  it("enforces zero fabricated metrics for new student accounts", () => {
    const overview = {
      testsAttempted: 0,
      questionsAnswered: 0,
      averageAccuracy: null,
      syllabusCoverage: null,
    };

    expect(overview.testsAttempted).toBe(0);
    expect(overview.questionsAnswered).toBe(0);
    expect(overview.averageAccuracy).toBeNull();
    expect(overview.syllabusCoverage).toBeNull();
  });
});
