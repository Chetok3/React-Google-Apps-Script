import installCronTriggers from './Triggers';
import generateOwnerDebtSheet from './Debt';
import { getAssortmentSheet } from './Assortment';
import { getOperationsSheet } from './Operations';
import syncEmployees from './Employees';
import { getSalesSheet } from './Sales';
import generateSalarySheet from './Salary';
import generateIncomeSheet from './Income';
import generateCashierSheet from './Cashier';
import initEnv from './initEnv';

const doGet = () => {
  initEnv();
  syncEmployees();
  getAssortmentSheet();
  getSalesSheet();
  getOperationsSheet();
  generateOwnerDebtSheet();
  generateSalarySheet();
  generateIncomeSheet();
  generateCashierSheet();
  installCronTriggers();
  const output = HtmlService.createHtmlOutputFromFile('scalpi');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return output;
};
export default doGet;
