import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, copied: false };
    }

    static getDerivedStateFromError(error) {
        // Update state to display fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Error caught by error boundary:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload(); // Reload the page
    };

    handleCopy = () => {
        const errorDetails = `${this.state.error.toString()}\n${this.state.errorInfo.componentStack}`;
        navigator.clipboard.writeText(errorDetails).then(() => {
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000); // Reset copied state after 2 seconds
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-gray-800">
                    <div className="max-w-lg rounded-lg bg-white p-8 text-center shadow-lg">
                        <div className="mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto h-16 w-16 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M12 18.5A1.5 1.5 0 1112 15a1.5 1.5 0 010 3.5z"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-4 text-2xl font-bold text-gray-800">Oops! Something went wrong.</h1>
                        <p className="mb-6 text-gray-600">
                            An unexpected error occurred. Please try again or go back to the dashboard.
                        </p>
                        <details className="mb-6 rounded-md bg-gray-100 p-4 text-left">
                            <summary className="font-semibold">Technical Details</summary>
                            <pre className="whitespace-pre-wrap text-left text-gray-700">
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo ? this.state.errorInfo.componentStack : 'No additional details'}
                            </pre>
                        </details>

                        <div className="mb-6 flex justify-center">
                            <button
                                onClick={this.handleCopy}
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 shadow-md transition hover:bg-gray-300"
                            >
                                {this.state.copied ? 'Copied!' : 'Copy Error Details'}
                            </button>
                        </div>

                        <div className="space-x-4">
                            <button
                                onClick={this.handleReload}
                                className="rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition hover:bg-blue-600"
                            >
                                Reload Page
                            </button>
                            <a
                                href="/dashboard"
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 shadow-md transition hover:bg-gray-300"
                            >
                                Go to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        // Render children if no error
        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;