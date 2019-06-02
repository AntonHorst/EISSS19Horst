const mongoose = require('mongoose');

const rankSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    score: {type: String, required : true},
    name: {type: mongoose.Schema.Types.String, ref: 'Frage', require: true },
    antwort1: {type: mongoose.Schema.Types.Boolean, ref: 'antwort1', require: true },
    kultur: {type: mongoose.Schema.Types.String, ref: 'kultur', require: true },
    neuerScore:{type:String},

});

module.exports = mongoose.model('rank', rankSchema);