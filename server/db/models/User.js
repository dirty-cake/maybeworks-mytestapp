const Model  = require('./BaseModel.js')
const bcrypt = require('bcrypt')

module.exports = class User extends Model {
    static tableName = 'users'
  
    static relationMappings = {
      messages: {
        relation: Model.HasManyRelation,
        modelClass: 'Message',
        join: {
          from: 'users.id',
          to: 'messages.user_id'
        }
      }
    }

    comparePassword(password) {
      return bcrypt.compareSync(password, this.password)
    }

    $formatDatabaseJson(model) {
      const json = super.$formatDatabaseJson(model)
      if (json.password)  {
        json.password = bcrypt.hashSync(json.password, 11)
      }
      return json
    }

    $formatJson(model, options) {
      const user = super.$formatJson(model, options)
      delete user.password
      return user
    }
} 