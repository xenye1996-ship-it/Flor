# Заказы, оплата Т‑Банк, фото перед отправкой

Дата: 2026-11-11  
Статус: утверждено («делай как считаешь нужным»)

## Решения
- Заказы: `data/orders.json`
- Оплата: Т‑Банк Acquiring (Init + Notification). Без ключей — заказ как заявка.
- Фото: флорист грузит в админке → клиент по ссылке `/order/{id}?t=…` подтверждает или просит правки.

## Статусы
`new` → `awaiting_payment` → `paid` → `assembling` → `photo_pending` → `photo_approved` | `photo_revision` → `delivering` → `delivered` | `cancelled`
