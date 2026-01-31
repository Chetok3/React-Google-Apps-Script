import { addToast, Spinner, Tab } from '@heroui/react';
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import CashierCard from './CashierCard';
import { serverFunctions } from '../../utils/serverFunctions';
import {
  AssortmentItem,
  Cashier,
  Employee,
  Salary,
  Debt,
  IncomeRow,
} from '../../../server/data';
import AssortmentCard from './AssortmentCard';
import EmployeeList from './EmployeesList';
import TabsNew from './tabs/src/tabs';
import SalesWidget from './sales/SalesCard';
import FinanceCard from './IncomeCard';
// import { Employee } from '../../../server/data';

const App = () => {
  const [cashier, setCashier] = useState<Cashier | null>(null);
  const [items, setItems] = useState<AssortmentItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [salaries, setSalaries] = React.useState<Salary[]>([]);
  const [debts, setDebts] = React.useState<Debt[]>([]);
  const [incomes, setIncomes] = React.useState<IncomeRow[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = React.useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = React.useState<string[]>(
    []
  );
  const [selected, setSelected] = React.useState('general');
  const onCashierUpdate = async () => {
    return Promise.all([
      serverFunctions.getCashier().then((v) => setCashier(v)),
      serverFunctions.getAllIncomes().then((i) => setIncomes(i)),
    ]);
  };
  const setTaxCashless =  async (value: number) => {
    return serverFunctions.setTaxCashless(value).then((v) => setCashier(v));
  };
  const loadItems = () => {
    setLoadingItems(true);
    serverFunctions
      .getAllItems()
      .then((res) => {
        setItems(res);
      })
      .finally(() => setLoadingItems(false));
  };
  const loadIncomes = () => {
    setIsLoadingIncomes(true);
    serverFunctions
      .getAllIncomes()
      .then((i) => setIncomes(i))
      .finally(() => setIsLoadingIncomes(false));
  };

  const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
    const empName = employees.find((e) => e.id === id)?.name ?? '';
    setIsLoadingEmployees((prev) => {
      return [...prev, empName];
    });
    addToast({
      title: 'Сотрудник обновлен',
      description: `Данные сотрудника ID: ${id} обновляются`,
      classNames: {
        icon: 'text-success',
      },
      loadingComponent: <Spinner size="sm" color="warning" />,
      promise: serverFunctions
        .updateEmployee(id, updates)
        .then((empolyees) => {
          setEmployees(empolyees);
        })
        .then(() => {
          return Promise.all([
            serverFunctions.getAllSalaries().then((s) => setSalaries(s)),
            serverFunctions.getAllDebts().then((s) => setDebts(s)),
          ]);
        })
        .catch((e) => {
          addToast({
            title: 'Ошибка: Обновление не выполнено',
            description: `${e}`,
            color: 'danger',
          });
        })
        .finally(() =>
          setIsLoadingEmployees((prev) => {
            const next = prev.filter((s) => s !== empName);
            return next;
          })
        ),
      icon: (
        <Icon icon="mdi:success" className="text-success" color="success" />
      ),
    });
  };
  const handleAddSale = (
    barcode: string,
    quantity: number,
    employeeId: string,
    paymentMethod: 'Нал' | 'Безнал'
  ) => {
    const promise = serverFunctions
      .addSale(barcode, quantity, employeeId, paymentMethod)
      .then((r) => {
        return Promise.all([
          serverFunctions.getAllSalaries().then((s) => setSalaries(s)),
          serverFunctions.getAllDebts().then((s) => setDebts(s)),
          serverFunctions.getCashier().then((s) => setCashier(s)),
          serverFunctions.getAllIncomes().then((i) => setIncomes(i)),
        ]).then(() => r);
      });

    addToast({
      title: 'Продажа товара',
      description: `Продажа ${barcode} сотрудником ${employeeId}`,
      classNames: { icon: 'text-success' },
      loadingComponent: <Spinner size="sm" color="warning" />,
      promise,
      icon: (
        <Icon icon="mdi:success" className="text-success" color="success" />
      ),
    });

    return promise;
  };

  const handlePaySalary = (
    date: string,
    employeeName: string,
    amount: number,
    note: string
  ) => {
    // Создаем дату в UTC
    const newDate = `${date}-01`;
    const [year, month, day] = newDate.split('-');
    const formatted = `${day}.${month}.${year}`;
    setIsLoadingEmployees((prev) => [...prev, employeeName]);
    addToast({
      title: 'Зарплата выплачена',
      description: `Выплачено ${amount.toLocaleString(
        'ru-RU'
      )} грн. сотруднику ${employeeName}`,
      classNames: {
        icon: 'text-success',
      },
      loadingComponent: <Spinner size="sm" color="warning" />,
      promise: serverFunctions
        .addOperation({
          type: 'Зарплата',
          date: formatted,
          amount,
          method: 'Нал',
          employee: employeeName,
          note,
        })
        .then(() => {
          return Promise.all([
            serverFunctions.getAllSalaries().then((s) => setSalaries(s)),
            serverFunctions.getCashier().then((s) => setCashier(s)),
            serverFunctions.getAllIncomes().then((i) => setIncomes(i)),
          ]);
        })
        .catch((e) => {
          addToast({
            title: 'Ошибка: Зарплата не выплачена',
            description: `${e}`,
            color: 'danger',
          });
        })
        .finally(() =>
          setIsLoadingEmployees((prev) => {
            const next = prev.filter((s) => s !== employeeName);
            return next;
          })
        ),
      icon: (
        <Icon icon="mdi:success" className="text-success" color="success" />
      ),
    });
  };

  useEffect(() => {
    serverFunctions.getEmployees().then((e) => setEmployees(e));
    serverFunctions.getAllSalaries().then((s) => setSalaries(s));
    serverFunctions.getAllDebts().then((s) => setDebts(s));
    serverFunctions.getCashier().then((v) => setCashier(v));
    loadIncomes();
    loadItems();
  }, []);
  const getCurrentYearMonth = (): string => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  };
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <main className="container mx-auto px-4 ">
        <TabsNew
          size="lg"
          aria-label="Options"
          selectedKey={selected}
          onSelectionChange={(key) => setSelected(String(key))}
          fullWidth
          destroyInactiveTabPanel={false}
          disableAnimation={false}
          className="mt-4"
        >
          <Tab key="general" title="Главная">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
              <div className="cols-span-1">
                <CashierCard
                  cashier={cashier}
                  onUpdate={onCashierUpdate}
                  employees={employees}
                  setTaxCashless={setTaxCashless}
                />
              </div>
              <div className="cols-span-1">
                <FinanceCard incomes={incomes} isLoading={isLoadingIncomes} />
              </div>
              <div className="col-span-1 sm:col-span-2 xl:col-span-4">
                <SalesWidget
                  items={items}
                  employees={employees}
                  handleAddSale={handleAddSale}
                />
              </div>
            </div>
          </Tab>
          <Tab key="employees" title="Сотрудники">
            <EmployeeList
              employees={employees}
              salaries={salaries}
              debts={debts}
              onUpdateEmployee={handleUpdateEmployee}
              onPaySalary={handlePaySalary}
              isLoading={isLoadingEmployees}
              currentMonth={getCurrentYearMonth()}
            />
          </Tab>
          <Tab key="assortment" title="Ассортимент">
            <AssortmentCard
              items={items}
              setItems={setItems}
              loadingItems={loadingItems}
              onRefresh={loadItems}
            />
          </Tab>
        </TabsNew>
      </main>
    </div>
  );
};
export default App;
