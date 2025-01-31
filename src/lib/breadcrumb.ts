const BREADCRUMB_MAPPINGS: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "My Courses",
  analytics: "Analytics",
  teacher: "Teacher",
  register: "Registration",
  builder: "Builder",
  students: "Students",
  // Add more mappings as needed
};
export function generateBreadcrumb(pathname: string) {
  const paths = pathname.replace(/\/$/, "").split("/").filter(Boolean);

  return paths.map((path, index) => {
    // Use custom mapping if available, otherwise format the path
    const label =
      BREADCRUMB_MAPPINGS[path] ||
      path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
      label,
      isLast: index === paths.length - 1,
    };
  });
}
