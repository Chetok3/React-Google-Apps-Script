import React from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Switch,
  Input,
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
  NumberInput,
  Spinner,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Debt, Employee, Salary } from '../../../server/data';

interface EmployeeCardProps {
  employee: Employee;
  salary?: Salary;
  salaries: Salary[]; // Add all salaries to filter by employee
  debt?: Debt;
  debts: Debt[];
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void;
  onPaySalary: (
    date: string,
    employeeName: string,
    amount: number,
    note: string
  ) => void;
  isLoading: boolean;
  currentMonth: string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  salary,
  salaries,
  debt,
  debts,
  onUpdateEmployee,
  onPaySalary,
  isLoading,
  currentMonth,
}) => {
  const [isOwner, setIsOwner] = React.useState(employee.owner);
  const [percent, setPercent] = React.useState(employee.percent);
  const [isEditing, setIsEditing] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedMonth, setSelectedMonth] =
    React.useState<string>(currentMonth);
  const [employeeSalary, setEmployeeSalary] = React.useState<
    Salary | undefined
  >(salary);
  const [employeeDebt, setEmployeeDebt] = React.useState<Debt | undefined>(
    debt
  );
  const [paymentNote, setPaymentNote] = React.useState('');

  // Get available months for this specific employee
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    if (employee.owner === true) {
      debts.forEach((s) => {
        if (s.employee === employee.name) {
          months.add(s.month);
        }
      });
    } else {
      salaries.forEach((s) => {
        if (s.employee === employee.name) {
          months.add(s.month);
        }
      });
    }

    return Array.from(months).sort().reverse(); // Sort in descending order (newest first)
  }, [salaries, employee, debts]);

  // Update the displayed salary when month changes
  React.useEffect(() => {
    if (employee.owner !== true) {
      const newSalary = salaries.find(
        (s) => s.employee === employee.name && s.month === selectedMonth
      );
      setEmployeeSalary(newSalary);
    } else {
      const newDebt = debts.find(
        (s) => s.employee === employee.name && s.month === selectedMonth
      );
      setEmployeeDebt(newDebt);
    }
  }, [selectedMonth, salaries, debts, employee]);

  // Update selected month when currentMonth prop changes (from parent)
  React.useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  React.useEffect(() => {
    setIsOwner(employee.owner);
    setPercent(employee.percent);
  }, [employee]);

  React.useEffect(() => {
    const ownerChanged = isOwner !== employee.owner;
    const percentChanged = percent !== employee.percent;
    setHasChanges(ownerChanged || percentChanged);
  }, [isOwner, percent, employee]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleSave = () => {
    const updates: Partial<Employee> = {};

    if (isOwner !== employee.owner) {
      updates.owner = isOwner;
    }

    const newPercent = percent;
    if (!Number.isNaN(newPercent) && newPercent !== employee.percent) {
      updates.percent = newPercent;
    }

    if (Object.keys(updates).length > 0) {
      onUpdateEmployee(employee.id, updates);
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsOwner(employee.owner);
    setPercent(employee.percent);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handlePaymentSubmit = () => {
    if (!Number.isNaN(paymentAmount) && paymentAmount > 0 && employeeSalary) {
      onPaySalary(selectedMonth, employee.name, paymentAmount, paymentNote);
      onClose();
      setPaymentNote('');
      setPaymentAmount(0);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  };

  return (
    <Card className="overflow-visible">
      <CardHeader className="flex gap-3 items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-500">
          <Icon icon="lucide:user" width={24} height={24} />
        </div>
        <div className="flex flex-col flex-grow">
          <p className="text-md font-semibold text-foreground">
            {employee.name}
          </p>
          <p className="text-small text-foreground-500">
            {employee.specialization}
          </p>
        </div>
        {isLoading ? (
          <Spinner size="sm" color="warning" />
        ) : (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setIsEditing(!isEditing)}
            isDisabled={isLoading}
          >
            <Icon icon={isEditing ? 'lucide:x' : 'lucide:pencil'} width={18} />
          </Button>
        )}
      </CardHeader>
      <Divider />
      <CardBody className="h-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:phone" className="text-foreground-400" />
            <span className="text-sm">{employee.phone || 'Не указан'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:mail" className="text-foreground-400" />
            <span className="text-sm">{employee.email || 'Не указан'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:id-card" className="text-foreground-400" />
            <span className="text-sm">ID: {employee.id}</span>
          </div>
        </div>
      </CardBody>
      <Divider />

      <CardBody className="py-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Период:</span>
            <div className="w-36">
              <Select
                size="sm"
                selectedKeys={[selectedMonth]}
                onChange={handleMonthChange}
                aria-label="Выберите месяц"
                isDisabled={isLoading}
                isLoading={isLoading}
              >
                {availableMonths.map((month) => (
                  <SelectItem key={month} textValue={month}>
                    {getMonthName(month)}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          {!isOwner ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Общая ЗП:</span>
                <span className="text-sm">
                  {employeeSalary
                    ? formatCurrency(employeeSalary.total)
                    : '0.00'}{' '}
                  ₴
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Выплачено:</span>
                <span className="text-sm">
                  {employeeSalary
                    ? formatCurrency(employeeSalary.paid)
                    : '0.00'}{' '}
                  ₴
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600">
                  К выплате:
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {employeeSalary
                    ? formatCurrency(employeeSalary.toPay)
                    : '0.00'}{' '}
                  ₴
                </span>
              </div>
              <div className="pt-2">
                <Button
                  color="primary"
                  variant="flat"
                  fullWidth
                  startContent={<Icon icon="lucide:credit-card" />}
                  onPress={onOpen}
                  isDisabled={
                    !employeeSalary || employeeSalary.toPay <= 0 || isLoading
                  }
                >
                  Зарплата
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Долг:</span>
              <span className="text-sm">
                {employeeDebt ? formatCurrency(employeeDebt.debt) : '0.00'} ₴
              </span>
            </div>
          )}
        </div>
      </CardBody>
      <Divider />
      <CardFooter>
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:crown"
                className={isOwner ? 'text-warning' : 'text-foreground-400'}
              />
              <span className="text-sm font-medium">Владелец</span>
            </div>
            <Switch
              isSelected={isOwner}
              onValueChange={setIsOwner}
              size="sm"
              color="warning"
              isDisabled={!isEditing || isLoading}
              className="transition-opacity duration-200"
              classNames={{
                base: isEditing ? 'opacity-100' : 'opacity-70',
              }}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:percent" className="text-foreground-400" />
              <span className="text-sm font-medium">Процент</span>
            </div>
            <div className="w-24">
              <NumberInput
                type="number"
                value={Number(percent)}
                onValueChange={(v) => setPercent(v)}
                size="sm"
                minValue={0}
                maxValue={100}
                step={1}
                isDisabled={!isEditing || isLoading}
                endContent={<div className="pointer-events-none">%</div>}
                classNames={{
                  base: isEditing ? 'opacity-100' : 'opacity-70',
                }}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={handleCancel}
                isDisabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                color="primary"
                onPress={handleSave}
                isDisabled={!hasChanges || isLoading}
                isLoading={isLoading}
              >
                Сохранить
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
      <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Выплата зарплаты за {getMonthName(selectedMonth)}
          </ModalHeader>
          <ModalBody>
            <p className="text-sm mb-2">
              Сотрудник: <span className="font-medium">{employee.name}</span>
            </p>
            <p className="text-sm mb-4">
              К выплате:{' '}
              <span className="font-medium">
                {employeeSalary ? formatCurrency(employeeSalary.toPay) : '0.00'}{' '}
                ₴
              </span>
            </p>

            <NumberInput
              label="Сумма выплаты"
              placeholder="Введите сумму"
              value={paymentAmount}
              onValueChange={setPaymentAmount}
              endContent={<div className="pointer-events-none">₴</div>}
              minValue={0}
              maxValue={employeeSalary?.toPay || 0}
            />
            <Input
              label="Примечание"
              placeholder="Введите примечание к выплате"
              value={paymentNote}
              onValueChange={setPaymentNote}
              startContent={
                <Icon icon="lucide:file-text" className="text-default-400" />
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Отмена
            </Button>
            <Button
              color="primary"
              onPress={handlePaymentSubmit}
              isDisabled={
                paymentAmount <= 0 ||
                paymentAmount > (employeeSalary?.toPay || 0)
              }
              isLoading={isLoading}
            >
              Выплатить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};
export default EmployeeCard;
