import 'dotenv/config'
import mongoose from 'mongoose'

const port = Number(process.env.PORT) || 5000
const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('MONGODB_URI is not set. Copy server/.env.example to server/.env and configure it.')
  process.exit(1)
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET must be set to a random value of at least 32 characters.')
  process.exit(1)
}

try {
  await mongoose.connect(mongoUri)
  const { default: app } = await import('./app.js')
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`)
  })
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message)
  process.exit(1)
}
