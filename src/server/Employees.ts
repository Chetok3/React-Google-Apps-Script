/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Employee } from './data';
import { ss } from './init';

const EMPLOYEES = 'Сотрудники';

// Заголовки для таблицы
const employeeHeaders = [
  'ID',
  'Имя',
  'Должность',
  'Телефон',
  'Email',
  'Владелец',
  'Процент',
];

// Получаем лист сотрудников
export const getEmployeesSheet = (): GoogleAppsScript.Spreadsheet.Sheet => {
  if (!ss) throw new Error('Spreadsheet не инициализирован. Вызовите initSS.');
  let sheet = ss.getSheetByName(EMPLOYEES);
  if (!sheet) {
    sheet = ss.insertSheet(EMPLOYEES);
    sheet.appendRow(employeeHeaders);
  }
  return sheet;
};

// Форматирование листа сотрудников
const formatEmployeesSheet = () => {
  const sheet = getEmployeesSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;

  const range = sheet.getRange(1, 1, lastRow, lastCol);

  // Жирный шрифт, размер 13
  range.setFontWeight('bold').setFontSize(13);

  // Центровка
  range.setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Ширина столбцов
  sheet.setColumnWidth(1, 80); // ID
  sheet.setColumnWidth(2, 180); // Имя
  sheet.setColumnWidth(3, 180); // Должность
  sheet.setColumnWidth(4, 140); // Телефон
  sheet.setColumnWidth(5, 200); // Email
  sheet.setColumnWidth(6, 120); // Статус
  sheet.setColumnWidth(7, 80); // Процент

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
  // ✅ Валидация для "Владелец" (TRUE/FALSE)
  const boolRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Да', 'Нет'])
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 6, lastRow - 1 || 1).setDataValidation(boolRule);
};

// Поиск сотрудника по ID
export const getEmployeeById = (id: number | string): Employee | null => {
  const sheet = getEmployeesSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const rowId = String(values[i][0]);
    if (rowId === String(id)) {
      return {
        id: rowId,
        name: values[i][1],
        specialization: values[i][2],
        phone: values[i][3],
        email: values[i][4],
        owner: String(values[i][5]) === 'Да',
        percent: values[i][6] ?? 0,
      };
    }
  }
  return null;
};

// Получаем всех сотрудников
export const getEmployees = (): Employee[] => {
  const sheet = getEmployeesSheet();
  const values = sheet.getDataRange().getValues();

  const employees: Employee[] = [];

  for (let i = 1; i < values.length; i++) {
    employees.push({
      id: String(values[i][0]),
      name: values[i][1],
      specialization: values[i][2],
      phone: values[i][3],
      email: values[i][4],
      owner: String(values[i][5]) === 'Да',
      percent: values[i][6] ?? 0,
    });
  }

  return employees;
};

// Обновление сотрудника по ID
export const updateEmployee = (
  id: number | string,
  updates: Partial<Employee>
): Employee[] => {
  const sheet = getEmployeesSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    const rowId = String(values[i][0]);
    if (rowId === String(id)) {
      const rowIndex = i + 1;
      const rowValues = values[i];

      if (updates.name !== undefined) rowValues[1] = updates.name;
      if (updates.specialization !== undefined)
        rowValues[2] = updates.specialization;
      if (updates.phone !== undefined) rowValues[3] = updates.phone;
      if (updates.email !== undefined) rowValues[4] = updates.email;
      if (updates.owner !== undefined)
        rowValues[5] = updates.owner === true ? 'Да' : null;
      if (updates.percent !== undefined) rowValues[6] = updates.percent;

      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);

      Logger.log(`✅ Сотрудник ${id} обновлён`);
      return getEmployees();
    }
  }
  Logger.log(`⚠️ Сотрудник ${id} не найден`);
  throw new Error(`⚠️ Сотрудник ${id} не найден`);
};

// Основная функция синхронизации сотрудников
export const syncEmployees = () => {
  const companyId =
    PropertiesService.getScriptProperties().getProperty('ALTEGIO_COMPANY_ID');
  const apiParentKey = PropertiesService.getScriptProperties().getProperty(
    'ALTEGIO_PARENT_TOKEN'
  );
  const apiUserKey =
    PropertiesService.getScriptProperties().getProperty('ALTEGIO_USER_TOKEN');
  if (!companyId || !apiParentKey || !apiUserKey) return;

  const sheet = getEmployeesSheet();

  const url = `https://api.alteg.io/api/v1/staff/${companyId}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${apiParentKey}, User ${apiUserKey}`,
      Accept: 'application/vnd.api.v2+json',
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    throw new Error(`Ошибка API Altegio: ${response.getContentText()}`);
  }

  const employees = JSON.parse(response.getContentText()).data ?? [];

  // Текущие строки в таблице
  const values = sheet.getDataRange().getValues();
  const existing: Record<string, number> = {}; // id -> rowIndex
  for (let i = 1; i < values.length; i++) {
    existing[String(values[i][0])] = i + 1; // храним индекс строки (1-based)
  }

  // Обновляем или добавляем
  employees.forEach((emp: any) => {
    const row = [
      emp.id,
      emp.name,
      emp.specialization,
      emp.phone || '',
      emp.email || '',
      null,
      null, // процент не трогаем
    ];

    const rowIndex = existing[String(emp.id)];
    if (rowIndex) {
      // обновляем только первые 6 колонок (процент остаётся)
      sheet.getRange(rowIndex, 1, 1, 5).setValues([row.slice(0, 5)]);
    } else {
      // добавляем новую строку
      sheet.appendRow(row);
    }
  });

  formatEmployeesSheet();
  Logger.log(`✅ Синхронизировано сотрудников: ${employees.length}`);
};

export default syncEmployees;
