import { create } from "zustand"
import {
  getProfile,
  updateProfile,
  type ProfileResponse,
} from "@/lib/profileApi"
import {
  createAddress,
  listAddresses,
  updateAddress,
  type AddressPayload,
} from "@/lib/addressesApi"
import { useAuthStore } from "@/stores/auth/useAuthStore"

type ProfileState = {
  fullName: string
  email: string
  phone: string
  company: string
  address: string
  joinedDate: string
}

type ProfileStoreState = {
  profile: ProfileState
  addresses: AddressPayload[]
  isEditing: boolean
  isLoading: boolean
  isSaving: boolean
  errorMessage: string | null
  showUpdated: boolean
  hydrateFromAuth: (user: Record<string, unknown> | null) => void
  updateField: (key: keyof ProfileState, value: string) => void
  setEditing: (value: boolean) => void
  setShowUpdated: (value: boolean) => void
  loadProfile: () => Promise<void>
  saveProfile: () => Promise<void>
}

const emptyProfile: ProfileState = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  joinedDate: "",
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Terjadi kesalahan, silakan coba lagi."
}

const normalizeDateInput = (value?: string | null) => {
  if (!value) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().slice(0, 10)
}

const mapUserToProfile = (
  user: Record<string, unknown> | null
): ProfileState => ({
  fullName: typeof user?.display_name === "string" ? user.display_name : "",
  email: typeof user?.email === "string" ? user.email : "",
  phone: typeof user?.phone_number === "string" ? user.phone_number : "",
  company: "",
  address: "",
  joinedDate:
    typeof user?.created_at === "string"
      ? normalizeDateInput(user.created_at)
      : "",
})

const mapResponseToProfile = (
  response: ProfileResponse,
  fallback: ProfileState
): ProfileState => {
  const profile = response.profile ?? {}
  const user = response.user ?? {}
  return {
    fullName:
      typeof profile.full_name === "string"
        ? profile.full_name
        : typeof user.display_name === "string"
        ? user.display_name
        : fallback.fullName,
    email:
      typeof profile.email === "string"
        ? profile.email
        : typeof user.email === "string"
        ? user.email
        : fallback.email,
    phone:
      typeof profile.phone === "string"
        ? profile.phone
        : typeof user.phone_number === "string"
        ? user.phone_number
        : fallback.phone,
    company: typeof profile.company === "string" ? profile.company : fallback.company,
    address: typeof profile.address === "string" ? profile.address : fallback.address,
    joinedDate:
      typeof profile.joined_date === "string"
        ? normalizeDateInput(profile.joined_date)
        : typeof user.created_at === "string"
        ? normalizeDateInput(user.created_at)
        : fallback.joinedDate,
  }
}

const pickDefaultAddress = (addresses: AddressPayload[]) => {
  if (!addresses.length) return null
  return addresses.find((address) => address.is_default) || addresses[0]
}

const formatAddress = (address: AddressPayload | null) => {
  if (!address) return ""
  const parts = [
    address.address_line1,
    address.address_line2,
    address.city,
    address.province,
    address.postal_code,
    address.country,
  ]
  return parts.filter((part) => Boolean(part && `${part}`.trim())).join(", ")
}

export const useProfileStore = create<ProfileStoreState>((set, get) => ({
  profile: emptyProfile,
  addresses: [],
  isEditing: false,
  isLoading: false,
  isSaving: false,
  errorMessage: null,
  showUpdated: false,
  hydrateFromAuth: (user) =>
    set((state) => {
      const fallback = mapUserToProfile(user)
      return {
        profile: {
          fullName: state.profile.fullName || fallback.fullName,
          email: state.profile.email || fallback.email,
          phone: state.profile.phone || fallback.phone,
          company: state.profile.company || fallback.company,
          address: state.profile.address || fallback.address,
          joinedDate: state.profile.joinedDate || fallback.joinedDate,
        },
      }
    }),
  updateField: (key, value) =>
    set((state) => ({
      profile: { ...state.profile, [key]: value },
    })),
  setEditing: (value) => set({ isEditing: value }),
  setShowUpdated: (value) => set({ showUpdated: value }),
  loadProfile: async () => {
    const { isLoggedIn, user, setUser } = useAuthStore.getState()
    if (!isLoggedIn) {
      set({ isLoading: false })
      return
    }
    set({ isLoading: true, errorMessage: null })
    try {
      const response = await getProfile()
      const mapped = mapResponseToProfile(
        response,
        mapUserToProfile(user)
      )
      set({ profile: mapped })
      if (response.user) {
        setUser(response.user ?? null)
      }
      try {
        const addressResponse = await listAddresses()
        const addresses = addressResponse.addresses || []
        const defaultAddress = pickDefaultAddress(addresses)
        const addressLabel = formatAddress(defaultAddress)
        set((state) => ({
          addresses,
          profile: {
            ...state.profile,
            address: state.profile.address || addressLabel,
          },
        }))
      } catch (error) {
        set({ errorMessage: getErrorMessage(error) })
      }
    } catch (error) {
      set({ errorMessage: getErrorMessage(error) })
    } finally {
      set({ isLoading: false })
    }
  },
  saveProfile: async () => {
    const { isLoggedIn, setUser } = useAuthStore.getState()
    if (!isLoggedIn) return
    const { profile } = get()
    set({ isSaving: true, errorMessage: null })
    try {
      const payload = {
        full_name: profile.fullName.trim() || null,
        email: profile.email.trim() || null,
        phone: profile.phone.trim() || null,
        company: profile.company.trim() || null,
        address: profile.address.trim() || null,
        joined_date: profile.joinedDate || null,
      }
      const response = await updateProfile(payload)
      const mapped = mapResponseToProfile(response, profile)
      set({
        profile: mapped,
        isEditing: false,
        showUpdated: true,
      })
      if (response.user) {
        setUser(response.user ?? null)
      }

      const addressText = profile.address.trim()
      if (addressText) {
        const { addresses } = get()
        const defaultAddress = pickDefaultAddress(addresses)
        const addressPayload: AddressPayload = {
          recipient_name: profile.fullName.trim() || null,
          email: profile.email.trim() || null,
          phone: profile.phone.trim() || null,
          address_line1: addressText,
          is_default: true,
          metadata: { source: "profile" },
        }
        try {
          if (defaultAddress?.id) {
            const updated = await updateAddress(
              defaultAddress.id,
              addressPayload
            )
            set((state) => ({
              addresses: state.addresses.map((item) =>
                item.id === defaultAddress.id ? updated.address : item
              ),
            }))
          } else {
            const created = await createAddress(addressPayload)
            set((state) => ({
              addresses: [...state.addresses, created.address],
            }))
          }
        } catch (error) {
          set({ errorMessage: getErrorMessage(error) })
        }
      }
    } catch (error) {
      set({ errorMessage: getErrorMessage(error) })
    } finally {
      set({ isSaving: false })
    }
  },
}))
