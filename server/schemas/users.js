const Joi = require('@hapi/joi')

const User = {
    nickname: Joi.string().pattern(/^[a-zA-Z]+$/).min(3),
    password: Joi.string().min(5).max(16)
}

exports.signin = Joi.object({
    nickname: User.nickname.required(),
    password: User.password.required()
})
