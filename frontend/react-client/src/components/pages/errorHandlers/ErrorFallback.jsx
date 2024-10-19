import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Collapse,
    IconButton,
    Snackbar,
    Container,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Home as HomeIcon,
    ExpandMore as ExpandMoreIcon,
    ContentCopy as ContentCopyIcon
} from '@mui/icons-material';

const ErrorFallback = ({ error }) => {
    const [expanded, setExpanded] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    p: 3,
                    textAlign: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Typography variant="h4" color="error" gutterBottom>
                        Oops! Something Went Wrong
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        We apologize, but an unexpected error has occurred. Our team has been notified and is working on a fix.
                    </Typography>
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<HomeIcon />}
                            component={Link}
                            to="/dashboard"
                        >
                            Go to Homepage
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                        >
                            Refresh Page
                        </Button>
                    </Box>
                    <Box sx={{ mt: 3, width: '100%' }}>
                        <Button
                            onClick={handleExpand}
                            endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                        >
                            {expanded ? 'Hide' : 'Show'} Technical Details
                        </Button>
                        <Collapse in={expanded}>
                            <Paper elevation={0} variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {error?.toString() || 'Unknown error'}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <IconButton onClick={handleCopyError} size="small" aria-label="copy error details">
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Paper>
                        </Collapse>
                    </Box>
                </Paper>
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message="Error details copied to clipboard"
            />
        </Container>
    );
}

export default ErrorFallback;