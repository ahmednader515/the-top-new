/** Monthly plan: first N published chapters per course (order includes quizzes by position). */
export const SUBSCRIPTION_MONTHLY_CHAPTERS = 4;

/** Term plan */
export const SUBSCRIPTION_TERM_CHAPTERS = 16;

/** Calendar access length for each plan type (stacked on renewal). */
export const SUBSCRIPTION_MONTHLY_DAYS = 30;

export const SUBSCRIPTION_TERM_DAYS = 120;

export function isValidChaptersPerCourse(value: number): boolean {
  return value === SUBSCRIPTION_MONTHLY_CHAPTERS || value === SUBSCRIPTION_TERM_CHAPTERS;
}

export function defaultTitleForChapters(chaptersPerCourse: number): string {
  return chaptersPerCourse === SUBSCRIPTION_TERM_CHAPTERS ? "اشتراك الترم" : "اشتراك شهري";
}

export function durationDaysForChapters(chaptersPerCourse: number): number {
  return chaptersPerCourse === SUBSCRIPTION_TERM_CHAPTERS
    ? SUBSCRIPTION_TERM_DAYS
    : SUBSCRIPTION_MONTHLY_DAYS;
}
