const Joi = require('@hapi/joi')

exports.nickname = Joi
    .string()
    .pattern(/^[a-zA-Z]+$/)
    .min(3)

exports.password = Joi
    .string()
    .min(5)
    .max(16)