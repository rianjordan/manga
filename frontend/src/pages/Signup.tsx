import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    const userData = { username, email: email.toLowerCase(), password }
    localStorage.setItem('rh_user', JSON.stringify(userData))
    navigate('/login')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <span className="font-black text-3xl tracking-wider text-accent">Reader's Haven</span>
        </Link>

        <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/40">
          <h1 className="text-2xl font-black text-center mb-1 tracking-tight">Create Account</h1>
          <p className="text-muted text-sm text-center mb-7">Join the community and start reading today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-300">Username</label>
              <div className="relative mt-1">
                <i className="fa-regular fa-user absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-surface border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">Email Address</label>
              <div className="relative mt-1">
                <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-surface border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">Password</label>
              <div className="relative mt-1">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-surface border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">Confirm Password</label>
              <div className="relative mt-1">
                <i className="fa-solid fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full bg-surface border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-pink-500 text-dark font-bold py-3 rounded-xl text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 mt-2"
            >
              CREATE ACCOUNT
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:text-white transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
