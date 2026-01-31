/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SaleRecord, OperationItem } from './data';
import { getEmployeeById } from './Employees';
import { getByBarcode, updateItem } from './Assortment';
import { ss } from './init';
import { addOperation } from './Operations';

const SALES = 'Продажи';

const headersMap: Record<keyof SaleRecord, string> = {
  barcode: 'Артикул',
  name: 'Название',
  quantity: 'Кол-во',
  price: 'Цена',
  total: 'Сумма',
  paymentMethod: 'Метод оплаты',
  employee: 'Сотрудник',
  date: 'Дата',
};

export const getSalesSheet = (): GoogleAppsScript.Spreadsheet.Sheet => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');
  let sheet = ss.getSheetByName(SALES);
  if (!sheet) {
    sheet = ss.insertSheet(SALES);
    sheet.appendRow(Object.values(headersMap));
  }
  return sheet;
};

const getHeaders = (): string[] => {
  const sheet = getSalesSheet();
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0] as string[];
};

const getSheetData = (): any[][] => {
  const sheet = getSalesSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
};

export const formatSalesSheet = () => {
  const sheet = getSalesSheet();
  const headers = getHeaders();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  const range = sheet.getRange(1, 1, lastRow, lastCol);
  range.setFontWeight('bold').setFontSize(12);
  range
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  headers.forEach((header, index) => {
    const col = index + 1;
    switch (header) {
      case headersMap.barcode:
        sheet.setColumnWidth(col, 120);
        break;
      case headersMap.name:
        sheet.setColumnWidth(col, 220);
        break;
      case headersMap.employee:
        sheet.setColumnWidth(col, 180);
        break;
      case headersMap.paymentMethod:
        sheet.setColumnWidth(col, 140);
        break;
      case headersMap.date:
        sheet.setColumnWidth(col, 160);
        break;
      default:
        sheet.setColumnWidth(col, 100);
    }
  });
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

  // Валидация для Метода оплаты
  const methodList = ['Нал', 'Безнал'];
  const methodRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(methodList)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 6, lastRow - 1 || 1).setDataValidation(methodRule);

  Logger.log('✅ Лист Продажи отформатирован');
};

const rowToSale = (row: any[], headers: string[]): SaleRecord => {
  const sale: Partial<SaleRecord> = {};
  (Object.keys(headersMap) as (keyof SaleRecord)[]).forEach((key) => {
    const colIndex = headers.indexOf(headersMap[key]);
    let value = row[colIndex];
    if (key === 'date' && value) {
      value = value.toLocaleDateString('uk-UA');
    }
    sale[key] = value ?? '';
  });
  return sale as SaleRecord;
};

export const getAllSales = (): SaleRecord[] => {
  const headers = getHeaders();
  return getSheetData().map((row) => rowToSale(row, headers));
};

export const addSale = (
  barcode: string,
  quantity: number,
  employeeId: string | number,
  paymentMethod: 'Нал' | 'Безнал'
): SaleRecord[] => {
  const sheet = getSalesSheet();
  const item = getByBarcode(barcode);

  if (!item)
    throw new Error(`Товар с barcode ${barcode} не найден в ассортименте`);

  const employee = getEmployeeById(employeeId);
  if (!employee) throw new Error(`Сотрудник с ID ${employeeId} не найден`);

  if (item.stock < quantity) {
    throw new Error(`Недостаточно товара на складе (${item.stock} доступно)`);
  }

  const total = +(item.price * quantity).toFixed(2);

  const row: SaleRecord = {
    barcode: item.barcode,
    name: item.name,
    quantity,
    price: item.price,
    total,
    paymentMethod,
    employee: employee.name,
    date: new Date().toLocaleDateString('uk-UA'),
  };

  const rowValues = (Object.keys(headersMap) as (keyof SaleRecord)[]).map(
    (key) => row[key]
  );
  sheet.appendRow(rowValues);

  // уменьшаем остаток
  updateItem(item.barcode, { stock: item.stock - quantity });
  // Добавить в лист операций если не владелец
  if (employee.owner === false || employee.owner == null) {
    const newOp: OperationItem = {
      type: 'Продажа',
      date: row.date,
      amount: total,
      method: paymentMethod,
      employee: employee.name,
      note: item.name,
    };
    addOperation(newOp);
  }

  formatSalesSheet();
  return getAllSales();
};
