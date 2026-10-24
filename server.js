const express = require('express');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Мидлвары
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === API ЕНДПОИНТЫ ===

// 1. Проверка работы сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Бэкенд работает отлично!' });
});

// 2. Получить список всех товаров из PostgreSQL
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.title, p.description, p.price, p.image_url, c.title AS category 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении товаров:', err);
    res.status(500).json({ error: 'Ошибка сервера при запросе к БД' });
  }
});

// 3. Получить один торт по ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при получении товара:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
// Эндпоинт для создания заказа
app.post('/api/orders', async (req, res) => {
  const { customer_name, phone, product_title, comment } = req.body;
  try {
    // Если у тебя еще нет таблицы orders, можно пока сохранять в логи или создать таблицу
    const query = `
      INSERT INTO orders (customer_name, phone, product_title, comment) 
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    // Пример (если таблица orders создана):
    // const result = await db.query(query, [customer_name, phone, product_title, comment]);
    
    // Пока для теста отвечаем успехом:
    res.json({ success: true, message: 'Заказ успешно оформлен!' });
  } catch (err) {
    console.error('Ошибка при сохранении заказа:', err);
    res.status(500).json({ error: 'Ошибка сервера при заказе' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});