import { Component, PropsWithChildren, ReactNode } from "react";
import { ErrorBoundary as WnaErrorFallback } from "@components/WnaApp";

type State = { error: Error | null };

export default class WnaErrorBoundary extends Component<
  PropsWithChildren,
  State
> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  retry = async (): Promise<void> => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (this.state.error) {
      return <WnaErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}
