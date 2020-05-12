const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Departments = require('../models/departmentSchema');

const departmentRouter = express.Router();

departmentRouter.use(bodyParser.json());

departmentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Departments.find(req.query)
    .then((Departments) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Departments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        Departments.create(req.body)
        .then((Department) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(Department);
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Department not found in request body');
        err.status = 404;
        return next(err);
    }

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /Departments/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Departments.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

departmentRouter.route('/:departmentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Departments.findById(req.params.departmentId)
    .then((Department) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(Department);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /Departments/'+ req.params.departmentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Departments.findById(req.params.dno)
    .then((Department) => {
        if (Department != null) {
            if (!Department.dno.equals(req.dno)) {
                var err = new Error('You are not authorized to update this Department!');
                err.status = 403;
                return next(err);
            }
            req.body.author = req.user._id;
            Departments.findByIdAndUpdate(req.params.departmentId, {
                $set: req.body
            }, { new: true })
            .then((Department) => {
                Departments.findById(Department._id)
                .populate('author')
                .then((Department) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(Department); 
                })               
            }, (err) => next(err));
        }
        else {
            err = new Error('Department ' + req.params.departmentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Departments.findById(req.params.departmentId)
    .then((Department) => {
        if (Department != null) {
            if (!Department.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to delete this Department!');
                err.status = 403;
                return next(err);
            }
            Departments.findByIdAndRemove(req.params.departmentId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp); 
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            err = new Error('Department ' + req.params.departmentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = departmentRouter;