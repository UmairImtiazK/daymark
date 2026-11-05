import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isObjectBody(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body)
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  }
}

function startUserSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error)
        return
      }

      req.session.userId = userId.toString()
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()))
    })
  })
}

export async function signup(req, res) {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: 'Please provide valid signup details' })
  }

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (!name || name.length > 80) {
    return res.status(400).json({ error: 'Name must be between 1 and 80 characters' })
  }
  if (!emailPattern.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Please provide a valid email address' })
  }
  if (password.length < 8 || password.length > 72 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Password must be 8–72 characters' })
  }

  const existingUser = await User.exists({ email })
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  let user
  try {
    user = await User.create({ name, email, passwordHash })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }
    throw error
  }

  await startUserSession(req, user._id)
  res.status(201).json({ user: publicUser(user) })
}

export async function login(req, res) {
  if (!isObjectBody(req.body)) {
    return res.status(400).json({ error: 'Please provide your email and password' })
  }

  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  if (
    !emailPattern.test(email) ||
    !password ||
    password.length > 72 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({ error: 'Please provide a valid email and password' })
  }

  const user = await User.findOne({ email }).select('+passwordHash')
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Email or password is incorrect' })
  }

  await startUserSession(req, user._id)
  res.json({ user: publicUser(user) })
}

export async function logout(req, res) {
  await new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()))
  })
  res.clearCookie('daymark.sid', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  res.status(204).end()
}

export function getCurrentUser(req, res) {
  res.json({ user: publicUser(req.user) })
}
