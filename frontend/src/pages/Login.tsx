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

  // 3-Step Forgot Password States
  const [forgotStep, setForgotStep] = useState<'none' | 'email' | 'code' | 'reset'>('none')
  const [forgotEmail, setForgotEmail] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')

  // Password Strength Checker for new password in forgot flow
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

  const strength = checkPasswordStrength(newPassword)

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

  // ─── FORGOT PASSWORD RENDER OVERLAYS ───
  if (forgotStep !== 'none') {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat py-12 px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 12, 12, 0.82), rgba(12, 12, 12, 0.82)), url('/img/website/loginbg.jpg')`
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setForgotStep('none')}
          className="fixed top-6 left-6 md:top-10 md:left-10 z-50 flex items-center gap-3 text-accent font-bold transition-all duration-300 group cursor-pointer"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 backdrop-blur-md border border-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-[0_0_20px_rgba(214,51,108,0.15)]">
            <i className="fa-solid fa-arrow-left" />
          </div>
          <span className="hidden sm:block tracking-wide">Back to Login</span>
        </button>

        {/* Background Ambient Glows */}
        <div className="login-bg-glow login-bg-glow--1" />
        <div className="login-bg-glow login-bg-glow--2" />

        {/* Modal Card */}
        <div className="w-full max-w-md relative z-10">
          <div className="login-card bg-card/85 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/40 relative">
            {/* Close Button */}
            <button
              onClick={() => setForgotStep('none')}
              className="absolute top-4 right-4 text-muted hover:text-accent transition-colors text-lg cursor-pointer"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>

            {/* Error & Success Messages */}
            {forgotError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation" />
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="bg-accent/10 border border-accent/30 text-accent px-4 py-3 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2 backdrop-blur-md">
                <i className="fa-solid fa-circle-check" />
                {forgotSuccess}
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 'email' && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <i className="fa-solid fa-envelope-open-text text-accent" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white">Forgot Password</h2>
                </div>
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  Enter the email linked to your account. We'll send you a 6-digit verification code.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setForgotError('')
                    setForgotSuccess('')

                    if (!forgotEmail.trim()) {
                      setForgotError('Please enter a valid email address.')
                      return
                    }

                    const stored = localStorage.getItem('rh_user')
                    if (stored) {
                      const userData = JSON.parse(stored)
                      if (forgotEmail.trim().toLowerCase() !== userData.email) {
                        setForgotError('No account found with this email.')
                        return
                      }
                    } else {
                      setForgotError('No account found. Please sign up first.')
                      return
                    }

                    const mockCode = Math.floor(100000 + Math.random() * 900000).toString()
                    localStorage.setItem('rh_reset_code', mockCode)
                    localStorage.setItem('rh_reset_email', forgotEmail.trim().toLowerCase())

                    setForgotSuccess(`Verification code sent! (Security Code: ${mockCode})`)

                    setTimeout(() => {
                      setForgotStep('code')
                      setForgotSuccess('')
                    }, 2500)
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Email Address</label>
                    <div className="relative">
                      <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-btn w-full bg-accent hover:bg-pink-500 text-dark font-black py-3 rounded-xl text-sm tracking-wide transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accent/20"
                  >
                    SEND CODE
                  </button>

                  <div className="flex items-center gap-4 my-2">
                    <div className="flex-grow h-px bg-gray-700/50 border-gray-800" />
                    <span className="text-xs text-muted font-medium tracking-wider">OR</span>
                    <div className="flex-grow h-px bg-gray-700/50 border-gray-800" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setForgotStep('none')}
                    className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-surface/40 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left mr-2 text-xs" /> Back to Login
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: Verify Code */}
            {forgotStep === 'code' && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <i className="fa-solid fa-shield-halved text-accent" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white">Verification Code</h2>
                </div>
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  Please check your email for a 6-digit verification code and enter it below.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setForgotError('')
                    setForgotSuccess('')

                    const storedCode = localStorage.getItem('rh_reset_code')
                    if (!verifyCode.trim()) {
                      setForgotError('Please enter the 6-digit code.')
                      return
                    }

                    if (verifyCode.trim() !== storedCode) {
                      setForgotError('Invalid code. Please check and try again.')
                      return
                    }

                    setForgotSuccess('Code verified successfully!')

                    setTimeout(() => {
                      setForgotStep('reset')
                      setForgotSuccess('')
                    }, 1200)
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">6-Digit Code</label>
                    <div className="relative">
                      <i className="fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                      <input
                        type="text"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                        className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20 tracking-[0.3em] text-center font-mono text-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-btn w-full bg-accent hover:bg-pink-500 text-dark font-black py-3 rounded-xl text-sm tracking-wide transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accent/20"
                  >
                    VERIFY CODE
                  </button>

                  <div className="flex items-center gap-4 my-2">
                    <div className="flex-grow h-px bg-gray-700/50 border-gray-800" />
                    <span className="text-xs text-muted font-medium tracking-wider">OR</span>
                    <div className="flex-grow h-px bg-gray-700/50 border-gray-800" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-surface/40 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left mr-2 text-xs" /> Go Back
                  </button>
                </form>
              </>
            )}

            {/* STEP 3: Change Password */}
            {forgotStep === 'reset' && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <i className="fa-solid fa-key text-accent" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white">Change Password</h2>
                </div>
                <p className="text-muted text-sm mb-6 leading-relaxed">
                  Fill in your new password below. Make sure it's strong and memorable.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setForgotError('')
                    setForgotSuccess('')

                    const hasUppercase = /[A-Z]/.test(newPassword)
                    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

                    if (newPassword.length < 8) {
                      setForgotError('Password must be at least 8 characters.')
                      return
                    }
                    if (!hasUppercase) {
                      setForgotError('Password must contain at least one uppercase letter.')
                      return
                    }
                    if (!hasSymbol) {
                      setForgotError('Password must contain at least one symbol (!@#$%^&* etc.).')
                      return
                    }

                    if (newPassword !== confirmNewPassword) {
                      setForgotError('Passwords do not match.')
                      return
                    }

                    const stored = localStorage.getItem('rh_user')
                    if (stored) {
                      const userData = JSON.parse(stored)
                      userData.password = newPassword
                      localStorage.setItem('rh_user', JSON.stringify(userData))
                    }

                    localStorage.removeItem('rh_reset_code')
                    localStorage.removeItem('rh_reset_email')

                    setForgotSuccess('Password reset successfully! Redirecting to Login...')

                    setTimeout(() => {
                      setForgotStep('none')
                      setForgotSuccess('')
                      setForgotEmail('')
                      setVerifyCode('')
                      setNewPassword('')
                      setConfirmNewPassword('')
                    }, 2000)
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">New Password</label>
                    <div className="relative">
                      <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </div>

                    {/* Strength Indicator Widget */}
                    {newPassword && (
                      <div className="mt-2 flex flex-col gap-1.5 animate-fade-in">
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
                            <i className={`fa-solid ${newPassword.length >= 8 ? 'fa-circle-check text-emerald-400' : 'fa-circle text-white/10'}`} />
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <i className={`fa-solid ${/[A-Z]/.test(newPassword) ? 'fa-circle-check text-emerald-400' : 'fa-circle text-white/10'}`} />
                            <span>At least 1 uppercase letter</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <i className={`fa-solid ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'fa-circle-check text-emerald-400' : 'fa-circle text-white/10'}`} />
                            <span>At least 1 symbol (!@#$%^&*...)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-300">Confirm New Password</label>
                    <div className="relative">
                      <i className="fa-solid fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-accent focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-btn w-full bg-accent hover:bg-pink-500 text-dark font-black py-3 rounded-xl text-sm tracking-wide transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accent/20"
                  >
                    RESET PASSWORD
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── NORMAL LOGIN CARD RENDER ───
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

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <span className="font-black text-3xl tracking-wider text-accent">Reader's Haven</span>
        </Link>

        {/* Form Container */}
        <div className="login-card bg-card/85 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/40">
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

            {/* Remember / Forgot Password */}
            <div className="flex justify-between items-center -mt-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded bg-surface border-gray-700 text-accent focus:ring-accent/30 cursor-pointer" />
                <span className="text-sm text-muted group-hover:text-white transition-colors">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => {
                  setForgotStep('email')
                  setError('')
                  setForgotError('')
                  setForgotSuccess('')
                }}
                className="text-sm text-accent hover:text-white transition-colors font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn w-full bg-accent hover:bg-pink-500 text-dark font-black py-3.5 rounded-xl text-sm tracking-wide transition-all duration-300 hover:shadow-[0_8px_24px_rgba(214,51,108,0.3)] cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accent/20"
            >
              LOG IN
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-grow h-px bg-gray-700/50 border-gray-800" />
            <span className="text-xs text-muted font-medium tracking-wider">OR</span>
            <div className="flex-grow h-px bg-gray-700/50 border-gray-800" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              className="social-btn flex-1 flex items-center justify-center gap-2 bg-[#2A2A2A] hover:bg-gray-800 border border-gray-700/40 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-300 cursor-pointer"
            >
              <i className="fa-brands fa-google text-red-400" /> Google
            </button>
            <button
              type="button"
              className="social-btn flex-1 flex items-center justify-center gap-2 bg-[#2A2A2A] hover:bg-gray-800 border border-gray-700/40 rounded-xl py-2.5 text-sm font-semibold text-white transition-all duration-300 cursor-pointer"
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
