'use strict';

const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'help',
      description: 'Показывает список команд',
    });
  }
  run({ args, message }) {
    message.reply(1);
  }
};
