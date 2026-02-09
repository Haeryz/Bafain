import { create } from "zustand"
import { sendCsChat, type CsMessagePayload } from "@/lib/csApi"
import { getAccessToken } from "@/stores/auth/authStorage"

type CsRole = "user" | "assistant"

type CsMessage = {
  id: string
  role: CsRole
  content: string
  created_at: string
}

type CsStoreState = {
  isOpen: boolean
  messages: CsMessage[]
  isLoading: boolean
  error: string | null
  lastModel: string | null
  toggleOpen: () => void
  close: () => void
  sendMessage: (content: string) => Promise<boolean>
  clearMessages: () => void
  clearError: () => void
}

const STORAGE_KEY = "bafain:csMessages"
const MAX_LOCAL_MESSAGES = 30
const MAX_HISTORY_MESSAGES = 12
const MAX_INPUT_LENGTH = 1200

const createMessage = (role: CsRole, content: string): CsMessage => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  created_at: new Date().toISOString(),
})

const readStoredMessages = (): CsMessage[] => {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as CsMessage[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          typeof item.created_at === "string"
      )
      .slice(-MAX_LOCAL_MESSAGES)
  } catch {
    return []
  }
}

const persistMessages = (messages: CsMessage[]) => {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES))
  )
}

const toApiMessages = (messages: CsMessage[]): CsMessagePayload[] =>
  messages.slice(-MAX_HISTORY_MESSAGES).map((item) => ({
    role: item.role,
    content: item.content,
  }))

export const useCsStore = create<CsStoreState>((set, get) => ({
  isOpen: false,
  messages: readStoredMessages(),
  isLoading: false,
  error: null,
  lastModel: null,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),

  sendMessage: async (content) => {
    const message = content.trim()
    if (!message) return false

    if (!getAccessToken()) {
      set({ error: "Silakan login untuk menggunakan CS chat." })
      return false
    }

    if (get().isLoading) return false

    const trimmedMessage =
      message.length > MAX_INPUT_LENGTH
        ? message.slice(0, MAX_INPUT_LENGTH)
        : message

    const userMessage = createMessage("user", trimmedMessage)
    const nextMessages = [...get().messages, userMessage].slice(
      -MAX_LOCAL_MESSAGES
    )

    set({
      messages: nextMessages,
      isLoading: true,
      error: null,
      isOpen: true,
    })
    persistMessages(nextMessages)

    try {
      const response = await sendCsChat({
        messages: toApiMessages(nextMessages),
      })
      const assistantMessage = createMessage("assistant", response.message)
      const finalMessages = [...nextMessages, assistantMessage].slice(
        -MAX_LOCAL_MESSAGES
      )
      set({
        messages: finalMessages,
        isLoading: false,
        error: null,
        lastModel: response.model,
      })
      persistMessages(finalMessages)
      return true
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error && error.message
            ? error.message
            : "Gagal terhubung ke CS.",
      })
      return false
    }
  },

  clearMessages: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    set({ messages: [], error: null })
  },

  clearError: () => set({ error: null }),
}))

