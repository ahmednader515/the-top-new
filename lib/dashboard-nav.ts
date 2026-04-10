/** Shared active-state rules for merged dashboard routes (sidebar + mobile nav). */
function pathMatchesTeacherCourses(pathname: string): boolean {
  return (
    pathname === "/dashboard/teacher/courses" ||
    pathname.startsWith("/dashboard/teacher/courses/") ||
    pathname === "/dashboard/admin-assistant/courses" ||
    pathname.startsWith("/dashboard/admin-assistant/courses/")
  );
}

function pathMatchesTeacherManagement(pathname: string): boolean {
  return (
    pathname === "/dashboard/teacher/management" ||
    pathname.startsWith("/dashboard/teacher/management/") ||
    pathname.startsWith("/dashboard/teacher/users") ||
    pathname.startsWith("/dashboard/teacher/add-courses") ||
    pathname.startsWith("/dashboard/teacher/passwords") ||
    pathname === "/dashboard/admin-assistant/management" ||
    pathname.startsWith("/dashboard/admin-assistant/management/") ||
    pathname.startsWith("/dashboard/admin-assistant/users") ||
    pathname.startsWith("/dashboard/admin-assistant/balances") ||
    pathname.startsWith("/dashboard/admin-assistant/add-courses") ||
    pathname.startsWith("/dashboard/admin-assistant/passwords")
  );
}

function pathMatchesAdminManagement(pathname: string): boolean {
  return (
    pathname === "/dashboard/admin/management" ||
    pathname.startsWith("/dashboard/admin/management/") ||
    pathname.startsWith("/dashboard/admin/users") ||
    pathname.startsWith("/dashboard/admin/balances") ||
    pathname.startsWith("/dashboard/admin/add-courses") ||
    pathname.startsWith("/dashboard/admin/passwords")
  );
}

export function isDashboardSectionActive(
  pathname: string,
  href: string,
  search: string | null = null
): boolean {
  if (href.includes("?")) {
    const [pathPart, queryString] = href.split("?");
    if (pathname !== pathPart) return false;
    const wanted = new URLSearchParams(queryString);
    const current = new URLSearchParams(search ?? "");
    for (const key of wanted.keys()) {
      if (current.get(key) !== wanted.get(key)) return false;
    }
    return true;
  }

  const tab = new URLSearchParams(search ?? "").get("tab");

  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/dashboard/teacher/assessments") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/dashboard/teacher/quizzes") ||
      pathname.startsWith("/dashboard/teacher/quiz-results")
    );
  }

  if (href === "/dashboard/teacher/progress") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/dashboard/teacher/grades")
    );
  }

  if (href === "/dashboard/teacher/management") {
    if (!pathMatchesTeacherManagement(pathname)) return false;
    return true;
  }

  if (href === "/dashboard/teacher/courses") {
    if (!pathMatchesTeacherCourses(pathname)) return false;
    return true;
  }

  if (href === "/dashboard/admin/assessments") {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      pathname.startsWith("/dashboard/admin/quizzes") ||
      pathname.startsWith("/dashboard/admin/progress")
    );
  }

  if (href === "/dashboard/admin/management") {
    if (!pathMatchesAdminManagement(pathname)) return false;
    return true;
  }

  if (href === "/dashboard/teacher/management" || href === "/dashboard/admin-assistant/management") {
    if (!pathMatchesTeacherManagement(pathname)) return false;
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
