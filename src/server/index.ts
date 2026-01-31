import doGet from './initClientApp';
import doPost from './AltegIoWebhooks';
import { initSS } from './init';
import { addItem, updateItem, deleteItem, getAllItems } from './Assortment';
import { testAddItem } from './tests/TestAssortment';
import { testAddSale, testGetAllSale } from './tests/TestSales';
import syncEmployees, { getEmployees, updateEmployee } from './Employees';
import { addOperation, testAddOperation } from './Operations';
import { getCashier } from './Cashier';
import { getAllSalaries } from './Salary';
import { getAllDebts } from './Debt';
import { addSale, getAllSales } from './Sales';
import { getAllIncomes } from './Income';
import { setTaxCashless } from './Cashier';

initSS('SCALPI');
const version = '0.0.1';
const getVersion = () => version;
getAllItems();

// Public functions must be exported as named exports
export {
  doGet,
  doPost,
  getVersion,
  addItem,
  updateItem,
  deleteItem,
  getAllItems,
  testAddItem,
  syncEmployees,
  testAddOperation,
  testAddSale,
  getCashier,
  getEmployees,
  updateEmployee,
  getAllSalaries,
  addOperation,
  getAllDebts,
  getAllSales,
  addSale,
  testGetAllSale,
  getAllIncomes,
  setTaxCashless
};
