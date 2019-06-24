import { Hook } from './Hook';

export class Event extends Hook {
  async invoke(data: Object) {
    this.handlers.map((handler) => handler(data))
      .forEach(async (promise) => { await promise });
  }
}
