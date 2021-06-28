/* eslint-disable consistent-return */
'use strict';

const { MessageEmbed, User } = require('discord.js');
const Command = require('../../structures/Command');
const { moderRoles } = require('../../utils/config');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'unlink',
      description: 'Отвязать форумный аккаунт от пользователя',
      guildOnly: true,
    });
  }
  async run({ args, message }) {
    const hasPermission =
      message.member.roles.cache.some(r => moderRoles.includes(r.id)) || message.member.hasPermission('ADMINISTRATOR');
    const member =
      message.mentions.members.first() && hasPermission
        ? message.mentions.members.first()
        : args[0] && this.isSnowflake(args[0]) && hasPermission
        ? await message.guild.members.fetch(args[0])
        : message.member;

    let user = await User.findOne({ id: member.id });
    if (!user) if (message.member.id === member.id) return this.confirmUnlink(message, member);
    this.unlinkUser(message, member);
  }

  isSnowflake(str) {
    return str.length === 18 && !isNaN(+str);
  }

  unlinkUser(message, member, edit = false) {}

  async confirmUnlink(message, member) {
    const msg = await message.channel.send(
      member,
      new MessageEmbed()
        .setColor('#fcd703')
        .setDescription(
          // eslint-disable-next-line max-len
          `**Не смотря на то, что вы отвязываете форумный аккаунт, он останется в вашей истории, которая доступна всем. Если необходимо, обратитесь к модерации, чтобы удалить аккаунт из истории**`,
        )
        .setFooter('Нажмите ✅, чтобы продолжить'),
    );
    msg.react('✅');

    const filter = reaction => reaction.emoji.name === '✅';
    const collector = msg.createReactionCollector(filter, { time: 1 * 60 * 1000 });

    collector.on('collect', (reaction, user) => {
      if (user.bot) return;
      if (user.id !== message.author.id) return reaction.users.remove(user);

      msg.reactions.removeAll();
      this.unlinkUser(message, member, true);
    });
  }
};
