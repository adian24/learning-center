export function generateBreadcrumb(pathname: string) {
  // Remove trailing slash and split
  const paths = pathname.replace(/\/$/, "").split("/").filter(Boolean);

  return paths.map((path, index) => {
    // Create URL for this breadcrumb item
    const href = "/" + paths.slice(0, index + 1).join("/");

    // Format the path name (e.g., convert-to-title -> Convert To Title)
    const label = path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      href,
      label,
      isLast: index === paths.length - 1,
    };
  });
}
