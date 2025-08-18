import { z } from "zod"

export const setupSchema = z.object({
  username: z.preprocess(
    (val) => {
      if (typeof val !== "string") return val
      return val.trim().replace(/^@/, "").toLowerCase()
    },
    z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-z0-9]+$/, "Username can only contain letters and numbers"),
  ),

  displayName: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string().min(1, "Display name must not be empty"),
  ),
})

export type SetupSchema = z.infer<typeof setupSchema>
