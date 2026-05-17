import React from 'react'


interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center bg-darker p-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
            <i className="fa-solid fa-circle-exclamation text-4xl text-rose-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Something went wrong</h1>
            <p className="text-muted mb-2">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <p className="text-rose-400 text-sm font-mono bg-black/50 p-4 rounded-lg mt-4 max-w-lg mx-auto overflow-auto">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm transition-all"
            >
              <i className="fa-solid fa-rotate-left" />
              Refresh Page
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-card hover:bg-gray-800 text-muted font-bold px-6 py-3 rounded-xl text-sm transition-all border border-gray-700"
            >
              <i className="fa-solid fa-house" />
              Go Home
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
