const passport = require('passport')
const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const pool = require('../utils/pool')

const initialize = passport => {
	const localOptions = {
		usernameField: 'login',
	}

	const localLogin = new LocalStrategy(
		localOptions,
		async (login, password, done) => {
			console.log('login', login)
			console.log('password', password)
			try {
				const user = await pool.query('SELECT * FROM users WHERE login = $1;', [
					login,
				])

				if (!user.rows.length > 0) {
					return done(null, false)
				}

				console.log('user', user.rows[0].password)

				const validPassword = await bcrypt.compare(
					password,
					user.rows[0].password
				)

				if (!validPassword) done(null, false)

				return done(null, user.rows)
			} catch (error) {
				return done(error)
			}
		}
	)

	const jwtOptions = {
		jwtFromRequest: ExtractJwt.fromHeader('authorization'),
		secretOrKey: config.secret,
	}

	const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
		console.log('LOLOLO')
		try {
			const user = await pool.query('SELECT * FROM users WHERE login = $1;', [
				payload.sub,
			])

			if (user.rows.length > 0) {
				done(null, user)
			} else {
				done(null, false)
			}
		} catch (error) {
			return done(error, false)
		}
	})

	passport.use(jwtLogin)
	passport.use(localLogin)
}

module.exports = initialize
