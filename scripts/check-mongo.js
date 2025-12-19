require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongo OK. DB:', mongoose.connection.name);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mongo check failed:', err.message);
    process.exit(1);
  }
})();
