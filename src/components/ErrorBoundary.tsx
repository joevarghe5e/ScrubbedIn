import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-white">
          <div className="w-full max-w-sm text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <h1 className="text-lg font-bold text-[#1B2B6B] mb-1">Something went wrong</h1>
            <p className="text-sm text-[#4A5568] mb-6">
              ScrubbedIn ran into an unexpected error. Reloading usually fixes it.
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
              className="w-full py-2.5 bg-white border border-[#1B2B6B] hover:bg-[#EEF2FF] text-[#1B2B6B] font-semibold rounded transition-colors text-sm"
            >
              Reload ScrubbedIn
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
