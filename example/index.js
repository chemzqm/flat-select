require('../style.css')
var regions = require('./data.json')
var Select = require('..')
var GB2260 = require('./gb2260').GB2260
var gb = new GB2260(regions)
var targets = document.querySelectorAll('.select-item')

var provinces = gb.provinces().map(function (division) {
  return {
    id: division.code,
    text: division.name
  }
})

var pselect = new Select(targets[0], {
  searchable: true,
  name: 'province',
  data: provinces
})

var cselect = new Select(targets[1], {
  searchable: true,
  name: 'city',
  data: getCityData()
})

var dselect = new Select(targets[2], {
  searchable: true,
  name: 'district',
  data: getDistrictData()
})

pselect.on('change', function () {
  cselect.reset()
  cselect.setData(getCityData())
})

cselect.on('change', function () {
  dselect.reset()
  dselect.setData(getDistrictData())
})

function getCityData() {
  var pval = pselect.value()
  if (!pval) return []
  return gb.prefectures(pval).map(function (division) {
    return {
      id: division.code,
      text: division.name
    }
  })
}

function getDistrictData() {
  var cval = cselect.value()
  if (!cval) return []
  return gb.counties(cval).map(function (division) {
    return {
      id: division.code,
      text: division.name
    }
  })
}
