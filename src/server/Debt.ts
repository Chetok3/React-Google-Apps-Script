/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Debt } from './data';
import { ss } from './init';

const OWNER_DEBT_SHEET = 'Долг Владельцев';

const generateOwnerDebtSheet = () => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  // Получаем или создаём лист
  let sheet = ss.getSheetByName(OWNER_DEBT_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(OWNER_DEBT_SHEET);
  }

  // Вставляем формулу QUERY в ячейку A1
  const formula = `=QUERY(ARRAYFORMULA(IF('Продажи'!A2:A<>""; {TEXT('Продажи'!H2:H;"YYYY-MM")\\ IF(VLOOKUP('Продажи'!G2:G;'Сотрудники'!B2:F; 5; FALSE)="Да";'Продажи'!G2:G;)\\ VLOOKUP('Продажи'!A2:A;'Ассортимент'!A:E; 5; FALSE) * 'Продажи'!C2:C / 2 }; )); "select Col1, Col2, sum(Col3) where Col2 is not null group by Col1, Col2 order by Col1 asc, Col2 asc label Col1 'Месяц', Col2 'Сотрудник', sum(Col3) 'Долг'"; 0)`;
  sheet.getRange(1, 1).setFormula(formula);

  // Форматируем все три столбца до конца листа
  const maxRows = sheet.getMaxRows();
  const range = sheet.getRange(1, 1, maxRows, 3);
  range.setFontWeight('bold').setFontSize(12);
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.setColumnWidth(1, 120); // Месяц
  sheet.setColumnWidth(2, 180); // Сотрудник
  sheet.setColumnWidth(3, 120); // Долг

  // Форматируем колонку "Долг" с двумя знаками после запятой
  sheet.getRange(2, 3, maxRows - 1).setNumberFormat('#,##0.00');

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

  Logger.log(
    '✅ Лист "Долг Владельцев" обновлён с формулой, форматированием и числовым форматом.'
  );
};

export const getAllDebts = (): Debt[] => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  const sheet = ss.getSheetByName(OWNER_DEBT_SHEET);
  if (!sheet) throw new Error(`Лист "${OWNER_DEBT_SHEET}" не найден`);

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const salaries: Debt[] = values.slice(1).map((row) => ({
    month: row[0] || '',
    employee: row[1] || '',
    debt: Number(row[2]) || 0,
  }));

  return salaries;
};

export default generateOwnerDebtSheet;
