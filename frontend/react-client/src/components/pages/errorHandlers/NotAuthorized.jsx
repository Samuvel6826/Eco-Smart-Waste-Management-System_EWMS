import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HomeIcon from '@mui/icons-material/Home';

const NotAuthorized = () => {
    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4, textAlign: 'center' }}>
                <LockOutlinedIcon sx={{ fontSize: 64, color: 'error.main' }} />
                <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                    Access Denied
                </Typography>
                <WarningAmberIcon sx={{ fontSize: 24, color: 'warning.main' }} />
                <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
                    You do not have permission to view this page. If you believe this is an error, please contact the administrator.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        component={Link}
                        to="/"
                        variant="contained"
                        color="primary"
                        startIcon={<HomeIcon />}
                    >
                        Go to Homepage
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default NotAuthorized;