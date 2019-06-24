import { Hook } from './Hook';

export class Filter extends Hook {
  cursorIdx = 0;

  constructor(name: string) {
    super(name);
  }

  async invoke(data = {}, context = {}) {
    while (this.cursorIdx < this.handlers.length) {
      data = await this.next(data, context);
    }
    this.cursorIdx = 0;
    return data;
  }

  invokeSync(data = {}, context = {}) {
    while (this.cursorIdx < this.handlers.length) {
      data = this.next(data, context);
    }
    this.cursorIdx = 0;
    return data;
  }

  next(data = {}, context = {}) {
    const nData = this.handlers[this.cursorIdx].call(this, data, context, this.next);
    this.cursorIdx++;
    return typeof nData === 'object' ? nData : data;
  }
}