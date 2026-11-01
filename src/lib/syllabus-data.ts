/**
 * MockMate — Verified CUET UG Subject & Syllabus Catalog
 *
 * Sourced directly from:
 * - National Testing Agency (NTA) CUET (UG) Official Information Bulletin
 * - National Council of Educational Research and Training (NCERT) Class 12 Rationalized Curriculum
 *
 * Verification URL: https://exams.nta.ac.in/CUET-UG/
 */

export interface SubtopicData {
  order: number;
  title: string;
}

export interface TopicData {
  order: number;
  title: string;
  subtopics: SubtopicData[];
}

export interface UnitData {
  unitNumber: number;
  title: string;
  description?: string;
  topics: TopicData[];
}

export interface SyllabusVersionData {
  version: string;
  status: "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
  sourceDocument: string;
  sourceUrl: string;
  verifiedAt: string; // ISO date string
  units: UnitData[];
}

export interface SubjectData {
  code: string;
  name: string;
  slug: string;
  categorySlug: "languages" | "domain-subjects" | "general-test";
  categoryName: string;
  description: string;
  examYears: number[];
  syllabus?: SyllabusVersionData; // undefined means not yet published or verified
}

export const CUET_EXAM_YEARS = [2026, 2027] as const;

export const CUET_SUBJECT_CATEGORIES = [
  {
    name: "Section I: Languages",
    slug: "languages",
    description: "Language proficiency, reading comprehension, vocabulary, and grammar.",
  },
  {
    name: "Section II: Domain Subjects",
    slug: "domain-subjects",
    description: "Specialized subject knowledge based exclusively on the NCERT Class 12 rationalized syllabus.",
  },
  {
    name: "Section III: General Aptitude Test",
    slug: "general-test",
    description: "General knowledge, current affairs, numerical ability, and logical reasoning.",
  },
] as const;

export const CUET_SUBJECTS_CATALOG: SubjectData[] = [
  // SECTION I: LANGUAGES
  {
    code: "101",
    name: "English",
    slug: "english",
    categorySlug: "languages",
    categoryName: "Section I: Languages",
    description: "CUET UG Section IA Language paper evaluating reading comprehension, verbal ability, and vocabulary.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Official Syllabus — Section IA English",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Reading Comprehension",
          description: "Passages up to 300-350 words of different types: Factual, Narrative, and Literary.",
          topics: [
            {
              order: 1,
              title: "Factual Passages",
              subtopics: [
                { order: 1, title: "Identifying Main Ideas and Supporting Details" },
                { order: 2, title: "Data and Fact Extraction" },
                { order: 3, title: "Contextual Vocabulary within Technical/Factual Text" },
              ],
            },
            {
              order: 2,
              title: "Narrative & Literary Passages",
              subtopics: [
                { order: 1, title: "Author's Tone and Perspective" },
                { order: 2, title: "Inference and Deductive Reasoning" },
                { order: 3, title: "Metaphors, Similes and Figures of Speech" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Verbal Ability & Grammar",
          description: "Command of language structure, syntax, and sentence coherence.",
          topics: [
            {
              order: 1,
              title: "Rearranging the Parts (Sentence Ordering)",
              subtopics: [
                { order: 1, title: "Para Jumbles and Logical Connectors" },
                { order: 2, title: "Cohesive Sentence Reordering (PQRS)" },
              ],
            },
            {
              order: 2,
              title: "Grammar & Sentence Correction",
              subtopics: [
                { order: 1, title: "Subject-Verb Agreement" },
                { order: 2, title: "Tenses, Modals and Conditional Clauses" },
                { order: 3, title: "Prepositions and Conjunctions" },
                { order: 4, title: "Active and Passive Voice" },
                { order: 5, title: "Direct and Indirect Speech" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Vocabulary & Word Power",
          description: "Lexical knowledge, idiomatic expressions, and word connotations.",
          topics: [
            {
              order: 1,
              title: "Synonyms and Antonyms",
              subtopics: [
                { order: 1, title: "Contextual Word Substitution" },
                { order: 2, title: "High-Frequency Academic Vocabulary" },
              ],
            },
            {
              order: 2,
              title: "Idioms, Phrases & Analogies",
              subtopics: [
                { order: 1, title: "Idiomatic Expressions and Phrasal Verbs" },
                { order: 2, title: "Word Analogies and Relationships" },
                { order: 3, title: "One-Word Substitution" },
                { order: 4, title: "Spelling Errors and Confusing Words" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    code: "102",
    name: "Hindi",
    slug: "hindi",
    categorySlug: "languages",
    categoryName: "Section I: Languages",
    description: "CUET UG Section IA Hindi language paper covering comprehension, vyakaran, and shabda samarthya.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Official Syllabus — Section IA Hindi",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Apathit Gadyansh (Reading Comprehension)",
          description: "Gadyansh evaluation based on factual, narrative, and literary passages.",
          topics: [
            {
              order: 1,
              title: "Gadyansh Vishleshan",
              subtopics: [
                { order: 1, title: "Mukhya Bhav aur Tathyatmak Prashna" },
                { order: 2, title: "Nishkarsh aur Sandarbh Bodh" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Vyakaran evam Shabda Rachna",
          description: "Hindi grammar fundamentals and sentence syntax.",
          topics: [
            {
              order: 1,
              title: "Shabda Bhed va Vyakaran",
              subtopics: [
                { order: 1, title: "Sandhi, Samas, Upsarg aur Pratyay" },
                { order: 2, title: "Sangya, Sarvanam, Visheshan aur Kriya" },
                { order: 3, title: "Vakya Shuddhi evam Kram Vyavasthapan" },
              ],
            },
            {
              order: 2,
              title: "Shabda Samarthya (Vocabulary)",
              subtopics: [
                { order: 1, title: "Paryayvachi evam Vilom Shabda" },
                { order: 2, title: "Anekarthi evam Samroopi Bhinnarthak Shabda" },
                { order: 3, title: "Muhavare evam Lokoktiyan" },
                { order: 4, title: "Vakyansh ke liye Ek Shabda" },
              ],
            },
          ],
        },
      ],
    },
  },

  // SECTION II: DOMAIN SUBJECTS
  {
    code: "314",
    name: "Physics",
    slug: "physics",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Core physical sciences paper aligned to NCERT Class 12 rationalized syllabus covering electrodynamics, optics, and modern physics.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Physics Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Electrostatics",
          description: "Electric charges, Coulomb's law, electric field, potential, and capacitance.",
          topics: [
            {
              order: 1,
              title: "Electric Charges and Fields",
              subtopics: [
                { order: 1, title: "Coulomb's Law, forces between multiple charges and superposition principle" },
                { order: 2, title: "Electric field, field lines, electric dipole and torque on a dipole" },
                { order: 3, title: "Electric flux, Gauss's theorem and its applications to infinitely long straight wire, uniformly charged infinite plane sheet and thin spherical shell" },
              ],
            },
            {
              order: 2,
              title: "Electrostatic Potential and Capacitance",
              subtopics: [
                { order: 1, title: "Electric potential, potential difference, equipotential surfaces, potential energy of a system of charges" },
                { order: 2, title: "Conductors, insulators, dielectrics and electric polarization" },
                { order: 3, title: "Capacitors and capacitance, combination of capacitors in series and parallel, energy stored in a capacitor" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Current Electricity",
          description: "Electric currents, Ohm's law, resistance, electrical circuits, and measurement devices.",
          topics: [
            {
              order: 1,
              title: "Electric Current and Resistance",
              subtopics: [
                { order: 1, title: "Drift velocity, mobility, Ohm's law, electrical resistance and V-I characteristics" },
                { order: 2, title: "Electrical resistivity, conductivity and temperature dependence of resistance" },
                { order: 3, title: "Internal resistance of a cell, terminal potential difference and emf, cells in series and in parallel" },
              ],
            },
            {
              order: 2,
              title: "Electrical Circuits and Measurements",
              subtopics: [
                { order: 1, title: "Kirchhoff's rules and their circuit applications" },
                { order: 2, title: "Wheatstone bridge and its sensitivity condition" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Magnetic Effects of Current and Magnetism",
          description: "Magnetic fields due to currents, Biot-Savart law, Ampere's circuital law, and magnetic materials.",
          topics: [
            {
              order: 1,
              title: "Moving Charges and Magnetism",
              subtopics: [
                { order: 1, title: "Concept of magnetic field, Oersted's experiment, Biot-Savart law and applications to circular current loop" },
                { order: 2, title: "Ampere's circuital law and its applications to infinitely long straight wire and solenoid" },
                { order: 3, title: "Force on moving charge in magnetic field (Lorentz force), force between two parallel current-carrying conductors" },
                { order: 4, title: "Torque experienced by current loop in uniform magnetic field, moving coil galvanometer and conversion to ammeter/voltmeter" },
              ],
            },
            {
              order: 2,
              title: "Magnetism and Matter",
              subtopics: [
                { order: 1, title: "Current loop as magnetic dipole and magnetic dipole moment" },
                { order: 2, title: "Magnetic field lines, Earth's magnetic elements" },
                { order: 3, title: "Magnetic properties of materials: diamagnetic, paramagnetic, and ferromagnetic substances" },
              ],
            },
          ],
        },
        {
          unitNumber: 4,
          title: "Electromagnetic Induction and Alternating Currents",
          description: "Faraday's laws, Lenz's law, inductance, AC circuits, and power factor.",
          topics: [
            {
              order: 1,
              title: "Electromagnetic Induction",
              subtopics: [
                { order: 1, title: "Electromagnetic induction, Faraday's laws, induced emf and current, Lenz's Law, Eddy currents" },
                { order: 2, title: "Self and mutual induction" },
              ],
            },
            {
              order: 2,
              title: "Alternating Currents",
              subtopics: [
                { order: 1, title: "Peak and RMS value of alternating current/voltage, reactance and impedance" },
                { order: 2, title: "LCR series circuit, resonance, quality factor and power in AC circuits, wattless current" },
                { order: 3, title: "AC generator and transformer principles and losses" },
              ],
            },
          ],
        },
        {
          unitNumber: 5,
          title: "Electromagnetic Waves",
          description: "Characteristics, displacement current, and the electromagnetic spectrum.",
          topics: [
            {
              order: 1,
              title: "Electromagnetic Waves and Spectrum",
              subtopics: [
                { order: 1, title: "Displacement current, characteristics and transverse nature of EM waves" },
                { order: 2, title: "Electromagnetic spectrum (radio waves, microwaves, infrared, visible, ultraviolet, X-rays, gamma rays) and applications" },
              ],
            },
          ],
        },
        {
          unitNumber: 6,
          title: "Optics",
          description: "Ray optics, wave optics, optical instruments, interference, and diffraction.",
          topics: [
            {
              order: 1,
              title: "Ray Optics and Optical Instruments",
              subtopics: [
                { order: 1, title: "Refraction of light, total internal reflection and optical fibers" },
                { order: 2, title: "Refraction at spherical surfaces, thin lens formula, lens maker's formula, magnification and power of a lens" },
                { order: 3, title: "Refraction of light through a prism" },
                { order: 4, title: "Microscopes and astronomical telescopes (reflecting and refracting) and their magnifying powers" },
              ],
            },
            {
              order: 2,
              title: "Wave Optics",
              subtopics: [
                { order: 1, title: "Wave front and Huygens' principle, reflection and refraction of plane wave at a plane surface" },
                { order: 2, title: "Interference of light, Young's double slit experiment and fringe width expression" },
                { order: 3, title: "Diffraction due to a single slit, width of central maximum" },
              ],
            },
          ],
        },
        {
          unitNumber: 7,
          title: "Dual Nature of Radiation and Matter",
          description: "Photoelectric effect, Einstein's photoelectric equation, and matter waves.",
          topics: [
            {
              order: 1,
              title: "Photoelectric Effect and Matter Waves",
              subtopics: [
                { order: 1, title: "Photoelectric effect, Hertz and Lenard's observations, Einstein's photoelectric equation" },
                { order: 2, title: "Particle nature of light (photons), matter waves, wave nature of particles and de Broglie relation" },
              ],
            },
          ],
        },
        {
          unitNumber: 8,
          title: "Atoms and Nuclei",
          description: "Atomic models, Bohr's theory, nuclear composition, binding energy, and nuclear reactions.",
          topics: [
            {
              order: 1,
              title: "Atoms",
              subtopics: [
                { order: 1, title: "Alpha-particle scattering experiment, Rutherford's model of atom" },
                { order: 2, title: "Bohr model of hydrogen atom, energy levels and hydrogen emission spectrum" },
              ],
            },
            {
              order: 2,
              title: "Nuclei",
              subtopics: [
                { order: 1, title: "Composition and size of nucleus, atomic masses, isotopes, isobars, isotones" },
                { order: 2, title: "Mass-energy relation, mass defect, binding energy per nucleon and its variation with mass number" },
                { order: 3, title: "Nuclear fission and nuclear fusion" },
              ],
            },
          ],
        },
        {
          unitNumber: 9,
          title: "Electronic Devices",
          description: "Semiconductors, p-n junction diodes, rectification, and basic digital circuits.",
          topics: [
            {
              order: 1,
              title: "Semiconductor Materials and Devices",
              subtopics: [
                { order: 1, title: "Energy bands in conductors, semiconductors and insulators" },
                { order: 2, title: "Intrinsic and extrinsic semiconductors (p-type and n-type)" },
                { order: 3, title: "p-n junction diode: forward and reverse bias, I-V characteristics" },
                { order: 4, title: "Diode as a half-wave and full-wave rectifier" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "306",
    name: "Chemistry",
    slug: "chemistry",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Physical, Inorganic, and Organic Chemistry based on NCERT Class 12 covering solutions, kinetics, coordination compounds, and biomolecules.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Chemistry Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Solutions",
          description: "Types of solutions, concentration, solubility, Raoult's law, and colligative properties.",
          topics: [
            {
              order: 1,
              title: "Solubility and Colligative Properties",
              subtopics: [
                { order: 1, title: "Types of solutions, expression of concentration of solutions of solids in liquids" },
                { order: 2, title: "Solubility of gases in liquids, Henry's law, Raoult's law for volatile solutes" },
                { order: 3, title: "Ideal and non-ideal solutions, colligative properties: relative lowering of vapour pressure, elevation of boiling point, depression of freezing point, osmotic pressure" },
                { order: 4, title: "Determination of molecular mass using colligative properties, abnormal molecular mass and van 't Hoff factor" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Electrochemistry",
          description: "Redox reactions, galvanic and electrolytic cells, Nernst equation, and Kohlrausch's law.",
          topics: [
            {
              order: 1,
              title: "Electrochemical Cells and Conductance",
              subtopics: [
                { order: 1, title: "Redox reactions, EMF of a cell, standard electrode potential, Nernst equation and its application to chemical cells" },
                { order: 2, title: "Relation between Gibbs energy change and EMF of a cell" },
                { order: 3, title: "Conductance in electrolytic solutions, specific and molar conductivity, variations of conductivity with concentration, Kohlrausch's Law" },
                { order: 4, title: "Electrolysis, Faraday's laws of electrolysis, dry cell, lead accumulator, fuel cells, corrosion" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Chemical Kinetics",
          description: "Reaction rates, order, molecularity, rate laws, and Arrhenius theory.",
          topics: [
            {
              order: 1,
              title: "Reaction Rates and Integrated Rate Equations",
              subtopics: [
                { order: 1, title: "Rate of a reaction (average and instantaneous), factors influencing reaction rate" },
                { order: 2, title: "Order and molecularity of a reaction, rate law and specific rate constant" },
                { order: 3, title: "Integrated rate equations and half-life for zero and first order reactions" },
                { order: 4, title: "Concept of collision theory, activation energy, Arrhenius equation" },
              ],
            },
          ],
        },
        {
          unitNumber: 4,
          title: "d and f Block Elements",
          description: "Transition elements, Lanthanoids, and Actinoids.",
          topics: [
            {
              order: 1,
              title: "Transition Elements (d-Block)",
              subtopics: [
                { order: 1, title: "General introduction, electronic configuration, occurrence and general characteristics of transition metals" },
                { order: 2, title: "Trends in physical and chemical properties: ionization enthalpy, oxidation states, ionic radii, catalytic property, magnetic properties, complex formation" },
                { order: 3, title: "Preparation and properties of K2Cr2O7 and KMnO4" },
              ],
            },
            {
              order: 2,
              title: "Inner Transition Elements (f-Block)",
              subtopics: [
                { order: 1, title: "Lanthanoids: Electronic configuration, oxidation states and lanthanoid contraction and its consequences" },
                { order: 2, title: "Actinoids: Electronic configuration, oxidation states and comparison with lanthanoids" },
              ],
            },
          ],
        },
        {
          unitNumber: 5,
          title: "Coordination Compounds",
          description: "Coordination complexes, IUPAC nomenclature, isomerism, bonding, and stability.",
          topics: [
            {
              order: 1,
              title: "Structure and Bonding in Coordination Complexes",
              subtopics: [
                { order: 1, title: "Werner's theory, ligands, coordination number, coordination sphere, IUPAC nomenclature of mononuclear coordination compounds" },
                { order: 2, title: "Isomerism (structural and stereo) in coordination compounds" },
                { order: 3, title: "Bonding: Valence Bond Theory and Crystal Field Theory (octahedral and tetrahedral fields)" },
                { order: 4, title: "Color, magnetic properties, and stability of coordination compounds" },
              ],
            },
          ],
        },
        {
          unitNumber: 6,
          title: "Haloalkanes and Haloarenes",
          description: "Nomenclature, SN1 and SN2 mechanisms, properties, and environmental effects.",
          topics: [
            {
              order: 1,
              title: "Haloalkanes and Haloarenes Chemistry",
              subtopics: [
                { order: 1, title: "Nomenclature, nature of C-X bond, physical and chemical properties" },
                { order: 2, title: "Mechanisms of substitution reactions (SN1 and SN2), optical rotation and inversion" },
                { order: 3, title: "Haloarenes: Nature of C-X bond, substitution reactions (directive influence of halogen in monosubstituted compounds)" },
              ],
            },
          ],
        },
        {
          unitNumber: 7,
          title: "Alcohols, Phenols and Ethers",
          description: "Classification, preparation methods, mechanisms, and chemical reactions.",
          topics: [
            {
              order: 1,
              title: "Alcohols and Phenols",
              subtopics: [
                { order: 1, title: "Classification, nomenclature, methods of preparation, physical and chemical properties" },
                { order: 2, title: "Mechanism of dehydration of alcohols" },
                { order: 3, title: "Phenols: Acidity, electrophilic substitution reactions, Kolbe's reaction, Reimer-Tiemann reaction" },
              ],
            },
            {
              order: 2,
              title: "Ethers",
              subtopics: [
                { order: 1, title: "Nomenclature, methods of preparation (Williamson synthesis), physical and chemical properties" },
              ],
            },
          ],
        },
        {
          unitNumber: 8,
          title: "Aldehydes, Ketones and Carboxylic Acids",
          description: "Carbonyl chemistry, nucleophilic addition, oxidation-reduction, and acidity.",
          topics: [
            {
              order: 1,
              title: "Aldehydes and Ketones",
              subtopics: [
                { order: 1, title: "Nomenclature, nature of carbonyl group, methods of preparation" },
                { order: 2, title: "Nucleophilic addition reactions, alpha-hydrogen reactivity, Aldol condensation, Cannizzaro reaction" },
              ],
            },
            {
              order: 2,
              title: "Carboxylic Acids",
              subtopics: [
                { order: 1, title: "Nomenclature, acidic nature, methods of preparation, physical and chemical properties" },
              ],
            },
          ],
        },
        {
          unitNumber: 9,
          title: "Amines (Organic Compounds Containing Nitrogen)",
          description: "Classification, Gabriel synthesis, basicity, and diazonium salts.",
          topics: [
            {
              order: 1,
              title: "Amines and Diazonium Salts",
              subtopics: [
                { order: 1, title: "Classification, structure, nomenclature, methods of preparation, basic character of amines" },
                { order: 2, title: "Identification of primary, secondary, and tertiary amines (Hinsberg test)" },
                { order: 3, title: "Diazonium salts: Preparation, chemical reactions, and synthetic importance in organic synthesis" },
              ],
            },
          ],
        },
        {
          unitNumber: 10,
          title: "Biomolecules",
          description: "Carbohydrates, proteins, enzymes, vitamins, and nucleic acids.",
          topics: [
            {
              order: 1,
              title: "Carbohydrates, Proteins and Nucleic Acids",
              subtopics: [
                { order: 1, title: "Carbohydrates: Classification, monosaccharides (glucose and fructose), D-L configuration, oligosaccharides and polysaccharides" },
                { order: 2, title: "Proteins: Amino acids, peptide bond, primary, secondary, tertiary and quaternary structure, denaturation of proteins" },
                { order: 3, title: "Nucleic acids: Chemical composition of DNA and RNA, double helix structure" },
                { order: 4, title: "Vitamins and hormones: Classification, biological functions and deficiency diseases" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "312",
    name: "Mathematics / Applied Mathematics",
    slug: "mathematics",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Core & Applied Mathematics covering matrices, calculus, differential equations, vectors, 3D geometry, and probability distributions.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Mathematics Syllabus (Section A & Section B)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Section A: Common Topics (Algebra & Calculus)",
          description: "Compulsory section covering matrices, determinants, calculus, differential equations, and probability.",
          topics: [
            {
              order: 1,
              title: "Algebra & Matrices",
              subtopics: [
                { order: 1, title: "Matrices and types of matrices, equality of matrices, transpose of a matrix" },
                { order: 2, title: "Determinants, minors, cofactors, adjoint and inverse of a square matrix" },
                { order: 3, title: "Consistency, inconsistency and number of solutions of system of linear equations" },
              ],
            },
            {
              order: 2,
              title: "Calculus & Integrals",
              subtopics: [
                { order: 1, title: "Higher order derivatives, rate of change of quantities" },
                { order: 2, title: "Increasing and decreasing functions, tangents and normals, maxima and minima" },
                { order: 3, title: "Definite integrals and fundamental theorem of calculus" },
                { order: 4, title: "Applications of definite integrals: Area bounded by simple curves" },
              ],
            },
            {
              order: 3,
              title: "Differential Equations & Probability",
              subtopics: [
                { order: 1, title: "Order and degree of differential equations, formulating differential equations" },
                { order: 2, title: "Solutions of first order differential equations by separation of variables" },
                { order: 3, title: "Random variables, probability distributions and Binomial distribution" },
                { order: 4, title: "Linear Programming problem formulation and graphical solution" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Section B1: Relations, Functions and Advanced Calculus",
          description: "Core mathematics elective section focusing on theoretical depth and analysis.",
          topics: [
            {
              order: 1,
              title: "Relations and Functions",
              subtopics: [
                { order: 1, title: "Types of relations: reflexive, symmetric, transitive and equivalence relations" },
                { order: 2, title: "One-to-one and onto functions, composite functions, inverse of a function" },
                { order: 3, title: "Inverse trigonometric functions: definition, range, domain and principal value branch" },
              ],
            },
            {
              order: 2,
              title: "Continuity and Differentiability",
              subtopics: [
                { order: 1, title: "Continuity and differentiability, derivative of composite functions, chain rule" },
                { order: 2, title: "Derivatives of inverse trigonometric functions, implicit functions, exponential and logarithmic functions" },
                { order: 3, title: "Rolle's and Lagrange's Mean Value Theorems (geometric interpretation)" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Section B1: Vectors, 3D Geometry and Probability",
          description: "Spatial geometry, vector operations, and conditional probability models.",
          topics: [
            {
              order: 1,
              title: "Vectors and Three-Dimensional Geometry",
              subtopics: [
                { order: 1, title: "Vectors and scalars, magnitude and direction of a vector, direction cosines and direction ratios" },
                { order: 2, title: "Dot (scalar) product and cross (vector) product of vectors" },
                { order: 3, title: "Cartesian and vector equation of a line, coplanar and skew lines, shortest distance between two lines" },
                { order: 4, title: "Cartesian and vector equation of a plane, angle between two planes, distance of a point from a plane" },
              ],
            },
            {
              order: 2,
              title: "Probability and Bayes' Theorem",
              subtopics: [
                { order: 1, title: "Conditional probability, multiplication theorem on probability, independent events" },
                { order: 2, title: "Total probability and Bayes' theorem with real-world applications" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "304",
    name: "Biology / Biological Studies / Biotechnology",
    slug: "biology",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "NCERT Class 12 Biology syllabus covering reproduction, genetics, biotechnology, and ecology.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Biology Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Reproduction",
          description: "Sexual reproduction in flowering plants, human reproduction, and reproductive health.",
          topics: [
            {
              order: 1,
              title: "Sexual Reproduction in Flowering Plants",
              subtopics: [
                { order: 1, title: "Flower structure, development of male and female gametophytes" },
                { order: 2, title: "Pollination types, outbreeding devices, pollen-pistil interaction" },
                { order: 3, title: "Double fertilization, development of endosperm and embryo, apomixis and polyembryony" },
              ],
            },
            {
              order: 2,
              title: "Human Reproduction & Reproductive Health",
              subtopics: [
                { order: 1, title: "Male and female reproductive systems, microscopic anatomy of testis and ovary" },
                { order: 2, title: "Gametogenesis (spermatogenesis and oogenesis), menstrual cycle" },
                { order: 3, title: "Fertilization, embryo development up to blastocyst formation, implantation, pregnancy and placenta formation" },
                { order: 4, title: "Need for reproductive health, contraceptive methods, sexually transmitted infections, assisted reproductive technologies (IVF, ZIFT, GIFT)" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Genetics and Evolution",
          description: "Mendelian inheritance, molecular basis of inheritance, and evolutionary biology.",
          topics: [
            {
              order: 1,
              title: "Principles of Inheritance and Variation",
              subtopics: [
                { order: 1, title: "Mendelian inheritance, deviations from Mendelism (incomplete dominance, co-dominance, multiple alleles)" },
                { order: 2, title: "Chromosome theory of inheritance, linkage and genetic mapping" },
                { order: 3, title: "Sex determination in humans, birds, and honeybees; sex-linked inheritance (haemophilia, colour blindness)" },
                { order: 4, title: "Mendelian disorders and chromosomal disorders in humans (Down's, Turner's, Klinefelter's syndromes)" },
              ],
            },
            {
              order: 2,
              title: "Molecular Basis of Inheritance",
              subtopics: [
                { order: 1, title: "Structure of DNA and RNA, DNA packaging, search for genetic material" },
                { order: 2, title: "DNA replication, transcription, genetic code, translation" },
                { order: 3, title: "Gene regulation (Lac operon), Human Genome Project, DNA fingerprinting" },
              ],
            },
            {
              order: 3,
              title: "Evolution",
              subtopics: [
                { order: 1, title: "Origin of life, biological evolution and evidences for biological evolution (paleontological, comparative anatomy, embryological and molecular)" },
                { order: 2, title: "Darwin's contribution, Modern synthetic theory of evolution, Hardy-Weinberg principle" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Biology and Human Welfare",
          description: "Human health and diseases, immunity, and microbes in human welfare.",
          topics: [
            {
              order: 1,
              title: "Human Health and Diseases",
              subtopics: [
                { order: 1, title: "Pathogens, parasites causing human diseases (malaria, filariasis, ascariasis, typhoid, pneumonia, common cold, amoebiasis, ringworm)" },
                { order: 2, title: "Basic concepts of immunology, vaccines, cancer, HIV and AIDS" },
                { order: 3, title: "Adolescence, drug and alcohol abuse" },
              ],
            },
            {
              order: 2,
              title: "Microbes in Human Welfare",
              subtopics: [
                { order: 1, title: "Microbes in household food processing, industrial production, sewage treatment, energy generation (biogas), biocontrol agents and biofertilizers" },
              ],
            },
          ],
        },
        {
          unitNumber: 4,
          title: "Biotechnology and Its Applications",
          description: "rDNA technology principles, processes, and applications in health and agriculture.",
          topics: [
            {
              order: 1,
              title: "Principles and Processes of Biotechnology",
              subtopics: [
                { order: 1, title: "Genetic engineering (recombinant DNA technology), restriction enzymes, cloning vectors" },
                { order: 2, title: "Polymerase Chain Reaction (PCR), insertion of rDNA into host cell, bioreactors, downstream processing" },
              ],
            },
            {
              order: 2,
              title: "Applications of Biotechnology",
              subtopics: [
                { order: 1, title: "Applications in health: Genetically engineered insulin, gene therapy, molecular diagnostics (ELISA, PCR)" },
                { order: 2, title: "Applications in agriculture: Bt crops, RNA interference (RNAi), transgenic animals, biosafety and ethical issues" },
              ],
            },
          ],
        },
        {
          unitNumber: 5,
          title: "Ecology and Environment",
          description: "Organisms and populations, ecosystems, biodiversity, and conservation biology.",
          topics: [
            {
              order: 1,
              title: "Organisms, Populations and Ecosystems",
              subtopics: [
                { order: 1, title: "Organism and its environment, major abiotic factors, adaptations, population attributes, growth models, population interactions" },
                { order: 2, title: "Ecosystem structure and function, productivity, decomposition, energy flow, ecological pyramids" },
              ],
            },
            {
              order: 2,
              title: "Biodiversity and Conservation",
              subtopics: [
                { order: 1, title: "Concept of biodiversity, patterns of biodiversity, importance of biodiversity, loss of biodiversity" },
                { order: 2, title: "Biodiversity conservation: in-situ and ex-situ conservation, hot spots, endangered organisms, Red Data Book, biosphere reserves, national parks and sanctuaries" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "308",
    name: "Economics / Business Economics",
    slug: "economics",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Introductory Microeconomics, Macroeconomics, and Indian Economic Development.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Economics Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Introduction to Microeconomics",
          description: "Consumer equilibrium, demand analysis, and elasticity.",
          topics: [
            {
              order: 1,
              title: "Consumer Behaviour and Demand",
              subtopics: [
                { order: 1, title: "Meaning of utility, marginal utility, law of diminishing marginal utility, consumer's equilibrium using indifference curve analysis" },
                { order: 2, title: "Demand, market demand, determinants of demand, demand schedule, demand curve, movement along and shifts in the demand curve" },
                { order: 3, title: "Price elasticity of demand: measurement (percentage and geometric methods), factors affecting price elasticity" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Introductory Macroeconomics",
          description: "National income, money and banking, determination of income and employment, government budget, and balance of payments.",
          topics: [
            {
              order: 1,
              title: "National Income and Related Aggregates",
              subtopics: [
                { order: 1, title: "Basic concepts: circular flow of income, GDP, GNP, NDP, NNP at market price and factor cost" },
                { order: 2, title: "Measurement of National Income: Value Added method, Income method, and Expenditure method" },
              ],
            },
            {
              order: 2,
              title: "Money, Banking and Monetary Policy",
              subtopics: [
                { order: 1, title: "Money: meaning, supply of money (currency with public and net demand deposits), money creation by commercial banking system" },
                { order: 2, title: "Central Bank (RBI) and functions: Bank of issue, government bank, banker's bank, controller of credit through Repo, Reverse Repo, CRR, SLR" },
              ],
            },
            {
              order: 3,
              title: "Determination of Income and Employment",
              subtopics: [
                { order: 1, title: "Aggregate demand, aggregate supply and their components, propensity to consume and propensity to save (average and marginal)" },
                { order: 2, title: "Short-run equilibrium output, investment multiplier and its mechanism" },
                { order: 3, title: "Problems of excess demand and deficient demand, measures to correct them: changes in government spending, taxes and money supply" },
              ],
            },
            {
              order: 4,
              title: "Government Budget and Balance of Payments",
              subtopics: [
                { order: 1, title: "Government budget: meaning, objectives and components (revenue and capital budget)" },
                { order: 2, title: "Fiscal deficit, revenue deficit, primary deficit: meanings and implications" },
                { order: 3, title: "Balance of payments: current and capital accounts, foreign exchange rate: fixed and flexible rates, managed floating" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Indian Economic Development",
          description: "Development policies since 1947, economic reforms (LPG), and current challenges facing the Indian economy.",
          topics: [
            {
              order: 1,
              title: "Development Experience (1947-90) & Economic Reforms (1991)",
              subtopics: [
                { order: 1, title: "A brief introduction of the state of Indian economy on the eve of independence, Five Year Plans goals" },
                { order: 2, title: "Economic Reforms since 1991: Features and appraisals of Liberalisation, Privatisation and Globalisation (LPG)" },
              ],
            },
            {
              order: 2,
              title: "Current Challenges Facing the Indian Economy",
              subtopics: [
                { order: 1, title: "Human Capital Formation: Education and health expenditure role" },
                { order: 2, title: "Rural Development: Credit and marketing, agricultural diversification, organic farming" },
                { order: 3, title: "Employment: Growth, informalisation and related issues" },
                { order: 4, title: "Sustainable Economic Development: Meaning, effects of economic development on resources and environment" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "301",
    name: "Accountancy / Book Keeping",
    slug: "accountancy",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Partnership accounts, company accounts (shares and debentures), financial statement analysis, and cash flow statements.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Accountancy Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Accounting for Partnership Firms",
          description: "Fundamentals of partnership, goodwill valuation, reconstitution, admission, retirement, and dissolution.",
          topics: [
            {
              order: 1,
              title: "Partnership Fundamentals & Reconstitution",
              subtopics: [
                { order: 1, title: "Partnership deed, capital accounts, profit and loss appropriation account, past adjustments and guarantee of profits" },
                { order: 2, title: "Goodwill: nature, factors affecting and methods of valuation (Average profit, Super profit and Capitalisation methods)" },
                { order: 3, title: "Change in profit sharing ratio among existing partners: sacrificing and gaining ratio, accounting treatment of reserves and accumulated profits" },
              ],
            },
            {
              order: 2,
              title: "Admission, Retirement and Dissolution of a Partner",
              subtopics: [
                { order: 1, title: "Admission of a partner: effect of admission, calculation of new profit sharing ratio and sacrificing ratio, treatment of goodwill, revaluation of assets and reassessment of liabilities" },
                { order: 2, title: "Retirement and death of a partner: calculating new ratio, treatment of goodwill, settlement of loan account" },
                { order: 3, title: "Dissolution of partnership firm: realization account and other related accounts" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Accounting for Companies",
          description: "Share capital transactions, forfeiture, reissue, and issue and redemption of debentures.",
          topics: [
            {
              order: 1,
              title: "Accounting for Share Capital",
              subtopics: [
                { order: 1, title: "Share and share capital: nature and types, accounting for issue and allotment of equity and preference shares" },
                { order: 2, title: "Private placement of shares, Employee Stock Option Plan (ESOP), sweat equity" },
                { order: 3, title: "Forfeiture and reissue of shares (at par, at premium), disclosure of share capital in company's balance sheet" },
              ],
            },
            {
              order: 2,
              title: "Accounting for Debentures",
              subtopics: [
                { order: 1, title: "Issue of debentures at par, at a premium and at a discount, issue of debentures as collateral security" },
                { order: 2, title: "Issue of debentures with terms of redemption, writing off discount/loss on issue of debentures" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Analysis of Financial Statements",
          description: "Financial ratios, common-size statements, and cash flow statement (AS-3).",
          topics: [
            {
              order: 1,
              title: "Financial Statement Analysis and Ratios",
              subtopics: [
                { order: 1, title: "Financial statements of a company: Meaning, objectives, importance and limitations" },
                { order: 2, title: "Tools for Financial Statement Analysis: Comparative statements, common size statements" },
                { order: 3, title: "Accounting Ratios: Liquidity ratios, Solvency ratios, Activity/Turnover ratios, Profitability ratios" },
              ],
            },
            {
              order: 2,
              title: "Cash Flow Statement",
              subtopics: [
                { order: 1, title: "Meaning, objectives, preparation of Cash Flow Statement as per Accounting Standard 3 (Revised) (Indirect method only)" },
                { order: 2, title: "Cash flows from operating activities, investing activities, and financing activities" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "305",
    name: "Business Studies",
    slug: "business-studies",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Principles and Functions of Management, Business Finance and Marketing.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Business Studies Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Principles and Functions of Management",
          description: "Nature of management, Fayol and Taylor principles, planning, organising, staffing, directing, and controlling.",
          topics: [
            {
              order: 1,
              title: "Nature of Management & Principles",
              subtopics: [
                { order: 1, title: "Management: concept, objectives, and importance; management as Science, Art and Profession" },
                { order: 2, title: "Principles of Management: Fayol's 14 principles, Taylor's Scientific Management principles and techniques" },
                { order: 3, title: "Business Environment: concept, importance, dimensions (Economic, Social, Technological, Political, Legal)" },
              ],
            },
            {
              order: 2,
              title: "Core Management Functions",
              subtopics: [
                { order: 1, title: "Planning: Concept, importance, limitations, planning process, types of plans" },
                { order: 2, title: "Organising: Concept, importance, organising process, structure of organisation (functional and divisional)" },
                { order: 3, title: "Staffing: Concept, importance, staffing process, recruitment, selection, training and development" },
                { order: 4, title: "Directing: Concept, elements (Supervision, Motivation - Maslow hierarchy, Leadership, Communication)" },
                { order: 5, title: "Controlling: Concept, importance, relationship between planning and controlling, controlling process" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Business Finance and Marketing",
          description: "Financial management, financial markets, marketing management, and consumer protection.",
          topics: [
            {
              order: 1,
              title: "Financial Management and Markets",
              subtopics: [
                { order: 1, title: "Financial Management: Concept, role, objectives, financial decisions (investment, financing, dividend)" },
                { order: 2, title: "Capital structure, fixed and working capital factors" },
                { order: 3, title: "Financial Markets: Money market and Capital market (Primary and Secondary), SEBI functions and objectives" },
              ],
            },
            {
              order: 2,
              title: "Marketing & Consumer Protection",
              subtopics: [
                { order: 1, title: "Marketing: Concept, functions, marketing philosophies (production, product, selling, marketing, societal)" },
                { order: 2, title: "Marketing Mix: 4 Ps (Product, Price, Place/Physical Distribution, Promotion)" },
                { order: 3, title: "Consumer Protection Act 2019: Concept, consumer rights, responsibilities, redressal machinery" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "310",
    name: "History",
    slug: "history",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Themes in Indian History: Ancient civilizations, medieval society, and modern colonial movements.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) History Syllabus (Themes in Indian History I, II, III)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Archaeology & Ancient India",
          description: "Harappan archaeology, early states and economies, social histories through Mahabharata.",
          topics: [
            {
              order: 1,
              title: "Bricks, Beads and Bones (The Harappan Civilisation)",
              subtopics: [
                { order: 1, title: "Urban layout, craft production, social differences, and end of the civilization" },
              ],
            },
            {
              order: 2,
              title: "Kings, Farmers and Towns (Early States and Economies)",
              subtopics: [
                { order: 1, title: "The 16 Mahajanapadas, Mauryan Empire, Ashokan inscriptions, and agrarian economies" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Medieval India: Society and Culture",
          description: "Agrarian relations, Mughal court, Vijayanagara Empire, Bhakti and Sufi traditions.",
          topics: [
            {
              order: 1,
              title: "Through the Eyes of Travellers & Bhakti-Sufi Traditions",
              subtopics: [
                { order: 1, title: "Accounts of Al-Biruni, Ibn Battuta, and Francois Bernier" },
                { order: 2, title: "Bhakti saints, Sufi silsilas, integration of cults and devotional literature" },
              ],
            },
            {
              order: 2,
              title: "An Imperial Capital: Vijayanagara & Peasants, Zamindars and State",
              subtopics: [
                { order: 1, title: "Discovery of Hampi, Rayas, Nayakas, and urban infrastructure" },
                { order: 2, title: "Agrarian society under the Mughals, Ain-i-Akbari, land revenue systems" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Modern India: Colonialism & Nation Building",
          description: "Colonial rule, 1857 revolt, Mahatma Gandhi and the nationalist movement, Framing of Constitution.",
          topics: [
            {
              order: 1,
              title: "Colonialism, The Countryside & Rebels and the Raj (1857)",
              subtopics: [
                { order: 1, title: "Permanent Settlement in Bengal, Ryotwari, Santhal rebellion" },
                { order: 2, title: "Pattern of 1857 rebellion, visions of unity, British repression and visual representations" },
              ],
            },
            {
              order: 2,
              title: "Mahatma Gandhi and the Nationalist Movement & Framing the Constitution",
              subtopics: [
                { order: 1, title: "Non-Cooperation, Civil Disobedience, Quit India, and mass mobilization" },
                { order: 2, title: "Constituent Assembly debates, linguistic reorganization, and fundamental rights" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "315",
    name: "Political Science",
    slug: "political-science",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Contemporary World Politics and Politics in India Since Independence.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Political Science Syllabus (Class 12 NCERT)",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Contemporary World Politics",
          description: "The end of bipolarity, contemporary centers of power, contemporary South Asia, international organizations, security, environment, and globalization.",
          topics: [
            {
              order: 1,
              title: "Global Politics Dynamics",
              subtopics: [
                { order: 1, title: "The End of Bipolarity: Disintegration of USSR, Shock Therapy and consequences" },
                { order: 2, title: "New Centres of Power: European Union, ASEAN, SAARC, BRICS, rise of China" },
                { order: 3, title: "United Nations and its organizations, Security in the Contemporary World, Globalisation" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "Politics in India Since Independence",
          description: "Nation-building challenges, planned development, India's foreign policy, democratic resurgence, and recent trends in Indian politics.",
          topics: [
            {
              order: 1,
              title: "Nation Building and Democratic Resurgence",
              subtopics: [
                { order: 1, title: "Challenges of Nation-Building: Partition, integration of princely states, States Reorganisation" },
                { order: 2, title: "Era of One-party Dominance & Politics of Planned Development (Five Year Plans, Green Revolution)" },
                { order: 3, title: "The Crisis of Democratic Order: Emergency (1975-77), civil liberties movements, Janata Party" },
                { order: 4, title: "Recent Developments in Indian Politics: Coalition era, Mandal Commission, economic reforms, Ayodhya movement" },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    code: "307",
    name: "Computer Science / Informatics Practices",
    slug: "computer-science",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Section A (Common: Exception handling, Database Concepts, SQL, Networks) and Section B1 (Computer Science: Data Structures, File Handling) / B2 (Informatics Practices: Pandas, Matplotlib, Cyber Ethics).",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) Computer Science / IP Syllabus",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "Section A: Common Topics (Python, SQL & Networks)",
          description: "Exception handling, database concepts, structured query language, and computer networks.",
          topics: [
            {
              order: 1,
              title: "Exception and File Handling in Python",
              subtopics: [
                { order: 1, title: "Syntax errors vs exceptions, try-except-finally blocks, raise statement" },
                { order: 2, title: "File handling: Text files, binary files (pickle module), and CSV files" },
              ],
            },
            {
              order: 2,
              title: "Database Concepts & Structured Query Language (SQL)",
              subtopics: [
                { order: 1, title: "Relational data model: Candidate key, primary key, alternate key, foreign key" },
                { order: 2, title: "SQL commands: DDL (CREATE, ALTER, DROP), DML (INSERT, SELECT, UPDATE, DELETE)" },
                { order: 3, title: "Aggregate functions, GROUP BY, HAVING, ORDER BY, and Cartesian product/Joins" },
              ],
            },
            {
              order: 3,
              title: "Computer Networks",
              subtopics: [
                { order: 1, title: "Network topologies (Star, Bus, Ring, Tree), transmission media (twisted pair, coaxial, fiber, wireless)" },
                { order: 2, title: "Network devices (Router, Switch, Gateway), protocols (TCP/IP, HTTP, FTP, DNS), Cyber safety" },
              ],
            },
          ],
        },
      ],
    },
  },

  // Subjects with syllabus pending verification or not yet published (Demonstrates requirement for proper unverified state)
  {
    code: "309",
    name: "Geography / Geology",
    slug: "geography",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Human Geography, People and Economy of India, and Practical Work in Geography.",
    examYears: [2026, 2027],
    // Syllabus intentionally left undefined to test empty/unverified state:
    // "The syllabus for this subject has not been published or verified yet."
  },
  {
    code: "311",
    name: "Legal Studies",
    slug: "legal-studies",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Judiciary, Topics in Law (Property, Contracts, Torts, Crimes), Arbitration, and International Law.",
    examYears: [2026, 2027],
    // Syllabus intentionally left undefined
  },
  {
    code: "316",
    name: "Psychology",
    slug: "psychology",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Variations in Psychological Attributes, Self and Personality, Meeting Life Challenges, Psychological Disorders.",
    examYears: [2026, 2027],
    // Syllabus intentionally left undefined
  },
  {
    code: "317",
    name: "Sociology",
    slug: "sociology",
    categorySlug: "domain-subjects",
    categoryName: "Section II: Domain Subjects",
    description: "Structure of Indian Society, Social Institutions, Social Inequality and Exclusion, Challenges of Cultural Diversity.",
    examYears: [2026, 2027],
    // Syllabus intentionally left undefined
  },

  // SECTION III: GENERAL APTITUDE TEST
  {
    code: "501",
    name: "General Aptitude Test",
    slug: "general-test",
    categorySlug: "general-test",
    categoryName: "Section III: General Aptitude Test",
    description: "Section III test covering General Knowledge, Current Affairs, General Mental Ability, Numerical Ability, and Logical & Analytical Reasoning.",
    examYears: [2026, 2027],
    syllabus: {
      version: "2026.1",
      status: "PUBLISHED",
      sourceDocument: "NTA CUET (UG) General Test Official Blueprint",
      sourceUrl: "https://exams.nta.ac.in/CUET-UG/",
      verifiedAt: "2026-03-01T00:00:00Z",
      units: [
        {
          unitNumber: 1,
          title: "General Knowledge & Current Affairs",
          description: "National and international contemporary events, Indian polity, geography, and general science.",
          topics: [
            {
              order: 1,
              title: "Static General Knowledge",
              subtopics: [
                { order: 1, title: "Indian Polity & Constitution: Fundamental Rights, Preamble, Constitutional bodies" },
                { order: 2, title: "Indian History & Heritage: Major historical eras, monuments, cultural arts" },
                { order: 3, title: "Physical & Economic Geography: Rivers, national parks, minerals, climate zones" },
                { order: 4, title: "General Science & Technology: Space missions, basic physics, chemistry and biology principles" },
              ],
            },
            {
              order: 2,
              title: "Current Events (National & International)",
              subtopics: [
                { order: 1, title: "Government Schemes, National Policies and Summits" },
                { order: 2, title: "Sports, Awards, Honors and Books & Authors" },
                { order: 3, title: "International organizations (UN, G20, ASEAN, WHO, IMF) and geopolitical summits" },
              ],
            },
          ],
        },
        {
          unitNumber: 2,
          title: "General Mental Ability & Logical Reasoning",
          description: "Pattern recognition, deductive logic, coding, and spatial relationships.",
          topics: [
            {
              order: 1,
              title: "Verbal & Analytical Reasoning",
              subtopics: [
                { order: 1, title: "Analogy, Classification, and Odd One Out" },
                { order: 2, title: "Number, Alphabet, and Alpha-numeric Series Completion" },
                { order: 3, title: "Coding-Decoding and Letter Shifting" },
                { order: 4, title: "Blood Relations, Family Trees, and Direction Sense Test" },
                { order: 5, title: "Syllogisms, Statement-Conclusions, and Cause-Effect" },
                { order: 6, title: "Linear and Circular Seating Arrangements" },
              ],
            },
            {
              order: 2,
              title: "Non-Verbal & Visual Reasoning",
              subtopics: [
                { order: 1, title: "Venn Diagrams and Set Relations" },
                { order: 2, title: "Figure Matrices, Series, and Pattern Completion" },
                { order: 3, title: "Mirror and Water Images, Paper Folding and Cutting" },
              ],
            },
          ],
        },
        {
          unitNumber: 3,
          title: "Numerical Ability & Quantitative Reasoning",
          description: "Foundational mathematics, arithmetic concepts, algebra, geometry, and data interpretation up to Grade 8/10 level.",
          topics: [
            {
              order: 1,
              title: "Arithmetic & Number Systems",
              subtopics: [
                { order: 1, title: "Number System, Divisibility Rules, HCF and LCM" },
                { order: 2, title: "Fractions, Decimals, Simplification, and Square Roots" },
                { order: 3, title: "Percentages, Profit and Loss, Discount and Marked Price" },
                { order: 4, title: "Ratio, Proportion, and Unitary Method" },
                { order: 5, title: "Simple Interest and Compound Interest" },
                { order: 6, title: "Time and Work, Pipes and Cisterns" },
                { order: 7, title: "Time, Speed, Distance, Trains, and Boats & Streams" },
                { order: 8, title: "Averages, Mixtures and Alligations" },
              ],
            },
            {
              order: 2,
              title: "Basic Algebra, Geometry & Mensuration",
              subtopics: [
                { order: 1, title: "Linear equations in one and two variables" },
                { order: 2, title: "2D Geometry: Triangles, Quadrilaterals, Circles and Angles" },
                { order: 3, title: "Mensuration: Perimeter, Area, Surface Area and Volume of 2D/3D shapes" },
                { order: 4, title: "Basic Trigonometry ratios and heights & distances" },
                { order: 5, title: "Data Interpretation: Bar charts, Pie charts, Line graphs and Tables" },
              ],
            },
          ],
        },
      ],
    },
  },
];

