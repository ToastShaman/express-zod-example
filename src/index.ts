import express, { Request, Response } from "express";
import {
  InMemoryUserRepository,
  PostgresUserRepository,
} from "./users/storage";
import { create as users } from "./users/routes";
import { PrintingEvents } from "./events";
import { logger } from "./logger";
import { pinoHttp } from "pino-http";
import { initPool } from "./db";
import dotenv from "dotenv";

const main = async () => {
  // Load environment variables from .env file
  dotenv.config();

  const app = express();
  const port = process.env.API_PORT || 3000;

  app.use(pinoHttp({ logger }));
  app.use(express.json());

  // Create dependencies
  const pool = await initPool(process.env.DB_CONNECTION || "postgres://");
  const events = new PrintingEvents(logger);
  const repository =
    process.env.DB_IMPLEMENTATION === "memory"
      ? new InMemoryUserRepository()
      : new PostgresUserRepository(pool);

  // Mount the user router
  app.use("/v1/users", users(repository, events));

  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
};

main();
