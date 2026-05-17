import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center relative overflow-hidden px-4 text-center py-20">
      {/* Background Glowing Ambiences */}
      <div className="login-bg-glow login-bg-glow--1" />
      <div className="login-bg-glow login-bg-glow--2" />

      {/* Content Container */}
      <div className="relative z-10 max-w-lg bg-card/45 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gray-800/40 shadow-2xl flex flex-col items-center gap-6">
        {/* Animated Icon */}
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-4xl text-accent shadow-lg shadow-accent/5 animate-pulse">
          <i className="fa-solid fa-ghost" />
        </div>

        {/* 404 Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-pink-500 tracking-tighter leading-none">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-sm">
            Oops! The page you are looking for has wandered off into another dimension or never existed at all.
          </p>
        </div>

        {/* Home Redirect Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-black px-8 py-3.5 rounded-xl text-xs tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-accent/20"
        >
          <i className="fa-solid fa-house" />
          <span>RETURN TO HOME</span>
        </Link>
      </div>
    </div>
  )
}
