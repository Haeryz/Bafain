import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { useCsStore } from "@/stores/cs/useCsStore"
import { useAuthStore } from "@/stores/auth/useAuthStore"

export function CsFloatingButton() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isOpen = useCsStore((state) => state.isOpen)
  const isLoading = useCsStore((state) => state.isLoading)
  const messages = useCsStore((state) => state.messages)
  const sendMessage = useCsStore((state) => state.sendMessage)
  const clearMessages = useCsStore((state) => state.clearMessages)
  const close = useCsStore((state) => state.close)
  const lastModel = useCsStore((state) => state.lastModel)
  const toggleOpen = useCsStore((state) => state.toggleOpen)
  const error = useCsStore((state) => state.error)
  const clearError = useCsStore((state) => state.clearError)
  const [draft, setDraft] = useState("")
  const messageListRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen || !messageListRef.current) return
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight
  }, [isOpen, messages, isLoading])

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || isLoading) return
    setDraft("")
    const ok = await sendMessage(content)
    if (!ok) {
      setDraft(content)
    }
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[calc(100vw-3rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">CS Bafain</p>
              <p className="text-[11px] text-slate-500">
                {lastModel || "Groq: moonshotai/kimi-k2-instruct"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearMessages}
                className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={close}
                className="cursor-pointer rounded-md px-2 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>

          <div
            ref={messageListRef}
            className="h-80 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4"
          >
            {messages.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                Halo, ada yang bisa kami bantu terkait produk, pesanan, atau
                pembayaran Anda?
              </div>
            )}
            {messages.map((item) => {
              const isUser = item.role === "user"
              return (
                <div
                  key={item.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {item.content}
                    </p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isUser ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {formatTime(item.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                  Sedang mengetik...
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-2 mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
              <div className="flex items-start justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="cursor-pointer whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 px-4 py-3">
            {!isLoggedIn && (
              <p className="mb-2 text-[11px] font-semibold text-slate-500">
                Login diperlukan untuk menggunakan CS chat.
              </p>
            )}
            <textarea
              rows={2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Tulis pertanyaan Anda..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
            />
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !draft.trim() || !isLoggedIn}
                className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </div>
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
