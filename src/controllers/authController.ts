import { Request, Response } from 'express'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
import config from '../config'
// import pool from '../utils/pool'
const pool = require('../utils/pool')
import {
	IAuthProps,
	IUserProps,
	ILogIn,
} from '../interfaces/controller.interface'

const tokenGenerator = (user: IUserProps[]) => {
	const timestamp = new Date().getTime()

	return jwt.sign({ sub: user[0].login, iat: timestamp }, config.secret, {
		expiresIn: '1h',
	})
}

const signUp = async (req: Request, res: Response) => {
	const body: IAuthProps = req.body
	const login = body.login
	const password = body.password

	if (!login || !password)
		res.send({ error: 'You must provide login and password' })

	const loginExists = await pool.query(
		'SELECT * FROM users WHERE login = $1;',
		[login]
	)

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
		res.send({ errorMessage: 'Something went wrong', error })
	}
}

const logIn = async (req: ILogIn, res: Response) => {
	try {
		res.send({ token: tokenGenerator(req.user) })
	} catch (error) {
		console.log(error)
	}
}

module.exports = { signUp, logIn }
