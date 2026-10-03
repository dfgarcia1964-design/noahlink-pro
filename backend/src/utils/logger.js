// Simple logger utility for development and production
const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  info: (message, data) => {
    if (isDev) {
      console.log(`ℹ️  ${message}`, data || '');
    }
  },

  success: (message, data) => {
    if (isDev) {
      console.log(`✅ ${message}`, data || '');
    }
  },

  warn: (message, data) => {
    console.warn(`⚠️  ${message}`, data || '');
  },

  error: (message, data) => {
    console.error(`❌ ${message}`, data || '');
  },

  debug: (message, data) => {
    if (isDev && process.env.DEBUG) {
      console.log(`🔍 ${message}`, data || '');
    }
  }
};

module.exports = logger;
