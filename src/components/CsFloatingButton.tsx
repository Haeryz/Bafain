import { useCsStore } from "@/stores/cs/useCsStore"

export function CsFloatingButton() {
  const isOpen = useCsStore((state) => state.isOpen)
  const isLoading = useCsStore((state) => state.isLoading)
  const toggleOpen = useCsStore((state) => state.toggleOpen)
  const error = useCsStore((state) => state.error)
  const clearError = useCsStore((state) => state.clearError)

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-72 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-lg">
          <p className="font-semibold text-slate-900">CS Chat</p>
          <p className="mt-1">
            Backend CS sudah terhubung. UI chat lengkap menyusul.
          </p>
          {error && (
            <button
              type="button"
              onClick={clearError}
              className="mt-3 cursor-pointer rounded-lg bg-rose-50 px-3 py-1 font-semibold text-rose-700"
            >
              {error}
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Buka customer support"
        className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
      >
        {isLoading ? (
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              d="M8 10h8M8 14h5M6 4h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4.5 3V6a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  )
}

export default CsFloatingButton

