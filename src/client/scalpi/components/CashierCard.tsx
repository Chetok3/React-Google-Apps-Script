import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Spinner,
  Switch,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useMemo, useState, useEffect } from 'react';
import { Cashier, Employee } from '../../../server/data';
import { serverFunctions } from '../../utils/serverFunctions';
import BillKeeper from './BillKeeper';

interface CashierCardProps {
  cashier: Cashier | null;
  onUpdate: () => Promise<[void, void]>;
  employees: Employee[];
  setTaxCashless: (value: number) => Promise<void>;
}
const CashierCard = ({ cashier, onUpdate, employees, setTaxCashless }: CashierCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  type variantI = 'Пополнение' | 'Расход' | 'Инкассация' | null;
  const [variant, setVariant] = useState<variantI>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [amount, setAmount] = useState(0);
  const [billKeeperTotal, setBillKeeper] = useState(0);
  const [isCash, setIsCash] = useState(true);
  const [operationNote, setOperationNote] = useState('');
  const [taxCashless, setTax] = useState(cashier?.taxCashless || 0);
  const [isLoadingTaxCashless, setIsLoadingTaxCashless] = useState(false);
  const handleSetTaxCashless = (value: number) => {
    setIsLoadingTaxCashless(true);
    setTaxCashless(value).finally(() => setIsLoadingTaxCashless(false));
  };
  useEffect(() => {
    setTax(cashier?.taxCashless || 0)
  }, [cashier])
  const getMaxAmount = () => {
    if (!cashier) return undefined;
    if (variant === 'Инкассация') {
      if (billKeeperTotal !== 0) {
        return billKeeperTotal;
      }
      if (isCash) {
        return cashier.cash > 0 ? cashier.cash : 0;
      }
      return cashier.cashless > 0 ? cashier.cashless : 0;
    }
    if (variant !== 'Пополнение') {
      if (isCash) {
        return cashier.cash > 0 ? cashier.cash : 0;
      }
      return cashier.cashless > 0 ? cashier.cashless : 0;
    }
    return undefined;
  };
  const filtredEmployees = useMemo(() => {
    return employees.filter((e) => e.owner === true);
  }, [employees]);
  const handleOpenModal = (v: variantI) => {
    setVariant(v);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    if (!selectedEmployee || !variant) return;
    addToast({
      title: variant,
      description: `Операция ${variant}. Сотрудник ${selectedEmployee.name
        }. Сумма ${amount.toFixed(2)}. ${isCash ? 'Нал' : 'Безнал'}`,
      classNames: {
        icon: 'text-success',
      },
      loadingComponent: <Spinner size="sm" color="warning" />,
      promise: serverFunctions
        .addOperation({
          date: new Date().toLocaleDateString('uk-UA'),
          type: variant, // Операция (Доход, Продажа, ...)
          amount,
          method: isCash ? 'Нал' : 'Безнал', // Метод (Нал/Безнал)
          employee: selectedEmployee.name, // Сотрудник
          note: operationNote, // Примечание
        })
        .then(() => {
          return onUpdate();
        })
        .catch((e) => {
          addToast({
            title: 'Ошибка: Операция не выполнена',
            description: `${e}`,
            color: 'danger',
          });
        })
        .finally(() => {
          setIsCash(true);
          setBillKeeper(0);
          setOperationNote('');
          setVariant(null);
          setSelectedEmployee(null);
          setAmount(0);
          setIsModalOpen(false);
        }),
      icon: (
        <Icon icon="mdi:success" className="text-success" color="success" />
      ),
    });
  };
  return (
    <Card className="w-full max-w-max min-w-min shadow-lg rounded-2xl">
      <CardHeader className="flex justify-between gap-1">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-xl font-bold">Касса 💰</h2>
        </div>
        <Button
          isIconOnly
          onPress={onUpdate}
          size="md"
          variant="light"
          className="rounded-full"
        >
          <Icon icon="mdi:refresh" width={20} height={20} />
        </Button>
      </CardHeader>
      <Divider />
      <CardBody className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-default-200 rounded-xl shadow-sm">
          <p className="text-md text-default-500">Наличные</p>
          {cashier ? (
            <p
              className={`text-xl font-semibold ${cashier.cash >= 0 ? 'text-success' : 'text-danger'
                }`}
            >
              {cashier.cash.toFixed(2)}
            </p>
          ) : (
            <Spinner />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="p-3 bg-default-200 rounded-xl shadow-sm">
            <p className="text-md text-default-500">Безнал</p>
            {cashier ? (
              <p
                className={`text-xl font-semibold ${cashier.cashless >= 0 ? 'text-success' : 'text-danger'
                  }`}
              >
                {cashier.cashless.toFixed(2)}
              </p>
            ) : (
              <Spinner />
            )}
          </div>
          {cashier ? (
            <NumberInput
              label="Налог Б"
              value={taxCashless}
              type="number"
              size="sm"
              isDisabled={isLoadingTaxCashless}
              minValue={0}
              maxValue={100}
              onValueChange={setTax}
              hideStepper={true}
              startContent={<div className="pointer-events-none">%</div>}
              endContent={<Button isIconOnly size="sm" variant="light" color='success' isLoading={isLoadingTaxCashless} onPress={() => handleSetTaxCashless(taxCashless)}>
                <Icon icon="mdi:success" width={20} height={20} />
              </Button>}
            />
          ) : (
            <Spinner />
          )}

        </div>
      </CardBody>

      <Divider />

      <CardFooter className="flex flex-col gap-3 w-full">
        <div className="grid grid-cols-3 gap-3">
          <Button
            color="success"
            variant="flat"
            // startContent={<Plus size={18} />}
            onPress={() => {
              handleOpenModal('Пополнение');
            }}
          >
            Пополнение
          </Button>
          <Button
            color="warning"
            variant="flat"
            onPress={() => {
              handleOpenModal('Инкассация');
            }}
          // startContent={<ArrowDownCircle size={18} />}
          >
            Инкассация
          </Button>
          <Button
            color="danger"
            variant="flat"
            onPress={() => {
              handleOpenModal('Расход');
            }}
          // startContent={<MinusCircle size={18} />}
          >
            Расход
          </Button>
        </div>
      </CardFooter>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsCash(true);
          setBillKeeper(0);
          setOperationNote('');
          setSelectedEmployee(null);
          setVariant(null);
          setAmount(0);
          setIsModalOpen(false);
        }}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            {variant}{' '}
            {isCash
              ? `касса Нал: ${cashier?.cash.toFixed(2)} ₴`
              : `касса Безнал: ${cashier?.cashless.toFixed(2)} ₴`}
          </ModalHeader>
          <ModalBody className="flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center">
              <h3>Нал: </h3>
              <Switch
                isSelected={isCash}
                onValueChange={setIsCash}
                size="md"
                color="warning"
              />
            </div>
            <div className="flex flex-row gap-3 items-center">
              <h3>Сотрудник: </h3>
              <div className="flex flex-row gap-3">
                {filtredEmployees.map((e) => {
                  return (
                    <Button
                      key={e.name}
                      size="md"
                      className="max-w-[100px] rounded-full"
                      color={
                        e.name === selectedEmployee?.name
                          ? 'success'
                          : 'default'
                      }
                      variant={
                        e.name === selectedEmployee?.name ? 'shadow' : 'solid'
                      }
                      onPress={() => {
                        if (selectedEmployee?.name === e.name) {
                          setSelectedEmployee(null);
                        } else {
                          setSelectedEmployee(e);
                        }
                      }}
                    >
                      {e.name}
                    </Button>
                  );
                })}{' '}
              </div>
            </div>
            {variant === 'Инкассация' && isCash && (
              <>
                <BillKeeper onUpdate={setBillKeeper} />
                {billKeeperTotal !== 0 && (
                  <div>Фактическая касса: {billKeeperTotal} ₴</div>
                )}
              </>
            )}
            <NumberInput
              label="Сумма"
              value={amount}
              type="number"
              minValue={0}
              maxValue={getMaxAmount()}
              onValueChange={setAmount}
              endContent={<div className="pointer-events-none">₴</div>}
            />
            <Input
              label="Примечание"
              placeholder="Введите примечание к выплате"
              value={operationNote}
              onValueChange={setOperationNote}
              startContent={
                <Icon icon="lucide:file-text" className="text-default-400" />
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setOperationNote('');
                setSelectedEmployee(null);
                setVariant(null);
                setAmount(0);
                setIsModalOpen(false);
              }}
            >
              Отмена
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isDisabled={!selectedEmployee}
            >
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};
export default CashierCard;
