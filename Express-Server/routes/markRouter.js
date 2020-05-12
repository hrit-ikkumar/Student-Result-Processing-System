const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Marks = require('../models/markSchema');

const markRouter = express.Router();

markRouter.use(bodyParser.json());

markRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Marks.find(req.query)
    .then((Marks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Marks);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.eno = req.user.enumber;
        req.body.gradeObtained = (req.body.practicalObtained + req.body.theoryObtained + req.body.midTermObtained)/10;
        Marks.create(req.body)
        .then((mark) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(mark);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('mark not found in request body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Marks/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Marks.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

markRouter.route('/:markId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Marks.findById(req.params.markId)
    .then((mark) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(mark);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Marks/'+ req.params.markId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Marks.findById(req.params.markId)
    .then((mark) => {
        if (mark != null) {
            if (!mark.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to update this mark!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Marks.findByIdAndUpdate(req.params.markId, {
                $set: req.body
            }, { new: true })
            .then((mark) => {
                Marks.findById(mark._id)
                .populate('User')
                .populate('Course')
                .then((mark) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(mark); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('mark ' + req.params.markId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Marks.findById(req.params.markId)
    .then((mark) => {
        if (mark != null) {
            if (!mark.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this mark!');
                err.status = 403;
                return next(err);
            }
            Marks.findByIdAndRemove(req.params.markId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('mark ' + req.params.markId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = markRouter;