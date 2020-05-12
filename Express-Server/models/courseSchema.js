const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    sessionId: {
        type: String,
        required: true
    }, 
    semesterNo: {
        type: Number,
        required: true
    },
    maxTheory: {
        type: Number,
        required: true
    },
    maxPractical: {
        type: Number,
        required: true
    },
    maxMidTerm:{
        type: Number,
        required: true
    },
    courseCode: {
        type: String,
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    creditTheory: {
        type: Number,
        required: true
    },
    creditPractical: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});


var Courses = mongoose.model('Course', courseSchema);

module.exports = Courses;