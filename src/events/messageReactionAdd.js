'use strict';

module.exports = async (client, reaction, reactedUser) => {
  if (reaction.partial) await reaction.fetch();
  if (reactedUser.bot) return;
};
