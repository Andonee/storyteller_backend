"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../src/pool');
const tokenGenerator = user => {
    console.log('aaaaaaaaaa', user);
    const timestamp = new Date().getTime();
    console.log(user);
    return jwt.sign({ sub: user[0].login, iat: timestamp }, config.secret, {
        expiresIn: '1h',
    });
};
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const login = req.body.login;
    const password = req.body.password;
    console.log('login', login, 'password', password);
    if (!login || !password)
        res.send({ error: 'You must provide login and password' });
    const loginExists = yield pool.query('SELECT * FROM users WHERE login = $1;', [login]);
    console.log(loginExists.rows);
    if (loginExists.rows.length > 0) {
        res.status(401).send({ error: 'Login aready exists' });
        return;
    }
    const salt = yield bcrypt.genSalt(10);
    const hashedPassword = yield bcrypt.hash(password, salt);
    try {
        const newUser = yield pool.query('INSERT INTO users (login, password) VALUES ($1, $2) RETURNING *;', [login, hashedPassword]);
        res.send({ token: tokenGenerator(newUser) });
    }
    catch (error) {
        res.send({ error: 'Something went wrong', error });
    }
});
const logIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('AAAAAAAAAAAAAAAAAAaa');
    try {
        res.send({ token: tokenGenerator(req.user) });
    }
    catch (error) {
        console.log(error);
    }
});
module.exports = { signUp, logIn };
