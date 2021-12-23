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
const passport = require('passport');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../src/pool');
const initialize = passport => {
    const localOptions = {
        usernameField: 'login',
    };
    const localLogin = new LocalStrategy(localOptions, (login, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('login', login);
        console.log('password', password);
        try {
            const user = yield pool.query('SELECT * FROM users WHERE login = $1;', [
                login,
            ]);
            if (!user.rows.length > 0) {
                return done(null, false);
            }
            console.log('user', user.rows[0].password);
            const validPassword = yield bcrypt.compare(password, user.rows[0].password);
            if (!validPassword)
                done(null, false);
            return done(null, user.rows);
        }
        catch (error) {
            return done(error);
        }
    }));
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: config.secret,
    };
    const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('LOLOLO');
        try {
            const user = yield pool.query('SELECT * FROM users WHERE login = $1;', [
                payload.sub,
            ]);
            if (user.rows.length > 0) {
                done(null, user);
            }
            else {
                done(null, false);
            }
        }
        catch (error) {
            return done(error, false);
        }
    }));
    passport.use(jwtLogin);
    passport.use(localLogin);
};
module.exports = initialize;
