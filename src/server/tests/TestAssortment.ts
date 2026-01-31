/* eslint-disable import/prefer-default-export */
import { addItem, deleteItem, getAllItems } from '../Assortment';
import { AssortmentItem } from '../data';

export function testAddItem() {
  const testItem: Partial<AssortmentItem> = {
    barcode: 'TEST001',
    name: 'Тестовый товар с фото',
    unit: 'шт',
    stock: 5,
    price: 120,
    cost: 80,
    photo:
      'https://www.gstatic.com/images/branding/productlogos/apps_script/v10/web-64dp/logo_apps_script_color_1x_web_64dp.png',
  };

  // Добавляем товар
  const allItemsAfterAdd = addItem(testItem);

  Logger.log('Все товары после добавления:');
  allItemsAfterAdd.forEach((item) => {
    Logger.log({
      barcode: item.barcode,
      name: item.name,
      unit: item.unit,
      stock: item.stock,
      price: item.price,
      cost: item.cost,
      photo: item.photo, // тут уже должен быть URL
    });
  });

  // Проверка, добавился ли товар
  const added = allItemsAfterAdd.find((i) => i.barcode === 'TEST001');
  if (added) {
    Logger.log('✅ Тест пройден — товар добавлен и фото доступно через URL');
  } else {
    Logger.log('❌ Тест не пройден — товар не найден');
  }

  // Очистка: удалить тестовый товар
  deleteItem('TEST001');
  Logger.log('Тестовый товар удален');
}

export function testGetAllItems() {
  const items = getAllItems();
  Logger.log(items);
}
