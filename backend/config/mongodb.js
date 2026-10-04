import mongoose from 'mongoose';

const mongodbConfig = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/noahlink-pro',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbConfig.url, mongodbConfig.options);
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error.message);
    throw error;
  }
};

export { connectDB, disconnectDB, mongodbConfig };
