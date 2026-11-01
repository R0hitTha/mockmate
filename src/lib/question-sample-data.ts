/**
 * MockMate — Question Bank Initial Benchmark Dataset
 *
 * Provenance:
 * - NCERT Class 12 Exemplar Benchmarks
 * - NTA CUET UG Official Model Papers & Rationalized Syllabus Blueprints
 * - Clearly marked with metadata provenance.
 */

export interface SampleOption {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface SampleQuestion {
  questionCode: string;
  examYear: number;
  subjectSlug: string;
  unitNumber: number;
  topicOrder: number;
  subtopicOrder?: number;
  questionType: "MCQ_SINGLE" | "MCQ_MULTIPLE" | "ASSERTION_REASON" | "PASSAGE_BASED" | "TRUE_FALSE";
  questionText: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  marks: number;
  negativeMarks: number;
  status: "PUBLISHED" | "IN_REVIEW" | "DRAFT";
  provenance: string;
  passage?: {
    title: string;
    passageText: string;
  };
  tags: string[];
  options: SampleOption[];
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  // 1. PHYSICS — ELECTROSTATICS (MCQ_SINGLE)
  {
    questionCode: "Q-PHY-2026-001",
    examYear: 2026,
    subjectSlug: "physics",
    unitNumber: 1, // Electrostatics
    topicOrder: 1, // Electric Charges and Fields
    subtopicOrder: 1, // Coulomb's Law
    questionType: "MCQ_SINGLE",
    questionText:
      "Two point charges $+3\\mu\\text{C}$ and $+8\\mu\\text{C}$ repel each other with a force of $40\\text{ N}$. If a charge of $-5\\mu\\text{C}$ is added to each of them, what will be the new force between them at the same separation?",
    difficulty: "MEDIUM",
    explanation:
      "Initial charges: $q_1 = +3\\mu\\text{C}$, $q_2 = +8\\mu\\text{C}$. Force $F_1 = k \\frac{(3)(8)}{r^2} = k \\frac{24}{r^2} = 40\\text{ N}$.\nAfter adding $-5\\mu\\text{C}$ to each:\nNew charges: $q_1' = 3 - 5 = -2\\mu\\text{C}$, $q_2' = 8 - 5 = +3\\mu\\text{C}$.\nNew force $F_2 = k \\frac{|(-2)(+3)|}{r^2} = k \\frac{6}{r^2} = \\frac{1}{4} \\times \\left(k \\frac{24}{r^2}\\right) = \\frac{40}{4} = 10\\text{ N}$ (Attractive).",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Physics Exemplar, Chapter 1 Benchmark",
    tags: ["NCERT Exemplar", "Coulomb's Law", "High Yield"],
    options: [
      { optionLabel: "A", optionText: "10 N, attractive", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "10 N, repulsive", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "20 N, attractive", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "40 N, repulsive", isCorrect: false, order: 4 },
    ],
  },

  // 2. CHEMISTRY — SOLUTIONS (ASSERTION_REASON)
  {
    questionCode: "Q-CHE-2026-002",
    examYear: 2026,
    subjectSlug: "chemistry",
    unitNumber: 1, // Solutions
    topicOrder: 1, // Solubility and Colligative Properties
    subtopicOrder: 3, // Colligative properties
    questionType: "ASSERTION_REASON",
    questionText:
      "Given below are two statements:\nAssertion (A): An ideal solution obeys Raoult's law over the entire range of concentrations.\nReason (R): For an ideal solution, the intermolecular attractive forces between A-A and B-B are identical to those between A-B, leading to $\\Delta H_{\\text{mix}} = 0$ and $\\Delta V_{\\text{mix}} = 0$.\n\nIn the light of the above statements, choose the most appropriate answer from the options given below:",
    difficulty: "EASY",
    explanation:
      "An ideal solution satisfies Raoult's law at all temperatures and concentrations because intermolecular interactions between solvent-solute (A-B) are of the same magnitude as solvent-solvent (A-A) and solute-solute (B-B). Hence, both enthalpy of mixing and volume change upon mixing are zero. Therefore, Reason (R) is the correct explanation of Assertion (A).",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Chemistry, Chapter 1 Official Concept Benchmark",
    tags: ["Raoult's Law", "Solutions", "Assertion Reason"],
    options: [
      {
        optionLabel: "A",
        optionText: "Both (A) and (R) are true and (R) is the correct explanation of (A)",
        isCorrect: true,
        order: 1,
      },
      {
        optionLabel: "B",
        optionText: "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)",
        isCorrect: false,
        order: 2,
      },
      { optionLabel: "C", optionText: "(A) is true but (R) is false", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "(A) is false but (R) is true", isCorrect: false, order: 4 },
    ],
  },

  // 3. MATHEMATICS — CALCULUS (MCQ_SINGLE)
  {
    questionCode: "Q-MAT-2026-003",
    examYear: 2026,
    subjectSlug: "mathematics",
    unitNumber: 1, // Section A: Common Topics
    topicOrder: 2, // Calculus & Integrals
    subtopicOrder: 3, // Definite integrals
    questionType: "MCQ_SINGLE",
    questionText:
      "The value of the definite integral $\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}} \\left( x^3 + x\\cos x + \\tan^5 x + 1 \\right) dx$ is equal to:",
    difficulty: "MEDIUM",
    explanation:
      "Recall the property $\\int_{-a}^a f(x)dx = 0$ for odd functions.\nHere, $x^3$, $x\\cos x$, and $\\tan^5 x$ are all odd functions since $f(-x) = -f(x)$.\nTherefore: $\\int_{-\\pi/2}^{\\pi/2} x^3 dx = 0$, $\\int_{-\\pi/2}^{\\pi/2} x\\cos x dx = 0$, and $\\int_{-\\pi/2}^{\\pi/2} \\tan^5 x dx = 0$.\nThe remaining term is $\\int_{-\\pi/2}^{\\pi/2} 1 dx = \\left[ x \\right]_{-\\pi/2}^{\\pi/2} = \\frac{\\pi}{2} - \\left(-\\frac{\\pi}{2}\\right) = \\pi$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Mathematics Exemplar & CUET UG 2024 Past Pattern Benchmark",
    tags: ["Definite Integrals", "Calculus", "High Yield"],
    options: [
      { optionLabel: "A", optionText: "0", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "1", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "\\pi", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "2\\pi", isCorrect: false, order: 4 },
    ],
  },

  // 4. ENGLISH — READING COMPREHENSION (PASSAGE_BASED)
  {
    questionCode: "Q-ENG-2026-004",
    examYear: 2026,
    subjectSlug: "english",
    unitNumber: 1, // Reading Comprehension
    topicOrder: 1, // Factual Passages
    subtopicOrder: 1, // Identifying Main Ideas
    questionType: "PASSAGE_BASED",
    passage: {
      title: "The Paradigm Shift in Renewable Energy",
      passageText:
        "The global transition toward renewable energy has evolved from an environmental aspiration into an economic imperative. Over the past decade, the levelized cost of electricity (LCOE) for solar photovoltaics and onshore wind has plunged by more than eighty percent, making green electrons substantially cheaper than their fossil-fuel counterparts in most major markets. However, the intermittent nature of wind and solar introduces acute grid stability challenges. Without substantial investments in utility-scale energy storage, flexible demand response, and ultra-high-voltage transmission networks, surplus energy generated during peak hours risks curtailment rather than productive economic deployment.",
    },
    questionText:
      "According to the passage, what is the primary hurdle preventing the immediate unconstrained utilization of solar and wind power?",
    difficulty: "EASY",
    explanation:
      "The passage explicitly states: 'However, the intermittent nature of wind and solar introduces acute grid stability challenges. Without substantial investments in utility-scale energy storage... surplus energy risks curtailment.' Hence, the intermittency and resultant grid stability challenges constitute the primary barrier.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Section IA English Reading Comprehension Blueprint Benchmark",
    tags: ["Reading Comprehension", "Factual Passages", "Section IA"],
    options: [
      { optionLabel: "A", optionText: "Excessive generation cost per megawatt-hour", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Intermittent generation patterns and inadequate grid storage capacity", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "Lack of commercial consumer demand for electricity", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "Prohibitive import tariffs on rare earth minerals", isCorrect: false, order: 4 },
    ],
  },

  // 5. GENERAL APTITUDE TEST — LOGICAL REASONING (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-005",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 2, // General Mental Ability & Logical Reasoning
    topicOrder: 1, // Verbal & Analytical Reasoning
    subtopicOrder: 2, // Number series
    questionType: "MCQ_SINGLE",
    questionText:
      "Identify the missing number in the following numerical series:\n$3, 7, 15, 31, 63, \\,?$",
    difficulty: "EASY",
    explanation:
      "Look at the progression:\n$3 \\times 2 + 1 = 7$\n$7 \\times 2 + 1 = 15$\n$15 \\times 2 + 1 = 31$\n$31 \\times 2 + 1 = 63$\nFollowing the identical pattern: $63 \\times 2 + 1 = 126 + 1 = 127$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NTA CUET UG Section III General Test Blueprint Benchmark",
    tags: ["Number Series", "Logical Reasoning", "Section III GT"],
    options: [
      { optionLabel: "A", optionText: "125", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "127", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "128", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "131", isCorrect: false, order: 4 },
    ],
  },

  // 6. DRAFT SAMPLE FOR REVIEW WORKFLOW DEMONSTRATION
  {
    questionCode: "Q-PHY-2026-006",
    examYear: 2026,
    subjectSlug: "physics",
    unitNumber: 2, // Current Electricity
    topicOrder: 1, // Electric Current and Resistance
    subtopicOrder: 2, // Temperature dependence
    questionType: "MCQ_SINGLE",
    questionText:
      "When the temperature of a metallic conductor is increased, its electrical resistivity increases primarily because of:",
    difficulty: "EASY",
    explanation:
      "As temperature rises, the amplitude of vibration of lattice ions increases, causing more frequent collisions with conduction electrons. This sharply reduces the mean relaxation time $\\tau$. Since resistivity $\\rho = \\frac{m}{n e^2 \\tau}$, a decrease in $\\tau$ causes an increase in resistivity.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "IN_REVIEW",
    provenance: "CUET UG Physics Practice Draft Benchmark",
    tags: ["Current Electricity", "Draft", "In Review"],
    options: [
      { optionLabel: "A", optionText: "Decrease in the number density of conduction electrons", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Decrease in the relaxation time between successive collisions", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "Increase in the mass of the conduction electrons", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "Decrease in the thermal speed of electrons", isCorrect: false, order: 4 },
    ],
  },
];

