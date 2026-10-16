/**
 * The college is the classification; the course codes below are the school's
 * official program abbreviations. Codes stay the stored value everywhere
 * (documents, filters, validation) so existing records keep working — only
 * what the user reads is spelled out.
 */
export type StudentProgram = {
  college: string;
  code: string;
  label: string;
  majors: string[];
};

/** The single source of truth. Add a program here and every list updates. */
export const STUDENT_PROGRAMS: StudentProgram[] = [
  {
    college: "College of Information Technology",
    code: "BSCS",
    label: "Bachelor of Science in Computer Science",
    majors: [],
  },
  {
    college: "College of Information Technology",
    code: "BSIT",
    label: "Bachelor of Science in Information Technology",
    majors: [],
  },
  {
    college: "College of Business Administration",
    code: "BSBA",
    label: "Bachelor of Science in Business Administration",
    majors: [
      "Marketing Management",
      "Human Resource Management",
      "Financial Management",
    ],
  },
  {
    college: "College of Education",
    code: "BSED",
    label: "Bachelor of Secondary Education",
    majors: ["Filipino", "Mathematics", "English"],
  },
  {
    college: "College of Education",
    code: "BEED",
    label: "Bachelor of Elementary Education",
    majors: [],
  },
  {
    college: "College of Criminology",
    code: "BS Criminology",
    label: "Bachelor of Science in Criminology",
    majors: [],
  },
];

/** Course code → full program name. */
export const COURSE_LABELS: Record<string, string> =
  Object.fromEntries(
    STUDENT_PROGRAMS.map((program) => [
      program.code,
      program.label,
    ])
  );

/** Course code → its majors (empty means the course has none). */
export const COURSE_MAJORS: Record<string, string[]> =
  Object.fromEntries(
    STUDENT_PROGRAMS.map((program) => [
      program.code,
      [...program.majors],
    ])
  );

/** College → its course codes, in the order they are declared above. */
export const COLLEGE_COURSES: Record<string, string[]> =
  STUDENT_PROGRAMS.reduce<Record<string, string[]>>(
    (colleges, program) => {
      colleges[program.college] = [
        ...(colleges[program.college] ?? []),
        program.code,
      ];

      return colleges;
    },
    {}
  );

/** College → its programs, ready to render as a grouped dropdown. */
export const PROGRAMS_BY_COLLEGE: Record<
  string,
  StudentProgram[]
> = STUDENT_PROGRAMS.reduce<
  Record<string, StudentProgram[]>
>((colleges, program) => {
  colleges[program.college] = [
    ...(colleges[program.college] ?? []),
    program,
  ];

  return colleges;
}, {});

export function getProgram(code: string): StudentProgram | undefined {
  const value = code.trim().toUpperCase();

  return STUDENT_PROGRAMS.find(
    (program) => program.code.toUpperCase() === value
  );
}

export const YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

export const DOCUMENT_TYPES = [
  "Form 137",
  "Diploma Copy",
  "Report Card",
  "Birth Certificate",
  "Good Moral Certificate",
];
