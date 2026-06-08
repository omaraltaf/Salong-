import { z } from 'zod'

export const bookingSchema = z.object({
  customer_name: z
    .string()
    .min(2, { message: 'Navn må ha minst 2 tegn' }),
  customer_email: z
    .string()
    .email({ message: 'Ugyldig e-postadresse' }),
  customer_phone: z
    .string()
    .regex(/^(\+47|0047)?[2-9]\d{7}$/, {
      message: 'Ugyldig norsk telefonnummer',
    }),
  service_id: z
    .string()
    .uuid({ message: 'Ugyldig tjeneste' }),
  timeslot_id: z
    .string()
    .uuid({ message: 'Ugyldig tidsluke' }),
  notes: z
    .string()
    .optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Navn må ha minst 2 tegn' }),
  email: z
    .string()
    .email({ message: 'Ugyldig e-postadresse' }),
  phone: z
    .string()
    .regex(/^(\+47|0047)?[2-9]\d{7}$/, {
      message: 'Ugyldig norsk telefonnummer',
    })
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .min(10, { message: 'Meldingen må ha minst 10 tegn' }),
})

export type ContactFormData = z.infer<typeof contactSchema>
