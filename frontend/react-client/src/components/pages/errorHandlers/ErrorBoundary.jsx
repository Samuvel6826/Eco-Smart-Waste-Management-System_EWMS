import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            copied: false,
            showDetails: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by error boundary:', error, errorInfo);
        this.setState({ error, errorInfo });

        // Log error to an error tracking service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleCopy = () => {
        const errorDetails = `${this.state.error.toString()}\n${this.state.errorInfo.componentStack}`;
        navigator.clipboard.writeText(errorDetails).then(() => {
            this.setState({ copied: true });
            toast.success('Error details copied to clipboard');
            setTimeout(() => this.setState({ copied: false }), 2000);
        });
    };

    toggleDetails = () => {
        this.setState(prevState => ({ showDetails: !prevState.showDetails }));
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 text-gray-800">
                    <div className="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-2xl">
                        <div className="mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto h-20 w-20 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-4 text-3xl font-bold text-gray-800">Oops! Something went wrong</h1>
                        <p className="mb-6 text-gray-600">
                            We apologize for the inconvenience. Our team has been notified and is working on a fix.
                        </p>
                        {this.state.showDetails && (
                            <div className="mb-6">
                                <div className="rounded-md bg-gray-100 p-4 text-left">
                                    <h3 className="mb-2 font-semibold">Technical Details</h3>
                                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-left text-sm text-gray-700">
                                        {this.state.error && this.state.error.toString()}
                                        <br />
                                        {this.state.errorInfo ? this.state.errorInfo.componentStack : 'No additional details'}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="mb-6 flex justify-center space-x-4">
                            <button
                                onClick={this.toggleDetails}
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 shadow-md transition hover:bg-gray-300"
                            >
                                {this.state.showDetails ? 'Hide Details' : 'Show Details'}
                            </button>
                            <button
                                onClick={this.handleCopy}
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 shadow-md transition hover:bg-gray-300"
                            >
                                {this.state.copied ? 'Copied!' : 'Copy Error Details'}
                            </button>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={this.handleReload}
                                className="rounded-md bg-blue-500 px-6 py-2 text-white shadow-md transition hover:bg-blue-600"
                            >
                                Reload Page
                            </button>
                            <a
                                href="/dashboard"
                                className="rounded-md bg-gray-200 px-6 py-2 text-gray-700 shadow-md transition hover:bg-gray-300"
                            >
                                Go to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;