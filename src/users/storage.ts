import { User, UserWithId } from "./domain";

export interface UserRepository {
  put(user: User): Promise<UserWithId>;
  get(id: string): Promise<UserWithId | undefined>;
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, UserWithId> = new Map();

  async put(user: User): Promise<UserWithId> {
    const id = crypto.randomUUID();
    const userWithId: UserWithId = { ...user, id };
    this.users.set(id, userWithId);
    return Promise.resolve(userWithId);
  }

  async get(id: string): Promise<UserWithId | undefined> {
    const user = this.users.get(id);
    return Promise.resolve(user);
  }
}
