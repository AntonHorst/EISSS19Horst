const mongoose = require('mongoose');

const reiseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required : true},
    kultur: {type: String},
    aktivitaet: {type: String},
    erholung: {type: String},
    preis: {type: String}


});

module.exports = mongoose.model('reise', reiseSchema);