import User from '../models/User.js'

export default async function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Please sign in to continue' })
  }

  const user = await User.findById(req.session.userId).select('_id name email')
  if (!user) {
    await new Promise((resolve, reject) => {
      req.session.destroy((error) => (error ? reject(error) : resolve()))
    })
    return res.status(401).json({ error: 'Please sign in to continue' })
  }

  req.user = user
  next()
}
