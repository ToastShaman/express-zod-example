import { createTimestampTypeParser, DatabasePool, sql } from "slonik";
import { User, UserWithId, UserWithIdSchema, UUID } from "./domain";
import z from "zod";
import { ulid } from "ulid";

export interface UserRepository {
  put(user: User): Promise<UserWithId>;
  get(id: UUID): Promise<UserWithId | undefined>;
}

const UserRecordSchema = z.object({
  user_id: z.string().uuid("Invalid UUID format"),
  version: z
    .string()
    .ulid("Invalid ULID format")
    .default(() => ulid()),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().max(255).email("Invalid email format"),
  latest: z.boolean().default(true),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

type UserRecord = z.infer<typeof UserRecordSchema>;

class UserRecordHelpers {
  static toDomain = UserRecordSchema.transform((data) => {
    return {
      id: data.user_id,
      name: data.name,
      email: data.email,
    } as UserWithId;
  }).pipe(UserWithIdSchema);

  static fromDomain = (user: UserWithId | User): UserRecord => {
    const id = "id" in user ? user.id : crypto.randomUUID();
    const now = new Date();

    return {
      user_id: id,
      version: ulid(),
      name: user.name,
      email: user.email,
      latest: true,
      created_at: now,
      updated_at: now,
    };
  };
}

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, UserRecord> = new Map();

  async put(user: User): Promise<UserWithId> {
    const record: UserRecord = UserRecordHelpers.fromDomain(user);
    const userWithId: UserWithId = { ...user, id: record.user_id };
    this.users.set(record.user_id, record);
    return userWithId;
  }

  async get(id: string): Promise<UserWithId | undefined> {
    const record = this.users.get(id);

    if (!record) {
      return undefined;
    }

    const parsed = UserRecordHelpers.toDomain.safeParse(record);

    if (!parsed.success) {
      throw new Error(
        `Failed to parse user with id ${id}: ${parsed.error.message}`,
      );
    }

    return parsed.data;
  }
}

export class PostgresUserRepository implements UserRepository {
  constructor(private pool: DatabasePool) {}

  async put(user: User): Promise<UserWithId> {
    const record: UserRecord = UserRecordHelpers.fromDomain(user);
    const userWithId: UserWithId = { ...user, id: record.user_id };

    await this.pool.query(sql.unsafe`
      INSERT INTO users (user_id, version, name, email, latest, created_at, updated_at) 
      VALUES (${record.user_id}, ${record.version}, ${record.name}, ${record.email}, ${record.latest}, ${sql.timestamp(record.created_at)}, ${sql.timestamp(record.updated_at)})
    `);

    return userWithId;
  }

  async get(id: UUID): Promise<UserWithId | undefined> {
    const result = await this.pool.maybeOne(sql.type(UserRecordSchema)`
      SELECT user_id, version, name, email, latest, created_at, updated_at FROM users WHERE user_id = ${id} AND latest = true
    `);

    if (!result) {
      return undefined;
    }

    const parsed = UserRecordHelpers.toDomain.safeParse(result);

    if (!parsed.success) {
      throw new Error(
        `Failed to parse user with id ${id}: ${parsed.error.message}`,
      );
    }

    return parsed.data;
  }
}
