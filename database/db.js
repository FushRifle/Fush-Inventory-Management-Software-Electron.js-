const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/inventory.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      dateAdded TEXT NOT NULL
    )
  `);
});

module.exports = {
  addProduct: (product) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO products (name, amount, dateAdded) VALUES (?, ?, ?)',
        [product.name, product.amount, product.dateAdded],
        function (err) {
          if (err) reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  },

  getProducts: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }
};
