import { X } from "lucide-react"

type LoginModalProps = {
  open: boolean
  mode: "login" | "register" | "forgot"
  onClose: () => void
  onSwitchMode: (mode: "login" | "register" | "forgot") => void
  onLoginSuccess?: () => void
}

export function LoginModal({
  open,
  mode,
  onClose,
  onSwitchMode,
  onLoginSuccess,
}: LoginModalProps) {
  if (!open) return null

  const isRegister = mode === "register"
  const isForgot = mode === "forgot"

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 px-4 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {isRegister
                ? "Create your account"
                : isForgot
                ? "Forgot Password?"
                : "Login to your account"}
            </p>
            {(isRegister || isForgot) && (
              <p className="mt-1 text-xs text-slate-500">
                {isRegister
                  ? "Sign up to get started"
                  : "Enter your email to receive reset link"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-6 space-y-4 text-sm text-slate-600">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="081234567890"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          )}
          {!isForgot && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-semibold text-blue-600"
                    onClick={() => onSwitchMode("forgot")}
                  >
                    Forgot ?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          )}
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (!isRegister && !isForgot) {
                onLoginSuccess?.()
                onClose()
                return
              }
            }}
            className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {isRegister ? "Sign Up now" : isForgot ? "Send Reset Link" : "Login now"}
          </button>
        </form>

        {!isRegister && !isForgot && (
          <>
            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-600">
                G
              </span>
              Sign in with Google
            </button>
          </>
        )}

        <p className="mt-4 text-center text-xs text-slate-500">
          {isRegister
            ? "Already have an account? "
            : isForgot
            ? "Remember your password? "
            : "Don't Have An Account? "}
          <button
            type="button"
            className="cursor-pointer font-semibold text-blue-600"
            onClick={() =>
              onSwitchMode(isRegister || isForgot ? "login" : "register")
            }
          >
            {isRegister || isForgot ? "Login" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginModal
