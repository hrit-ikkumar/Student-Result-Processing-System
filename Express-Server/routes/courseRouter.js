const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Courses = require('../models/courseSchema');

const courseRouter = express.Router();

courseRouter.use(bodyParser.json());

courseRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Courses.find(req.query)
    .then((Courses) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Courses);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.author = req.user._id;
        Courses.create(req.body)
        .then((Course) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Course);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Course not found in request body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Courses/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Courses.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

courseRouter.route('/:CourseId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Courses.findById(req.params.CourseId)
    .then((Course) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Course);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Courses/'+ req.params.CourseId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Courses.findById(req.params.CourseId)
    .then((Course) => {
        if (Course != null) {
            if (!Course.courseCode.equals(req.courseCode)) {
                var err = new Error('You are not authorized to update this Course!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Courses.findByIdAndUpdate(req.params.CourseId, {
                $set: req.body
            }, { new: true })
            .then((Course) => {
                Courses.findById(Course._id)
                .populate('author')
                .then((Course) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(Course); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('Course ' + req.params.CourseId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Courses.findById(req.params.CourseId)
    .then((Course) => {
        if (Course != null) {
            if (!Course.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this Course!');
                err.status = 403;
                return next(err);
            }
            Courses.findByIdAndRemove(req.params.CourseId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Course ' + req.params.CourseId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = courseRouter;