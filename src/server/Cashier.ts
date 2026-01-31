/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Cashier } from './data';
import { ss } from './init';

const CASHIER_SHEET = 'Касса';

const generateCashierSheet = () => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  // 1. Получаем или создаём лист
  let sheet = ss.getSheetByName(CASHIER_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CASHIER_SHEET);
  }
  sheet.getRange(1, 3).setValue('Налог Б');
  // 2. Формула QUERY для дохода и прибыли
  const formula = `=QUERY(ARRAYFORMULA( IF('Операции'!A2:A<>""; { IF(('Операции'!D2:D="Нал") * (('Операции'!A2:A="Доход")+('Операции'!A2:A="Продажа")+('Операции'!A2:A="Пополнение")); 'Операции'!C2:C; IF(('Операции'!D2:D="Нал") * (('Операции'!A2:A="Расход")+('Операции'!A2:A="Зарплата")+('Операции'!A2:A="Инкассация")); -'Операции'!C2:C;0 ) )\\ IF(('Операции'!D2:D="Безнал") * (('Операции'!A2:A="Доход")+('Операции'!A2:A="Продажа")+('Операции'!A2:A="Пополнение")); 'Операции'!C2:C; IF(('Операции'!D2:D="Безнал") * (('Операции'!A2:A="Расход")+('Операции'!A2:A="Зарплата")+('Операции'!A2:A="Инкассация")); -'Операции'!C2:C;0 ) ) }; ) ); "select sum(Col1), sum(Col2) label sum(Col1) 'Касса Нал', sum(Col2) 'Касса Безнал'"; 0 )`;

  // 3. Вставляем формулу в A1 (формула создаёт шапку сама)
  sheet.getRange(1, 1).setFormula(formula);

  // 4. Форматируем лист
  const lastCol = 3;
  const lastRow = 2; // форматируем весь лист
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  sheet.getRange(2, 1, lastRow, 3).setNumberFormat('#,##0.00');

  range.setFontWeight('bold').setFontSize(12);
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');

  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 120);

  range.setBorder(
    true,
    true,
    true,
    true,
    true,
    true,
    'black',
    SpreadsheetApp.BorderStyle.SOLID
  );

  Logger.log('✅ Лист "Касса" создан и формула вставлена.');
  return sheet;
};

export const getCashier = (): Cashier => {
  const sheet = generateCashierSheet();
  const values = sheet.getDataRange().getValues();
  return {
    cash: values[1][0],
    cashless: values[1][1],
    taxCashless: values[1][2],
  };
};

export const getTaxCashless = (): number => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');
  let sheet = ss.getSheetByName(CASHIER_SHEET);
  if (!sheet) {
    return 0
  }
  return Number(sheet.getRange(2, 3).getValue());
};

export const setTaxCashless = (taxCashless: number): Cashier => {
  const sheet = generateCashierSheet();
  const range = sheet.getRange(2, 3);
  if (taxCashless < 0) { range.setValue(0); } else {
    range.setValue(taxCashless);
  }

  const values = sheet.getDataRange().getValues();
  return {
    cash: values[1][0],
    cashless: values[1][1],
    taxCashless: values[1][2],
  };
};

export default generateCashierSheet;
