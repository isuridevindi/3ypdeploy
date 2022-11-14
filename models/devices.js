const mongoose = require('mongoose')

const devicesSchema = new mongoose.Schema({
    issueDate: {type: Date, default: Date.now}
    
}, {collection: 'devices'})

const model = mongoose.model('devicesModel', devicesSchema)

module.exports = model