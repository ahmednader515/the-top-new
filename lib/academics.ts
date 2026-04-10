export const GRADE_OPTIONS = [
  { value: "GRADE_4", label: "الصف الرابع الابتدائي" },
  { value: "GRADE_5", label: "الصف الخامس الابتدائي" },
  { value: "GRADE_6", label: "الصف السادس الابتدائي" },
  { value: "GRADE_7", label: "الصف الأول الإعدادي" },
  { value: "GRADE_8", label: "الصف الثاني الإعدادي" },
  { value: "GRADE_9", label: "الصف الثالث الإعدادي" },
  { value: "GRADE_10", label: "الصف الأول الثانوي" },
  { value: "GRADE_11", label: "الصف الثاني الثانوي" },
  { value: "GRADE_12", label: "الصف الثالث الثانوي" },
] as const;

export const DIVISION_OPTIONS = [
  { value: "GENERAL", label: "عام (لا يوجد شعبات)" },
  { value: "SCIENTIFIC", label: "علمي" },
  { value: "ARTS", label: "أدبي" },
  { value: "SCIENTIFIC_SCIENCE", label: "علمي علوم" },
  { value: "SCIENTIFIC_MATH", label: "علمي رياضة" },
] as const;

export const CURRICULUM_OPTIONS = [
  { value: "ARABIC_CURRICULUM", label: "المناهج العربي" },
  { value: "LANGUAGES_CURRICULUM", label: "مناهج اللغات" },
] as const;

export const SECOND_LANGUAGE_OPTIONS = [
  { value: "SECOND_LANGUAGE_GERMAN", label: "اللغة الألمانية" },
  { value: "SECOND_LANGUAGE_FRENCH", label: "اللغة الفرنسية" },
  { value: "SECOND_LANGUAGE_SPANISH", label: "اللغة الأسبانية" },
] as const;

export const GRADE_12_DIVISION_SELECTIONS = [
  {
    value: "G12_SCIENCE_ARABIC",
    label: "علمي علوم (عربي)",
    division: "SCIENTIFIC_SCIENCE",
    curriculum: "ARABIC_CURRICULUM",
  },
  {
    value: "G12_SCIENCE_LANGUAGES",
    label: "علمي علوم (لغات)",
    division: "SCIENTIFIC_SCIENCE",
    curriculum: "LANGUAGES_CURRICULUM",
  },
  {
    value: "G12_MATH_ARABIC",
    label: "علمي رياضة (عربي)",
    division: "SCIENTIFIC_MATH",
    curriculum: "ARABIC_CURRICULUM",
  },
  {
    value: "G12_MATH_LANGUAGES",
    label: "علمي رياضة (لغات)",
    division: "SCIENTIFIC_MATH",
    curriculum: "LANGUAGES_CURRICULUM",
  },
  {
    value: "G12_ARTS_ARABIC",
    label: "أدبي (عربي)",
    division: "ARTS",
    curriculum: "ARABIC_CURRICULUM",
  },
  {
    value: "G12_ARTS_LANGUAGES",
    label: "أدبي (لغات)",
    division: "ARTS",
    curriculum: "LANGUAGES_CURRICULUM",
  },
] as const;

export const COURSE_DIVISION_OPTIONS = [
  { value: "GENERAL", label: "عام (أولى ثانوي)" },
  { value: "SCIENTIFIC", label: "علمي (ثانية ثانوي)" },
  { value: "ARTS", label: "أدبي" },
  { value: "SCIENTIFIC_SCIENCE", label: "علمي علوم" },
  { value: "SCIENTIFIC_MATH", label: "علمي رياضة" },
  { value: "BOTH", label: "كل الشعب (قديم)" },
] as const;

export const SUBJECT_OPTIONS = [
  { value: "ARABIC", label: "اللغة العربية", icon: "AR" },
  { value: "ENGLISH", label: "اللغة الإنجليزية", icon: "🇬🇧" },
  { value: "SOCIAL_STUDIES", label: "الدراسات الاجتماعية", icon: "🗺️" },
  { value: "SCIENCE_AR", label: "علوم", icon: "🧪" },
  { value: "SCIENCE_EN", label: "Science", icon: "🧪" },
  { value: "SECOND_LANGUAGE_GERMAN", label: "اللغة الثانية (ألماني)", icon: "🇩🇪" },
  { value: "SECOND_LANGUAGE_FRENCH", label: "اللغة الثانية (فرنسي)", icon: "🇫🇷" },
  { value: "SECOND_LANGUAGE_SPANISH", label: "اللغة الثانية (إسباني)", icon: "🇪🇸" },
  { value: "HISTORY", label: "التاريخ", icon: "📜" },
  { value: "PHILOSOPHY_LOGIC", label: "الفلسفة والمنطق", icon: "🧠" },
  { value: "MATH_AR", label: "الرياضيات", icon: "📐" },
  { value: "MATH_EN", label: "Math", icon: "📐" },
  { value: "INTEGRATED_SCIENCE_AR", label: "العلوم المتكاملة", icon: "🧪" },
  { value: "INTEGRATED_SCIENCE_EN", label: "Integrated Science", icon: "🧪" },
  { value: "CHEMISTRY_AR", label: "الكيمياء", icon: "⚗️" },
  { value: "CHEMISTRY_EN", label: "Chemistry", icon: "⚗️" },
  { value: "PHYSICS_AR", label: "الفيزياء", icon: "⚛️" },
  { value: "PHYSICS_EN", label: "Physics", icon: "⚛️" },
  { value: "PURE_MATH_AR", label: "الرياضيات البحتة", icon: "📐" },
  { value: "PURE_MATH_EN", label: "Pure Math", icon: "📐" },
  { value: "APPLIED_MATH_AR", label: "الرياضيات التطبيقية", icon: "📊" },
  { value: "APPLIED_MATH_EN", label: "Applied Math", icon: "📊" },
  { value: "GEOGRAPHY", label: "الجغرافيا", icon: "🌍" },
  { value: "PSYCHOLOGY_SOCIOLOGY", label: "علم نفس واجتماع", icon: "🧠" },
  { value: "STATISTICS_AR", label: "الإحصاء", icon: "📈" },
  { value: "STATISTICS_EN", label: "Statistics", icon: "📈" },
  { value: "BIOLOGY_AR", label: "الأحياء", icon: "🧬" },
  { value: "BIOLOGY_EN", label: "Biology", icon: "🧬" },
  { value: "GEOLOGY_AR", label: "الجيولوجيا", icon: "🪨" },
  { value: "GEOLOGY_EN", label: "Geology", icon: "🪨" },
] as const;

export const SUBJECT_LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  SUBJECT_OPTIONS.map((subject) => [subject.value, subject.label])
);

export const GRADE_LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  GRADE_OPTIONS.map((grade) => [grade.value, grade.label])
);

export const DIVISION_LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  DIVISION_OPTIONS.map((division) => [division.value, division.label])
);

export const CURRICULUM_LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  CURRICULUM_OPTIONS.map((curriculum) => [curriculum.value, curriculum.label])
);

export const SECOND_LANGUAGE_LABEL_BY_VALUE: Record<string, string> = Object.fromEntries(
  SECOND_LANGUAGE_OPTIONS.map((language) => [language.value, language.label])
);

export type AcademicGradeValue = (typeof GRADE_OPTIONS)[number]["value"];
export type AcademicDivisionValue = (typeof DIVISION_OPTIONS)[number]["value"];
export type AcademicCurriculumValue = (typeof CURRICULUM_OPTIONS)[number]["value"];
export type SecondLanguageValue = (typeof SECOND_LANGUAGE_OPTIONS)[number]["value"];
export type CourseDivisionValue = (typeof COURSE_DIVISION_OPTIONS)[number]["value"];
export type SubjectValue = (typeof SUBJECT_OPTIONS)[number]["value"];

type NormalizedStudentClassification = {
  division: string;
  curriculum: string;
};

export function getSignupDivisionOptions(grade?: string) {
  if (grade === "GRADE_12") {
    return GRADE_12_DIVISION_SELECTIONS.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }
  if (grade === "GRADE_11") {
    return [
      { value: "SCIENTIFIC", label: "علمي" },
      { value: "ARTS", label: "أدبي" },
    ];
  }
  if (
    grade === "GRADE_4" ||
    grade === "GRADE_5" ||
    grade === "GRADE_6" ||
    grade === "GRADE_7" ||
    grade === "GRADE_8" ||
    grade === "GRADE_9" ||
    grade === "GRADE_10"
  ) {
    return [{ value: "GENERAL", label: "عام (لا يوجد شعبات)" }];
  }
  return [];
}

export function normalizeStudentClassification(
  grade?: string,
  division?: string,
  curriculum?: string
): NormalizedStudentClassification | null {
  if (!grade) return null;

  if (
    grade === "GRADE_4" ||
    grade === "GRADE_5" ||
    grade === "GRADE_6" ||
    grade === "GRADE_7" ||
    grade === "GRADE_8" ||
    grade === "GRADE_9" ||
    grade === "GRADE_10"
  ) {
    if (!curriculum) return null;
    return { division: "GENERAL", curriculum };
  }

  if (grade === "GRADE_11") {
    if (!division || !curriculum) return null;
    if (division !== "SCIENTIFIC" && division !== "ARTS") return null;
    return { division, curriculum };
  }

  if (grade === "GRADE_12") {
    const selected = GRADE_12_DIVISION_SELECTIONS.find((item) => item.value === division);
    if (!selected) return null;
    return {
      division: selected.division,
      curriculum: selected.curriculum,
    };
  }

  return null;
}

export function getAllowedCourseDivisionTargets(grade?: string, division?: string): string[] {
  if (!grade || !division) return [];

  if (
    grade === "GRADE_4" ||
    grade === "GRADE_5" ||
    grade === "GRADE_6" ||
    grade === "GRADE_7" ||
    grade === "GRADE_8" ||
    grade === "GRADE_9" ||
    grade === "GRADE_10"
  ) {
    return ["GENERAL"];
  }

  if (grade === "GRADE_11") {
    if (division === "SCIENTIFIC") return ["SCIENTIFIC"];
    if (division === "ARTS") return ["ARTS"];
    return [];
  }

  if (grade === "GRADE_12") {
    if (division === "SCIENTIFIC_SCIENCE") return ["SCIENTIFIC_SCIENCE", "SCIENTIFIC"];
    if (division === "SCIENTIFIC_MATH") return ["SCIENTIFIC_MATH", "SCIENTIFIC"];
    if (division === "ARTS") return ["ARTS"];
    return [];
  }

  return [];
}

function secondLanguageToSubject(secondLanguage?: string) {
  if (!secondLanguage) return null;
  if (secondLanguage === "SECOND_LANGUAGE_GERMAN") return "SECOND_LANGUAGE_GERMAN";
  if (secondLanguage === "SECOND_LANGUAGE_FRENCH") return "SECOND_LANGUAGE_FRENCH";
  if (secondLanguage === "SECOND_LANGUAGE_SPANISH") return "SECOND_LANGUAGE_SPANISH";
  return null;
}

export function getAllowedSubjectsForStudent({
  grade,
  curriculum,
  division,
  secondLanguage,
}: {
  grade?: string;
  curriculum?: string;
  division?: string;
  secondLanguage?: string;
}): string[] {
  const secondLangSubject = secondLanguageToSubject(secondLanguage);
  const baseSubjects = ["ARABIC", "ENGLISH"] as string[];

  // Primary (4-6) & Preparatory (7-9): no divisions, curriculum decides arabic vs languages subject codes
  if (
    grade === "GRADE_4" ||
    grade === "GRADE_5" ||
    grade === "GRADE_6" ||
    grade === "GRADE_7" ||
    grade === "GRADE_8" ||
    grade === "GRADE_9"
  ) {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [...baseSubjects, "MATH_EN", "SCIENCE_EN", "SOCIAL_STUDIES"];
    }
    return [...baseSubjects, "MATH_AR", "SCIENCE_AR", "SOCIAL_STUDIES"];
  }

  if (secondLangSubject) {
    baseSubjects.push(secondLangSubject);
  } else {
    baseSubjects.push(
      "SECOND_LANGUAGE_GERMAN",
      "SECOND_LANGUAGE_FRENCH",
      "SECOND_LANGUAGE_SPANISH"
    );
  }

  if (grade === "GRADE_10") {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [...baseSubjects, "HISTORY", "PHILOSOPHY_LOGIC", "MATH_EN", "INTEGRATED_SCIENCE_EN"];
    }
    return [...baseSubjects, "HISTORY", "PHILOSOPHY_LOGIC", "MATH_AR", "INTEGRATED_SCIENCE_AR"];
  }

  if (grade === "GRADE_11" && division === "SCIENTIFIC") {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [
        ...baseSubjects,
        "CHEMISTRY_EN",
        "PHYSICS_EN",
        "PURE_MATH_EN",
        "APPLIED_MATH_EN",
        "HISTORY",
        "CHEMISTRY",
        "PHYSICS",
        "PURE_MATH",
        "APPLIED_MATH",
      ];
    }
    return [...baseSubjects, "CHEMISTRY_AR", "PHYSICS_AR", "PURE_MATH_AR", "APPLIED_MATH_AR", "HISTORY", "CHEMISTRY", "PHYSICS", "PURE_MATH", "APPLIED_MATH"];
  }

  if (grade === "GRADE_11" && division === "ARTS") {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [...baseSubjects, "GEOGRAPHY", "HISTORY", "PSYCHOLOGY_SOCIOLOGY", "PURE_MATH_EN", "PURE_MATH"];
    }
    return [...baseSubjects, "GEOGRAPHY", "HISTORY", "PSYCHOLOGY_SOCIOLOGY", "PURE_MATH_AR", "PURE_MATH"];
  }

  if (grade === "GRADE_12" && division === "ARTS") {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [...baseSubjects, "GEOGRAPHY", "HISTORY", "STATISTICS_EN"];
    }
    return [...baseSubjects, "GEOGRAPHY", "HISTORY", "STATISTICS_AR"];
  }

  if (grade === "GRADE_12" && division === "SCIENTIFIC_SCIENCE") {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [...baseSubjects, "PHYSICS_EN", "CHEMISTRY_EN", "BIOLOGY_EN", "GEOLOGY_EN", "PHYSICS", "CHEMISTRY"];
    }
    return [...baseSubjects, "PHYSICS_AR", "CHEMISTRY_AR", "BIOLOGY_AR", "GEOLOGY_AR", "PHYSICS", "CHEMISTRY"];
  }

  if (grade === "GRADE_12" && division === "SCIENTIFIC_MATH") {
    if (curriculum === "LANGUAGES_CURRICULUM") {
      return [...baseSubjects, "PHYSICS_EN", "CHEMISTRY_EN", "PURE_MATH_EN", "APPLIED_MATH_EN", "PHYSICS", "CHEMISTRY", "PURE_MATH", "APPLIED_MATH"];
    }
    return [...baseSubjects, "PHYSICS_AR", "CHEMISTRY_AR", "PURE_MATH_AR", "APPLIED_MATH_AR", "PHYSICS", "CHEMISTRY", "PURE_MATH", "APPLIED_MATH"];
  }

  return baseSubjects;
}

export function normalizeSubjectForDisplay(subject?: string | null): string | null {
  if (!subject) return null;
  const legacyMap: Record<string, string> = {
    PHYSICS: "PHYSICS_AR",
    CHEMISTRY: "CHEMISTRY_AR",
    PURE_MATH: "PURE_MATH_AR",
    APPLIED_MATH: "APPLIED_MATH_AR",
    PSYCHOLOGY: "PSYCHOLOGY_SOCIOLOGY",
  };
  return legacyMap[subject] ?? subject;
}
