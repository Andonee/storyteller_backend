const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const pool = require('../utils/pool')

const tokenGenerator = user => {
	console.log('aaaaaaaaaa', user)
	const timestamp = new Date().getTime()
	console.log(user)
	return jwt.sign({ sub: user[0].login, iat: timestamp }, config.secret, {
		expiresIn: '1h',
	})
}

const signUp = async (req, res, next) => {
	const login = req.body.login
	const password = req.body.password

	console.log('login', login, 'password', password)

	if (!login || !password)
		res.send({ error: 'You must provide login and password' })

	const loginExists = await pool.query(
		'SELECT * FROM users WHERE login = $1;',
		[login]
	)

	console.log(loginExists.rows)

	if (loginExists.rows.length > 0) {
		res.status(401).send({ error: 'Login aready exists' })
		return
	}

	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)

	try {
		const newUser = await pool.query(
			'INSERT INTO users (login, password) VALUES ($1, $2) RETURNING *;',
			[login, hashedPassword]
		)
		res.send({ token: tokenGenerator(newUser) })
	} catch (error) {
		res.send({ error: 'Something went wrong', error })
	}
}

const logIn = async (req, res) => {
	console.log('AAAAAAAAAAAAAAAAAAaa')
	try {
		res.send({ token: tokenGenerator(req.user) })
	} catch (error) {
		console.log(error)
	}
}

module.exports = { signUp, logIn }
