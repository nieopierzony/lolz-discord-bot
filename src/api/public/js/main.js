'use strict';

const API_URL = 'http://localhost:3000/verify';
const CLIENT_ID = 'w6scjc4xfx';

(async () => {
  try {
    if (!window.location.hash) return showError(['Не указаны данные', genLink()]);
    const hash = await parseHash();
    const requiredFields = ['access_token', 'expires_in', 'token_type', 'user_id', 'state', 'scope'];
    if (requiredFields.every(i => !Object.keys(hash).includes(i))) {
      return showError(['Указаны не все поля', genLink(hash.state ? hash.state : undefined)]);
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(hash),
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!json || json.message) {
      throw new Error(json && json.message ? json.message : 'Не удалось получить ответ сервера');
    }

    if (!json.user || !json.user.nick || !json.user.url || !json.user.discordTag) {
      return showError(['Сервер отправил недействительный ответ', genLink(hash.state ? hash.state : undefined)]);
    }

    showSuccess([json.user.url, json.user.nick, json.user.discordTag]);
  } catch (err) {
    const hash = window.location.hash ? await parseHash() : undefined;
    showError([err.message, genLink(hash && hash.state)]);
    console.error(err);
  }

  return true;
})();

function genLink(token) {
  // eslint-disable-next-line max-len
  return `https://lolz.guru/api/index.php?oauth/authorize&response_type=token&client_id=${CLIENT_ID}&state=${token}&scope=read`;
}

function parseHash() {
  const hash = window.location.hash;
  return Object.fromEntries(
    hash
      .split('#')[1]
      .split('&')
      .map(i => i.split('=')),
  );
}

function hideCurrent() {
  const current = document.querySelector('.visible');
  current.classList.remove('visible');
}

function showError(data) {
  hideCurrent();
  const error = document.querySelector('.error');
  data.forEach((j, i) => {
    error.innerHTML = error.innerHTML.replace(`%${i}`, j);
  });
  error.classList.add('visible');
}

function showSuccess(data) {
  hideCurrent();
  const success = document.querySelector('.success');
  data.forEach((j, i) => {
    success.innerHTML = success.innerHTML.replace(`%${i}`, j);
  });
  success.classList.add('visible');
}
