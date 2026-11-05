import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="auth">
          <div className="auth__card">
            <h1>Щось пішло не так</h1>
            <p className="muted">Сталася непередбачена помилка інтерфейсу.</p>
            <button className="btn btn--primary" onClick={() => window.location.reload()}>Перезавантажити</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
