const pg = require('pg')

class Pool {
	_pool: any = null

	connect(options: any) {
		this._pool = new pg.Pool(options)
		return this._pool.query('SELECT 1 + 1')
	}

	close() {
		return this._pool.end()
	}

	query(sql: any, params: any) {
		return this._pool.query(sql, params)
	}
}

module.exports = new Pool()
