import mongoose from 'mongoose'
import Task from '../models/Task.js'

const editableFields = ['title', 'description', 'dueDate', 'completed']

function isValidTaskInput(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return false
  }

  const keys = Object.keys(input)
  if (keys.some((key) => !editableFields.includes(key))) {
    return false
  }
  if (partial && keys.length === 0) {
    return false
  }
  if (!partial && (typeof input.title !== 'string' || !input.title.trim())) {
    return false
  }
  if (
    input.title !== undefined &&
    (typeof input.title !== 'string' || !input.title.trim() || input.title.trim().length > 120)
  ) {
    return false
  }
  if (input.description !== undefined && typeof input.description !== 'string') {
    return false
  }
  if (input.completed !== undefined && typeof input.completed !== 'boolean') {
    return false
  }
  if (
    input.dueDate !== undefined &&
    input.dueDate !== null &&
    (typeof input.dueDate !== 'string' || Number.isNaN(Date.parse(input.dueDate)))
  ) {
    return false
  }

  return true
}

export async function getTasks(req, res) {
  const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.json(tasks)
}

export async function createTask(req, res) {
  if (!isValidTaskInput(req.body)) {
    return res.status(400).json({ error: 'Provide a non-empty title and valid task fields' })
  }

  const task = await Task.create({ ...req.body, userId: req.user._id })
  res.status(201).json(task)
}

export async function updateTask(req, res) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: 'Invalid task ID' })
  }
  if (!isValidTaskInput(req.body, { partial: true })) {
    return res.status(400).json({ error: 'Provide valid task fields to update' })
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )

  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }

  res.json(task)
}

export async function deleteTask(req, res) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: 'Invalid task ID' })
  }

  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  })
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }

  res.status(204).end()
}
