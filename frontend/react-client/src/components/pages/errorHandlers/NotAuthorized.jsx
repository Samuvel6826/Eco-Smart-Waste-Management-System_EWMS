import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Collapse,
    TextField,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HomeIcon from '@mui/icons-material/Home';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const NotAuthorized = () => {
    const [expanded, setExpanded] = useState(false);
    const [email, setEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleExpand = () => {
        setExpanded(!expanded);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Here you would typically send the email to your backend
        console.log('Support request sent for:', email);
        setSnackbarOpen(true);
        setEmail('');
        setExpanded(false);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

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
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: 2 }}>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        color="primary"
                        startIcon={<HomeIcon />}
                    >
                        Go to Home
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ContactSupportIcon />}
                        onClick={handleExpand}
                        endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                    >
                        Request Access
                    </Button>
                </Box>
                <Collapse in={expanded}>
                    <Paper elevation={0} variant="outlined" sx={{ mt: 4, p: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom>
                            Request Access
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Your Email"
                                variant="outlined"
                                value={email}
                                onChange={handleEmailChange}
                                type="email"
                                required
                                sx={{ mb: 2 }}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                Submit Request
                            </Button>
                        </form>
                    </Paper>
                </Collapse>
            </Paper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Access request submitted successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default NotAuthorized;