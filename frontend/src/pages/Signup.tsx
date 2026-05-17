import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  // Password Strength Checker
  const checkPasswordStrength = (pass: string) => {
    let score = 0
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' }
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500 shadow-[0_0_8px_#ef4444]' }
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' }
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' }
    return { score: 100, label: 'Strong', color: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' }
  }

  const strength = checkPasswordStrength(password)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }

    const hasUppercase = /[A-Z]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!hasUppercase) {
      setError('Password must contain at least one uppercase letter.')
      return
    }
    if (!hasSymbol) {
      setError('Password must contain at least one symbol (!@#$%^&* etc.).')
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
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat py-12 px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 12, 12, 0.82), rgba(12, 12, 12, 0.82)), url('/img/website/loginbg.jpg')`
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
      <div className="login-bg-glow login-bg-glow--1" />
      <div className="login-bg-glow login-bg-glow--2" />

      {/* Signup Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <span className="font-black text-3xl tracking-wider text-accent">Reader's Haven</span>
        </Link>

        {/* Form Container */}
        <div className="signup-card bg-card/85 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/40">
          <h1 className="text-2xl font-black text-center mb-1 tracking-tight text-white">Create Account</h1>
          <p className="text-muted text-sm text-center mb-7">Join the community and start reading today</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="text-sm font-semibold text-gray-300">Username</label>
              <div className="relative mt-1">
                <i className="fa-regular fa-user absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-sm font-semibold text-gray-300">Email Address</label>
              <div className="relative mt-1">
                <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Password with Strength Indicator */}
            <div>
              <label className="text-sm font-semibold text-gray-300">Password</label>
              <div className="relative mt-1">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              
              {/* Strength Indicator Widget */}
              {password && (
                <div className="mt-2.5 flex flex-col gap-1.5 animate-fade-in">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted">Strength:</span>
                    <span className={
                      strength.label === 'Weak' ? 'text-red-400' :
                      strength.label === 'Fair' ? 'text-amber-400' :
                      strength.label === 'Good' ? 'text-blue-400' : 'text-emerald-400'
                    }>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  
                  {/* Requirements List checklist */}
                  <div className="flex flex-col gap-1 mt-1 text-[10px] text-muted font-semibold">
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${password.length >= 8 ? 'fa-circle-check text-emerald-400' : 'fa-circle text-white/10'}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${/[A-Z]/.test(password) ? 'fa-circle-check text-emerald-400' : 'fa-circle text-white/10'}`} />
                      <span>At least 1 uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className={`fa-solid ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'fa-circle-check text-emerald-400' : 'fa-circle text-white/10'}`} />
                      <span>At least 1 symbol (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-300">Confirm Password</label>
              <div className="relative mt-1">
                <i className="fa-solid fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn w-full bg-accent hover:bg-pink-500 text-dark font-black py-3.5 rounded-xl text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 mt-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accent/20"
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
