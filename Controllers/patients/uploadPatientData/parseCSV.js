const exceljs = require('exceljs')
const {Readable} = require('stream')
const LOT = require('../../../models/LOT')

const parseCSV = async (buffer) => {
  const readableFile = new Readable()
  readableFile.push(buffer)
  readableFile.push(null)
  const workbook = new exceljs.Workbook()
  await workbook.xlsx.read(readableFile)
  const worksheet = workbook.worksheets[0]

  const rows = []

  worksheet.eachRow((row, i) => {
    if (i > 1) {
      const rowData = {}
      row.eachCell((cell, j) => {
        rowData[worksheet.getRow(1).getCell(j).value] = cell.value
      })
      rows.push([rowData])
    }
  })

  return rows
}

module.exports = parseCSV
