import { create } from "zustand"
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "@/lib/authApi"
import {
  clearAuthStorage,
  extractTokens,
  getAccessToken,
  getStoredSession,
  getStoredUser,
  storeAuthSession,
} from "@/stores/auth/authStorage"

type AuthTab = "masuk" | "daftar" | "lupa" | "reset"

type Feedback = {
  type: "success" | "error"
  message: string
}

type AuthStoreState = {
  activeTab: AuthTab
  isLoggedIn: boolean
  user: Record<string, unknown> | null
  session: Record<string, unknown> | null
  loginForm: {
    email: string
    password: string
  }
  registerForm: {
    name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
  }
  forgotForm: {
    email: string
  }
  resetForm: {
    accessToken: string
    refreshToken: string
    newPassword: string
  }
  passwordVisibility: {
    login: boolean
    register: boolean
    confirm: boolean
    reset: boolean
  }
  submitting: {
    login: boolean
    register: boolean
    forgot: boolean
    reset: boolean
  }
  feedback: {
    login: Feedback | null
    register: Feedback | null
    forgot: Feedback | null
    reset: Feedback | null
  }
  setActiveTab: (tab: AuthTab) => void
  setUser: (user: Record<string, unknown> | null) => void
  setSession: (session: Record<string, unknown> | null) => void
  updateLoginForm: (payload: Partial<AuthStoreState["loginForm"]>) => void
  updateRegisterForm: (
    payload: Partial<AuthStoreState["registerForm"]>
  ) => void
  updateForgotForm: (payload: Partial<AuthStoreState["forgotForm"]>) => void
  updateResetForm: (payload: Partial<AuthStoreState["resetForm"]>) => void
  togglePasswordVisibility: (
    key: keyof AuthStoreState["passwordVisibility"]
  ) => void
  login: () => Promise<boolean>
  register: () => Promise<boolean>
  forgot: () => Promise<boolean>
  reset: () => Promise<boolean>
  logout: () => void
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Terjadi kesalahan, silakan coba lagi."
}

const getResetTokensFromUrl = () => {
  if (typeof window === "undefined") return null

  const parseTokens = (value: string) => {
    if (!value) return null
    const params = new URLSearchParams(value)
    const accessToken =
      params.get("access_token") ??
      params.get("accessToken") ??
      params.get("oobCode") ??
      params.get("oob_code")
    if (!accessToken) return null
    const refreshToken =
      params.get("refresh_token") ??
      params.get("refreshToken") ??
      accessToken
    return { accessToken, refreshToken }
  }

  const hash = window.location.hash.replace(/^#/, "")
  const hashTokens = parseTokens(hash)
  if (hashTokens) return hashTokens

  const search = window.location.search.replace(/^\?/, "")
  return parseTokens(search)
}

const getInitialAuthState = () => {
  const session = getStoredSession()
  const user = getStoredUser()
  const tokens = extractTokens(session)
  if (session && (tokens.accessToken || tokens.refreshToken)) {
    storeAuthSession(session, user)
  }
  const accessToken = tokens.accessToken || getAccessToken()
  return {
    session,
    user,
    isLoggedIn: Boolean(accessToken),
  }
}

const initialResetTokens = getResetTokensFromUrl()
const initialAuthState = getInitialAuthState()

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  activeTab: initialResetTokens ? "reset" : "masuk",
  isLoggedIn: initialAuthState.isLoggedIn,
  user: initialAuthState.user,
  session: initialAuthState.session,
  loginForm: {
    email: "",
    password: "",
  },
  registerForm: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  },
  forgotForm: {
    email: "",
  },
  resetForm: {
    accessToken: initialResetTokens?.accessToken ?? "",
    refreshToken: initialResetTokens?.refreshToken ?? "",
    newPassword: "",
  },
  passwordVisibility: {
    login: false,
    register: false,
    confirm: false,
    reset: false,
  },
  submitting: {
    login: false,
    register: false,
    forgot: false,
    reset: false,
  },
  feedback: {
    login: null,
    register: null,
    forgot: null,
    reset: null,
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setUser: (user) => {
    const session = get().session
    storeAuthSession(session, user)
    set({ user })
  },
  setSession: (session) => {
    const user = get().user
    storeAuthSession(session, user)
    const tokens = extractTokens(session)
    set({
      session,
      isLoggedIn: Boolean(tokens.accessToken),
    })
  },
  updateLoginForm: (payload) =>
    set((state) => ({
      loginForm: { ...state.loginForm, ...payload },
    })),
  updateRegisterForm: (payload) =>
    set((state) => ({
      registerForm: { ...state.registerForm, ...payload },
    })),
  updateForgotForm: (payload) =>
    set((state) => ({
      forgotForm: { ...state.forgotForm, ...payload },
    })),
  updateResetForm: (payload) =>
    set((state) => ({
      resetForm: { ...state.resetForm, ...payload },
    })),
  togglePasswordVisibility: (key) =>
    set((state) => ({
      passwordVisibility: {
        ...state.passwordVisibility,
        [key]: !state.passwordVisibility[key],
      },
    })),
  login: async () => {
    const { loginForm } = get()
    const email = loginForm.email.trim()
    if (!email) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          login: {
            type: "error",
            message: "Email wajib diisi.",
          },
        },
      }))
      return false
    }
    set((state) => ({
      submitting: { ...state.submitting, login: true },
      feedback: { ...state.feedback, login: null },
    }))

    try {
      const response = await loginUser({
        email,
        password: loginForm.password,
      })
      const responseEmail =
        response.user && typeof response.user.email === "string"
          ? response.user.email
          : loginForm.email
      const session = response.session ?? null
      const user = response.user ?? null
      const tokens = extractTokens(session)
      storeAuthSession(session, user)
      set((state) => ({
        isLoggedIn: Boolean(tokens.accessToken),
        user,
        session,
        loginForm: { ...state.loginForm, password: "" },
        feedback: {
          ...state.feedback,
          login: {
            type: "success",
            message: `Berhasil masuk${responseEmail ? `, ${responseEmail}` : ""}.`,
          },
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          login: {
            type: "error",
            message: getErrorMessage(error),
          },
        },
      }))
      return false
    } finally {
      set((state) => ({
        submitting: { ...state.submitting, login: false },
      }))
    }
  },
  register: async () => {
    const { registerForm } = get()
    const email = registerForm.email.trim()

    if (!email) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          register: {
            type: "error",
            message: "Email wajib diisi.",
          },
        },
      }))
      return false
    }

    if (
      registerForm.confirmPassword &&
      registerForm.confirmPassword !== registerForm.password
    ) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          register: {
            type: "error",
            message: "Konfirmasi password tidak sesuai.",
          },
        },
      }))
      return false
    }

    set((state) => ({
      submitting: { ...state.submitting, register: true },
      feedback: { ...state.feedback, register: null },
    }))

    try {
      const payload = {
        email,
        password: registerForm.password,
        ...(registerForm.name.trim()
          ? { name: registerForm.name.trim() }
          : {}),
        ...(registerForm.phone.trim()
          ? { phone: registerForm.phone.trim() }
          : {}),
      }
      const response = await registerUser(payload)
      const session = response.session ?? null
      const user = response.user ?? null
      const tokens = extractTokens(session)
      storeAuthSession(session, user)
      set((state) => ({
        isLoggedIn: Boolean(tokens.accessToken),
        user,
        session,
        registerForm: {
          ...state.registerForm,
          password: "",
          confirmPassword: "",
        },
        feedback: {
          ...state.feedback,
          register: {
            type: "success",
            message: response?.message || "Registrasi berhasil.",
          },
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          register: {
            type: "error",
            message: getErrorMessage(error),
          },
        },
      }))
      return false
    } finally {
      set((state) => ({
        submitting: { ...state.submitting, register: false },
      }))
    }
  },
  forgot: async () => {
    const { forgotForm } = get()
    const email = forgotForm.email.trim()
    if (!email) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          forgot: {
            type: "error",
            message: "Email wajib diisi.",
          },
        },
      }))
      return false
    }
    set((state) => ({
      submitting: { ...state.submitting, forgot: true },
      feedback: { ...state.feedback, forgot: null },
    }))

    try {
      const response = await forgotPassword({
        email,
      })
      set((state) => ({
        feedback: {
          ...state.feedback,
          forgot: {
            type: "success",
            message: response?.message || "Instruksi reset telah dikirim.",
          },
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          forgot: {
            type: "error",
            message: getErrorMessage(error),
          },
        },
      }))
      return false
    } finally {
      set((state) => ({
        submitting: { ...state.submitting, forgot: false },
      }))
    }
  },
  reset: async () => {
    const { resetForm } = get()
    const accessToken = resetForm.accessToken.trim()
    const refreshToken = resetForm.refreshToken.trim() || accessToken

    if (!accessToken) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          reset: {
            type: "error",
            message: "Token reset wajib diisi.",
          },
        },
      }))
      return false
    }
    if (!resetForm.newPassword || resetForm.newPassword.length < 8) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          reset: {
            type: "error",
            message: "Password baru minimal 8 karakter.",
          },
        },
      }))
      return false
    }

    set((state) => ({
      submitting: { ...state.submitting, reset: true },
      feedback: { ...state.feedback, reset: null },
    }))

    try {
      const response = await resetPassword({
        access_token: accessToken,
        refresh_token: refreshToken,
        new_password: resetForm.newPassword,
      })
      set((state) => ({
        resetForm: {
          ...state.resetForm,
          newPassword: "",
        },
        feedback: {
          ...state.feedback,
          reset: {
            type: "success",
            message: response?.message || "Password berhasil diperbarui.",
          },
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        feedback: {
          ...state.feedback,
          reset: {
            type: "error",
            message: getErrorMessage(error),
          },
        },
      }))
      return false
    } finally {
      set((state) => ({
        submitting: { ...state.submitting, reset: false },
      }))
    }
  },
  logout: () => {
    clearAuthStorage()
    set({
      isLoggedIn: false,
      user: null,
      session: null,
    })
  },
}))
