import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Typography,
    Card,
    Collapse,
    Input,
    Snackbar,
    Alert
} from '@material-tailwind/react';
import {
    LockClosedIcon,
    ExclamationIcon,
    HomeIcon,
    ChevronDownIcon,
    InformationCircleIcon
} from '@heroicons/react/outline';

const NotAuthorized = () => {
    const [expanded, setExpanded] = useState(false);
    const [email, setEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Replace this with your backend request
        console.log('Support request sent for:', email);
        setSnackbarOpen(true);
        setEmail('');
        setExpanded(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
            <Card className="w-full max-w-md p-8 text-center shadow-lg">
                <LockClosedIcon className="mx-auto h-16 w-16 text-red-500" />
                <Typography variant="h4" className="mt-4 font-bold">
                    Access Denied
                </Typography>
                <ExclamationIcon className="mx-auto my-2 h-6 w-6 text-yellow-500" />
                <Typography variant="body1" className="mb-6 mt-4 text-gray-600">
                    You do not have permission to view this page. If you believe this is an error, please contact the administrator.
                </Typography>
                <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        color="blue"
                        onClick={() => navigate('/login')}
                        startIcon={<HomeIcon className="h-5 w-5" />}
                    >
                        Go to Home
                    </Button>
                    <Button
                        color="gray"
                        variant="outlined"
                        startIcon={<InformationCircleIcon className="h-5 w-5" />}
                        endIcon={
                            <ChevronDownIcon
                                className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : 'rotate-0'}`}
                            />
                        }
                        onClick={handleExpand}
                    >
                        Request Access
                    </Button>
                </div>
                <Collapse open={expanded}>
                    <div className="mt-4 rounded-md bg-gray-100 p-4 text-left">
                        <Typography variant="h6" className="font-semibold">
                            Request Access
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Your Email"
                                type="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                color="blue"
                                size="lg"
                                className="mb-4"
                            />
                            <Button type="submit" color="blue" className="w-full">
                                Submit Request
                            </Button>
                        </form>
                    </div>
                </Collapse>
            </Card>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    color="green"
                    onClose={handleSnackbarClose}
                    className="w-full text-center"
                >
                    Access request submitted successfully!
                </Alert>
            </Snackbar>
        </div>
    );
}

export default NotAuthorized;