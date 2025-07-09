import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format").max(255),
});

export const UserWithIdSchema = UserSchema.extend({
  id: z.string().uuid("Invalid UUID format"),
});

export type User = z.infer<typeof UserSchema>;

export type UserWithId = z.infer<typeof UserWithIdSchema>;

export const UUID = z.string().uuid();

export type UUID = z.infer<typeof UUID>;
