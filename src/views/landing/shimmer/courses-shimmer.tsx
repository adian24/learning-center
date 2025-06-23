export default function CoursesShimmer() {
  return (
    <div className="animate-pulse rounded-2xl border shadow-sm p-5 min-h-[420px] flex flex-col justify-between">
      <div>
        <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
        <div className="flex gap-2 mb-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="mt-6 h-10 bg-gray-300 rounded-xl"></div>
    </div>
  );
}
