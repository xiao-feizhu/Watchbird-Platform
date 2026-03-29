import { z } from 'zod'
import { FeeType } from '@prisma/client'

export const createTripSchema = z.object({
  title: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
  destinationLat: z.number().min(-90).max(90).optional(),
  destinationLng: z.number().min(-180).max(180).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  maxParticipants: z.number().int().min(2).max(50),
  requirements: z.string().max(500).optional(),
  feeType: z.nativeEnum(FeeType),
  feeAmount: z.number().min(0).optional(),
  feeDescription: z.string().max(200).optional(),
  description: z.string().min(10).max(2000),
})

export const updateTripSchema = createTripSchema.partial()

export const listTripsQuerySchema = z.object({
  region: z.string().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  status: z.enum(['OPEN', 'FULL']).optional(),
  page: z.string().default('1').transform(Number),
  limit: z.string().default('10').transform(Number),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
