import { addSale, getAllSales } from '../Sales';

export function testAddSale() {
  try {
    const sales = addSale(
      '700111', // barcode
      1, // quantity
      2884810, // employeeId
      'Безнал' // paymentMethod
    );
    Logger.log('✅ Продажа добавлена');
    Logger.log(JSON.stringify(sales[sales.length - 1], null, 2));
  } catch (e) {
    Logger.log(`❌ Ошибка: ${e}`);
  }
}
export function testGetAllSale() {
  try {
    const sales = getAllSales();
    Logger.log('✅ Продажа добавлена');
    Logger.log(JSON.stringify(sales, null, 2));
  } catch (e) {
    Logger.log(`❌ Ошибка: ${e}`);
  }
}
export default testAddSale;
