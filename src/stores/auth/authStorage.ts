const ACCESS_TOKEN_KEY = "bafain:auth:accessToken"
const REFRESH_TOKEN_KEY = "bafain:auth:refreshToken"
const SESSION_KEY = "bafain:auth:session"
const USER_KEY = "bafain:auth:user"

type SessionPayload = Record<string, unknown>
type UserPayload = Record<string, unknown>

const getStorage = () => {
  if (typeof window === "undefined") return null
  return window.localStorage
}

const readJson = <T>(key: string): T | null => {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const extractTokens = (session: SessionPayload | null) => {
  const accessToken =
    session && typeof session.access_token === "string"
      ? session.access_token
      : null
  const refreshToken =
    session && typeof session.refresh_token === "string"
      ? session.refresh_token
      : null
  return { accessToken, refreshToken }
}

export const getAccessToken = () => {
  const storage = getStorage()
  return storage?.getItem(ACCESS_TOKEN_KEY) ?? null
}

export const getRefreshToken = () => {
  const storage = getStorage()
  return storage?.getItem(REFRESH_TOKEN_KEY) ?? null
}

export const getStoredSession = () => readJson<SessionPayload>(SESSION_KEY)

export const getStoredUser = () => readJson<UserPayload>(USER_KEY)

export const storeAuthSession = (
  session: SessionPayload | null,
  user: UserPayload | null
) => {
  const storage = getStorage()
  if (!storage) return

  if (session) {
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    storage.removeItem(SESSION_KEY)
  }

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    storage.removeItem(USER_KEY)
  }

  const { accessToken, refreshToken } = extractTokens(session)
  if (accessToken) {
    storage.setItem(ACCESS_TOKEN_KEY, accessToken)
  } else {
    storage.removeItem(ACCESS_TOKEN_KEY)
  }

  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  } else {
    storage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export const clearAuthStorage = () => {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(ACCESS_TOKEN_KEY)
  storage.removeItem(REFRESH_TOKEN_KEY)
  storage.removeItem(SESSION_KEY)
  storage.removeItem(USER_KEY)
}
