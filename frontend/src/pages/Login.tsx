import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store'
import { api } from '../lib/api'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }

    const stored = localStorage.getItem('rh_user')
    if (stored) {
      const userData = JSON.parse(stored)
      if (email.toLowerCase() === userData.email && password === userData.password) {
        try {
          await api.post('/users', {
            id: userData.email,
            username: userData.username,
          })
        } catch (e) {
          console.error('Failed to sync profile to DB:', e)
        }

        login({ username: userData.username, token: userData.email })
        navigate('/')
        return
      }
    }
    setError('Invalid email or password.')
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat py-12 px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.92), rgba(18, 18, 18, 0.92)), url('/img/website/loginbg.jpg')`
      }}
    >
      {/* Back to Home Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 md:top-10 md:left-10 z-50 flex items-center gap-3 text-accent font-bold transition-all duration-300 group"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 backdrop-blur-md border border-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-[0_0_20px_rgba(214,51,108,0.15)]">
          <i className="fa-solid fa-arrow-left" />
        </div>
        <span className="hidden sm:block tracking-wide">Back to Home</span>
      </Link>

      {/* Background Ambient Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none z-0 animate-pulse" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <span className="font-black text-3xl tracking-wider text-accent">Reader's Haven</span>
        </Link>

        {/* Form Container */}
        <div className="bg-card/85 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/40">
          <h1 className="text-2xl font-black text-center mb-1 tracking-tight text-white">Welcome Back</h1>
          <p className="text-muted text-sm text-center mb-8">Log in to continue your reading journey</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_12px_rgba(214,51,108,0.1)]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-300">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:shadow-[0_0_12px_rgba(214,51,108,0.1)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-accent hover:bg-pink-500 text-dark font-bold py-3 rounded-xl text-sm tracking-wide transition-all duration-300 hover:shadow-[0_8px_24px_rgba(214,51,108,0.3)] cursor-pointer"
            >
              LOG IN
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-grow h-px bg-gray-700/50" />
            <span className="text-xs text-muted font-medium tracking-wider">OR</span>
            <div className="flex-grow h-px bg-gray-700/50" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-[#2A2A2A] hover:bg-gray-800 border border-gray-700/40 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-300"
            >
              <i className="fa-brands fa-google text-red-400" /> Google
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 bg-[#2A2A2A] hover:bg-gray-800 border border-gray-700/40 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-300"
            >
              <i className="fa-brands fa-facebook text-blue-400" /> Facebook
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent font-semibold hover:text-white transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
