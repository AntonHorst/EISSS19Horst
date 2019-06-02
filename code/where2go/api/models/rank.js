const mongoose = require('mongoose');

const rankSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    score: {type: String, required : true},
    name: {type: String},
});

module.exports = mongoose.model('rank', rankSchema);