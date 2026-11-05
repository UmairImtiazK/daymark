import cors from 'cors'
import express from 'express'
import session from 'express-session'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import requireAuth from './middleware/requireAuth.js'
import verifyOrigin from './middleware/verifyOrigin.js'

const app = express()
const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be set to a random value of at least 32 characters')
}

app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10kb' }))
app.use(session({
  name: 'daymark.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60,
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  },
}))
app.use(verifyOrigin)

app.get('/api/health', (_req, res) => {
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  const healthy = database === 'connected'
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'error', database })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', requireAuth, taskRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' })
  }

  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
