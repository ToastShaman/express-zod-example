import { Logger } from "pino";

export interface Event {
  name(): string;
}

export interface Events {
  emit(event: Event): void;
  andThen(other: Events): Events;
}

export class PrintingEvents implements Events {
  constructor(private logger: Logger) {}

  emit(event: Event): void {
    this.logger.info({
      name: event.name(),
      payload: event,
    });
  }

  andThen(other: Events): Events {
    return new CompositeEvents(this, other);
  }
}

export class NoOpEvents implements Events {
  emit(event: Event): void {
    // No operation, does nothing
  }
  andThen(other: Events): Events {
    return other; // Just return the other events handler
  }
}

class CompositeEvents implements Events {
  constructor(
    private first: Events,
    private second: Events,
  ) {}

  emit(event: Event): void {
    this.first.emit(event);
    this.second.emit(event);
  }

  andThen(other: Events): Events {
    return new CompositeEvents(this, other);
  }
}
