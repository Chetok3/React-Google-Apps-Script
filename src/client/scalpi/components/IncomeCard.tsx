import { Card, CardHeader, CardBody } from '@heroui/card';
import { Select, SelectItem } from '@heroui/select';
import React, { useState } from 'react';
import { Spinner } from '@heroui/react';
import { IncomeRow } from '../../../server/data';

function format(num: number) {
  return num.toLocaleString('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
interface FinanceTableCardProps {
  incomes: IncomeRow[];
  isLoading: boolean;
}
const FinanceTableCard = ({ incomes, isLoading }: FinanceTableCardProps) => {
  const [month, setMonth] = useState<string>('');
  const row = incomes.find((d) => d.month === month) ?? {
    month: '',
    income: 0,
    profit: 0,
    cashin: 0,
    incomeN: 0,
    profitN: 0,
    cashinN: 0,
    incomeB: 0,
    profitB: 0,
    cashinB: 0,
  };
  React.useEffect(() => {
    if (incomes.length > 0) setMonth(incomes[0].month);
  }, [incomes]);
  return (
    <Card className="w-full max-w-none sm:max-w-fit shadow-lg rounded-2xl">
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Фінанси</h2>
        <Select
          size="sm"
          selectedKeys={[month]}
          onSelectionChange={(keys) => setMonth(Array.from(keys)[0] as string)}
          className="w-[120px]"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          {incomes.map((d) => (
            <SelectItem key={d.month} textValue={d.month}>
              {d.month}
            </SelectItem>
          ))}
        </Select>
      </CardHeader>

      <CardBody className="pt-0">
        {isLoading ? (
          <Spinner />
        ) : (
          <table className="w-full max-w-[200px] text-sm border-collapse">
            <thead className="">
              <tr className="text-gray-500">
                <th className="text-left font-medium p-1 text-sm">Категорія</th>
                <th className="text-center font-medium p-1 text-gray-500 text-sm">
                  Доход
                </th>
                <th className="text-center font-medium p-1 text-gray-500 text-sm">
                  Прибыль
                </th>
                <th className="text-center font-medium p-1 text-gray-500 text-sm">
                  Инкассация
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 font-medium text-gray-500 text-sm">Общее</td>
                <td className="p-1 text-center">{format(row.income)}</td>
                <td
                  className={`p-1 text-center ${
                    row.profit < 0 ? 'text-red-500' : ''
                  }`}
                >
                  {format(row.profit)}
                </td>
                <td className="p-1 text-center">{format(row.cashin)}</td>
              </tr>
              <tr>
                <td className="p-1 font-medium text-gray-500 text-sm">Нал</td>
                <td className="p-1 text-center">{format(row.incomeN)}</td>
                <td
                  className={`p-1 text-center ${
                    row.profitN < 0 ? 'text-red-500' : ''
                  }`}
                >
                  {format(row.profitN)}
                </td>
                <td className="p-1 text-center">{format(row.cashinN)}</td>
              </tr>
              <tr>
                <td className="p-1 font-medium text-gray-500 text-sm">
                  Безнал
                </td>
                <td className="p-1 text-center">{format(row.incomeB)}</td>
                <td
                  className={`p-1 text-center ${
                    row.profitB < 0 ? 'text-red-500' : ''
                  }`}
                >
                  {format(row.profitB)}
                </td>
                <td className="p-1 text-center">{format(row.cashinB)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
};
export default FinanceTableCard;
