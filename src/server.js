require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('========================================');
      console.log('   UDAAN BACKEND STARTED');
      console.log('========================================');
      console.log(`   Port: ${PORT}`);
      console.log(`   Env:  ${process.env.NODE_ENV}`);
      console.log('========================================');
      console.log('');
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();