/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssortmentItem } from './data';
import { ss } from './init';

const ASSORTMENT = 'Ассортимент';

const headersMap: Record<keyof AssortmentItem, string> = {
  barcode: 'Артикул',
  name: 'Название',
  unit: 'Ед. изм.',
  price: 'Цена',
  cost: 'Вход',
  stock: 'Кол-во',
  photo: 'Фото',
};

export const getAssortmentSheet = (): GoogleAppsScript.Spreadsheet.Sheet => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');
  let sheet = ss.getSheetByName(ASSORTMENT);
  if (!sheet) {
    sheet = ss.insertSheet(ASSORTMENT);
    sheet.appendRow(Object.values(headersMap));
  }
  return sheet;
};

const getHeaders = (): string[] => {
  const sheet = getAssortmentSheet();
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0] as string[];
};

const getSheetData = (): any[][] => {
  const sheet = getAssortmentSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
};

export const formatAssortmentSheet = () => {
  const sheet = getAssortmentSheet();
  const headers = getHeaders();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  // 1. Жирный шрифт, размер 13 для всего диапазона
  const range = sheet.getRange(1, 1, lastRow, lastCol);
  range.setFontWeight('bold').setFontSize(13);

  // 2. Выравнивание по центру вертикально и горизонтально
  range
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  // 3. Установка ширины столбцов
  headers.forEach((header, index) => {
    const col = index + 1;
    switch (header) {
      case headersMap.barcode: // Артикул
      case headersMap.price: // Цена
      case headersMap.cost: // Входная цена
      case headersMap.unit: // Ед. изм.
      case headersMap.stock: // Кол-во
        sheet.setColumnWidth(col, 100);
        break;
      case headersMap.name:
        sheet.setColumnWidth(col, 220);
        break;
      case headersMap.photo:
        sheet.setColumnWidth(col, 270);
        break;
      default:
        sheet.setColumnWidth(col, 100);
    }
  });

  // 4. Установка высоты строк
  for (let i = 2; i <= lastRow; i++) {
    sheet.setRowHeight(i, 270);
  }

  // 5. Добавление границ (тонкие, вокруг всех ячеек)
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

  Logger.log('✅ Лист отформатирован');
};

/**
 * Преобразует строку таблицы в объект AssortmentItem
 * Если колонка фото содержит CellImage, берём getContentUrl()
 */
const rowToItem = (row: any[], headers: string[]): AssortmentItem => {
  const item: Partial<AssortmentItem> = {};
  (Object.keys(headersMap) as (keyof AssortmentItem)[]).forEach((key) => {
    const colIndex = headers.indexOf(headersMap[key]);
    let value = row[colIndex];
    if (
      key === 'photo' &&
      value?.valueType === SpreadsheetApp.ValueType.IMAGE
    ) {
      value = value.getContentUrl(); // временный URL для фронта
    }
    item[key] = value ?? '';
  });
  return item as AssortmentItem;
};

const findRowByBarcode = (barcode: string): number => {
  const headers = getHeaders();
  const data = getSheetData();
  const barcodeIndex = headers.indexOf(headersMap.barcode);

  for (let i = 0; i < data.length; i++) {
    if (data[i][barcodeIndex] === barcode) {
      return i + 2;
    }
  }
  return -1;
};

export const getAllItems = (): AssortmentItem[] => {
  const headers = getHeaders();
  return getSheetData().map((row) => rowToItem(row, headers));
};

export const getByBarcode = (barcode: string): AssortmentItem | null => {
  const headers = getHeaders();
  const data = getSheetData();
  const barcodeIndex = headers.indexOf(headersMap.barcode);

  const row = data.find(
    (r) => String(r[barcodeIndex]).trim() === String(barcode).trim()
  );
  return row ? rowToItem(row, headers) : null;
};

export const addItem = (item: Partial<AssortmentItem>): AssortmentItem[] => {
  const sheet = getAssortmentSheet();
  const headers = getHeaders();

  // 1. Формируем строку без картинки
  const rowValues = (Object.keys(headersMap) as (keyof AssortmentItem)[]).map(
    (key) => (key === 'photo' ? '' : item[key] ?? '')
  );

  sheet.appendRow(rowValues);

  // 2. Вставляем картинку, только если столбец найден
  if (item.photo) {
    const lastRow = sheet.getLastRow();
    const photoColIndex = headers.indexOf(headersMap.photo);
    if (photoColIndex !== -1) {
      const img = SpreadsheetApp.newCellImage()
        .setSourceUrl(item.photo)
        .build();
      sheet.getRange(lastRow, photoColIndex + 1).setValue(img);
    }
  }

  formatAssortmentSheet();
  return getAllItems();
};

export const updateItem = (
  barcode: string,
  newData: Partial<AssortmentItem>
): AssortmentItem[] => {
  const sheet = getAssortmentSheet();
  const headers = getHeaders();
  const rowIndex = findRowByBarcode(barcode);

  if (rowIndex !== -1) {
    (Object.keys(newData) as (keyof AssortmentItem)[]).forEach((key) => {
      const colIndex = headers.indexOf(headersMap[key]);
      if (colIndex === -1) return; // безопасно пропускаем если колонка не найдена

      const value = newData[key] ?? '';

      if (key === 'photo' && value) {
        const img = SpreadsheetApp.newCellImage()
          .setSourceUrl(value as string)
          .build();
        sheet.getRange(rowIndex, colIndex + 1).setValue(img);
      } else {
        sheet.getRange(rowIndex, colIndex + 1).setValue(value);
      }
    });
  }

  formatAssortmentSheet();
  return getAllItems();
};

export const deleteItem = (barcode: string): AssortmentItem[] => {
  const sheet = getAssortmentSheet();
  const rowIndex = findRowByBarcode(barcode);

  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
  }
  formatAssortmentSheet();
  return getAllItems();
};
