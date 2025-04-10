const mongoose = require('mongoose');


const licenceModel = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        unique: true
    },
    licence: {
        type: String,
        required: true,
        unique: true
    }
})


const Licence = mongoose.model("licences", licenceModel)


module.exports = Licence