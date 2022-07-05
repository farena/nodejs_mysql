const xl = require('excel4node');
const { uuid } = require('uuidv4');
const fileSystem = require('./fileSystem');

const generateSheet = async (sheetData, wb, options, index) => {
  if (sheetData.constructor !== Array) throw new Error('"sheetData" is not an array');

  let ws = null;
  if (options.sheet_name_attr && sheetData[0][options.sheet_name_attr]) {
    ws = wb.addWorksheet(sheetData[0][options.sheet_name_attr]);
  } else {
    ws = wb.addWorksheet(`Worksheet ${index}`);
  }

  const headerStyle = wb.createStyle({ font: { bold: true } });
  const moneyStyle = wb.createStyle({ numberFormat: '€#,##0.00; -€#,##0.00; €0.00' });

  // WRITE HEADERS
  let col = 1;
  Object.keys(sheetData[0]).forEach((x) => {
    ws.cell(1, col).string(x).style(headerStyle);
    col += 1;
  });

  // WRITE DATA
  let row = 2;
  sheetData.forEach((x) => {
    col = 1;
    Object.keys(x).forEach((z) => {
      if (
        options.money_cells &&
        options.money_cells.length &&
        options.money_cells.includes(z) &&
        typeof x[z] === 'number'
      ) {
        ws.cell(row, col).number(parseFloat(x[z])).style(moneyStyle);
      } else if (typeof x[z] === 'number') {
        ws.cell(row, col).number(x[z]);
      } else {
        ws.cell(row, col).string(x[z]);
      }
      col += 1;
    });
    row += 1;
  });
};

module.exports = async (sheetsArray, options = {}) => {
  if (sheetsArray.constructor !== Array) throw new Error('"sheetsArray" is not an array');

  const wb = new xl.Workbook();

  let index = 1;
  for (const sheet of sheetsArray) {
    await generateSheet(sheet, wb, options, index);
    index += 1;
  }

  const fileName = `.temp/${(options.filename || uuid())}.xlsx`;
  await wb.write(fileName);
  await fileSystem.timeout(1000);

  return fileName;
};
