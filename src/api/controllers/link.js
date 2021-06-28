'use strict';

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const request = require('../utils/request');
const ALLOWED_HOST = 'localhost:3000';

const verify = async (req, res) => {
  try {
    const ips = req.ips ?? [req.ip];
    const { hostname, headers, body } = req;
    const userAgent = headers['user-agent'];

    if (!hostname || hostname !== ALLOWED_HOST) throw new Error('Неверный Hostname');
    const requiredFields = ['access_token', 'expires_in', 'token_type', 'user_id', 'state', 'scope'];
    if (!body || requiredFields.every(i => !Object.keys(body).includes(i))) {
      throw new Error('Указаны не все поля');
    }

    const parsedState = jwt.verify(body.state, process.env.JWT_SECRET);
    if (!parsedState || !parsedState.id || !parsedState.tag) throw new Error('Не удалось проверить подлинность токена');

    const { user: userData } = await request(`/users/me`, { method: 'get', token: body.access_token });
    if (!userData.user_id) throw new Error('Форум вернул недействительный ответ');

    let user = await User.findOne({ id: parsedState.id });
    if (!user) user = await User.create({ id: parsedState.id });

    if (user.forums.some(i => i.id === userData.user_id)) {
      throw new Error('Вы уже привязали аккаунт к этому пользователю');
    }

    const alreadyLinked = await User.find({ 'forums.id': userData.user_id });
    if (alreadyLinked.length) {
      throw new Error('Данный форумный аккаунт уже привязан к другому пользователю Discord');
    }

    if (user.forums.length) user.forums.filter(i => i.active).every(i => (i.active = false));
    user.forums.push({ id: userData.user_id, ips, accessToken: body.access_token, userAgent });
    await user.save();

    res.send({
      success: true,
      user: {
        url: userData?.links?.permalink ?? `https://lolz.guru/${userData.user_id}`,
        nick: userData.username,
        discordTag: parsedState.tag,
      },
    });
  } catch (err) {
    let message = err.message;
    if (message === 'jwt expired') {
      message = 'Ссылка устарела. Создайте новую';
    } else if (err.isAxiosError && err.response && err.response.data && err.response.data.errors) {
      message = err.response.data.errors.join('. ');
    } else {
      console.error(err);
    }
    res.send({ error: true, message });
  }
};

module.exports = { verify };
