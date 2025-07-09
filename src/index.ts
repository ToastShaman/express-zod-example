import express, { Request, Response } from "express";
import { InMemoryUserRepository } from "./users/storage";
import { create as users } from "./users/routes";
import { PrintingEvents } from "./events";
import { logger } from "./logger";
import { pinoHttp } from "pino-http";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(pinoHttp({ logger }));
app.use(express.json());

// Create dependencies
const events = new PrintingEvents(logger);
const userRepository = new InMemoryUserRepository();

// Mount the user router
app.use("/v1/users", users(userRepository, events));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express!");
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
