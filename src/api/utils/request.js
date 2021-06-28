'use strict';

const axios = require('axios');
const API_URL = 'https://lolz.guru/api/index.php?';

const request = async (endpoint, { method = 'get', body, token } = {}) => {
  if (!token) throw new TypeError('Не указан токен');

  const res = await axios[method](`${API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: 'xf_logged_in=1; xf_market_currency=usd' },
    body: body ? JSON.stringify(body) : undefined,
    method,
  });
  const isSuccess = res && res.status === 200;
  return isSuccess ? res.data : null;
};

module.exports = request;
