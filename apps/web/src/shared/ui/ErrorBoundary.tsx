import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  feature: string;
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** Per-feature error boundary (M4 quality bar): errors never dead-end the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[boundary:${this.props.feature}]`, error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="error-box" role="alert">
          <p>
            <strong>Something went wrong in {this.props.feature}.</strong>
          </p>
          <p className="small dim">Your progress is saved locally — nothing is lost.</p>
          <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
