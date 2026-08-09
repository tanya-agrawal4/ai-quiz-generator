import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Detailed Error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-svh flex items-center justify-center p-6 bg-muted text-left">
          <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-surface p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-danger shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Something went wrong</h2>
                <p className="text-xs text-subtle">An unexpected error occurred in the component tree.</p>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs space-y-2">
              <p className="font-bold text-danger">Detailed Error:</p>
              <pre className="font-mono text-[11px] text-red-800 whitespace-pre-wrap break-all overflow-x-auto max-h-36">
                {this.state.error?.message || this.state.error?.toString() || 'Unknown error'}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:bg-muted transition"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
