#!/usr/bin/env node
// Skrypt do generowania bcrypt hashy
// Użycie: node scripts/hash-password.js <twoje-haslo>

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Użycie: node scripts/hash-password.js <haslo>');
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log('\nHash bcrypt dla hasła:', password);
  console.log('\n' + hash + '\n');
  console.log('Wklej powyższy hash do config/users.yml jako password_hash');
});
