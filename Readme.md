# Flat-select

Select component designed for simplicity.

[demo](https://chemzqm.github.io/flat-select/)

## Install

    npm install flat-select --save

## Usage

``` js
var Select = require('flat-select')
var target = document.querySelector('select-item')
var select = new Select(target, {
  data: [{
    id 1,
    text: 'abc'
  }, {
    id 2,
    text: 'def'
  }]
})
```

## API

### new Select(target, [option])

* `target` target element for align and click.
* `option.name` bind to input element with name (should be form outside).
* `option.searchable` set to true if filter needed.
* `option.pos` position for [align](https://github.com/chemzqm/align), default `bl-tl`
* `option.data` data array contains `id` and `text`, `id` is used for value and text is used for innerHTML of option, default `[]`

### .unbind()

Unbind all events

### .reset()

Reset all status (filter, target & hidden input)

### .value([value])

Set/Get the value.

### .setData(array)

Make internal data use new `array`, no reset is called.

## LICENSE

  Copyright 2016 chemzqm@gmail.com

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
  OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
