/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { OperationItem } from './data';
import { getTaxCashless } from './Cashier';
import { ss } from './init';

const OPERATIONS = 'Операции';

type OperationsHeaderKey = keyof OperationItem | 'taxCashless';

const headersMap: Record<OperationsHeaderKey, string> = {
  type: 'Операция',
  date: 'Дата',
  amount: 'Сумма',
  method: 'Метод',
  employee: 'Сотрудник',
  note: 'Примечание',
  taxCashless: 'Налог Б'
};

export const getOperationsSheet = (): GoogleAppsScript.Spreadsheet.Sheet => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');
  let sheet = ss.getSheetByName(OPERATIONS);
  if (!sheet) {
    sheet = ss.insertSheet(OPERATIONS);
    sheet.appendRow(Object.values(headersMap));
  }
  return sheet;
};

export const formatOperationsSheet = () => {
  const sheet = getOperationsSheet();
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const lastCol = sheet.getLastColumn();

  const range = sheet.getRange(1, 1, lastRow, lastCol);

  // Шрифт и выравнивание
  range.setFontWeight('bold').setFontSize(13);
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Ширина столбцов
  const headers = Object.values(headersMap);
  headers.forEach((header, index) => {
    const col = index + 1;
    switch (header) {
      case headersMap.type:
      case headersMap.amount:
      case headersMap.method:
      case headersMap.employee:
        sheet.setColumnWidth(col, 150);
        break;
      case headersMap.date:
        sheet.setColumnWidth(col, 180);
        break;
      case headersMap.note:
        sheet.setColumnWidth(col, 250);
        break;
      default:
        sheet.setColumnWidth(col, 120);
    }
  });

  // Высота строк
  for (let i = 1; i <= lastRow; i++) {
    sheet.setRowHeight(i, 40);
  }

  // Границы
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

  // Перенос по словам
  range.setWrap(true);

  // Валидация для Операции
  const operationsList = [
    'Доход',
    'Продажа',
    'Зарплата',
    'Инкассация',
    'Пополнение',
    'Расход',
  ];
  const operationRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(operationsList)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 1, lastRow - 1 || 1).setDataValidation(operationRule);

  // Валидация для Метода
  const methodList = ['Нал', 'Безнал'];
  const methodRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(methodList)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 4, lastRow - 1 || 1).setDataValidation(methodRule);

  // Цвета (чипы) для Операций
  const colors = [
    { text: 'Доход', color: '#c8e6c9' },
    { text: 'Продажа', color: '#bbdefb' },
    { text: 'Зарплата', color: '#fff9c4' },
    { text: 'Инкассация', color: '#ffe0b2' },
    { text: 'Пополнение', color: '#d1c4e9' },
    { text: 'Расход', color: '#ffcdd2' },
  ];

  const rules = colors.map((c) =>
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(c.text)
      .setBackground(c.color)
      .setRanges([sheet.getRange(2, 1, lastRow - 1 || 1)])
      .build()
  );

  sheet.setConditionalFormatRules(rules);

  Logger.log('✅ Лист "Операции" отформатирован');
};
export const addOperation = (op: Partial<OperationItem>) => {
  const sheet = getOperationsSheet();
  const taxCashless = getTaxCashless();
  let amount = Number(op.amount) || 0;
  let tax = 0;
  if (
    op.method === 'Безнал' &&
    (op.type === 'Продажа' || op.type === 'Пополнение' || op.type === 'Доход')
  ) {
    const originalAmount = amount;
  
    const coefficient = 1 - taxCashless / 100;
    amount = originalAmount * coefficient;
  
    tax = originalAmount - amount;
  }
  // Если дата не указана — ставим текущую
  const date = op.date ? op.date : new Date().toLocaleDateString();

  const rowValues = (Object.keys(headersMap) as OperationsHeaderKey[]).map(
    (key) => {
      if (key === 'date') {
        return date; // Google Sheets нормально принимает объект Date
      }
      if (key === 'amount') {
        return amount;
      }
      if (key === 'taxCashless') {
        return  tax !== 0 ? `${taxCashless}% - ${tax.toFixed(2)}₴` : '';
      }
      return op[key as keyof OperationItem] ?? '';
    }
  );

  sheet.appendRow(rowValues);
  formatOperationsSheet();
};
export const deleteOperationByNoteId = (id: string | number) => {
  const sheet = getOperationsSheet();
  const lastRow = sheet.getLastRow();
  const headers = Object.values(headersMap);

  const noteCol = headers.indexOf(headersMap.note) + 1; // индекс колонки "Примечание"

  if (noteCol <= 0) {
    throw new Error('Колонка "Примечание" не найдена.');
  }

  // Получаем все примечания
  const notes = sheet.getRange(2, noteCol, lastRow - 1).getValues();

  for (let i = 0; i < notes.length; i++) {
    if (String(notes[i][0]) === String(id)) {
      const rowIndex = i + 2; // т.к. данные начинаются со 2-й строки
      sheet.deleteRow(rowIndex);
      Logger.log(`✅ Операция с id=${id} удалена (строка ${rowIndex})`);
      return true;
    }
  }

  Logger.log(`⚠️ Операция с id=${id} не найдена`);
  return false;
};

export function testAddOperation() {
  const testOp = {
    type: 'Продажа', // выборка из списка
    date: new Date().toISOString(), // текущая дата и время
    amount: 2500, // сумма
    method: 'Безнал', // выборка из списка
    employee: 'Иванов Иван', // сотрудник
    note: 'Оплата через терминал', // примечание
  };

  addOperation(testOp);

  Logger.log('✅ Тестовая операция добавлена');
}
