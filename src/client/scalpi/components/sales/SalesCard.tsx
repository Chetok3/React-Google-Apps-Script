/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Icon } from '@iconify/react';
import {
  Button,
  DateRangePicker,
  Select,
  SelectItem,
  Chip,
} from '@heroui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import type { RangeValue } from '@react-types/shared';
import type { DateValue } from '@react-types/datepicker';
import { I18nProvider } from '@react-aria/i18n';
import { AssortmentItem, Employee, SaleRecord } from '../../../../server/data';
import SellModal from './SalesModal';
import SalesTable from './SalesTable';
import { serverFunctions } from '../../../utils/serverFunctions';

interface SalesWidgetProps {
  items: AssortmentItem[];
  employees: Employee[];
  handleAddSale: (
    barcode: string,
    quantity: number,
    employeeId: string,
    paymentMethod: 'Нал' | 'Безнал'
  ) => Promise<SaleRecord[]>;
}

export const SalesWidget: React.FC<SalesWidgetProps> = ({
  items,
  employees,
  handleAddSale,
}) => {
  const [sales, setSales] = React.useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Add new state for filters
  const [dateRange, setDateRange] =
    React.useState<RangeValue<DateValue> | null>({
      start: today(getLocalTimeZone()),
      end: today(getLocalTimeZone()),
    });

  // Change selectedEmployee from string to string[] for multi-select
  const [selectedEmployees, setSelectedEmployees] = React.useState<string[]>([
    'all',
  ]);

  // Get unique employees from sales data
  const uniqueEmployees = React.useMemo(() => {
    const uEmployees = new Set<string>();
    sales.forEach((sale) => uEmployees.add(sale.employee));
    return Array.from(uEmployees);
  }, [sales]);
  const aviableItems = React.useMemo(() => {
    return items.filter((i) => i.stock && i.stock > 0);
  }, [items]);

  // Add the missing clearFilters function
  const clearFilters = React.useCallback(() => {
    setDateRange({
      start: today(getLocalTimeZone()),
      end: today(getLocalTimeZone()),
    });
    setSelectedEmployees(['all']);
  }, []);

  const fetchSales = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await serverFunctions.getAllSales();
      setSales(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ошибка при загрузке данных'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Update filteredSales to handle multiple employee selection
  const filteredSales = React.useMemo(() => {
    if (!sales.length) return [];

    return sales.filter((sale) => {
      // Parse the sale date (assuming format DD.MM.YYYY)
      const [day, month, year] = sale.date.split('.').map(Number);
      const saleDate = new Date(year, month - 1, day);

      // Parse the filter dates
      const startDate = dateRange?.start
        ? dateRange.start.toDate(getLocalTimeZone())
        : null;
      const endDate = dateRange?.end
        ? dateRange.end.toDate(getLocalTimeZone())
        : null;

      // Check if the sale date is within the selected range
      const isInDateRange =
        !dateRange ||
        !startDate ||
        !endDate ||
        (saleDate >= startDate && saleDate <= endDate);

      // Check if the employee matches any of the selected employees
      const isEmployeeMatch =
        selectedEmployees.includes('all') ||
        selectedEmployees.includes(sale.employee);

      return isInDateRange && isEmployeeMatch;
    });
  }, [sales, dateRange, selectedEmployees]);

  const handleAddSales = async (
    barcode: string,
    quantity: number,
    employeeId: string | number,
    paymentMethod: 'Нал' | 'Безнал'
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedSales = await handleAddSale(
        barcode,
        quantity,
        employeeId.toString(),
        paymentMethod
      );
      setSales(updatedSales);
      setIsModalOpen(false);
      return { success: true, message: 'Продажа успешно добавлена' };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ошибка при добавлении продажи';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle employee selection change
  const handleEmployeeSelectionChange = (keys: any) => {
    const selectedKeys = Array.from(keys) as string[];

    // If "all" is selected, deselect other options
    if (selectedKeys.includes('all') && !selectedEmployees.includes('all')) {
      setSelectedEmployees(['all']);
      return;
    }

    // If a specific employee is selected and "all" was previously selected, remove "all"
    if (
      selectedKeys.some((key) => key !== 'all') &&
      selectedEmployees.includes('all')
    ) {
      setSelectedEmployees(selectedKeys.filter((key) => key !== 'all'));
      return;
    }

    // If no employees are selected, default to "all"
    if (selectedKeys.length === 0) {
      setSelectedEmployees(['all']);
      return;
    }

    setSelectedEmployees(selectedKeys);
  };

  return (
    <div className="bg-content1 rounded-medium shadow-xs border border-default-200">
      <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center border-b border-default-200 gap-4">
        <h2 className="text-xl font-medium">Продажи</h2>
        <Button
          color="primary"
          onPress={() => setIsModalOpen(true)}
          startContent={<Icon icon="lucide:plus" width={18} />}
        >
          Продать
        </Button>
      </div>

      {/* Add filters section */}
      <div className="p-4 border-b border-default-200">
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="w-full md:w-auto md:flex-1">
            <I18nProvider locale="uk-UA">
              <DateRangePicker
                label="Период"
                value={dateRange}
                onChange={setDateRange}
              />
            </I18nProvider>
          </div>

          <div className="w-full md:w-64">
            <Select
              label="Сотрудники"
              placeholder="Выберите сотрудников"
              selectionMode="multiple"
              selectedKeys={selectedEmployees}
              onSelectionChange={handleEmployeeSelectionChange}
              items={[
                { key: 'all', name: 'Все сотрудники' },
                ...uniqueEmployees.map((e) => ({ key: e, name: e })),
              ]}
            >
              {(item) => <SelectItem key={item.key}>{item.name}</SelectItem>}
            </Select>
          </div>
        </div>

        {/* Active filters */}
        {(!selectedEmployees.includes('all') ||
          (dateRange?.start &&
            dateRange?.end &&
            (dateRange.start.toString() !==
              today(getLocalTimeZone()).toString() ||
              dateRange.end.toString() !==
                today(getLocalTimeZone()).toString()))) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-default-600">Активные фильтры:</span>

            {!selectedEmployees.includes('all') && (
              <Chip
                onClose={() => setSelectedEmployees(['all'])}
                variant="flat"
                color="primary"
                size="sm"
              >
                Сотрудники:{' '}
                {selectedEmployees.length > 1
                  ? `${selectedEmployees.length} выбрано`
                  : selectedEmployees[0]}
              </Chip>
            )}

            {dateRange?.start &&
              dateRange?.end &&
              (dateRange.start.toString() !==
                today(getLocalTimeZone()).toString() ||
                dateRange.end.toString() !==
                  today(getLocalTimeZone()).toString()) && (
                <Chip
                  onClose={() =>
                    setDateRange({
                      start: today(getLocalTimeZone()),
                      end: today(getLocalTimeZone()),
                    })
                  }
                  variant="flat"
                  color="primary"
                  size="sm"
                >
                  Период:{' '}
                  {dateRange.start
                    .toDate(getLocalTimeZone())
                    .toLocaleDateString('ru-RU')}{' '}
                  -
                  {dateRange.end
                    .toDate(getLocalTimeZone())
                    .toLocaleDateString('ru-RU')}
                </Chip>
              )}

            <Button
              size="sm"
              variant="light"
              onPress={clearFilters}
              startContent={<Icon icon="lucide:x" width={14} />}
            >
              Сбросить все
            </Button>
          </div>
        )}
      </div>

      <SalesTable sales={filteredSales} isLoading={isLoading} error={error} />

      <SellModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSale={handleAddSales}
        items={aviableItems}
        employees={employees}
      />
    </div>
  );
};
export default SalesWidget;
