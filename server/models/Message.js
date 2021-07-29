const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    userId: {
        type:String,
        required: true
    },
    text: {
        type:String,
        required: true
    },
    roomId: {
        type:String,
        required: true
    }
}, { timestamps: true })

const Message = mongoose.model('message', messageSchema)

module.exports = Message;