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

		const places = await pool.query(`SELECT * FROM places WHERE map_id = $1;`, [
			mapID,
		])

		const placeID = places.rows.length > 0 && places.rows[0].id

		let pointPlaces = { rows: [] }
		let linePlaces = { rows: [] }
		let photos = { rows: [] }
		let videos = { rows: [] }
		let links = { rows: [] }

		if (placeID) {
			pointPlaces = await pool.query(
				`SELECT * FROM point_place WHERE place_id = $1 AND map_id = $2;`,
				[placeID, mapID]
			)
			linePlaces = await pool.query(
				`SELECT * FROM line_place WHERE place_id = $1 AND map_id = $2;`,
				[placeID, mapID]
			)
			photos = await pool.query(
				`SELECT * FROM photo WHERE place_id = $1 AND map_id = $2;`,
				[placeID, mapID]
			)
			videos = await pool.query(
				`SELECT * FROM video WHERE place_id = $1 AND map_id = $2;`,
				[placeID, mapID]
			)
			links = await pool.query(
				`SELECT * FROM link WHERE place_id = $1 AND map_id = $2;`,
				[placeID, mapID]
			)
		}

		const map = {
			...userMap.rows[0],
			...mapSettings.rows[0],
			places: places.rows[0] ? places.rows : [],
			points: pointPlaces.rows,
			lines: linePlaces.rows,
			photos: photos.rows,
			videos: videos.rows,
			links: links.rows,
		}

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

		const newMapID = newMap.rows[0].id

		await pool.query(
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
			'DELETE FROM maps WHERE user_id = $1 AND id = $2;',
			[userID, mapID]
		)

		res.send(removedMap)
	} catch (error) {
		res.send({ errorMessage: 'Could not remove the map', error })
	}
}

const updateMap = async (req: Request, res: Response) => {
	const { mapID } = req.params
	const body: IBodyMapProps = req.body

	const { title, description, font, panel_color, icons, panel_position } = body

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

	const { place, description, photo, video, link, coords, type } = body

	console.log(photo, video, link)

	try {
		const newPlace = await pool.query(
			`INSERT INTO places (map_id, place, description) 
			VALUES ($1, $2, $3)
			RETURNING id;`,
			[mapID, place, description]
		)

		const newPlaceID = newPlace.rows[0].id

		let newPlaceCoords

		if (video) {
			pool.query(
				`INSERT INTO video (place_id, map_id, link)
			VALUES ($1, $2, $3);`,
				[newPlaceID, mapID, video]
			)
		}

		if (link) {
			pool.query(
				`INSERT INTO link (place_id, map_id, link)
			VALUES ($1, $2, $3);`,
				[newPlaceID, mapID, link]
			)
		}

		if (photo) {
			pool.query(
				`INSERT INTO photo (place_id, map_id, link)
			VALUES ($1, $2, $3);`,
				[newPlaceID, mapID, photo]
			)
		}

		if (type === 'point') {
			newPlaceCoords = await pool.query(
				`INSERT INTO point_place (place_id, coords, map_id)
				VALUES ($1, $2, $3)
				`,
				[newPlaceID, coords, mapID]
			)
		} else {
			newPlaceCoords = await pool.query(
				`INSERT INTO line_place (place_id, coords, map_id)
				VALUES ($1, $2, $3)`,
				[newPlaceID, coords, mapID]
			)
		}

		res.send('New place created')
	} catch (error) {
		res.send({ errorMessage: 'Could not create a new place', error })
	}
}

const removePlace = async (req: Request, res: Response) => {
	const { mapID } = req.params
	interface IRemovePlace {
		place_id: number
	}

	const body: IRemovePlace = req.body

	try {
		await pool.query(`DELETE FROM places WHERE id = $1 AND map_id = $2`, [
			body.place_id,
			mapID,
		])
		res.send('Removed')
	} catch (error) {
		res.send({ errorMessage: 'Could not remove the place object', error })
	}
}

const updatePlace = async (req: Request, res: Response) => {
	const { mapID } = req.params
	const body: IBodyPlaceProps = req.body

	const { place, description, photo, video, link, place_id } = body

	console.log('place_id', place_id)
	console.log(place, description, mapID)
	try {
		const newPlace = await pool.query(
			`
			UPDATE places SET 
			place = $1,
		 	description = $2
			WHERE id = $3 AND map_id = $4
			RETURNING *;`,
			[place, description, place_id, mapID]
		)

		if (video) {
			await pool.query(
				`UPDATE video SET
				link = $1
				WHERE place_id = $2 AND map_id = $3;`,
				[video, place_id, mapID]
			)
		}

		if (link) {
			await pool.query(
				`UPDATE link SET
				link = $1
				WHERE place_id = $2 AND map_id = $3;`,
				[link, place_id, mapID]
			)
		}

		if (photo) {
			await pool.query(
				`UPDATE photo SET
				link = $1
				WHERE place_id = $2 AND map_id = $3;`,
				[photo, place_id, mapID]
			)
		}

		res.send('Place updated')
	} catch (error) {
		res.send({ errorMessage: 'Could not update the place', error })
	}
}

module.exports = {
	getMaps,
	getMap,
	createMap,
	removeMap,
	updateMap,
	createPlace,
	removePlace,
	updatePlace,
}
