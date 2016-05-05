var debounce = require('debounce')
var classes = require('classes')
var domify = require('domify')
var _ = require('dom')
var event = require('event')
var events = require('events')
var align = require('align')
var detect = require('prop-detect')
var transitionEnd = detect.transitionend
var transition = detect.transition
var closest = require('closest')
var template = require('./template.html')
var Emitter = require('emitter')

/**
 * Select with target element and option
 *
 * @public
 * @constructor
 * @param {Element} target
 * @param {Object} opt
 */
function Select(target, opt) {
  if (!(this instanceof Select)) return new Select(target, opt)
  opt = opt || {}
  if (opt.name) {
    var form = closest(target, 'form')
    if (!form) throw new Error('form element not found')
    this.input = form.querySelector('[name="' + opt.name + '"]')
    if (!this.input) throw new Error('Could not find input for name: ' + opt.name)
  }
  var data = opt.data || []
  this.searchable = opt.searchable || false
  this.pos = opt.pos || 'bl-tl'
  this.target = target
  this.container = domify('<div class="flat-select"></div>')
  this.isinput = target.children[0].tagName.toLowerCase() == 'input'
  target.parentNode.appendChild(this.container)
  if (this.searchable) {
    var el = domify(template)
    this.container.appendChild(el)
    this.closeEl = el.querySelector('.flat-select-close')
    this.filter = el.children[0]
  }
  this.setData(data)
  this.bind()
  if (this.input) {
    var val = this._value = this.input.value
    if (val) {
      var o = this.search(val)
      if (!o) throw new Error('Value: ' + val + ' not found on data')
      this.target.children[0].textContent = o.text
    }
  }
}

Emitter(Select.prototype)

/**
 * Bind event listeners
 *
 * @private
 */
Select.prototype.bind = function () {
  var filter = this.filter
  this._onkeyup = debounce(this.onkeyup.bind(this), 300)
  this._onkeydown = this.onkeydown.bind(this)
  if (filter) {
    event.bind(filter, 'keyup', this._onkeyup)
    event.bind(filter, 'keydown', this._onkeydown)
  }
  this._targetClick = this.ontargetclick.bind(this)
  event.bind(this.target, 'click', this._targetClick)
  this.events = events(this.container, this)
  this.docEvents = events(document, this)
  this.events.bind('click')
  this.events.bind('mouseenter')
  this.docEvents.bind('click', 'ondocclick')
}

Select.prototype.onmouseenter = function (e) { //eslint-disable-line
  var els = this.container.querySelectorAll('.flat-select-item')
  for (var i = 0, l = els.length; i < l; i++) {
    var node = els[i]
    classes(node).remove('active')
  }
}
/**
 * keydown event handler for filter
 *
 * @private
 * @param  {Event}  e
 */
Select.prototype.onkeydown = function (e) {
  var key = e.keyCode || e.which
  if (key === 27 || key === 13) {
    e.preventDefault()
  }
}


/**
 * keyup event handler for filter
 *
 * @private
 * @param  {Event}  e
 */
Select.prototype.onkeyup = function (e) {
  var val = e.target.textContent
  var key = e.keyCode || e.which
  // esc and enter
  if (key === 27 || key === 13) {
    e.preventDefault()
    if (key === 27) {
      this.resetFilter()
      this.hide()
      return
    } else if (key === 13) {
      var div = this.first()
      if (div) {
        var index = parseInt(div.getAttribute('data-index'), 10)
        var o = this.data[index]
        this.select(o)
      }
      return
    }
  }
  var els = this.container.querySelectorAll('.flat-select-item')
  for (var i = 0, l = els.length; i < l; i++) {
    var node = els[i]
    var text = node.textContent
    if (text.indexOf(val) === -1) {
      node.style.display = 'none'
    } else {
      node.style.display = 'block'
    }
  }
  if (val.length) {
    classes(this.closeEl).add('visible')
  } else {
    classes(this.closeEl).remove('visible')
  }
}

/**
 * Find first visible item
 *
 * @private
 * @returns {Element}
 */
Select.prototype.first = function () {
  var els = this.container.querySelectorAll('.flat-select-item')
  for (var i = 0, l = els.length; i < l; i++) {
    var node = els[i]
    if (node.style.display !== 'none') return node
  }
}
/**
 * Rebuild select with new data
 *
 * @public
 * @param {Object} data
 */
Select.prototype.setData = function (data) {
  this.data = data
  _(this.container).clean('.flat-select-item')
  if (data.length === 0) return
  var fragment = document.createDocumentFragment()
  var el
  for (var i = 0, l = data.length; i < l; i++) {
    var o = data[i]
    el = domify('<div class="flat-select-item" data-index="' +
         i + '">' + o.text + '</div>')
    fragment.appendChild(el)
  }
  this.container.appendChild(fragment)
}

/**
 * Unbind all event listeners
 *
 * @public
 * @returns {undefined}
 */
Select.prototype.unbind = function () {
  _(this.container).remove()
  event.unbind(this.target, 'click', this._targetClick)
  if (this.filter) {
    event.unbind(this.filter, 'keyup', this._onkeyup)
    event.unbind(this.filter, 'keydown', this._onkeydown)
  }
  this.off()
  this.events.unbind()
  this.docEvents.unbind()
}

/**
 * Popup click handler
 *
 * @private
 * @param  {Event}  e
 */
Select.prototype.onclick = function (e) {
  e.preventDefault()
  var div = closest(e.target, '.flat-select-item')
  if (classes(e.target).has('flat-select-close')) {
    return this.resetFilter()
  }
  if (div) {
    var index = parseInt(div.getAttribute('data-index'), 10)
    var o = this.data[index]
    this.select(o)
  }
}

/**
 * Reset filter status
 *
 * @public
 */
Select.prototype.resetFilter = function () {
  if (!this.filter) return
  this.filter.textContent = ''
  var els = this.container.querySelectorAll('.flat-select-item')
  for (var i = 0, l = els.length; i < l; i++) {
    var node = els[i]
    node.style.display = 'block'
  }
  classes(this.closeEl).remove('visible')
}

/**
 * Reset all status (filter, target & hidden input)
 *
 * @public
 */
Select.prototype.reset = function () {
  this.hide()
  this.resetFilter()
  this.value('')
}

/**
 * Get value or set value
 *
 * @public
 * @param {String} val [optional]
 * @returns {undefined}
 */
Select.prototype.value = function (val) {
  if (typeof val === 'undefined') return this._value
  var old = this._value
  if (this.input) this.input.value = val
  if (old == val) return
  this._value = val
  this.emit('change', val, old)
  if (val === '') {
    this.setText('')
  } else {
    var o = this.search(val)
    this.setText(o.text)
  }
}

Select.prototype.setText = function (text) {
  var el = this.target.children[0]
  if (this.isinput) {
    el.value = text
  } else {
    el.innerHTML = text
  }
}

/**
 * Target element click hander
 *
 * @private
 * @param  {Event}  e
 */
Select.prototype.ontargetclick = function (e) {
  e.preventDefault()
  if (classes(e.target).has('select-reset')) {
    return this.reset()
  }
  if (this.visible) {
    this.hide()
  } else {
    this.show()
  }
}

/**
 * Target element click hander
 *
 * @private
 * @param  {Event}  e
 */
Select.prototype.select = function (o) {
  this.value(o.id)
  this.resetFilter()
  this.hide()
}

/**
 * Search object from data by val (which is `id`)
 *
 * @private
 * @param {String|Number} val
 */
Select.prototype.search = function (val) {
  if (!this.data) return
  for (var i = 0, l = this.data.length; i < l; i++) {
    var o = this.data[i]
    if (o.id == val) {
      return o
    }
  }
}

/**
 * Document click handler
 *
 * @public
 * @param  {Element}  e
 */
Select.prototype.ondocclick = function (e) {
  var target = e.target
  while (target && target != document.documentElement) {
    if (target == this.target || classes(target).has('flat-select')) {
      return
    }
    target = target.parentNode
  }
  this.hide()
}

/**
 * Show popup
 *
 * @private
 */
Select.prototype.show = function () {
  var el = this.container
  this.visible = true
  classes(this.target).add('active')
  var rect = this.target.getBoundingClientRect()
  var width = rect.width
  var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  el.style.maxHeight = (vh - rect.bottom - 15) + 'px'
  el.style.width = width + 'px'
  el.style.display = 'block'
  el.style[transition] = 'none'
  align(this.target, el, this.pos, {x: -1})
  var self = this
  setTimeout(function () {
    el.style[transition] = ''
    self.aligned = true
    classes(el).remove('hidden')
    if (self.searchable) self.filter.focus()
  }, 20)
}

/**
 * Hide popup
 *
 * @private
 */
Select.prototype.hide = function () {
  var el = this.container
  if (!this.visible) return
  this.visible = false
  classes(this.target).remove('active')
  event.bind(el, transitionEnd, end)
  classes(el).add('hidden')
  var self = this
  function end() {
    event.unbind(el, transitionEnd, end)
    if (self.visible) return
    el.style.display = 'none'
  }
}

module.exports = Select
