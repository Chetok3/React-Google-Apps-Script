import React from 'react';
import { Debt, Employee, Salary } from '../../../server/data';
import EmployeeCard from './EmployeeCard';

interface EmployeeListProps {
  employees: Employee[];
  salaries: Salary[];
  debts: Debt[];
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onPaySalary: (
    date: string,
    employeeName: string,
    amount: number,
    note: string
  ) => void;
  isLoading: string[];
  currentMonth: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  salaries,
  debts,
  onUpdateEmployee,
  onPaySalary,
  isLoading,
  currentMonth,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {employees.map((employee) => {
        const employeeSalary = salaries.find(
          (s) => s.employee === employee.name && s.month === currentMonth
        );
        const employeeDebt = debts.find(
          (s) => s.employee === employee.name && s.month === currentMonth
        );
        const isEmployeeLoading = isLoading.some((s) => s === employee.name);
        return (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            salary={employeeSalary}
            salaries={salaries}
            debt={employeeDebt}
            debts={debts}
            onUpdateEmployee={onUpdateEmployee}
            onPaySalary={onPaySalary}
            isLoading={isEmployeeLoading}
            currentMonth={currentMonth}
          />
        );
      })}
    </div>
  );
};
export default EmployeeList;
