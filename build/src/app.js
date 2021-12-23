"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const express = require('express')
const express_1 = __importDefault(require("express"));
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
// const router = require('../routers/router')
const router_1 = __importDefault(require("../routers/router"));
const initializePassport = require('../services/passport');
module.exports = () => {
    const app = (0, express_1.default)();
    initializePassport(passport);
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express_1.default.json());
    app.use(passport.initialize());
    console.log('lolo');
    app.use('/', router_1.default);
    return app;
};
