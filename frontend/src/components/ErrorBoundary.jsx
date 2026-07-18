import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="state state--error" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h1 style={{ marginBottom: '0.75rem' }}>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Try a hard refresh (Cmd+Shift+R). If the problem persists, open the root URL with a trailing slash.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
