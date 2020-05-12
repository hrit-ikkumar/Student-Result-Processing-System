const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new Schema({
    enum: {
        type: Number,
        required: true
    },
    semesterNumber: {
        type: Number,
        required: true
    },
    SGPA: {
        type: Number,
        min: 0.0,
        max: 10.0
    },
    totalCredits: {
        type: Number
    },
    dyhAnyBacklog: {
        type: Boolean
    }
}, {
    timestamps: true
});

var Results = mongoose.model('Result', resultSchema);
module.exports = Results;