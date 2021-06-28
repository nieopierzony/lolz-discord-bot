'use strict';

const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    id: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now() },
    forums: [
      {
        id: Number,
        active: { type: Boolean, default: true },
        linkedAt: { type: Date, default: Date.now() },
        ips: Array,
        accessToken: String,
        userAgent: String,
      },
    ],
  },
  { versionKey: false },
);

module.exports = model('users', UserSchema);
