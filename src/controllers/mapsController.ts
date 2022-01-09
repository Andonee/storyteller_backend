import { Request, Response } from 'express'
import {
	IBodyMapProps,
	IBodyPlaceProps,
} from '../interfaces/controller.interface'

const pool = require('../utils/pool')

const getMaps = async (req: Request, res: Response) => {
	const { userID } = req.params

	try {
		const allMaps = await pool.query('SELECT * FROM maps WHERE user_id = $1;', [
			userID,
		])

		res.send(allMaps)
	} catch (error) {
		res.send({ errorMessage: 'Something went very wrong and I am sad', error })
	}
}

const getMap = async (req: Request, res: Response) => {
	const { userID, mapID } = req.params

	try {
		const userMap = await pool.query(
			'SELECT * FROM maps where user_id = $1 AND id = $2;',
			[userID, mapID]
		)

		const mapSettings = await pool.query(
			`SELECT * FROM map_settings WHERE map_id = $1;`,
			[mapID]
		)

		const map = { ...userMap.rows[0], ...mapSettings.rows[0] }

		res.send(map)
	} catch (error) {
		res.send({
			errorMessage: 'Could not fetch a map, some error occured',
			error,
		})
	}
}

const createMap = async (req: Request, res: Response) => {
	const { userID } = req.params

	try {
		const newMap = await pool.query(
			'INSERT INTO maps (user_id) VALUES ($1) RETURNING id;',
			[userID]
		)

		console.log('newMap', newMap.rows[0].id)

		const newMapID = newMap.rows[0].id

		const newMapSettings = await pool.query(
			`
		INSERT INTO map_settings
		(map_id) VALUES ($1)`,
			[newMapID]
		)

		res.send({ message: 'New map created' })
	} catch (error) {
		res.send({ errorMessage: 'Could not create a new map', error })
	}
}

const removeMap = async (req: Request, res: Response) => {
	const { userID, mapID } = req.params

	try {
		const removedMap = await pool.query(
			'DELETE FROM maps WHERE user_id = $1 AND id = $2 RETURNING *;',
			[userID, mapID]
		)

		if (!removedMap.rows.length) {
			return res.send({ errorMessage: 'There is nothing to remove' })
		}

		console.log('DELETING')
		res.send(removedMap)
	} catch (error) {
		res.send({ errorMessage: 'Could not remove the map', error })
	}
}

const updateMap = async (req: Request, res: Response) => {
	const { mapID } = req.params
	const body: IBodyMapProps = req.body
	console.log(req.body)
	console.log('mapID', mapID)

	const { title, description, font, panel_color, icons, panel_position } = body

	console.log(title)

	try {
		const updatedMap = await pool.query(
			`UPDATE map_settings SET
			 title = $1,
			 description = $2,
			 font= $3,
			 panel_color= $4,
			 icons= $5,
			 panel_position= $6
			 WHERE map_id = $7 RETURNING *;`,
			[title, description, font, panel_color, icons, panel_position, mapID]
		)
		res.send(updatedMap)
	} catch (error: any) {
		console.log(error)
		res.send({ errorMessage: 'Could not updated the map', error })
	}
}

const createPlace = async (req: Request, res: Response) => {
	const { mapID } = req.params
	const body: IBodyPlaceProps = req.body

	const { map_id, place, description, photos, video, link, coords, type } = body

	try {
		const newPlace = await pool.query(
			`INSERT INTO places (map_id, place, description, photos, video, link) 
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id;`,
			[map_id, place, description, photos, video, link, mapID]
		)

		let newPlaceCoords

		if (type === 'point') {
			newPlaceCoords = await pool.query(
				`INSERT INTO point_place (place_id, coords)
				VALUES ($1, $2)
				`,
				[newPlace, coords]
			)
		} else {
			newPlaceCoords = await pool.query(
				`INSERT INTO line_place (place_id, coords)
				VALUES ($1, $2)`,
				[newPlace, coords]
			)
		}

		res.send('New place created')
	} catch (error) {
		res.send({ errorMessage: 'Could not create a new place', error })
	}
}

module.exports = {
	getMaps,
	getMap,
	createMap,
	removeMap,
	updateMap,
	createPlace,
}
