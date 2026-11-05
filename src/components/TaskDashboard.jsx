import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api.js'
import '../dashboard.css'

function TaskDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiRequest('/tasks')
      .then((result) => {
        if (active) setTasks(result)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function addTask(event) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle || saving) return

    setSaving(true)
    setError('')
    try {
      const task = await apiRequest('/tasks', {
        method: 'POST',
        body: { title: cleanTitle },
      })
      setTasks((currentTasks) => [task, ...currentTasks])
      setTitle('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleTask(task) {
    setError('')
    try {
      const updatedTask = await apiRequest(`/tasks/${task._id}`, {
        method: 'PATCH',
        body: { completed: !task.completed },
      })
      setTasks((currentTasks) =>
        currentTasks.map((item) => item._id === updatedTask._id ? updatedTask : item),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteTask(taskId) {
    setError('')
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' })
      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <main className="todo-page">
      <header className="todo-header">
        <a className="todo-brand" href="/" aria-label="Daymark home">
          <span className="todo-brand-mark" aria-hidden="true">✓</span>
          <span>daymark</span>
        </a>
        <div className="account-menu">
          <span className="account-greeting">Hi, {user.name}</span>
          <button className="logout-button" type="button" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="todo-content">
        <span className="todo-kicker">YOUR SPACE, YOUR PACE</span>
        <h1>Make today count.</h1>
        <p className="todo-intro">One small step at a time. What would you like to get done?</p>

        <form className="add-task-form" onSubmit={addTask}>
          <input
            aria-label="New task"
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task to your day..."
            value={title}
          />
          <button disabled={!title.trim() || saving} type="submit">
            {saving ? 'Adding…' : 'Add task'}
          </button>
        </form>

        {error && <p className="todo-error" role="alert">{error}</p>}

        <div className="task-list-heading">
          <h2>Your tasks</h2>
          {!loading && (
            <span>{completedCount} of {tasks.length} complete</span>
          )}
        </div>

        {loading ? (
          <p className="task-empty">Loading your tasks…</p>
        ) : tasks.length ? (
          <ul className="todo-list">
            {tasks.map((task) => (
              <li className={task.completed ? 'todo-item is-complete' : 'todo-item'} key={task._id}>
                <button
                  aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
                  aria-pressed={task.completed}
                  className="todo-checkbox"
                  onClick={() => toggleTask(task)}
                  type="button"
                >
                  {task.completed ? '✓' : ''}
                </button>
                <span className="todo-title">{task.title}</span>
                <button
                  aria-label={`Delete ${task.title}`}
                  className="delete-task"
                  onClick={() => deleteTask(task._id)}
                  type="button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="task-empty">
            <span aria-hidden="true">✳</span>
            <p>No tasks yet. Add one small thing to get started.</p>
          </div>
        )}
      </section>
      <footer className="todo-footer">A little progress is still progress.</footer>
    </main>
  )
}

export default TaskDashboard
