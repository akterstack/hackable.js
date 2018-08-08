class Hackable {

  constructor(prefix) {
    if (!prefix) {
      prefix = this.constructor.name.toLowerCase()
    } else if (typeof prefix !== 'string') {
      throw new Error('prefix must be string')
    }
    this.prefix = prefix
    this.actions = []
    this.filters = []
  }

  addActions(name, handler) {
    let action = new Action(name)
    action.addHandler(handler)
    this.actions[action.name] = action
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

class Hook {

  constructor(name) {
    this.name = name;
    this.handlers = []
  }

  addHandler(handler) {
    this.handlers.push(handler)
  }

  invoke(data) {
    throw new Error('No default implementation found.')
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
    for (;;) {
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

exports = Hackable