import { Router, Request, Response } from "express";
import { UserRepository } from "./storage";
import { UserSchema } from "./domain";
import { Events } from "../events";
import { UserCreated } from "./events";
import z from "zod";

export function getUserById(
  repository: UserRepository,
  events: Events,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const userId = z.string().uuid().safeParse(req.params.id);

    if (userId.error) {
      res.status(400).send("Invalid user ID format");
      return;
    }

    try {
      const user = await repository.get(userId.data);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
      return;
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  };
}

export function createUser(
  repository: UserRepository,
  events: Events,
): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response) => {
    const user = UserSchema.safeParse(req.body);

    if (user.error) {
      res
        .status(400)
        .json({ error: user.error.errors.map((e) => e.message).join(", ") });
      return;
    }

    const saved = await repository.put(user.data);

    events.emit(new UserCreated(saved));

    res.status(201).json(saved);

    return;
  };
}

export function create(repository: UserRepository, events: Events): Router {
  const router = Router();

  // GET /users/:id - Get user by ID
  router.get("/:id", getUserById(repository, events));

  // POST /users - Create new user
  router.post("/", createUser(repository, events));

  return router;
}
