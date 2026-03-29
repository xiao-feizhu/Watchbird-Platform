import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  messageType: z.enum(['TEXT', 'IMAGE', 'LOCATION']).default('TEXT'),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
