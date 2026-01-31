import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Image,
  NumberInput,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { AssortmentItem, Employee } from '../../../../server/data';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AssortmentItem[];
  employees: Employee[];
  onAddSale: (
    barcode: string,
    quantity: number,
    employeeId: string | number,
    paymentMethod: 'Нал' | 'Безнал'
  ) => Promise<{ success: boolean; message: string }>;
}

export const SellModal: React.FC<SellModalProps> = ({
  isOpen,
  items,
  employees,
  onClose,
  onAddSale,
}) => {
  const [item, setItem] = React.useState<AssortmentItem | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<'Нал' | 'Безнал'>(
    'Нал'
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setItem(null);
      setQuantity(1);
      setEmployee(null);
      setPaymentMethod('Нал');
      setFormError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // Form validation
    if (!item) {
      setFormError('Выберите товар');
      return;
    }
    if (quantity <= 0) {
      setFormError('Количество должно быть больше 0');
      return;
    }
    if (!employee) {
      setFormError('Выберите сотрудника');
      return;
    }
    onClose();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const result = await onAddSale(
        item.barcode,
        quantity,
        employee.id,
        paymentMethod
      );
      if (result.success) {
        setSuccessMessage(result.message);
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setFormError(result.message);
      }
    } catch (error) {
      setFormError('Произошла ошибка при добавлении продажи');
      console.error('Error in form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:shopping-cart" width={20} />
              <span>Добавить продажу</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {successMessage && (
              <div className="bg-success-100 text-success-700 p-3 rounded-medium mb-4 flex items-center gap-2">
                <Icon icon="lucide:check-circle" width={18} />
                {successMessage}
              </div>
            )}

            {formError && (
              <div className="bg-danger-100 text-danger-700 p-3 rounded-medium mb-4 flex items-center gap-2">
                <Icon icon="lucide:alert-circle" width={18} />
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <Select
                label="Товар"
                placeholder="Выберите товар"
                selectedKeys={item ? [item.barcode.toString()] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  const newItem =
                    items.find(
                      (i) => i.barcode.toString() === selected.toString()
                    ) ?? null;
                  setItem(newItem);
                }}
                isRequired
              >
                {items.map((itemI) => {
                  return (
                    <SelectItem key={itemI.barcode} textValue={itemI.name}>
                      <div className="flex gap-2 items-center">
                        <Image
                          src={itemI.photo}
                          alt={itemI.name}
                          height={80}
                          className="object-contain"
                        />
                        <div className="flex flex-col">
                          <span className="text-small">{itemI.name}</span>
                          <span className="text-tiny text-default-600">
                            Цена: {itemI.price}
                          </span>
                          <span className="text-tiny text-default-600">
                            Количество: {itemI.stock}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </Select>

              <NumberInput
                label="Количество"
                placeholder="Введите количество"
                value={quantity}
                onValueChange={(value) => setQuantity(value)}
                startContent={
                  <Icon icon="lucide:hash" className="text-default-400" />
                }
                maxValue={item?.stock}
                minValue={1}
                isDisabled={!item}
                isRequired
              />

              <Select
                label="Сотрудник"
                placeholder="Выберите сотрудника"
                selectedKeys={employee ? [employee.id.toString()] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  const newEmp =
                    employees.find((e) => e.id === selected) ?? null;
                  setEmployee(newEmp);
                }}
                isRequired
              >
                {employees.map((emp) => (
                  <SelectItem key={emp.id} textValue={emp.name}>
                    {emp.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Метод оплаты"
                placeholder="Выберите метод оплаты"
                selectedKeys={[paymentMethod]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected === 'Нал' || selected === 'Безнал') {
                    setPaymentMethod(selected);
                  }
                }}
                isRequired
              >
                <SelectItem key="Нал" textValue="Нал">
                  Наличные
                </SelectItem>
                <SelectItem key="Безнал" textValue="Безнал">
                  Безналичный расчет
                </SelectItem>
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} isDisabled={isSubmitting}>
              Отмена
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              startContent={
                !isSubmitting && <Icon icon="lucide:check" width={18} />
              }
            >
              Добавить
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};
export default SellModal;
