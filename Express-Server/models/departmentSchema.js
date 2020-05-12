const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    dno: {
        type: Number,
        required: true
    },
    departmetName: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

var Departments = mongoose.model('Department', departmentSchema);

module.exports = Departments;