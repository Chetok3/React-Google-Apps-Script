import { getEmployeeById } from './Employees';
import { addOperation, deleteOperationByNoteId } from './Operations';

function doPost(e: GoogleAppsScript.Events.DoPost) {
  try {
    const body = JSON.parse(e.postData.contents);
    Logger.log(JSON.stringify(body, null, 2));

    if (body.resource === 'finances_operation') {
      if (body.status === 'create') {
        const employee = getEmployeeById(body.data.record?.staff_id);
        if (!employee?.owner) {
          addOperation({
            type: 'Доход',
            date: new Date(
              body.data.record?.date || body.data.date
            ).toISOString(),
            amount: body.data.amount,
            method: body.data.account?.is_cash ? 'Нал' : 'Безнал',
            employee: employee?.name ?? '',
            note: String(body.data.id), // кладём id в примечание
          });
        }
      } else if (body.status === 'delete') {
        deleteOperationByNoteId(body.data.id);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log(`❌ Ошибка в doPost: ${err}`);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
export default doPost;
