export const salonConfig = {
  name: "Blue Point AS",
  locale: "nb-NO",
  currency: "NOK",
  timezone: "Europe/Oslo",
  bookingWindowDays: 14,
  address: "Skedsmokorset, Norway",
  phone: "+47 XX XX XX XX",
  email: "post@bluepoint.no",
  theme: {
    primary: "#C4A882",
    secondary: "#2C2C2C",
    accent: "#E8D5C4",
    background: "#FAFAF8",
    foreground: "#1A1A1A",
    muted: "#F5F0EB",
    fonts: {
      heading: "Playfair Display",
      body: "Inter"
    }
  }
} as const

export type SalonConfig = typeof salonConfig
