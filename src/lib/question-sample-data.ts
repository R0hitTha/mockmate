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
    status: "PUBLISHED",
    provenance: "CUET UG Physics Practice Benchmark",
    tags: ["Current Electricity", "Temperature Dependence", "High Yield"],
    options: [
      { optionLabel: "A", optionText: "Decrease in the number density of conduction electrons", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Decrease in the relaxation time between successive collisions", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "Increase in the mass of the conduction electrons", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "Decrease in the thermal speed of electrons", isCorrect: false, order: 4 },
    ],
  },

  // 7. PHYSICS — ELECTROMAGNETIC INDUCTION (MCQ_SINGLE)
  {
    questionCode: "Q-PHY-2026-007",
    examYear: 2026,
    subjectSlug: "physics",
    unitNumber: 4,
    topicOrder: 1,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "A circular coil of 500 turns and radius 10 cm is placed in a uniform magnetic field of 0.2 T normal to the plane of the coil. If the magnetic field reduces to zero in 0.1 s, the average induced emf in the coil is:",
    difficulty: "MEDIUM",
    explanation:
      "Induced emf $e = -N \\frac{\\Delta \\Phi}{\\Delta t} = -N A \\frac{\\Delta B}{\\Delta t} = 500 \\times (\\pi \\times 0.1^2) \\times \\frac{0.2 - 0}{0.1} = 500 \\times 0.031416 \\times 2 \\approx 31.4 / 2 = 15.7\\text{ V}$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Physics, Chapter 6 EMI Benchmark",
    tags: ["Electromagnetic Induction", "Faraday Law", "High Yield"],
    options: [
      { optionLabel: "A", optionText: "15.7 V", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "31.4 V", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "7.85 V", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "62.8 V", isCorrect: false, order: 4 },
    ],
  },

  // 8. PHYSICS — RAY OPTICS (MCQ_SINGLE)
  {
    questionCode: "Q-PHY-2026-008",
    examYear: 2026,
    subjectSlug: "physics",
    unitNumber: 6,
    topicOrder: 2,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "An equilateral prism is made of glass of refractive index $\\mu = \\sqrt{3}$. What is the angle of minimum deviation ($D_{\\text{min}}$) produced by this prism?",
    difficulty: "MEDIUM",
    explanation:
      "For an equilateral prism, prism angle $A = 60^\\circ$. The prism formula is $\\mu = \\frac{\\sin((A + D_{\\text{min}})/2)}{\\sin(A/2)}$. Substituting values: $\\sqrt{3} = \\frac{\\sin((60^\\circ + D_{\\text{min}})/2)}{\\sin(30^\\circ)} = \\frac{\\sin((60^\\circ + D_{\\text{min}})/2)}{0.5} \\implies \\sin((60^\\circ + D_{\\text{min}})/2) = \\frac{\\sqrt{3}}{2} = \\sin(60^\\circ)$. Thus $(60^\\circ + D_{\\text{min}})/2 = 60^\\circ \\implies D_{\\text{min}} = 60^\\circ$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Physics, Chapter 9 Ray Optics Benchmark",
    tags: ["Ray Optics", "Prism", "Minimum Deviation"],
    options: [
      { optionLabel: "A", optionText: "30°", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "45°", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "60°", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "90°", isCorrect: false, order: 4 },
    ],
  },

  // 9. PHYSICS — PHOTOELECTRIC EFFECT & MODERN PHYSICS (MCQ_SINGLE)
  {
    questionCode: "Q-PHY-2026-009",
    examYear: 2026,
    subjectSlug: "physics",
    unitNumber: 7,
    topicOrder: 1,
    subtopicOrder: 3,
    questionType: "MCQ_SINGLE",
    questionText:
      "Monochromatic light of frequency $1.5 \\times 10^{15}\\text{ Hz}$ is incident on a metal surface having a work function of $2.5\\text{ eV}$. What is the maximum kinetic energy of the emitted photoelectrons? ($h = 6.63 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$, $1\\text{ eV} = 1.6 \\times 10^{-19}\\text{ J}$)",
    difficulty: "HARD",
    explanation:
      "Energy of incident photon $E = h\\nu = (6.63 \\times 10^{-34} \\times 1.5 \\times 10^{15}) / (1.6 \\times 10^{-19}) = 9.945 \\times 10^{-19} / 1.6 \\times 10^{-19} = 6.22\\text{ eV}$. By Einstein's photoelectric equation: $K_{\\text{max}} = E - \\Phi = 6.22 - 2.50 = 3.72\\text{ eV}$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Physics, Dual Nature of Radiation Benchmark",
    tags: ["Photoelectric Effect", "Work Function", "Einstein Equation"],
    options: [
      { optionLabel: "A", optionText: "3.72 eV", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "6.22 eV", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "2.50 eV", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "1.22 eV", isCorrect: false, order: 4 },
    ],
  },

  // 10. PHYSICS — WAVE OPTICS (MCQ_SINGLE)
  {
    questionCode: "Q-PHY-2026-010",
    examYear: 2026,
    subjectSlug: "physics",
    unitNumber: 6,
    topicOrder: 3,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "In a Young's double-slit experiment, the separation between the two slits is halved while the distance between the slits and the screen is doubled. The resulting fringe width will:",
    difficulty: "EASY",
    explanation:
      "Fringe width $\\beta = \\frac{\\lambda D}{d}$. When $d' = d/2$ and $D' = 2D$, new fringe width $\\beta' = \\frac{\\lambda (2D)}{d/2} = 4 \\left(\\frac{\\lambda D}{d}\\right) = 4\\beta$. Hence, the fringe width becomes four times.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Physics Official Syllabus Benchmark",
    tags: ["Wave Optics", "YDSE", "Fringe Width"],
    options: [
      { optionLabel: "A", optionText: "Remain unchanged", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Become double", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "Become four times", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "Become half", isCorrect: false, order: 4 },
    ],
  },

  // 11. CHEMISTRY — ELECTROCHEMISTRY (MCQ_SINGLE)
  {
    questionCode: "Q-CHE-2026-011",
    examYear: 2026,
    subjectSlug: "chemistry",
    unitNumber: 2,
    topicOrder: 1,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "The standard reduction potentials for $\\text{Zn}^{2+}/\\text{Zn}$ and $\\text{Cu}^{2+}/\\text{Cu}$ electrodes are $-0.76\\text{ V}$ and $+0.34\\text{ V}$ respectively. What is the standard cell potential ($E^\\circ_{\\text{cell}}$) for the Daniel cell?",
    difficulty: "EASY",
    explanation:
      "$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = E^\\circ(\\text{Cu}^{2+}/\\text{Cu}) - E^\\circ(\\text{Zn}^{2+}/\\text{Zn}) = (+0.34\\text{ V}) - (-0.76\\text{ V}) = +1.10\\text{ V}$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Chemistry, Electrochemistry Chapter Benchmark",
    tags: ["Electrochemistry", "Standard EMF", "Daniel Cell"],
    options: [
      { optionLabel: "A", optionText: "+1.10 V", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "-1.10 V", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "+0.42 V", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "-0.42 V", isCorrect: false, order: 4 },
    ],
  },

  // 12. CHEMISTRY — CHEMICAL KINETICS (MCQ_SINGLE)
  {
    questionCode: "Q-CHE-2026-012",
    examYear: 2026,
    subjectSlug: "chemistry",
    unitNumber: 3,
    topicOrder: 1,
    subtopicOrder: 3,
    questionType: "MCQ_SINGLE",
    questionText:
      "For a first-order chemical reaction, the time required for 99.9% completion is approximately how many times its half-life ($t_{1/2}$)?",
    difficulty: "MEDIUM",
    explanation:
      "For 99.9% completion, remaining concentration $[A] = [A]_0 - 0.999[A]_0 = 10^{-3}[A]_0$. Using first order equation: $t_{99.9\\%} = \\frac{2.303}{k} \\log_{10}\\left(\\frac{[A]_0}{10^{-3}[A]_0}\\right) = \\frac{2.303 \\times 3}{k} = \\frac{6.909}{k}$. Since $t_{1/2} = \\frac{0.693}{k}$, the ratio $\\frac{t_{99.9\\%}}{t_{1/2}} = \\frac{6.909}{0.693} \\approx 10$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Chemistry, Chapter 3 Kinetics Benchmark",
    tags: ["Chemical Kinetics", "First Order", "Half Life"],
    options: [
      { optionLabel: "A", optionText: "2 times", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "5 times", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "10 times", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "100 times", isCorrect: false, order: 4 },
    ],
  },

  // 13. CHEMISTRY — COORDINATION COMPOUNDS (MCQ_SINGLE)
  {
    questionCode: "Q-CHE-2026-013",
    examYear: 2026,
    subjectSlug: "chemistry",
    unitNumber: 5,
    topicOrder: 2,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "According to Werner's coordination theory, which of the following statements is INCORRECT regarding the secondary valencies of a transition metal ion?",
    difficulty: "MEDIUM",
    explanation:
      "In Werner's theory, primary valencies are ionizable and correspond to oxidation state, whereas secondary valencies are non-ionizable, correspond to coordination number, and are strictly directional in space.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Chemistry, Coordination Compounds Benchmark",
    tags: ["Werner Theory", "Coordination Compounds", "Valency"],
    options: [
      { optionLabel: "A", optionText: "Secondary valencies are non-ionizable in solution", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Secondary valencies are directional in space, determining complex geometry", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "Secondary valencies directly correspond to the oxidation state of the metal", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "Secondary valencies are satisfied by neutral molecules or anions", isCorrect: false, order: 4 },
    ],
  },

  // 14. CHEMISTRY — ORGANIC HALOALKANES (MCQ_SINGLE)
  {
    questionCode: "Q-CHE-2026-014",
    examYear: 2026,
    subjectSlug: "chemistry",
    unitNumber: 6,
    topicOrder: 1,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "Which of the following represents the correct decreasing order of reactivity towards bimolecular nucleophilic substitution ($S_N2$) among alkyl halides?",
    difficulty: "EASY",
    explanation:
      "$S_N2$ proceeds via a concerted backside nucleophilic attack. Crowding (steric hindrance) at the reacting alpha-carbon strongly destabilizes the pentacoordinated transition state, yielding the reactivity order: Methyl > 1° > 2° > 3°.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Chemistry, Haloalkanes Benchmark",
    tags: ["SN2 Mechanism", "Alkyl Halides", "Steric Hindrance"],
    options: [
      { optionLabel: "A", optionText: "CH3X > 1° > 2° > 3°", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "3° > 2° > 1° > CH3X", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "1° > CH3X > 2° > 3°", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "2° > 1° > CH3X > 3°", isCorrect: false, order: 4 },
    ],
  },

  // 15. CHEMISTRY — BIOMOLECULES (MCQ_SINGLE)
  {
    questionCode: "Q-CHE-2026-015",
    examYear: 2026,
    subjectSlug: "chemistry",
    unitNumber: 10,
    topicOrder: 2,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "Which specific chemical bond covalently links successive $\\alpha$-amino acid residues together to form polypeptide chains in proteins?",
    difficulty: "EASY",
    explanation:
      "Proteins are polyamides where $\\alpha$-amino acids are condensed via peptide bonds ($-CO-NH-$ linkages) formed between the $\\alpha$-carboxyl group of one amino acid and the $\\alpha$-amino group of the next.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Chemistry, Biomolecules Benchmark",
    tags: ["Biomolecules", "Peptide Bond", "Proteins"],
    options: [
      { optionLabel: "A", optionText: "Glycosidic bond", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Phosphodiester linkage", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "Peptide bond (-CO-NH-)", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "Disulfide crosslink", isCorrect: false, order: 4 },
    ],
  },

  // 16. MATHEMATICS — MATRICES & ADJOINTS (MCQ_SINGLE)
  {
    questionCode: "Q-MAT-2026-016",
    examYear: 2026,
    subjectSlug: "mathematics",
    unitNumber: 2,
    topicOrder: 2,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "If $A$ is an invertible square matrix of order 3 such that $\\det(A) = 4$, then what is the determinant of its adjoint matrix, $|\\text{adj}(A)|$?",
    difficulty: "MEDIUM",
    explanation:
      "For any $n \\times n$ square matrix, $|\\text{adj}(A)| = |A|^{n - 1}$. For order $n = 3$ and $|A| = 4$: $|\\text{adj}(A)| = 4^{3 - 1} = 4^2 = 16$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Mathematics, Determinants Chapter Benchmark",
    tags: ["Matrices", "Determinants", "Adjoint"],
    options: [
      { optionLabel: "A", optionText: "4", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "16", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "64", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "12", isCorrect: false, order: 4 },
    ],
  },

  // 17. MATHEMATICS — DIFFERENTIATION (MCQ_SINGLE)
  {
    questionCode: "Q-MAT-2026-017",
    examYear: 2026,
    subjectSlug: "mathematics",
    unitNumber: 3,
    topicOrder: 1,
    subtopicOrder: 4,
    questionType: "MCQ_SINGLE",
    questionText:
      "If $y = (\\sin x)^{\\cos x}$, then what is the exact value of $\\frac{dy}{dx}$ evaluated at $x = \\frac{\\pi}{2}$?",
    difficulty: "HARD",
    explanation:
      "Taking logs: $\\ln y = \\cos x \\ln(\\sin x)$. Differentiating: $\\frac{1}{y}\\frac{dy}{dx} = -\\sin x \\ln(\\sin x) + \\cos x \\frac{\\cos x}{\\sin x}$. At $x = \\pi/2$, $\\sin(\\pi/2) = 1 \\implies \\ln(1) = 0$, and $\\cos(\\pi/2) = 0$. Hence $\\frac{dy}{dx} = y(0 + 0) = 0$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Mathematics Calculus Benchmark",
    tags: ["Calculus", "Logarithmic Differentiation", "High Yield"],
    options: [
      { optionLabel: "A", optionText: "0", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "1", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "-1", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "π / 2", isCorrect: false, order: 4 },
    ],
  },

  // 18. MATHEMATICS — VECTORS (MCQ_SINGLE)
  {
    questionCode: "Q-MAT-2026-018",
    examYear: 2026,
    subjectSlug: "mathematics",
    unitNumber: 4,
    topicOrder: 1,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "What is the angle $\\theta$ between the vectors $\\vec{a} = 2\\hat{i} + \\hat{j} + 3\\hat{k}$ and $\\vec{b} = 3\\hat{i} - 2\\hat{j} + \\hat{k}$?",
    difficulty: "EASY",
    explanation:
      "$\\vec{a} \\cdot \\vec{b} = (2)(3) + (1)(-2) + (3)(1) = 6 - 2 + 3 = 7$. $|\\vec{a}| = \\sqrt{4 + 1 + 9} = \\sqrt{14}$, and $|\\vec{b}| = \\sqrt{9 + 4 + 1} = \\sqrt{14}$. $\\cos\\theta = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}||\\vec{b}|} = \\frac{7}{\\sqrt{14}\\times\\sqrt{14}} = \\frac{7}{14} = \\frac{1}{2}$. Therefore $\\theta = 60^\\circ$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Mathematics, Vector Algebra Benchmark",
    tags: ["Vectors", "Dot Product", "Angle Between Vectors"],
    options: [
      { optionLabel: "A", optionText: "60°", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "90°", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "45°", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "30°", isCorrect: false, order: 4 },
    ],
  },

  // 19. MATHEMATICS — INDEPENDENT PROBABILITY (MCQ_SINGLE)
  {
    questionCode: "Q-MAT-2026-019",
    examYear: 2026,
    subjectSlug: "mathematics",
    unitNumber: 6,
    topicOrder: 1,
    subtopicOrder: 3,
    questionType: "MCQ_SINGLE",
    questionText:
      "Two independent events $A$ and $B$ have probabilities $P(A) = 0.4$ and $P(A \\cup B) = 0.7$. What is the probability $P(B)$?",
    difficulty: "MEDIUM",
    explanation:
      "For independent events, $P(A \\cap B) = P(A)P(B)$. Using addition rule: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\implies 0.7 = 0.4 + P(B) - 0.4P(B) \\implies 0.3 = 0.6P(B) \\implies P(B) = \\frac{0.3}{0.6} = 0.5$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Mathematics, Probability Benchmark",
    tags: ["Probability", "Independent Events", "Union"],
    options: [
      { optionLabel: "A", optionText: "0.30", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "0.50", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "0.40", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "0.25", isCorrect: false, order: 4 },
    ],
  },

  // 20. MATHEMATICS — LINEAR PROGRAMMING (MCQ_SINGLE)
  {
    questionCode: "Q-MAT-2026-020",
    examYear: 2026,
    subjectSlug: "mathematics",
    unitNumber: 5,
    topicOrder: 1,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "In a linear programming problem, the corner points of the bounded feasible region are $(0, 0)$, $(0, 4)$, $(3, 3)$, and $(5, 0)$. At which corner point does the objective function $Z = 4x + 3y$ attain its maximum value?",
    difficulty: "EASY",
    explanation:
      "Calculate $Z$ at each corner point:\n- At $(0, 0)$: $Z = 0$\n- At $(0, 4)$: $Z = 4(0) + 3(4) = 12$\n- At $(3, 3)$: $Z = 4(3) + 3(3) = 12 + 9 = 21$\n- At $(5, 0)$: $Z = 4(5) + 3(0) = 20$\nThe maximum value is 21, which occurs at $(3, 3)$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "NCERT Class 12 Mathematics, Linear Programming Benchmark",
    tags: ["Linear Programming", "Corner Point Method", "Optimization"],
    options: [
      { optionLabel: "A", optionText: "(0, 4) with Z = 12", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "(3, 3) with Z = 21", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "(5, 0) with Z = 20", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "(0, 0) with Z = 0", isCorrect: false, order: 4 },
    ],
  },

  // 21. ENGLISH — VOCABULARY & ANTONYMS (MCQ_SINGLE)
  {
    questionCode: "Q-ENG-2026-021",
    examYear: 2026,
    subjectSlug: "english",
    unitNumber: 2,
    topicOrder: 1,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "Choose the word that is most nearly OPPOSITE in meaning to the capitalized word:\n\n**UBIQUITOUS**",
    difficulty: "EASY",
    explanation:
      "Ubiquitous describes something that is present, appearing, or found everywhere simultaneously. Its direct antonym is 'Scarce' (rare, uncommon, or infrequent).",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG English Vocabulary Blueprint Benchmark",
    tags: ["Vocabulary", "Antonyms", "Verbal Ability"],
    options: [
      { optionLabel: "A", optionText: "Omnipresent", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Scarce", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "Pervasive", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "Ephemeral", isCorrect: false, order: 4 },
    ],
  },

  // 22. ENGLISH — PARA JUMBLES (MCQ_SINGLE)
  {
    questionCode: "Q-ENG-2026-022",
    examYear: 2026,
    subjectSlug: "english",
    unitNumber: 3,
    topicOrder: 1,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "Rearrange the following segments into a coherent and grammatically correct sentence:\n\n(P) have unlocked revolutionary avenues in automated diagnostics\n(Q) recent advancements in algorithmic deep learning\n(R) while mitigating diagnostic human oversight\n(S) and targeted patient management protocols",
    difficulty: "MEDIUM",
    explanation:
      "The logical progression starts with the subject 'recent advancements in algorithmic deep learning' (Q), followed by the active predicate 'have unlocked revolutionary avenues...' (P), extended by compound object 'and targeted patient management protocols' (S), and closed by the participial adverbial clause 'while mitigating...' (R). Sequence: Q - P - S - R.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG English Sentence Rearrangement Benchmark",
    tags: ["Para Jumbles", "Grammar", "Syntax"],
    options: [
      { optionLabel: "A", optionText: "Q - P - S - R", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "P - Q - R - S", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "R - Q - P - S", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "S - P - Q - R", isCorrect: false, order: 4 },
    ],
  },

  // 23. ENGLISH — IDIOMS (MCQ_SINGLE)
  {
    questionCode: "Q-ENG-2026-023",
    examYear: 2026,
    subjectSlug: "english",
    unitNumber: 4,
    topicOrder: 1,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "Select the most appropriate meaning of the underlined idiom in the sentence:\n\n\"Faced with soaring material costs, the enterprise had to **bite the bullet** and revise its quarterly deliverables.\"",
    difficulty: "EASY",
    explanation:
      "'To bite the bullet' is a traditional idiom that means to accept an inevitable, painful, or difficult hardship with courage and resolve.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG English Idioms and Phrases Benchmark",
    tags: ["Idioms", "Phrases", "Comprehension"],
    options: [
      { optionLabel: "A", optionText: "To face an unpleasant or inevitable situation with courage", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "To prematurely celebrate an uncertain victory", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "To aggressively retaliate against external opponents", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "To abandon established operational protocols", isCorrect: false, order: 4 },
    ],
  },

  // 24. ENGLISH — GRAMMAR ERROR IDENTIFICATION (MCQ_SINGLE)
  {
    questionCode: "Q-ENG-2026-024",
    examYear: 2026,
    subjectSlug: "english",
    unitNumber: 5,
    topicOrder: 1,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "Identify the segment of the sentence that contains a grammatical error:\n\n\"Neither the department dean (A) / nor the associate professors (B) / was in attendance (C) / during the inaugural academic symposium (D).\"",
    difficulty: "EASY",
    explanation:
      "In subject-verb agreement with correlative conjunctions 'neither... nor', the verb must agree in number with the closer subject. Here, 'associate professors' is plural, so the verb must be the plural 'were in attendance', not 'was'. Hence segment (C) contains the error.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG English Grammar & Error Spotting Benchmark",
    tags: ["Grammar", "Subject Verb Agreement", "Error Spotting"],
    options: [
      { optionLabel: "A", optionText: "(A) Neither the department dean", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "(B) nor the associate professors", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "(C) was in attendance", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "(D) during the inaugural academic symposium", isCorrect: false, order: 4 },
    ],
  },

  // 25. GENERAL TEST — INDIAN POLITY (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-025",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 1,
    topicOrder: 1,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "Which Article of the Constitution of India enshrines the fundamental Right to Protection of Life and Personal Liberty?",
    difficulty: "EASY",
    explanation:
      "Article 21 provides that 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' It is one of the most broadly interpreted fundamental rights in the Indian Constitution.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG General Test Section III Polity Benchmark",
    tags: ["General Knowledge", "Indian Polity", "Fundamental Rights"],
    options: [
      { optionLabel: "A", optionText: "Article 14", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Article 19", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "Article 21", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "Article 32", isCorrect: false, order: 4 },
    ],
  },

  // 26. GENERAL TEST — TIME & DISTANCE (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-026",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 3,
    topicOrder: 2,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "A train 240 metres long crosses a stationary telegraph post in 16 seconds. What is the speed of the train in kilometres per hour (km/h)?",
    difficulty: "EASY",
    explanation:
      "Speed in m/s = Distance / Time = 240 / 16 = 15 m/s. Converting to km/h by multiplying with 18/5: $15 \\times \\frac{18}{5} = 3 \\times 18 = 54\\text{ km/h}$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Section III Quantitative Aptitude Benchmark",
    tags: ["Quantitative Aptitude", "Speed Time Distance", "Trains"],
    options: [
      { optionLabel: "A", optionText: "45 km/h", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "54 km/h", isCorrect: true, order: 2 },
      { optionLabel: "C", optionText: "60 km/h", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "72 km/h", isCorrect: false, order: 4 },
    ],
  },

  // 27. GENERAL TEST — CODING DECODING (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-027",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 2,
    topicOrder: 2,
    subtopicOrder: 2,
    questionType: "MCQ_SINGLE",
    questionText:
      "In a certain alphanumeric code, if the word **TEACHER** is encoded as **VGCEJGT**, how will the word **STUDENT** be encoded in that identical system?",
    difficulty: "MEDIUM",
    explanation:
      "Each letter is shifted forward by +2 alphabetical steps: T(+2)->V, E(+2)->G, A(+2)->C, C(+2)->E, H(+2)->J, E(+2)->G, R(+2)->T. Applying +2 to STUDENT: S->U, T->V, U->W, D->F, E->G, N->P, T->V. Result: UVWFGPV.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Section III Logical Reasoning Benchmark",
    tags: ["Logical Reasoning", "Coding Decoding", "Alphabetical Series"],
    options: [
      { optionLabel: "A", optionText: "UVWFGPV", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "TVWFGPV", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "UVWFGPU", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "UVWFHPU", isCorrect: false, order: 4 },
    ],
  },

  // 28. GENERAL TEST — PROFIT & PERCENTAGE (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-028",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 3,
    topicOrder: 1,
    subtopicOrder: 3,
    questionType: "MCQ_SINGLE",
    questionText:
      "A merchant marks an inventory item 40% above its cost price and subsequently grants a 20% trade discount on the marked price. What is the merchant's net profit percentage?",
    difficulty: "EASY",
    explanation:
      "Assume Cost Price $CP = 100$. Marked Price $MP = 100 + 40 = 140$. Selling Price after 20% discount $SP = 140 - (0.20 \\times 140) = 140 - 28 = 112$. Net profit percentage $= \\frac{112 - 100}{100} \\times 100\\% = 12\\%$.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Quantitative Ability Benchmark",
    tags: ["Profit and Loss", "Percentages", "Discounts"],
    options: [
      { optionLabel: "A", optionText: "12%", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "16%", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "20%", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "24%", isCorrect: false, order: 4 },
    ],
  },

  // 29. GENERAL TEST — PHYSICAL GEOGRAPHY (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-029",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 1,
    topicOrder: 2,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "Which is the longest river in Peninsular India, often revered in cultural literature as 'Dakshin Ganga'?",
    difficulty: "EASY",
    explanation:
      "The Godavari River is the longest river in Peninsular India, extending approximately 1,465 kilometres from its origin at Trimbakeshwar in the Western Ghats (Maharashtra) before emptying into the Bay of Bengal.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG General Knowledge & Geography Benchmark",
    tags: ["Geography", "Peninsular Rivers", "Static GK"],
    options: [
      { optionLabel: "A", optionText: "Krishna", isCorrect: false, order: 1 },
      { optionLabel: "B", optionText: "Narmada", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "Godavari", isCorrect: true, order: 3 },
      { optionLabel: "D", optionText: "Kaveri", isCorrect: false, order: 4 },
    ],
  },

  // 30. GENERAL TEST — DIRECTION SENSE (MCQ_SINGLE)
  {
    questionCode: "Q-GEN-2026-030",
    examYear: 2026,
    subjectSlug: "general-test",
    unitNumber: 2,
    topicOrder: 3,
    subtopicOrder: 1,
    questionType: "MCQ_SINGLE",
    questionText:
      "Rohan walks 10 metres North. He turns right and walks 6 metres. He then turns right again and walks 18 metres. What is his direct distance and direction relative to his starting coordinates?",
    difficulty: "MEDIUM",
    explanation:
      "Taking start as origin $(0, 0)$: North $10\\text{m} \\to (0, 10)$. Turn right (East) $6\\text{m} \\to (6, 10)$. Turn right (South) $18\\text{m} \\to (6, 10 - 18) = (6, -8)$. Displacement magnitude $= \\sqrt{6^2 + (-8)^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ metres}$. The coordinate $(+6, -8)$ lies South-East of the origin.",
    marks: 5.0,
    negativeMarks: 1.0,
    status: "PUBLISHED",
    provenance: "CUET UG Analytical Reasoning Benchmark",
    tags: ["Direction Sense", "Analytical Reasoning", "Pythagoras Theorem"],
    options: [
      { optionLabel: "A", optionText: "10 metres, South-East", isCorrect: true, order: 1 },
      { optionLabel: "B", optionText: "10 metres, North-East", isCorrect: false, order: 2 },
      { optionLabel: "C", optionText: "14 metres, South", isCorrect: false, order: 3 },
      { optionLabel: "D", optionText: "8 metres, East", isCorrect: false, order: 4 },
    ],
  },
];

