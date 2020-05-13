const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Results = require('../models/resultSchema');
const Marks = require('../models/markSchema');

const resultRouter = express.Router();

resultRouter.use(bodyParser.json());

resultRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Results.find({})
    .then((Results) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Results + Marks.find({}));
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        Results.create(req.body)
        .then((Result) => {
            Results.findById(Result._id)
            .then((Result) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Result);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Result not found in request body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Marks.find({$and: [{"enum":req.body.enum}, {"semesterNumber": req.body.semesterNumber}]})
    .then((marks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'appliation/json');
        res.json(marks[0]);
    });
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Results.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

resultRouter.route('/:ResultId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Results.findById(req.params.ResultId)
    .then((Result) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Result);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Results/'+ req.params.ResultId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Results.findById(req.params.ResultId)
    .then((Result) => {
        if (Result != null) {
            if (!Result.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to update this Result!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Results.findByIdAndUpdate(req.params.ResultId, {
                $set: req.body
            }, { new: true })
            .then((Result) => {
                Results.findById(Result._id)
                .populate('author')
                .then((Result) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(Result); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('Result ' + req.params.ResultId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Results.findById(req.params.ResultId)
    .then((Result) => {
        if (Result != null) {
            if (!Result.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this Result!');
                err.status = 403;
                return next(err);
            }
            Results.findByIdAndRemove(req.params.ResultId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Result ' + req.params.ResultId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = resultRouter;