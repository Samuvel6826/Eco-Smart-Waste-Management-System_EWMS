import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Collapse,
    Typography,
    IconButton,
    Snackbar
} from '@material-tailwind/react';

import { IoMdRefresh } from "react-icons/io";
import { IoMdHome } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { FaClipboard } from "react-icons/fa";

const ErrorFallback = ({ error }) => {
    const [expanded, setExpanded] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    const handleCopyError = () => {
        navigator.clipboard.writeText(error?.toString() || 'Unknown error')
            .then(() => setSnackbarOpen(true))
            .catch(console.error);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <Typography variant="h4" color="red" className="mb-4">
                    Oops! Something Went Wrong
                </Typography>
                <Typography variant="body1" className="mb-4 text-gray-600">
                    We apologize, but an unexpected error has occurred. Our team has been notified and is working on a fix.
                </Typography>
                <div className="mt-4 flex w-full flex-col gap-4 sm:flex-row">
                    <Button
                        color="blue"
                        variant="filled"
                        className="flex-1"
                        onClick={() => navigate('/dashboard')}
                        startIcon={<IoMdHome className="h-5 w-5" />}
                    >
                        Go to Homepage
                    </Button>
                    <Button
                        color="gray"
                        variant="outlined"
                        className="flex-1"
                        onClick={handleRefresh}
                        startIcon={<IoMdRefresh className="h-5 w-5" />}
                    >
                        Refresh Page
                    </Button>
                </div>
                <div className="mt-4">
                    <Button
                        onClick={handleExpand}
                        endIcon={
                            <IoIosArrowDown
                                className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : 'rotate-0'}`}
                            />
                        }
                        variant="text"
                    >
                        {expanded ? 'Hide' : 'Show'} Technical Details
                    </Button>
                    <Collapse open={expanded}>
                        <div className="mt-2 rounded-md bg-gray-100 p-4 text-left">
                            <Typography variant="body2" component="pre" className="whitespace-pre-wrap break-words">
                                {error?.toString() || 'Unknown error'}
                            </Typography>
                            <div className="mt-2 flex justify-end">
                                <IconButton onClick={handleCopyError} size="small" aria-label="copy error details">
                                    <FaClipboard className="h-5 w-5" />
                                </IconButton>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message="Error details copied to clipboard"
            />
        </div>
    );
};

export default ErrorFallback;