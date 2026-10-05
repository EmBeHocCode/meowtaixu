import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

export class SceneErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('Optional scene unavailable; HTML remains usable.', error, info);
  }

  render() {
    return this.state.failed
      ? <div data-scene-status="unavailable" />
      : this.props.children;
  }
}
