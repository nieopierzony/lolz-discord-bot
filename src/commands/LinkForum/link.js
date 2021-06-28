/* eslint-disable consistent-return */
'use strict';

const { MessageEmbed, DiscordAPIError } = require('discord.js');
const jwt = require('jsonwebtoken');
const plural = require('plural-ru');
const User = require('../../models/User');
const Command = require('../../structures/Command');
const { sendErrorMessage } = require('../../utils');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'link',
      description: 'Привязка форумного аккаунта к пользователю',
      guildOnly: true,
    });
  }
  async run({ message }) {
    // Проверка, есть ли у пользователя уже привязанный акк
    const user = await User.findOne({ id: message.author.id });
    if (user && user.forums.some(f => f.active)) {
      return this.confirmRewrite(message, message.member, user.forums.length);
    }
    this.sendLink(message);
    const msg = await message.channel.send(
      message.member,
      new MessageEmbed().setColor('#0398fc').setDescription('**Проверьте личные сообщения**'),
    );
    msg.delete({ timeout: 20 * 1000 });
  }

  genLink(token) {
    // eslint-disable-next-line max-len
    return `https://lolz.guru/api/index.php?oauth/authorize&response_type=token&client_id=${process.env.LOLZ_CLIENT}&state=${token}&scope=read`;
  }

  async sendLink(message) {
    try {
      // Создание токена с идом пользователя
      const token = jwt.sign({ id: message.author.id, tag: message.author.tag }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });

      // Отправка ембеда с ссылкой в лс. Если ошибка, написать об этом
      const embed = new MessageEmbed()
        .setColor('#299148')
        .setDescription(
          `**Для привязки форумного аккаунта, перейдите по этой [ссылке](${this.genLink(
            token,
          )}) и следуйте дальнейшим инструкциям **`,
        );

      await message.author.send(embed);

      message.delete({ timeout: 20 * 1000 });
    } catch (err) {
      if (err instanceof DiscordAPIError) {
        sendErrorMessage({
          message,
          content: 'Произошла ошибка при отправке личного сообщения. Проверьте настройки конфидециальности.',
          member: message.member,
        });
      }
      console.log(err);
    }
  }

  async confirmRewrite(message, member, forumsCount) {
    const msg = await message.channel.send(
      member,
      new MessageEmbed()
        .setColor('#fcd703')
        .setDescription(
          `**У вас уже есть ${plural(
            forumsCount,
            '%d привязанный аккаунт',
            '%d привязанных аккаунта',
            '%d привязанных аккаунтов',
          )}. Вы можете привязать другой, но имейте ввиду, что список старых профилей будет доступен всем.**`,
        )
        .setFooter('Нажмите ✅, чтобы продолжить'),
    );
    msg.react('✅');

    const filter = reaction => reaction.emoji.name === '✅';
    const collector = msg.createReactionCollector(filter, { time: 1 * 60 * 1000 });

    collector.on('collect', (reaction, user) => {
      if (user.bot) return;
      if (user.id !== message.author.id) return reaction.users.remove(user);

      this.sendLink(message);
      msg.reactions.removeAll();
      msg.edit(member, new MessageEmbed().setColor('#0398fc').setDescription('**Проверьте личные сообщения**'));
      msg.delete({ timeout: 20 * 1000 });
      message.delete({ timeout: 20 * 1000 });
    });
  }
};
