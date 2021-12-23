const app = require('./setup/app')
const pool = require('./utils/pool')
require('dotenv').config()

const PORT = process.env.PORT || 5000

pool
	.connect({
		host: 'localhost',
		port: 5432,
		database: 'storyteller',
		user: process.env.pg_user,
		password: process.env.pg_password,
	})
	.then(() => {
		app().listen(PORT, () => {
			console.log(`Listening on port ${PORT}`)
		})
	})
	.catch((err: any) => console.log(err))
