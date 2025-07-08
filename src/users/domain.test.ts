import { UserSchema, UserWithIdSchema, User, UserWithId } from "./domain";

describe("Domain Schemas", () => {
  describe("UserSchema", () => {
    it("should validate valid user data", () => {
      const validUser = {
        name: "John Doe",
        email: "john@example.com",
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it("should reject empty name", () => {
      const invalidUser = {
        name: "",
        email: "john@example.com",
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            path: ["name"],
            message: "Name is required",
          }),
        );
      }
    });

    it("should reject invalid email format", () => {
      const invalidUser = {
        name: "John Doe",
        email: "invalid-email",
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            path: ["email"],
            message: "Invalid email format",
          }),
        );
      }
    });

    it("should reject missing required fields", () => {
      const incompleteUser = {
        name: "John Doe",
        // Missing email
      };

      const result = UserSchema.safeParse(incompleteUser);
      expect(result.success).toBe(false);
    });
  });

  describe("UserWithIdSchema", () => {
    it("should validate valid user with ID", () => {
      const validUserWithId = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
      };

      const result = UserWithIdSchema.safeParse(validUserWithId);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(validUserWithId);
      }
    });

    it("should reject invalid UUID format", () => {
      const invalidUserWithId = {
        id: "invalid-uuid",
        name: "John Doe",
        email: "john@example.com",
      };

      const result = UserWithIdSchema.safeParse(invalidUserWithId);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors).toContainEqual(
          expect.objectContaining({
            path: ["id"],
            message: "Invalid UUID format",
          }),
        );
      }
    });

    it("should inherit all User validations", () => {
      const invalidUserWithId = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "",
        email: "invalid-email",
      };

      const result = UserWithIdSchema.safeParse(invalidUserWithId);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(1);
      }
    });
  });

  describe("TypeScript Types", () => {
    it("should have correct User type inference", () => {
      const user: User = {
        name: "John Doe",
        email: "john@example.com",
      };

      // This test passes if TypeScript compilation succeeds
      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("john@example.com");
    });

    it("should have correct UserWithId type inference", () => {
      const userWithId: UserWithId = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
      };

      // This test passes if TypeScript compilation succeeds
      expect(userWithId.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(userWithId.name).toBe("John Doe");
      expect(userWithId.email).toBe("john@example.com");
    });
  });
});
