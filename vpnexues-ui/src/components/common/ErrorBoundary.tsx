import { Component, type ReactNode } from 'react';
import { en } from '../../i18n/translations/en';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '80px 20px',
            textAlign: 'center',
          }}
        >
          <h2>{en.common.somethingWentWrong}</h2>
          <p>{en.common.pleaseRefresh}</p>
          {this.state.message ? (
            <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7, wordBreak: 'break-word' }}>
              {this.state.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '8px 24px',
            }}
          >
            {en.common.refreshPage}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
