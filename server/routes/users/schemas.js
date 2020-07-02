const Joi = require('@hapi/joi')
const User = require('../../schemas/User.js')

exports.signin = Joi.object({
    nickname: User.nickname.required(),
    password: User.password.required()
})