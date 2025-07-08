import { InMemoryUserRepository } from "./storage";
import { User } from "./domain";

describe("InMemoryUserRepository", () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  describe("put", () => {
    it("should store a user and generate an ID", async () => {
      const user: User = {
        name: "John Doe",
        email: "john@example.com",
      };

      const storedUser = await repository.put(user);

      expect(storedUser).toMatchObject(user);
      expect(storedUser.id).toBeDefined();
      expect(typeof storedUser.id).toBe("string");
    });
  });

  describe("get", () => {
    it("should return a user by ID", async () => {
      const user: User = {
        name: "Jane Doe",
        email: "jane@example.com",
      };

      const storedUser = await repository.put(user);
      const retrievedUser = await repository.get(storedUser.id);

      expect(retrievedUser).toEqual(storedUser);
    });

    it("should return undefined for non-existent ID", async () => {
      const result = await repository.get(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(result).toBeUndefined();
    });
  });
});
