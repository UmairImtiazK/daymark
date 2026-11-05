const trustedOrigin = new URL(
  process.env.CLIENT_URL || 'http://localhost:5173',
).origin

export default function verifyOrigin(req, res, next) {
  const origin = req.get('origin')

  if (origin && origin !== trustedOrigin) {
    return res.status(403).json({ error: 'Request origin is not allowed' })
  }

  next()
}
