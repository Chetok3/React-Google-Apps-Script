/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Salary } from './data';
import { ss } from './init';

const SALARY_SHEET = 'Зарплата';

const generateSalarySheet = () => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  let sheet = ss.getSheetByName(SALARY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SALARY_SHEET);
  }

  // Вставляем формулу в A1
  const formula = `=QUERY(ARRAYFORMULA(IF('Операции'!A2:A<>"";{TEXT('Операции'!B2:B;"YYYY-MM")\\ IFERROR(IF(VLOOKUP('Операции'!E2:E; 'Сотрудники'!B2:F; 5; FALSE)<>"Да"; 'Операции'!E2:E;))\\ N(IF('Операции'!A2:A="Доход"; 'Операции'!C2:C * VLOOKUP('Операции'!E2:E; 'Сотрудники'!B2:G; 6; FALSE) / 100))\\ N(IF('Операции'!A2:A="Зарплата"; 'Операции'!C2:C; 0))};)); "select Col1, Col2, sum(Col3), sum(Col4), sum(Col3)-sum(Col4) where Col2 is not null group by Col1, Col2 order by Col1 asc, Col2 asc label Col1 'Месяц', Col2 'Сотрудник', sum(Col3) 'Общая ЗП', sum(Col4) 'Выплачено', sum(Col3)-sum(Col4) 'К Выплате'";0)`;
  sheet.getRange(1, 1).setFormula(formula);

  // Форматируем весь лист
  const maxRows = sheet.getMaxRows();
  const range = sheet.getRange(1, 1, maxRows, 5);
  range.setFontWeight('bold').setFontSize(12);
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');

  sheet.setColumnWidth(1, 120); // Месяц
  sheet.setColumnWidth(2, 180); // Сотрудник
  sheet.setColumnWidth(3, 120); // Общая ЗП
  sheet.setColumnWidth(4, 120); // Выплачено
  sheet.setColumnWidth(5, 120); // К выплате

  // Форматируем числовые колонки
  sheet.getRange(2, 3, maxRows - 1, 3).setNumberFormat('#,##0.00');

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

  Logger.log('✅ Лист "Зарплата" создан и формула вставлена.');
};

export const getAllSalaries = (): Salary[] => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  const sheet = ss.getSheetByName(SALARY_SHEET);
  if (!sheet) throw new Error(`Лист "${SALARY_SHEET}" не найден`);

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const salaries: Salary[] = values.slice(1).map((row) => ({
    month: row[0] || '',
    employee: row[1] || '',
    total: Number(row[2]) || 0,
    paid: Number(row[3]) || 0,
    toPay: Number(row[4]) || 0,
  }));

  return salaries;
};

export default generateSalarySheet;
