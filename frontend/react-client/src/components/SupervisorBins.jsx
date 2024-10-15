import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './common/Navbar';
import Bin from './Bin';
import { useBinsContext } from '../contexts/BinsContext';
import { useAuth } from '../contexts/AuthContext';
import { useUsersContext } from '../contexts/UsersContext';
import {
    Button,
    Typography,
    Box,
    Grid,
    Paper,
    CircularProgress,
    Card,
    CardContent,
    Fade,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar,
    Container,
    Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SupervisorBins = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [selectedLocation, setSelectedLocation] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const { user } = useAuth();
    const { bins, loading, error, fetchBinsByLocation } = useBinsContext();
    const { fetchAssignedBinLocations } = useUsersContext();
    const [assignedLocations, setAssignedLocations] = useState([]);

    const fetchSupervisorData = useCallback(async () => {
        if (!user || !user.employeeId) {
            console.error('User or employeeId not available');
            return;
        }
        try {
            const locations = await fetchAssignedBinLocations(user.employeeId);
            setAssignedLocations(locations);
            if (locations.length > 0) {
                const storedLocation = localStorage.getItem('selectedUserLocation');
                const validLocation = storedLocation && locations.includes(storedLocation)
                    ? storedLocation
                    : locations[0];
                setSelectedLocation(validLocation);
                localStorage.setItem('selectedUserLocation', validLocation);
                await fetchBinsByLocation(validLocation);
            }
            toast.success('Supervisor data refreshed successfully!');
        } catch (error) {
            console.error('Failed to fetch supervisor data:', error);
            toast.error('Failed to fetch supervisor data. Please try again.');
        }
    }, [user, fetchAssignedBinLocations, fetchBinsByLocation]);

    useEffect(() => {
        fetchSupervisorData();
    }, [fetchSupervisorData, refreshKey]);

    const handleLocationClick = (location) => {
        setSelectedLocation(location);
        localStorage.setItem('selectedUserLocation', location);
        fetchBinsByLocation(location);
    };

    const binsForSelectedLocation = useMemo(() =>
        bins[selectedLocation] || [],
        [bins, selectedLocation]
    );

    const renderLoading = () => (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
            <Typography variant="h5" sx={{ ml: 2 }}>Loading bins...</Typography>
        </Box>
    );

    const renderError = () => (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
            <Typography variant="h5" color="error" gutterBottom>{error}</Typography>
            <Button variant="contained" color="primary" onClick={handleRefresh} startIcon={<RefreshIcon />}>
                Retry
            </Button>
        </Box>
    );

    const renderLocationsSummary = () => (
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Location Summary</Typography>
            <Grid container spacing={2}>
                {assignedLocations.map((location) => (
                    <Grid item key={location} xs={12} sm={6} md={4}>
                        <Card
                            variant="outlined"
                            sx={{
                                bgcolor: location === selectedLocation ? 'primary.light' : 'background.paper',
                                cursor: 'pointer',
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    transition: 'background-color 0.3s'
                                }
                            }}
                            onClick={() => handleLocationClick(location)}
                        >
                            <CardContent>
                                <Typography variant="subtitle1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOnIcon sx={{ mr: 1 }} />
                                    <strong>{location}</strong>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {(bins[location] || []).length} bins
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );

    const renderBinGrid = () => (
        <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
                {binsForSelectedLocation.length > 0 ? (
                    binsForSelectedLocation.map((binData) => (
                        <Grid item key={binData.id} xs={12} sm={6} md={4} lg={3}>
                            <Bin
                                locationId={selectedLocation}
                                binId={binData.id}
                                binData={binData}
                            />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography color="error" align="center">No bins found for this location.</Typography>
                    </Grid>
                )}
            </Grid>
        </Fade>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Navbar />
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Toolbar>
                    <Typography variant="h5" color="primary" sx={{ flexGrow: 1 }}>
                        Supervisor Bins Management
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {renderLocationsSummary()}

                <Divider sx={{ mb: 3 }} />

                {loading ? renderLoading() :
                    error ? renderError() :
                        selectedLocation ? renderBinGrid() :
                            <Typography color="primary" align="center">Please select a location to view bins.</Typography>}
            </Container>
        </Box>
    );
};

export default SupervisorBins;