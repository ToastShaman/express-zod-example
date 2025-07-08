import { Event } from "../events";
import { UserWithId } from "./domain";

export class UserCreated implements Event {
  constructor(readonly user: UserWithId) {}

  name(): string {
    return "UserCreated";
  }
}
