// Глобальная переменная для хранения Spreadsheet

// eslint-disable-next-line import/no-mutable-exports
export let ss: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;

/**
 * Инициализирует глобальную переменную ss.
 * Если файл с заданным именем найден и является Google Таблицей, открывает его.
 * Иначе создаёт новый Spreadsheet с указанным именем.
 */
export const initSS = (spreadsheetName: string) => {
  if (!ss) {
    const files = DriveApp.getFilesByName(spreadsheetName);
    if (files.hasNext()) {
      const file = files.next();
      // Если найден файл и он является Google Таблицей, открываем его
      if (file.getMimeType() === 'application/vnd.google-apps.spreadsheet') {
        ss = SpreadsheetApp.openById(file.getId());
      } else {
        // Если файл найден, но не является таблицей, создаём новую таблицу
        ss = SpreadsheetApp.create(spreadsheetName);
      }
    } else {
      // Если файл не найден, создаём новую таблицу
      ss = SpreadsheetApp.create(spreadsheetName);
    }
  }
};

export default initSS;
