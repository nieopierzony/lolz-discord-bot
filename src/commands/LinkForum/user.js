'use strict';

const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'user',
      description: 'Показать информацию о пользователе и его аккаунте на форуме',
    });
  }
  run({ args, message }) {
    // Если указан пользователь, искать инфу по нему. Если нет, то по автору
  }
};
