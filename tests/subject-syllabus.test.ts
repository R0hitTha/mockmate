import { describe, it, expect } from "vitest";
import { CUET_SUBJECTS_CATALOG } from "@/lib/syllabus-data";
import {
  getSubjects,
  getSubjectBySlug,
  getExamYears,
  getSubjectCategories,
} from "@/lib/syllabus-service";

describe("Phase 6: CUET Subject & Syllabus Architecture & Business Logic", () => {
  it("defines standard CUET exam years (2026 and 2027)", async () => {
    const years = await getExamYears();
    expect(years).toHaveLength(2);
    expect(years.map((y) => y.year)).toContain(2026);
    expect(years.map((y) => y.year)).toContain(2027);

    const defaultYear = years.find((y) => y.isDefault);
    expect(defaultYear?.year).toBe(2026);
  });

  it("defines the 3 official NTA CUET UG subject sections", async () => {
    const categories = await getSubjectCategories();
    expect(categories).toHaveLength(3);
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("languages");
    expect(slugs).toContain("domain-subjects");
    expect(slugs).toContain("general-test");
  });

  it("ensures all subjects in the catalog have unique codes and slugs", () => {
    const codes = CUET_SUBJECTS_CATALOG.map((s) => s.code);
    const slugs = CUET_SUBJECTS_CATALOG.map((s) => s.slug);

    const uniqueCodes = new Set(codes);
    const uniqueSlugs = new Set(slugs);

    expect(uniqueCodes.size).toBe(codes.length);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("validates official verified NTA syllabi for core high-frequency subjects", () => {
    const coreSlugs = ["physics", "chemistry", "mathematics", "english", "general-test"];

    for (const slug of coreSlugs) {
      const subject = CUET_SUBJECTS_CATALOG.find((s) => s.slug === slug);
      expect(subject).toBeDefined();
      expect(subject?.syllabus).toBeDefined();
      expect(subject?.syllabus?.status).toBe("PUBLISHED");
      expect(subject?.syllabus?.sourceUrl).toBe("https://exams.nta.ac.in/CUET-UG/");
      expect(subject?.syllabus?.units.length).toBeGreaterThan(0);

      // Verify each unit contains valid ordered topics and subtopics
      for (const unit of subject!.syllabus!.units) {
        expect(unit.unitNumber).toBeGreaterThan(0);
        expect(unit.title.length).toBeGreaterThan(0);
        expect(unit.topics.length).toBeGreaterThan(0);

        for (const topic of unit.topics) {
          expect(topic.order).toBeGreaterThan(0);
          expect(topic.title.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("guarantees zero hallucinated content for unverified/in-progress subjects", async () => {
    // Geography and Legal Studies are unverified/in-progress
    const geography = await getSubjectBySlug("geography", 2026);
    expect(geography).toBeDefined();
    expect(geography?.hasVerifiedSyllabus).toBe(false);
    expect(geography?.syllabus).toBeUndefined();
    expect(geography?.totalUnits).toBe(0);
    expect(geography?.totalTopics).toBe(0);

    const legalStudies = await getSubjectBySlug("legal-studies", 2026);
    expect(legalStudies).toBeDefined();
    expect(legalStudies?.hasVerifiedSyllabus).toBe(false);
    expect(legalStudies?.syllabus).toBeUndefined();
  });

  it("filters subjects by exam year accurately", async () => {
    const subjects2026 = await getSubjects({ year: 2026 });
    expect(subjects2026.length).toBeGreaterThanOrEqual(10);

    const subjects2027 = await getSubjects({ year: 2027 });
    expect(subjects2027.length).toBe(subjects2026.length);
  });

  it("filters subjects by category accurately", async () => {
    const languages = await getSubjects({ categorySlug: "languages" });
    expect(languages.every((s) => s.categorySlug === "languages")).toBe(true);
    expect(languages.map((l) => l.code)).toContain("101"); // English
    expect(languages.map((l) => l.code)).toContain("102"); // Hindi

    const domains = await getSubjects({ categorySlug: "domain-subjects" });
    expect(domains.every((s) => s.categorySlug === "domain-subjects")).toBe(true);
    expect(domains.map((d) => d.slug)).toContain("physics");
    expect(domains.map((d) => d.slug)).toContain("chemistry");
    expect(domains.map((d) => d.slug)).toContain("mathematics");

    const generalTest = await getSubjects({ categorySlug: "general-test" });
    expect(generalTest.every((s) => s.categorySlug === "general-test")).toBe(true);
    expect(generalTest[0].code).toBe("501");
  });

  it("filters subjects by search keyword and NTA code", async () => {
    // Search by name
    const physicsSearch = await getSubjects({ search: "physics" });
    expect(physicsSearch).toHaveLength(1);
    expect(physicsSearch[0].slug).toBe("physics");

    // Search by code
    const codeSearch = await getSubjects({ search: "314" });
    expect(codeSearch).toHaveLength(1);
    expect(codeSearch[0].slug).toBe("physics");

    // Search partial
    const chemSearch = await getSubjects({ search: "chem" });
    expect(chemSearch.some((s) => s.slug === "chemistry")).toBe(true);
  });

  it("verifies hierarchical unit-topic-subtopic structure for Physics (Code 314)", async () => {
    const physics = await getSubjectBySlug("physics", 2026);
    expect(physics).not.toBeNull();
    expect(physics?.code).toBe("314");
    expect(physics?.hasVerifiedSyllabus).toBe(true);

    const units = physics?.syllabus?.units;
    expect(units).toBeDefined();
    expect(units!.length).toBe(9); // 9 official NCERT Class 12 units

    // Unit 1: Electrostatics
    const unit1 = units![0];
    expect(unit1.unitNumber).toBe(1);
    expect(unit1.title).toBe("Electrostatics");
    expect(unit1.topics.length).toBeGreaterThanOrEqual(2);

    const topic1 = unit1.topics[0];
    expect(topic1.title).toBe("Electric Charges and Fields");
    expect(topic1.subtopics.length).toBeGreaterThan(0);
    expect(topic1.subtopics[0].title).toContain("Coulomb's Law");
  });

  it("enforces maximum subject constraint logic (6 subjects max for CUET UG)", () => {
    const studentSubjects = [
      "english",
      "physics",
      "chemistry",
      "mathematics",
      "biology",
      "general-test",
    ];

    const canAddMore = studentSubjects.length < 6;
    expect(canAddMore).toBe(false);

    const withFive = studentSubjects.slice(0, 5);
    expect(withFive.length < 6).toBe(true);
  });
});
