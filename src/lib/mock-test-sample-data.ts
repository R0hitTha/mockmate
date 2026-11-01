/**
 * MockMate — Mock Test Benchmark Dataset
 *
 * Designed in strict adherence to NTA CUET UG examination blueprints:
 * - Domain Subjects: 50 Questions (40 to attempt), 45 Minutes, 200 Marks (+5 / -1)
 * - General Test (Section III): 60 Questions (50 to attempt), 60 Minutes, 250 Marks (+5 / -1)
 * - Mathematics / Accountancy / Economics: 50 Questions (40 to attempt), 60 Minutes, 200 Marks
 */

export interface SampleMockTestSection {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  sectionType: "COMPULSORY" | "OPTIONAL";
  description?: string;
  order: number;
  duration?: number;
  totalMarks: number;
  totalQuestions: number;
  questionsToAttempt: number;
  questionCodes: string[];
}

export interface SampleMockTest {
  id: string;
  title: string;
  slug: string;
  testCode: string;
  description: string;
  examYear: number;
  testType: "FULL_LENGTH" | "SUBJECT_WISE" | "GENERAL_TEST" | "SECTIONAL" | "CUSTOM_PRACTICE";
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  instructions: string;
  totalDuration: number; // in minutes
  totalMarks: number;
  totalQuestions: number;
  questionsToAttempt: number;
  isOfficialPattern: boolean;
  attemptsCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: SampleMockTestSection[];
}

export const SAMPLE_MOCK_TESTS: SampleMockTest[] = [
  // 1. Full-Length Physics Mock Test 01 (Official CUET UG Pattern)
  {
    id: "test-cuet-phy-01",
    title: "CUET UG Physics Full Mock Test 01",
    slug: "cuet-ug-physics-mock-01",
    testCode: "MT-CUET-PHY-2026-01",
    description:
      "Comprehensive full-length simulation of the CUET UG 2026 Physics paper based on NCERT Class 12 Rationalized Syllabus. Features 50 questions across electrostatics, optics, magnetism, and modern physics with 40 questions to be attempted.",
    examYear: 2026,
    testType: "SUBJECT_WISE",
    status: "PUBLISHED",
    difficulty: "MEDIUM",
    instructions: `### CUET UG Examination Instructions
1. **Total Duration**: 45 Minutes.
2. **Total Questions**: 50 Questions. You are required to attempt any **40 Questions**.
3. **Marking Scheme**:
   - For each correct response, you will be awarded **+5 marks**.
   - For each incorrect response, **1 mark will be deducted (-1)**.
   - Unanswered/marked for review will receive **0 marks**.
4. **CBT Navigation**:
   - Use the Question Palette on the right to jump directly to any question.
   - Click "Save & Next" to save your response.
   - Click "Mark for Review & Next" to flag questions you want to recheck.
5. In case of ambiguous options, official NTA answer key guidelines apply.`,
    totalDuration: 45,
    totalMarks: 200,
    totalQuestions: 50,
    questionsToAttempt: 40,
    isOfficialPattern: true,
    attemptsCount: 142,
    publishedAt: "2026-01-15T09:00:00Z",
    createdAt: "2026-01-10T12:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
    sections: [
      {
        id: "sec-phy-01-a",
        title: "Section A: Core Electrostatics & Electrodynamics",
        subjectCode: "314",
        subjectName: "Physics",
        sectionType: "COMPULSORY",
        description: "Core conceptual problems covering electric charges, fields, potential, and current electricity.",
        order: 1,
        duration: 25,
        totalMarks: 100,
        totalQuestions: 25,
        questionsToAttempt: 20,
        questionCodes: ["Q-PHY-2026-001"],
      },
      {
        id: "sec-phy-01-b",
        title: "Section B: Modern Physics & Magnetism",
        subjectCode: "314",
        subjectName: "Physics",
        sectionType: "COMPULSORY",
        description: "Advanced applications covering magnetic effects, electromagnetic induction, and modern physics.",
        order: 2,
        duration: 20,
        totalMarks: 100,
        totalQuestions: 25,
        questionsToAttempt: 20,
        questionCodes: ["Q-PHY-2026-006"],
      },
    ],
  },

  // 2. CUET UG General Test Full Mock 01 (Official Section III Pattern)
  {
    id: "test-cuet-gt-01",
    title: "CUET UG General Test Full Mock 01",
    slug: "cuet-ug-general-test-mock-01",
    testCode: "MT-CUET-GT-2026-01",
    description:
      "Section III General Test blueprint featuring General Knowledge, Current Affairs, General Mental Ability, Numerical Ability, and Logical/Analytical Reasoning. 60 questions with 50 to attempt.",
    examYear: 2026,
    testType: "GENERAL_TEST",
    status: "PUBLISHED",
    difficulty: "HARD",
    instructions: `### CUET UG Section III General Test Guidelines
1. **Total Duration**: 60 Minutes.
2. **Total Questions**: 60 Questions. You are required to attempt **50 Questions**.
3. **Marking Scheme**:
   - Correct answer: **+5 Marks**
   - Incorrect answer: **-1 Mark**
   - Unattempted: **0 Marks**
4. Rough work must be done on the designated scratch sheet.
5. Calculators or electronic aids are strictly prohibited.`,
    totalDuration: 60,
    totalMarks: 250,
    totalQuestions: 60,
    questionsToAttempt: 50,
    isOfficialPattern: true,
    attemptsCount: 89,
    publishedAt: "2026-01-20T10:00:00Z",
    createdAt: "2026-01-18T14:30:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
    sections: [
      {
        id: "sec-gt-01-a",
        title: "Section 1: General Knowledge & Current Affairs",
        subjectCode: "501",
        subjectName: "General Test",
        sectionType: "COMPULSORY",
        description: "Static GK, contemporary national/international events, and cultural heritage.",
        order: 1,
        duration: 20,
        totalMarks: 100,
        totalQuestions: 20,
        questionsToAttempt: 15,
        questionCodes: ["Q-GEN-2026-005"],
      },
      {
        id: "sec-gt-01-b",
        title: "Section 2: Reasoning & Quantitative Aptitude",
        subjectCode: "501",
        subjectName: "General Test",
        sectionType: "COMPULSORY",
        description: "Numerical ability, basic mathematical concepts (arithmetic/algebra/geometry), and logical deduction.",
        order: 2,
        duration: 40,
        totalMarks: 150,
        totalQuestions: 40,
        questionsToAttempt: 35,
        questionCodes: ["Q-GEN-2026-005"],
      },
    ],
  },

  // 3. CUET UG Mathematics Core Practice Test 01
  {
    id: "test-cuet-math-01",
    title: "CUET UG Mathematics Core Practice Test 01",
    slug: "cuet-ug-math-core-practice-01",
    testCode: "MT-CUET-MATH-2026-01",
    description:
      "Calculus, Matrices & Determinants, and Vector Algebra focused mock designed to test computational speed and conceptual accuracy for CUET UG 2026 aspirants.",
    examYear: 2026,
    testType: "SUBJECT_WISE",
    status: "PUBLISHED",
    difficulty: "MEDIUM",
    instructions: `### CUET UG Mathematics Instructions
1. **Total Duration**: 60 Minutes (NTA grants 60 mins for calculation-heavy subjects).
2. **Total Questions**: 50 Questions (Attempt any 40 Questions).
3. **Marks**: 200 Total (+5 / -1 marking).`,
    totalDuration: 60,
    totalMarks: 200,
    totalQuestions: 50,
    questionsToAttempt: 40,
    isOfficialPattern: true,
    attemptsCount: 65,
    publishedAt: "2026-01-25T11:00:00Z",
    createdAt: "2026-01-22T08:15:00Z",
    updatedAt: "2026-01-25T11:00:00Z",
    sections: [
      {
        id: "sec-math-01-a",
        title: "Section A: Compulsory Core Mathematics",
        subjectCode: "319",
        subjectName: "Mathematics",
        sectionType: "COMPULSORY",
        description: "Relations, Functions, Algebra of Matrices, and Differential Calculus.",
        order: 1,
        duration: 60,
        totalMarks: 200,
        totalQuestions: 50,
        questionsToAttempt: 40,
        questionCodes: ["Q-MAT-2026-003"],
      },
    ],
  },

  // 4. CUET UG Chemistry Diagnostic Assessment (Draft)
  {
    id: "test-cuet-chem-draft",
    title: "CUET UG Chemistry Diagnostic Assessment",
    slug: "cuet-ug-chem-diagnostic-draft",
    testCode: "MT-CUET-CHEM-2026-DRAFT",
    description:
      "Diagnostic test evaluating foundational readiness across Physical, Organic, and Inorganic Chemistry chapters.",
    examYear: 2026,
    testType: "SECTIONAL",
    status: "DRAFT",
    difficulty: "EASY",
    instructions: "Diagnostic practice test for gauging conceptual mastery before beginning full-length papers.",
    totalDuration: 30,
    totalMarks: 125,
    totalQuestions: 25,
    questionsToAttempt: 25,
    isOfficialPattern: false,
    attemptsCount: 0,
    publishedAt: null,
    createdAt: "2026-02-01T15:00:00Z",
    updatedAt: "2026-02-01T15:00:00Z",
    sections: [
      {
        id: "sec-chem-draft-a",
        title: "Section 1: Solutions & Electrochemistry",
        subjectCode: "306",
        subjectName: "Chemistry",
        sectionType: "COMPULSORY",
        order: 1,
        duration: 30,
        totalMarks: 125,
        totalQuestions: 25,
        questionsToAttempt: 25,
        questionCodes: ["Q-CHE-2026-002"],
      },
    ],
  },

  // 5. CUET UG English Language Archive 01 (Archived)
  {
    id: "test-cuet-eng-archive",
    title: "CUET UG English Language Comprehensive Mock (2025)",
    slug: "cuet-ug-english-archive-01",
    testCode: "MT-CUET-ENG-2025-ARCH",
    description:
      "Archived previous year mock test paper covering Reading Comprehension, Vocabulary, and Verbal Ability.",
    examYear: 2026,
    testType: "SUBJECT_WISE",
    status: "ARCHIVED",
    difficulty: "MEDIUM",
    instructions: "This test paper was formulated for the previous examination cycle and is archived for reference.",
    totalDuration: 45,
    totalMarks: 200,
    totalQuestions: 50,
    questionsToAttempt: 40,
    isOfficialPattern: true,
    attemptsCount: 210,
    publishedAt: "2025-03-01T10:00:00Z",
    createdAt: "2025-02-15T10:00:00Z",
    updatedAt: "2025-10-01T10:00:00Z",
    sections: [
      {
        id: "sec-eng-arch-a",
        title: "Section 1: Reading Comprehension & Verbal Ability",
        subjectCode: "101",
        subjectName: "English",
        sectionType: "COMPULSORY",
        order: 1,
        duration: 45,
        totalMarks: 200,
        totalQuestions: 50,
        questionsToAttempt: 40,
        questionCodes: ["Q-ENG-2026-004"],
      },
    ],
  },
];

