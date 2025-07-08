import express, { Request, Response } from "express";
import { InMemoryUserRepository } from "./users/storage";
import { create as users } from "./users/routes";
import { PrintingEvents } from "./events";
import { pinoHttp } from "pino-http";
import pino from "pino";

const logger = pino();
const events = new PrintingEvents(logger);

const app = express();
const port = 3000;

app.use(pinoHttp());
app.use(express.json());

// Create dependencies
const userRepository = new InMemoryUserRepository();

// Mount the user router
app.use("/v1/users", users(userRepository, events));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
