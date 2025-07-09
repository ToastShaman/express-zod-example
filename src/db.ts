import { createPool, DatabasePool } from "slonik";
import { createPgDriverFactory } from "@slonik/pg-driver";

export async function initPool(connection: string): Promise<DatabasePool> {
  return await createPool(connection, {
    driverFactory: createPgDriverFactory(),
  });
}
