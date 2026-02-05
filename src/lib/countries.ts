export type CountryOption = {
  code: string
  name: string
}

type DataHubCountry = {
  Code: string
  Name: string
}

const DATAHUB_COUNTRIES_URL =
  "https://datahub.io/core/country-list/r/data.json"
const CACHE_KEY = "bafain_country_options_v1"
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30

const fallbackCountryOptions: CountryOption[] = [
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "BN", name: "Brunei" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
]

const readCache = () => {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(CACHE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as {
      timestamp: number
      options: CountryOption[]
    }
    if (!parsed?.timestamp || !Array.isArray(parsed.options)) {
      return null
    }
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      return null
    }
    return parsed.options
  } catch {
    return null
  }
}

const writeCache = (options: CountryOption[]) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ timestamp: Date.now(), options })
  )
}

const normalizeDataHubCountries = (countries: DataHubCountry[]) =>
  countries
    .filter((country) => country?.Code && country?.Name)
    .map((country) => ({
      code: country.Code.toUpperCase(),
      name: country.Name,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

export const getCountryOptions = () =>
  readCache() ?? fallbackCountryOptions

export const fetchCountryOptions = async () => {
  const cached = readCache()
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(DATAHUB_COUNTRIES_URL)
    if (!response.ok) {
      throw new Error("Failed to fetch countries")
    }
    const data = (await response.json()) as DataHubCountry[]
    const options = normalizeDataHubCountries(data)
    if (options.length === 0) {
      return fallbackCountryOptions
    }
    writeCache(options)
    return options
  } catch {
    return fallbackCountryOptions
  }
}
