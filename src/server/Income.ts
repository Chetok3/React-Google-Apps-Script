/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IncomeRow } from './data';
import { ss } from './init';

const INCOME_SHEET = 'Доход';

const generateIncomeSheet = () => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  // 1. Получаем или создаём лист
  let sheet = ss.getSheetByName(INCOME_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(INCOME_SHEET);
  }

  // 2. Формула QUERY для дохода и прибыли
  const formula = `=QUERY(ARRAYFORMULA(IF('Операции'!A2:A<>""; {TEXT('Операции'!B2:B;"YYYY-MM")\\ IFERROR(IF(('Операции'!A2:A="Доход") + ('Операции'!A2:A="Продажа"); 'Операции'!C2:C;0 ))\\ IFERROR(IF(('Операции'!A2:A="Доход") + ('Операции'!A2:A="Продажа"); 'Операции'!C2:C * (1 - VLOOKUP('Операции'!E2:E;'Сотрудники'!B2:G;6;FALSE)/100);IF('Операции'!A2:A="Расход";-'Операции'!C2:C;0)))\\IFERROR(IF(VLOOKUP('Операции'!E2:E;'Сотрудники'!B2:F;5;FALSE)="Да"; IF('Операции'!A2:A="Инкассация"; 'Операции'!C2:C ;0 );0))\\IFERROR( IF((('Операции'!A2:A="Доход") + ('Операции'!A2:A="Продажа")) * ('Операции'!D2:D="Нал") ; 'Операции'!C2:C;0 ) )\\IFERROR( IF((('Операции'!A2:A="Доход") + ('Операции'!A2:A="Продажа")) * ('Операции'!D2:D="Нал"); 'Операции'!C2:C * (1 - VLOOKUP('Операции'!E2:E;'Сотрудники'!B2:G;6;FALSE)/100);IF(('Операции'!A2:A="Расход") * ('Операции'!D2:D="Нал");-'Операции'!C2:C;0) ))\\IFERROR(IF(VLOOKUP('Операции'!E2:E;'Сотрудники'!B2:F;5;FALSE)="Да"; IF(('Операции'!A2:A="Инкассация") * ('Операции'!D2:D="Нал"); 'Операции'!C2:C ;0 );0 ))\\IFERROR( IF((('Операции'!A2:A="Доход") + ('Операции'!A2:A="Продажа")) * ('Операции'!D2:D="Безнал") ; 'Операции'!C2:C; 0))\\IFERROR( IF((('Операции'!A2:A="Доход") + ('Операции'!A2:A="Продажа")) * ('Операции'!D2:D="Безнал"); 'Операции'!C2:C * (1 - VLOOKUP('Операции'!E2:E;'Сотрудники'!B2:G;6;FALSE)/100);IF(('Операции'!A2:A="Расход") * ('Операции'!D2:D="Безнал");-'Операции'!C2:C;0)))\\IFERROR(IF(VLOOKUP('Операции'!E2:E;'Сотрудники'!B2:F;5;FALSE)="Да"; IF(('Операции'!A2:A="Инкассация") * ('Операции'!D2:D="Безнал"); 'Операции'!C2:C ;0  );0))};)); "select Col1, sum(Col2), sum(Col3), sum(Col4), sum(Col5), sum(Col6), sum(Col7), sum(Col8), sum(Col9), sum(Col10) where Col1 is not null group by Col1 order by Col1 desc label Col1 'Месяц', sum(Col2) 'Доход', sum(Col3) 'Прибыль', sum(Col4) 'Инкассация', sum(Col5) 'Доход Н', sum(Col6) 'Прибыль Н', sum(Col7) 'Инкассация Н', sum(Col8) 'Доход Б', sum(Col9) 'Прибыль Б', sum(Col10) 'Инкассация Б'";0)`;
  // 3. Вставляем формулу в A1 (формула создаёт шапку сама)
  sheet.getRange(1, 1).setFormula(formula);

  // 4. Форматируем лист
  const lastCol = 10;
  const lastRow = sheet.getMaxRows(); // форматируем весь лист
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  sheet.getRange(2, 2, lastRow, 9).setNumberFormat('#,##0.00');

  range.setFontWeight('bold').setFontSize(12);
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');

  sheet.setColumnWidth(1, 120); // Месяц
  sheet.setColumnWidth(2, 120); // Доход
  sheet.setColumnWidth(3, 120); // Прибыль
  sheet.setColumnWidth(4, 120); // Инкассация
  sheet.setColumnWidth(5, 120); // Доход Нал
  sheet.setColumnWidth(6, 120); // Прибыль Нал
  sheet.setColumnWidth(7, 120); // Инкассация Нал
  sheet.setColumnWidth(8, 120); // Доход Безнал
  sheet.setColumnWidth(9, 120); // Прибыль Безнал
  sheet.setColumnWidth(10, 120); // Инкассация Безнал

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

  Logger.log('✅ Лист "Доход" создан и формула вставлена.');
};
export const getAllIncomes = (): IncomeRow[] => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');

  const sheet = ss.getSheetByName(INCOME_SHEET);
  if (!sheet) throw new Error(`Лист "${INCOME_SHEET}" не найден`);

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const incomes: IncomeRow[] = values.slice(1).map((row) => ({
    month: row[0] || '',
    income: Number(row[1]) || 0,
    profit: Number(row[2]) || 0,
    cashin: Number(row[3]) || 0,
    incomeN: Number(row[4]) || 0,
    profitN: Number(row[5]) || 0,
    cashinN: Number(row[6]) || 0,
    incomeB: Number(row[7]) || 0,
    profitB: Number(row[8]) || 0,
    cashinB: Number(row[9]) || 0,
  }));

  return incomes;
};
export default generateIncomeSheet;
