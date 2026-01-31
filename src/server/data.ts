// Тип для сотрудника
export interface Employee {
  id: string; // ID из Altegio всегда строкой, но можно number | string
  name: string;
  specialization: string;
  phone: string;
  email: string;
  owner: boolean; // можно null, если не задано
  percent: number;
}
export interface Salary {
  month: string; // Месяц (YYYY-MM)
  employee: string; // Сотрудник
  total: number; // Общая ЗП
  paid: number; // Выплачено
  toPay: number; // К выплате
}
export interface Debt {
  month: string; // Месяц (YYYY-MM)
  employee: string; // Сотрудник
  debt: number; // Общая ЗП
}
export interface AssortmentItem {
  barcode: string; // Штрихкод (пос. 6)
  name: string; // Название
  unit: string; // ед. изм.
  price: number; // Цена Продажи
  cost: number; // Входная цена
  stock: number; // Остаток
  photo: string; // Фото (URL)
}

export interface OperationItem {
  type: string; // Операция (Доход, Продажа, ...)
  date: string; // Дата (с временем)
  amount: number; // Сумма
  method: string; // Метод (Нал/Безнал)
  employee: string; // Сотрудник
  note: string; // Примечание
}
export interface IncomeRow {
  month: string;
  income: number;
  profit: number;
  cashin: number;
  incomeN: number;
  profitN: number;
  cashinN: number;
  incomeB: number;
  profitB: number;
  cashinB: number;
}
export interface SaleRecord {
  barcode: string; // Артикул
  name: string; // Название
  quantity: number; // Кол-во
  price: number; // Цена
  total: number; // Сумма
  paymentMethod: string; // Метод оплаты (Нал / Безнал)
  employee: string; // Сотрудник
  date: string; // Дата
}

export interface Cashier {
  cash: number;
  cashless: number;
  taxCashless: number;
}
