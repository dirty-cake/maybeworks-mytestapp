const Objection = require('objection')

module.exports = class BaseModel extends Objection.Model {
    static modulePaths = [__dirname]
  }