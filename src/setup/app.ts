// const express = require('express')
import express from 'express'
const morgan = require('morgan')
const cors = require('cors')
const passport = require('passport')
// const router = require('../routers/router')
import router from '../routers/router'
const initializePassport = require('../services/passport')

module.exports = () => {
	const app = express()

	initializePassport(passport)

	app.use(cors())

	app.use(morgan('combined'))

	app.use(express.json())

	app.use(passport.initialize())

	app.use('/api/v1/', router)

	return app
}
