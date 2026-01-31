/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button,
  Spinner,
  Image,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CardHeader,
  addToast,
  NumberInput,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { AssortmentItem } from '../../../server/data';
import { serverFunctions } from '../../utils/serverFunctions';

const columns = [
  { key: 'barcode', label: 'Артикул' },
  { key: 'name', label: 'Название' },
  { key: 'unit', label: 'Ед. изм.' },
  { key: 'price', label: 'Цена' },
  { key: 'cost', label: 'Вход' },
  { key: 'stock', label: 'Кол-во' },
  { key: 'photo', label: 'Фото' },
  { key: 'actions', label: 'Действия' },
];
interface AssortmentCardProps {
  items: AssortmentItem[];
  setItems: React.Dispatch<React.SetStateAction<AssortmentItem[]>>;
  onRefresh: () => void;
  loadingItems: boolean;
}
export default function AssortmentCard({
  items,
  onRefresh,
  setItems,
  loadingItems,
}: AssortmentCardProps) {
  const [search, setSearch] = useState('');
  const [isAddNew, setIsAddNew] = useState(false);

  // Модальное окно
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] =
    useState<Partial<AssortmentItem> | null>(null);

  // Подтверждение удаления
  const [deleteConfirm, setDeleteConfirm] = useState<AssortmentItem | null>(
    null
  );

  const handleDelete = (item: AssortmentItem) => {
    addToast({
      title: 'Удаление ассортимента',
      description: item.name,
      classNames: {
        icon: 'text-success',
      },
      loadingComponent: <Spinner color="warning" size="sm" />,
      promise: serverFunctions
        .deleteItem(item.barcode)
        .then((res) => setItems(res)),
      icon: (
        <Icon icon="mdi:success" className="text-success" color="success" />
      ),
    });

    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (isAddNew === false && currentItem?.barcode) {
      addToast({
        title: 'Обновление ассортимента',
        description: currentItem.name,
        classNames: {
          icon: 'text-success',
        },
        loadingComponent: <Spinner color="warning" size="sm" />,
        promise: serverFunctions
          .updateItem(currentItem.barcode, currentItem)
          .then((res) => setItems(res)),
        icon: (
          <Icon icon="mdi:success" className="text-success" color="success" />
        ),
      });
    } else if (currentItem !== null) {
      addToast({
        title: 'Добавление ассортимента',
        description: currentItem.name,
        classNames: {
          icon: 'text-success',
        },
        loadingComponent: <Spinner color="warning" size="sm" />,
        promise: serverFunctions
          .addItem(currentItem)
          .then((res) => setItems(res)),
        icon: (
          <Icon icon="mdi:success" className="text-success" color="success" />
        ),
      });
    }
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const filteredItems = React.useMemo(() => {
    return items.filter(
      (item) =>
        item.name.toString().toLowerCase().includes(search.toLowerCase()) ||
        item.barcode.toString().toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);
  return (
    <Card className="p-0 md:p-4 shadow-lg rounded-2xl">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-2xl font-bold">Ассортимент</h1>
        <div className="flex gap-3">
          <Input
            isClearable
            className="max-w-[200px]"
            placeholder="Поиск..."
            startContent={<Icon icon="mdi:search" width={20} height={20} />}
            value={search}
            onClear={() => setSearch('')}
            onValueChange={setSearch}
          />
          <Button
            color="primary"
            onPress={() => {
              setIsAddNew(true);
              setCurrentItem({});
              setIsModalOpen(true);
            }}
            size="md"
            variant="solid"
          >
            + Добавить
          </Button>
          <Button
            color="default"
            onPress={() => {
              onRefresh();
            }}
            isIconOnly
            className="rounded-full"
            variant="light"
          >
            <Icon icon="mdi:refresh" width={20} height={20} />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Table for desktop (lg and up) */}
        <div className="hidden lg:block">
          <Table aria-label="Ассортимент товаров" removeWrapper>
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key} className="text-center">
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredItems}
              emptyContent="Нет товаров"
              isLoading={loadingItems}
              loadingContent={<Spinner label="Загрузка..." />}
            >
              {(item) => (
                <TableRow key={item.barcode}>
                  {(columnKey) => {
                    if (columnKey === 'photo') {
                      return (
                        <TableCell className="text-center">
                          <div className="items-center flex justify-center">
                            {item.photo ? (
                              <Image
                                src={item.photo}
                                alt={item.name}
                                className="max-h-[200px]"
                              />
                            ) : (
                              '—'
                            )}
                          </div>
                        </TableCell>
                      );
                    }
                    if (columnKey === 'actions') {
                      return (
                        <TableCell className="text-center">
                          <div className="items-center flex justify-center items-center h-full">
                            <Button
                              size="md"
                              color="warning"
                              onPress={() => {
                                setIsAddNew(false);
                                setCurrentItem(item);
                                setIsModalOpen(true);
                              }}
                              isIconOnly
                              className="rounded-full"
                              variant="light"
                            >
                              <Icon icon="lucide:pen" width={20} height={20} />
                            </Button>
                            <Button
                              size="md"
                              color="danger"
                              onPress={() => setDeleteConfirm(item)}
                              isIconOnly
                              className="rounded-full"
                              variant="light"
                            >
                              <Icon
                                icon="lucide:trash"
                                width={20}
                                height={20}
                              />
                            </Button>
                          </div>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell className="text-center">
                        {item[columnKey as keyof AssortmentItem]}
                      </TableCell>
                    );
                  }}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards for mobile (below lg) */}
        <div className="block lg:hidden">
          {loadingItems && (
            <div className="flex justify-center py-8">
              <Spinner label="Загрузка..." />
            </div>
          )}
          {!loadingItems && filteredItems.length === 0 && (
            <div className="text-center text-gray-400 py-8">Нет товаров</div>
          )}
          {!loadingItems && filteredItems.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.barcode}
                  className="p-3 shadow-md rounded-xl bg-default-200"
                >
                  <div className="flex gap-3 items-center">
                    <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                      {item.photo ? (
                        <Image
                          src={item.photo}
                          alt={item.name}
                          className="object-cover max-h-20 max-w-20"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="font-bold text-lg">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        Артикул:{' '}
                        <span className="font-mono">{item.barcode}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span>
                          Ед.: <b>{item.unit}</b>
                        </span>
                        <span>
                          Цена: <b>{item.price}</b>
                        </span>
                        <span>
                          Вход: <b>{item.cost}</b>
                        </span>
                        <span>
                          Кол-во: <b>{item.stock}</b>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Button
                        size="sm"
                        color="warning"
                        onPress={() => {
                          setIsAddNew(false);
                          setCurrentItem(item);
                          setIsModalOpen(true);
                        }}
                        isIconOnly
                        className="rounded-full"
                        variant="light"
                      >
                        <Icon icon="lucide:pen" width={20} height={20} />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => setDeleteConfirm(item)}
                        isIconOnly
                        className="rounded-full"
                        variant="light"
                      >
                        <Icon icon="lucide:trash" width={20} height={20} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardBody>

      {/* Модальное окно добавления/редактирования */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            {currentItem?.barcode ? 'Редактировать товар' : 'Добавить товар'}
          </ModalHeader>
          <ModalBody className="flex flex-col gap-3">
            <Input
              label="Артикул"
              value={currentItem?.barcode || ''}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, barcode: e.target.value })
              }
            />
            <Input
              label="Название"
              value={currentItem?.name || ''}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, name: e.target.value })
              }
            />
            <Input
              label="Ед. изм."
              value={currentItem?.unit || ''}
              onChange={(e) =>
                setCurrentItem({ ...currentItem, unit: e.target.value })
              }
            />
            <NumberInput
              label="Цена"
              type="number"
              value={currentItem?.price || 0}
              minValue={0}
              onValueChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  price: Number(e),
                })
              }
            />
            <NumberInput
              label="Вход"
              type="number"
              value={currentItem?.cost || 0}
              minValue={0}
              onValueChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  cost: Number(e),
                })
              }
            />
            <NumberInput
              label="Кол-во"
              type="number"
              value={currentItem?.stock || 0}
              minValue={0}
              onValueChange={(e) =>
                setCurrentItem({
                  ...currentItem,
                  stock: Number(e),
                })
              }
            />
            <Input
              label="Фото (URL)"
              value={
                items.some(
                  (i) =>
                    currentItem?.barcode === i.barcode &&
                    currentItem?.photo?.toString() === i.photo.toString()
                )
                  ? ''
                  : currentItem?.photo?.toString()
              }
              onChange={(e) =>
                setCurrentItem({ ...currentItem, photo: e.target.value })
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button color="primary" onPress={handleSave}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Подтверждение удаления */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <ModalContent>
          <ModalHeader>Подтверждение удаления</ModalHeader>
          <ModalBody>
            Вы уверены, что хотите удалить{' '}
            <b>{deleteConfirm?.name || deleteConfirm?.barcode}</b>?
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setDeleteConfirm(null)}>
              Отмена
            </Button>
            <Button
              color="danger"
              onPress={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
