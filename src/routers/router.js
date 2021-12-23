import { Router } from 'express'

const Authentication = require('../controllers/authController')
const passport = require('passport')

const router = Router()

const requireAuth = passport.authenticate('jwt', { session: false })
const requireSignin = passport.authenticate('local', { session: false })

router.post('/signup', Authentication.signUp)
router.post('/signin', requireSignin, Authentication.logIn)

export default router
