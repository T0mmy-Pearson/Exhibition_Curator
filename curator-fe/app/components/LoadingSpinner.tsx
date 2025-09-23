export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading artworks...</p>
        </div>
      </div>
    </div>
  );
}