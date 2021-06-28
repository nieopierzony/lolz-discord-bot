'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const Client = require('./structures/Client');

const client = new Client({
  devs: ['422109629112254464'],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  messageCacheLifetime: 60,
  messageSweepInterval: 120,
});

mongoose.connect(
  process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  err => {
    if (err) throw err;
    console.log('[Database] База данных Mongo успешно подключена.');
  },
);

client.login();
client.loadEvents().initializeHTTPServer();

module.exports = client;
