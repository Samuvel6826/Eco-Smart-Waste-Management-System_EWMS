import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const ErrorPage = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                bgcolor: 'background.default',
                p: 3,
                textAlign: 'center',
            }}
        >
            <Typography variant="h4" color="error" gutterBottom>
                Something Went Wrong
            </Typography>
            <Typography variant="body1" gutterBottom>
                We're sorry, but an unexpected error has occurred. Please try again later.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/"
                sx={{ mt: 2 }}
            >
                Go to Homepage
            </Button>
        </Box>
    );
}

export default ErrorPage;