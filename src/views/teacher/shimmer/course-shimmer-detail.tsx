export const CourseShimmerDetail = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-6 px-4 animate-pulse">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="w-16 h-16 bg-gray-200 rounded-full" />
        <div className="space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
        ))}
        <div className="col-span-full h-4 w-48 bg-gray-200 rounded" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-5 h-5 bg-gray-200 rounded-full" />
              <div className="h-3 w-full bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
