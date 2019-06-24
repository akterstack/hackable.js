export class Hook {
  name: string;
  handlers: Function[];

  constructor(name: string) {
    this.name = name;
  }

  addHandler(handler: Function) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler of hook '${this.name}' must be a function.
       Found ${typeof handler}: ${handler}`);
    }
    this.handlers.push(handler);
  }
}