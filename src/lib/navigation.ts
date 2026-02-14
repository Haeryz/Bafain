export const getSafeNextPath = (search: string): string | null => {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  const rawNext = params.get("next")
  if (!rawNext) return null

  const nextPath = rawNext.trim()
  if (!nextPath.startsWith("/")) return null
  if (nextPath.startsWith("//")) return null
  if (nextPath === "/start" || nextPath.startsWith("/start?")) return null

  return nextPath
}
