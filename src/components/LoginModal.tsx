import { X } from "lucide-react"

type LoginModalProps = {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  if (!open) return null

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
              Login to your account
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-blue-600"
              >
                Forgot ?
              </button>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Login now
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-blue-600">
            G
          </span>
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-xs text-slate-500">
          Don't Have An Account?{" "}
          <button type="button" className="font-semibold text-blue-600">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginModal
