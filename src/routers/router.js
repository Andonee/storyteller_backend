import { Router } from 'express'

const Authentication = require('../controllers/authController')
const Maps = require('../controllers/mapsController')
const passport = require('passport')

const router = Router()

const requireAuth = passport.authenticate('jwt', { session: false })
const requireSignin = passport.authenticate('local', { session: false })

router.post('/signup', Authentication.signUp)
router.post('/signin', requireSignin, Authentication.logIn)

router.get('/:userID/maps', requireAuth, Maps.getMaps)
router.get('/:userID/maps/:mapID', requireAuth, Maps.getMap)
router.post('/:userID/maps', requireAuth, Maps.createMap)
router.delete('/:userID/maps/:mapID', requireAuth, Maps.removeMap)
router.patch('/:userID/maps/:mapID', requireAuth, Maps.updateMap)

router.post('/userID/maps/:mapID', requireAuth, Maps.createPlace)

export default router
