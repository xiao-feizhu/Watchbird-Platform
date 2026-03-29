import { z } from 'zod'
import { Gender } from '@prisma/client'

export const updateUserProfileSchema = z.object({
  age: z.number().int().min(10).max(100).optional(),
  gender: z.nativeEnum(Gender).optional(),
  region: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  birdingYears: z.number().int().min(0).max(100).optional(),
  expertBirds: z.array(z.string().max(50)).max(20).optional(),
  equipment: z.string().max(200).optional(),
  canDrive: z.boolean().optional(),
  carCapacity: z.number().int().min(0).max(50).optional(),
})

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
