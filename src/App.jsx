import { useEffect, useState } from 'react'
import TaskDashboard from './components/TaskDashboard.jsx'
import { apiRequest } from './lib/api.js'
import './App.css'

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <rect x="3" y="3" width="26" height="26" rx="9" fill="currentColor" />
        <path
          d="m10 16.5 4 4 8-9"
          stroke="#17231E"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="m5 10 3.2 3.2L15.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function App() {
  const [page, setPage] = useState('welcome')
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    apiRequest('/auth/me')
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch((error) => {
        if (active && error.status !== 401) {
          setNotice(`Could not connect to the server: ${error.message}`)
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const openPage = (nextPage) => {
    setPage(nextPage)
    setNotice('')
    setShowPassword(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)
    const body = Object.fromEntries(formData.entries())
    setSubmitting(true)
    setNotice('')
    try {
      const endpoint = page === 'signup' ? '/auth/signup' : '/auth/login'
      const result = await apiRequest(endpoint, { method: 'POST', body })
      setUser(result.user)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
      setUser(null)
      openPage('welcome')
    } catch (error) {
      setNotice(error.message)
    }
  }

  if (authLoading) {
    return (
      <main className="auth-page">
        <p className="session-loading" role="status">Loading your space…</p>
      </main>
    )
  }

  if (user) {
    return <TaskDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <main className="auth-page">
      <section className="auth-layout" aria-label="Daymark account">
        <aside className="story-panel">
          <a className="brand" href="#" onClick={() => openPage('welcome')}>
            <BrandMark />
            <span>daymark</span>
          </a>

          <div className="story-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              A little more focus, every day
            </span>
            <h1>
              Make room for
              <br />
              what <span>matters.</span>
            </h1>
            <p>
              A calmer way to collect your thoughts, plan your day, and keep
              moving forward.
            </p>
          </div>

          <div className="preview-card" aria-label="Task list preview">
            <div className="preview-heading">
              <div>
                <span className="preview-label">YOUR DAY, IN VIEW</span>
                <h2>Today&apos;s focus</h2>
              </div>
              <span className="preview-date">MON, 04 NOV</span>
            </div>
            <div className="preview-progress">
              <span className="progress-track">
                <span />
              </span>
              <span>2 of 4 done</span>
            </div>
            <ul className="preview-tasks">
              <li className="task-done">
                <span className="task-check"><CheckIcon /></span>
                <span>Map out this week</span>
                <span className="task-tag">PERSONAL</span>
              </li>
              <li className="task-done">
                <span className="task-check"><CheckIcon /></span>
                <span>Send project update</span>
              </li>
              <li>
                <span className="task-check" />
                <span>Take a proper lunch break</span>
                <span className="task-tag task-tag-green">WELLBEING</span>
              </li>
              <li>
                <span className="task-check" />
                <span>Read for twenty minutes</span>
              </li>
            </ul>
            <div className="preview-footer">
              <span className="footer-sparkle">✳</span>
              Small steps still move you forward.
            </div>
          </div>

          <div className="story-footer">
            <span>LESS NOISE. MORE YOU.</span>
            <span>01 — 03</span>
          </div>
          <span className="decor decor-one" />
          <span className="decor decor-two" />
        </aside>

        <section className="form-panel">
          <div className="mobile-brand">
            <BrandMark />
            <span>daymark</span>
          </div>
          <div className="form-content">
            {page === 'welcome' ? (
              <div className="welcome-content">
                <span className="welcome-kicker">WELCOME TO A FRESH START</span>
                <h2>Your day, with a little more intention.</h2>
                <p className="form-intro">
                  Sign in to pick up where you left off, or create an account
                  and make today count.
                </p>
                <div className="welcome-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => openPage('signup')}
                  >
                    Create your account <span aria-hidden="true">→</span>
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => openPage('login')}
                  >
                    I already have an account
                  </button>
                </div>
                {notice && <p className="form-notice" role="status">{notice}</p>}
                <div className="privacy-note">
                  <span className="privacy-icon" aria-hidden="true">⌑</span>
                  Your plans are personal. Your space stays yours.
                </div>
              </div>
            ) : (
              <div className="auth-form-wrap">
                <button
                  className="back-link"
                  type="button"
                  onClick={() => openPage('welcome')}
                >
                  <span aria-hidden="true">←</span> Back
                </button>
                <span className="welcome-kicker">
                  {page === 'signup' ? 'START WITH A CLEAN SLATE' : 'WELCOME BACK'}
                </span>
                <h2>{page === 'signup' ? 'Create your account' : 'Good to see you again.'}</h2>
                <p className="form-intro">
                  {page === 'signup'
                    ? 'A few details and you’re on your way.'
                    : 'Sign in and get back to what matters.'}
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                  {page === 'signup' && (
                    <label className="field-label">
                      Your name
                      <input
                        autoComplete="name"
                        name="name"
                        placeholder="e.g. Alex Morgan"
                        required
                      />
                    </label>
                  )}
                  <label className="field-label">
                    Email address
                    <input
                      autoComplete="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                      type="email"
                    />
                  </label>
                  <label className="field-label">
                    Password
                    <span className="password-field">
                      <input
                        autoComplete={page === 'signup' ? 'new-password' : 'current-password'}
                        maxLength={72}
                        minLength={8}
                        name="password"
                        placeholder="At least 8 characters"
                        required
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </span>
                  </label>
                  {page === 'login' && (
                    <button
                      className="forgot-link"
                      type="button"
                      onClick={() => setNotice('Password reset is not set up yet. Contact the app owner if you need help.')}
                    >
                      Forgot password?
                    </button>
                  )}
                  <button className="primary-button submit-button" disabled={submitting} type="submit">
                    {submitting ? 'Please wait…' : page === 'signup' ? 'Create account' : 'Sign in'}
                    {!submitting && <span aria-hidden="true">→</span>}
                  </button>
                </form>

                {notice && <p className="form-notice" role="status">{notice}</p>}

                <p className="switch-form">
                  {page === 'signup' ? 'Already have an account?' : 'New to Daymark?'}{' '}
                  <button
                    type="button"
                    onClick={() => openPage(page === 'signup' ? 'login' : 'signup')}
                  >
                    {page === 'signup' ? 'Sign in' : 'Create an account'}
                  </button>
                </p>
              </div>
            )}
          </div>

          <footer className="form-footer">
            <span>© 2026 Daymark</span>
            <span>Made for your next small step.</span>
          </footer>
        </section>
      </section>
    </main>
  )
}

export default App
