const Joi = require('@hapi/joi')

const Message = {
    text: Joi.string().max(200)
}

exports.send = Joi.object({
    test: Message.text.required()
})
