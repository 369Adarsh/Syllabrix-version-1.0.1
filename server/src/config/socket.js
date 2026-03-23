const config = require('./env');

const socketOptions = {
  cors: {
    origin: config.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
};

module.exports = { socketOptions };
