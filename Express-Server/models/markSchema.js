const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const markSchema = new Schema({
    eno: {
        type: Number,
        required: true
    },
    semesterNumber: {
        type: Number,
        required: true
    },
    courseCode: {
        type:String,
        required: true
    },
    theoryObtained: {
        type: Number,
        required: true
    },
    practicalObtained: {
        type: Number,
        required: true
    },
    midTermObtained: {
        type: Number,
        required: true
    },
    gradeObtained: {
        type: Number
    },
    backlog: {
        type: Boolean,
        required: true
    },
    totalCredits: {
        type: Number
    }
}, {
    timestamps: true
});


var Marks = mongoose.model('Mark', markSchema);

module.exports = Marks;