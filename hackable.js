const _actionsMap = new WeakMap()
const filtersMap = new WeakMap()

const hooks = {
  actionsMap: {},
  filtersMap: {}
}

let throwAbstractTypeError = (typeName) => {
  throw new TypeError(`Abstract type '${typeName}' must be implemented`)
}

let throwAbstractMethodError = (methodName) => {
  throw new TypeError(`Abstract method '${methodName}' must be implemented`)
}

class Hook {

  constructor(name) {
    this.name = name;
    this.handlers = []
  }

  addHandler(handler) {
    this.handlers.push(handler)
  }

  invoke(data) {
    throwAbstractMethodError('invoke')
  }

}

class Action extends Hook {

  constructor(name) {
    super(name)
  }

  invoke(data) {
    this.handlers.forEach((handler) => {
      handler(data)
    })
  }

}

class Filter extends Hook {

  constructor(name) {
    super(name);
    cursorIdx = 0;
  }

  async invoke(data) {
    let ndata = data;
    for (; ;) {
      if (this.cursorIdx === this.handlers.length) return ndata;
      ndata = this.next(ndata)
    }
  }

  async next(data) {
    let ndata = Object.assign({}, data)
    ndata = await this.handlers[this.cursorIdx++](ndata, this.next)
    return ndata;
  }

}

class Hackable {

  constructor() {
    if (new.target === Hackable) {
      throwAbstractTypeError(Hackable.constructor.name)
    }
    if (typeof this.prefix !== 'string') {
      throw new Error('prefix must be string')
    }
    _actionsMap.set(this, {})
    filtersMap.set(this, {})
  }

  get prefix() {
    throwAbstractMethodError('prefix')
  }

  addAction(name, handler) {
    let action = new Action(name)
    action.addHandler(handler)
    let actionMap = _actionsMap.get(this) || {}
    _actionsMap.set(this, actionMap)
    actionMap[action.name] = action
  }

  doAction(name, data) {
    this.actions[name](data)
  }

  addFilter(name, handler) {
    let filter = new Filter(name)
    filter.addHandler(handler)
    this.filters[name] = filter
  }

  async doFilter(name, data) {
    return await this.filters[name](data)
  }

}

exports = Hackable