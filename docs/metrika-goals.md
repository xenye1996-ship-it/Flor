# Яндекс.Метрика — STEM

1. Создайте счётчик на https://metrika.yandex.ru
2. В `.env.local`: `NEXT_PUBLIC_YM_ID=12345678`
3. Перезапустите `npm run dev` / деплой
4. В Метрике → Цели → JavaScript-событие, идентификаторы:

| Цель | ID события |
|---|---|
| Открытие корзины | `cart_open` |
| Заказ оформлен | `order_created` |
| Оплата успешна | `payment_success` |
| Фото подтверждено | `photo_approved` |
| Правки по фото | `photo_revision` |
