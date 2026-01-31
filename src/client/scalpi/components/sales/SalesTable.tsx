import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Pagination,
  Card,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { SaleRecord } from '../../../../server/data';

interface SalesTableProps {
  sales: SaleRecord[];
  isLoading: boolean;
  error: string | null;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  isLoading,
  error,
}) => {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 5;

  // Reset page when sales data changes
  React.useEffect(() => {
    setPage(1);
  }, [sales]);

  const pages = Math.ceil(sales.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sales.slice(start, end);
  }, [page, sales]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Mobile card view for sales data
  const renderMobileCards = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-8">
          <Spinner color="primary" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="py-8 text-center">
          <Icon
            icon="lucide:inbox"
            className="w-8 h-8 mx-auto mb-2 text-default-400"
          />
          <p>Нет данных о продажах</p>
          <p className="text-sm text-default-400">
            Попробуйте изменить параметры фильтрации
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        {items.map((sale, index) => (
          <Card key={`${sale.barcode}-${index}-${sale.date}`} className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{sale.name}</h3>
              <span
                className={`px-2 py-1 rounded-xs text-xs ${
                  sale.paymentMethod === 'Нал'
                    ? 'bg-success-100 text-success-700'
                    : 'bg-primary-100 text-primary-700'
                }`}
              >
                {sale.paymentMethod}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-default-500">Артикул:</p>
                <p>{sale.barcode}</p>
              </div>
              <div>
                <p className="text-default-500">Дата:</p>
                <p>{sale.date}</p>
              </div>
              <div>
                <p className="text-default-500">Количество:</p>
                <p>{sale.quantity}</p>
              </div>
              <div>
                <p className="text-default-500">Цена:</p>
                <p>{formatCurrency(sale.price)}</p>
              </div>
            </div>

            <Divider className="my-3" />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-default-500 text-sm">Сотрудник:</p>
                <p>{sale.employee}</p>
              </div>
              <div className="text-right">
                <p className="text-default-500 text-sm">Сумма:</p>
                <p className="font-medium">{formatCurrency(sale.total)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-8 text-center text-danger">
        <Icon icon="lucide:alert-circle" className="w-8 h-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile card view - shown only on small screens */}
      <div className="md:hidden">
        {renderMobileCards()}
        {pages > 1 && (
          <div className="flex justify-center w-full py-4">
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
          </div>
        )}
      </div>
      {/* Desktop table view - hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <Table
          aria-label="Таблица продаж"
          removeWrapper
          bottomContent={
            pages > 1 ? (
              <div className="flex justify-center w-full py-2">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={page}
                  total={pages}
                  onChange={setPage}
                />
              </div>
            ) : null
          }
          classNames={{
            wrapper: 'min-w-full',
          }}
        >
          <TableHeader>
            <TableColumn className="whitespace-nowrap">Артикул</TableColumn>
            <TableColumn className="whitespace-nowrap">Название</TableColumn>
            <TableColumn className="whitespace-nowrap">Кол-во</TableColumn>
            <TableColumn className="whitespace-nowrap">Цена</TableColumn>
            <TableColumn className="whitespace-nowrap">Сумма</TableColumn>
            <TableColumn className="whitespace-nowrap">
              Метод оплаты
            </TableColumn>
            <TableColumn className="whitespace-nowrap">Сотрудник</TableColumn>
            <TableColumn className="whitespace-nowrap">Дата</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={<Spinner color="primary" />}
            emptyContent={
              !isLoading && (
                <div className="py-8 text-center">
                  <Icon
                    icon="lucide:inbox"
                    className="w-8 h-8 mx-auto mb-2 text-default-400"
                  />
                  <p>Нет данных о продажах</p>
                  <p className="text-sm text-default-400">
                    Попробуйте изменить параметры фильтрации
                  </p>
                </div>
              )
            }
          >
            {items.map((sale, index) => (
              <TableRow key={`${sale.barcode}-${index}-${sale.date}`}>
                <TableCell className="whitespace-nowrap">
                  {sale.barcode}
                </TableCell>
                <TableCell>{sale.name}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {sale.quantity}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatCurrency(sale.price)}
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium">
                  {formatCurrency(sale.total)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-xs text-xs ${
                      sale.paymentMethod === 'Нал'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}
                  >
                    {sale.paymentMethod}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {sale.employee}
                </TableCell>
                <TableCell className="whitespace-nowrap">{sale.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Show summary when there are sales */}
      {sales.length > 0 && (
        <div className="p-4 border-t border-default-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm text-default-600">
              Всего записей: {sales.length}
            </span>
            <span className="text-sm font-medium">
              Общая сумма:{' '}
              {formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default SalesTable;
