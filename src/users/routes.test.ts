import { Request, Response } from "express";
import { getUserById, createUser } from "./routes";
import { UserRepository } from "./storage";
import { User, UserWithId, UUID } from "./domain";
import { NoOpEvents } from "../events";

// Mock repository
class MockUserRepository implements UserRepository {
  private users: Map<UUID, UserWithId> = new Map();

  async put(user: User): Promise<UserWithId> {
    const id: UUID = "550e8400-e29b-41d4-a716-446655440000";
    const userWithId: UserWithId = { ...user, id };
    this.users.set(id, userWithId);
    return userWithId;
  }

  async get(id: UUID): Promise<UserWithId | undefined> {
    return this.users.get(id);
  }

  // Helper method for testing
  addUser(user: UserWithId): void {
    this.users.set(user.id, user);
  }
}

// Mock Express Request and Response
const mockRequest = (params: any = {}, body: any = {}) =>
  ({
    params,
    body,
  }) as Request;

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

describe("Route Handlers", () => {
  let repository: MockUserRepository;

  beforeEach(() => {
    repository = new MockUserRepository();
  });

  describe("getUserById", () => {
    it("should return user when valid ID is provided", async () => {
      const user: UserWithId = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "John Doe",
        email: "john@example.com",
      };
      repository.addUser(user);

      const req = mockRequest({ id: user.id });
      const res = mockResponse();
      const handler = getUserById(repository, new NoOpEvents());

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 404 when user not found", async () => {
      const req = mockRequest({ id: "550e8400-e29b-41d4-a716-446655440000" });
      const res = mockResponse();
      const handler = getUserById(repository, new NoOpEvents());

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 400 for invalid UUID format", async () => {
      const req = mockRequest({ id: "invalid-uuid" });
      const res = mockResponse();
      const handler = getUserById(repository, new NoOpEvents());

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid user ID format");
    });
  });

  describe("createUser", () => {
    it("should create user with valid data", async () => {
      const user: User = {
        name: "Jane Doe",
        email: "jane@example.com",
      };

      const req = mockRequest({}, user);
      const res = mockResponse();
      const handler = createUser(repository, new NoOpEvents());

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: "550e8400-e29b-41d4-a716-446655440000",
        ...user,
      });
    });

    it("should return 400 for invalid user data", async () => {
      const invalidUser = {
        name: "", // Invalid: empty name
        email: "invalid-email", // Invalid: not an email
      };

      const req = mockRequest({}, invalidUser);
      const res = mockResponse();
      const handler = createUser(repository, new NoOpEvents());

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });

    it("should return 400 for missing required fields", async () => {
      const incompleteUser = {
        name: "John Doe",
        // Missing email
      };

      const req = mockRequest({}, incompleteUser);
      const res = mockResponse();
      const handler = createUser(repository, new NoOpEvents());

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });
  });
});
