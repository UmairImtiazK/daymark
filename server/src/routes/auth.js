import { Router } from 'express'
import {
  getCurrentUser,
  login,
  logout,
  signup,
} from '../controllers/authController.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, getCurrentUser)

export default router
