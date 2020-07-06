const Model  = require('./BaseModel.js')

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
  
    $formatJson(model, options) {
      const user = super.$formatJson(model, options)
      delete user.password
      return user
    }
} 