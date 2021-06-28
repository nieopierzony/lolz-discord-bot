'use strict';

const linkController = require('../controllers/link');

module.exports = [
  {
    method: 'POST',
    url: '/verify',
    handler: linkController.verify,
  },
];
