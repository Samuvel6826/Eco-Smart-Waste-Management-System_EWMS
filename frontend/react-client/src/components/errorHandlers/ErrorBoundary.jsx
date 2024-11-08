import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null,
        errorInfo: null,
        copied: false,
        timestamp: null,
    };

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            timestamp: dayjs().format('DD/MM/YYYY, hh:mm:ss A'),
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        // Consider adding error logging here (e.g., to an external monitoring service)
    }

    copyErrorDetails = async () => {
        try {
            const errorText = `
Application Error Report
-----------------------
Timestamp: ${this.state.timestamp}
Error: ${this.state.error?.toString()}
Stack: ${this.state.errorInfo?.componentStack || 'No stack trace available'}

Please include this information when reporting the issue.
            `.trim();

            await navigator.clipboard.writeText(errorText);
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        } catch (err) {
            console.error('Failed to copy error details:', err);
        }
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
                {/* Top Bar */}
                <header className="border-b border-red-100 bg-red-50 px-4 py-3">
                    <div className="mx-auto flex max-w-6xl items-center justify-between">
                        <div className="flex items-center gap-2 text-red-700">
                            <span className="sr-only">Error Indicator</span>
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium">Error Status</span>
                        </div>
                        <div className="text-sm text-red-600">{this.state.timestamp}</div>
                    </div>
                </header>

                {/* Error Content */}
                <main className="mx-auto max-w-6xl px-4 py-6">
                    {/* Error Message Section */}
                    <div className="text-center">
                        <h1 className="mb-4 text-3xl font-bold text-gray-900">An Unexpected Error Occurred</h1>
                        <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
                            You can try refreshing or returning to the dashboard. The issue has been noted for further review.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                                aria-label="Refresh the page"
                            >
                                <span className="mr-2 rotate-90">↻</span> Refresh Page
                            </button>
                            <button
                                onClick={() => (window.location.href = '/dashboard')}
                                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                                aria-label="Return to the dashboard"
                            >
                                <span className="mr-2">←</span> Return to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Technical Details Section */}
                    <section className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
                        <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">Technical Details</h2>
                            <button
                                onClick={this.copyErrorDetails}
                                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none"
                                aria-label="Copy error details to clipboard"
                            >
                                {this.state.copied ? (
                                    <span className="flex items-center gap-2 text-green-600">
                                        ✓ Copied to Clipboard
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        📋 Copy Error Details
                                    </span>
                                )}
                            </button>
                        </header>

                        {/* Error Message and Stack Trace */}
                        <div className="divide-y divide-gray-200">
                            <div className="px-6 py-4">
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Error Message</h3>
                                <div className="font-mono rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-red-800">
                                    {this.state.error?.toString() || 'Unknown Error'}
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Stack Trace</h3>
                                <pre className="font-mono max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-red-800">
                                    {this.state.errorInfo?.componentStack || 'No stack trace available'}
                                </pre>
                            </div>
                        </div>
                    </section>

                    {/* Support Information */}
                    <footer className="mt-8 text-center text-gray-600">
                        <p>Need assistance? Reach us at <a href="mailto:support@example.com" className="text-blue-600">support@example.com</a></p>
                    </footer>
                </main>
            </div>
        );
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;