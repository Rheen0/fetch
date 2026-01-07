export default function MatchesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-64 rounded bg-gray-200"></div>
        </div>

        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex gap-4">
                <div className="h-24 w-24 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-48 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-4 w-full rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-3 h-40 w-full rounded-md bg-gray-200"></div>
                    <div className="h-5 w-32 rounded bg-gray-200"></div>
                    <div className="mt-2 h-4 w-full rounded bg-gray-200"></div>
                    <div className="mt-4 h-10 w-full rounded-md bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
