'use strict';

const Command = require('../../structures/Command');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'update',
      description: 'Обновить статус пользователя Discord, в соответствии с званием на форуме',
    });
  }
  run({ args, message }) {
    // Если автор админ и в аргументах указан пользователь, производить действия по указаному юзеру
    // Проверка, привязан ли аккаунт
    // Проверка, активный ли аккаунт
    // Запрос на апи, получение инфы о пользователе
    // Обновление ролей
  }
};
