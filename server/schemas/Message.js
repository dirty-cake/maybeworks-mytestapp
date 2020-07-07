const Joi = require('@hapi/joi')

exports.text = Joi
    .string()
    .max(200)
