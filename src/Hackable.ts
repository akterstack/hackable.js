import { StringMap } from './helpers';
import { Event } from './Event';
import { Filter } from './Filter';

export class Hackable {

  events: StringMap<Event>;
  filters: StringMap<Filter>;

  bind = bindEventFactory(this.events);
  on = this.bind;
  emit = emitEventFactory(this.events);

  pipe = addFilterFactory(this.filters);
  flush = applyFilterFactory(this.filters);
  flushSync = applyFilterSyncFactory(this.filters);
}

const globalHooks = new Hackable();

function bindEventFactory(eventsMap: StringMap<Event>) {
  return (name: string, listener: Function) => {
    let event = eventsMap[name] || new Event(name);
    event.addHandler(listener);
    eventsMap[name] = event;
  }
}

function emitEventFactory(eventsMap: StringMap<Event>) {
  return async (name: string, data = {}) => {
    if (!eventsMap[name]) return;
    return eventsMap[name].invoke(data);
  }
}

function addFilterFactory(filtersMap: StringMap<Filter>) {
  return (name: string, flushFn: Function) => {
    let filter = filtersMap[name] || new Filter(name);
    filter.addHandler(flushFn);
    filtersMap[name] = filter;
  }
}

function applyFilterFactory(filtersMap: StringMap<Filter>) {
  return (name: string, data = {}, flushCtx = {}) => {
    if (!filtersMap[name]) return data;
    return filtersMap[name].invoke(data, flushCtx);
  }
}

function applyFilterSyncFactory(filtersMap: StringMap<Filter>) {
  return (name: string, data = {}, flushCtx = {}) => {
    if (!filtersMap[name]) return data;
    return filtersMap[name].invokeSync(data, flushCtx);
  }
}

export function on(name: string, listener: Function) {
  bindEventFactory(globalHooks.events)(name, listener);
}

export async function emit(name: string, data = {}) {
  return emitEventFactory(globalHooks.events)(name, data);
}

export function pipe(name: string, flushFn: Function) {
  addFilterFactory(globalHooks.filters)(name, flushFn);
}

export async function flush(name: string, data = {}, flushCtx = {}) {
  return applyFilterFactory(globalHooks.filters)(name, data, flushCtx);
}

export function flushSync(name: string, data = {}, flushCtx = {}) {
  return applyFilterSyncFactory(globalHooks.filters)(name, data, flushCtx);
}
