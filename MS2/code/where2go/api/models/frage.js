const mongoose = require('mongoose');

const frageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required : true},
    antwort1: {type: Boolean},
    antwort2: {type: Boolean},
    antwort3: {type: Boolean},
    antwort4: {type: Boolean},

});

module.exports = mongoose.model('frage', frageSchema);