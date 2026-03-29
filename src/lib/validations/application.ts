import { z } from 'zod'
import { ParticipantStatus } from '@prisma/client'

export const applyTripSchema = z.object({
  bio: z.string().min(5).max(300),
})

export const reviewApplicationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
})

export type ApplyTripInput = z.infer<typeof applyTripSchema>
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>
