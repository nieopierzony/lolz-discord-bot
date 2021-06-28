'use strict';

const path = require('path');
const fastify = require('fastify');
const routes = require('./router');

module.exports = class {
  constructor(client) {
    this.client = client;
    this.startServer();
  }

  startServer(port = process.env.PORT || 3000) {
    this.app = fastify();
    this.loadRoutes();

    this.app
      .register(require('fastify-cors'), { origin: ['http://localhost:3000'] })
      .register(require('fastify-static'), { root: path.join(__dirname, 'public') })
      .addHook('onRequest', (req, res, done) => {
        req.client = this.client;
        done();
      })
      .listen(port, '0.0.0.0')
      .then(() => {
        console.log('[HTTP] Сервер успешно запущен на порту %d', port);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  }

  loadRoutes() {
    routes.forEach(route => {
      this.app.route(route);
    });
  }
};
