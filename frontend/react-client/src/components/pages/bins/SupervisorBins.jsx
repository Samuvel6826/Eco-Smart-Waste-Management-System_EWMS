import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Bin from './Bin';
import { useBinsContext } from '../../contexts/BinsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUsersContext } from '../../contexts/UsersContext';
import {
    Button,
    Typography,
    Box,
    Grid,
    CircularProgress,
    AppBar,
    Toolbar,
    Container,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Fade,
    Slide,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';

const SupervisorBins = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuth();
    const { bins, loading, error, fetchBinsByLocation } = useBinsContext();
    const { fetchAssignedBinLocations } = useUsersContext();
    const [selectedLocation, setSelectedLocation] = useState('');
    const [assignedLocations, setAssignedLocations] = useState([]);
    const [view, setView] = useState('grid');

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
            toast.success('Supervisor data refreshed successfully!', { icon: '✅' });
        } catch (error) {
            console.error('Failed to fetch supervisor data:', error);
            toast.error('Failed to fetch supervisor data. Please try again.');
        }
    }, [user, fetchAssignedBinLocations, fetchBinsByLocation]);

    useEffect(() => {
        fetchSupervisorData();
    }, [fetchSupervisorData]);

    const handleLocationChange = (newLocation) => {
        setSelectedLocation(newLocation);
        localStorage.setItem('selectedUserLocation', newLocation);
        fetchBinsByLocation(newLocation);
    };

    const binsForSelectedLocation = useMemo(() =>
        bins[selectedLocation] || {},
        [bins, selectedLocation]
    );

    const attentionNeededCount = useMemo(() => {
        return Object.values(binsForSelectedLocation).filter(bin =>
            bin.filledBinPercentage > 80 ||
            bin.binLidStatus?.toLowerCase() === 'open' ||
            bin.microProcessorStatus?.toLowerCase() === 'off' ||
            bin.sensorStatus?.toLowerCase() === 'off' ||
            bin.binActiveStatus?.toLowerCase() === 'inactive'
        ).length;
    }, [binsForSelectedLocation]);

    const renderLoading = () => (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress color="primary" />
        </Box>
    );

    const renderError = () => (
        <Slide direction="up" in={!!error}>
            <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: '#FFF4F4' }}>
                <Typography variant="h6" color="error" align="center">
                    {error || 'An error occurred. Please try again.'}
                </Typography>
            </Paper>
        </Slide>
    );

    const renderLocationDropdown = () => (
        <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
                labelId="location-select-label"
                id="location-select"
                value={selectedLocation}
                label="Location"
                onChange={(event) => handleLocationChange(event.target.value)}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 48 * 7 + 8,
                            width: 250,
                        },
                    },
                }}
            >
                {assignedLocations.map((location) => (
                    <MenuItem key={location} value={location}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOnIcon sx={{ mr: 1 }} />
                                <Typography noWrap>{location}</Typography>
                            </Box>
                            <Chip
                                size="small"
                                label={Object.keys(bins[location] || {}).length}
                                sx={{ ml: 1 }}
                                color="primary"
                            />
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    const renderBinGrid = () => (
        <Grid container spacing={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
            {Object.entries(binsForSelectedLocation).length > 0 ? (
                Object.entries(binsForSelectedLocation).map(([binId, binData]) => (
                    <Fade in key={binId} timeout={500}>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Bin
                                locationId={selectedLocation}
                                binId={binId}
                                binData={binData}
                            />
                        </Grid>
                    </Fade>
                ))
            ) : (
                <Grid item xs={12}>
                    <Typography color="error" align="center">No bins found for this location.</Typography>
                </Grid>
            )}
        </Grid>
    );

    const renderBinList = () => (
        <Paper elevation={3}>
            {Object.entries(binsForSelectedLocation).length > 0 ? (
                Object.entries(binsForSelectedLocation).map(([binId, binData]) => (
                    <Fade in key={binId} timeout={500}>
                        <Box key={binId} sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                            <Bin
                                locationId={selectedLocation}
                                binId={binId}
                                binData={binData}
                                listView
                            />
                        </Box>
                    </Fade>
                ))
            ) : (
                <Typography color="error" align="center" sx={{ p: 3 }}>No bins found for this location.</Typography>
            )}
        </Paper>
    );

    return (
        <Box sx={{ flexGrow: 1, bgcolor: '#F5F5F5', minHeight: '100vh' }}>
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', mb: 3 }}>
                <Toolbar sx={{ justifyContent: 'space-between', gap: 2, py: 2 }}>
                    <Typography variant="h5" color="primary" sx={{ flexShrink: 0, fontWeight: 'bold' }}>
                        Supervisor Bins Management
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {attentionNeededCount > 0 && (
                            <Chip
                                icon={<WarningIcon />}
                                label={`${attentionNeededCount} bin${attentionNeededCount > 1 ? 's' : ''} need${attentionNeededCount > 1 ? '' : 's'} attention`}
                                color="warning"
                                variant="outlined"
                            />
                        )}

                        <Tooltip title="Toggle view">
                            <IconButton onClick={() => setView(view === 'grid' ? 'list' : 'grid')} color="primary">
                                {view === 'grid' ? <ViewListIcon /> : <DashboardIcon />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {renderLocationDropdown()}

                {loading ? renderLoading() :
                    error ? renderError() :
                        selectedLocation ? (
                            <>
                                <Box sx={{ mb: 3, textAlign: "center" }}>
                                    <Typography variant="h6" gutterBottom>
                                        Bins in {selectedLocation}
                                    </Typography>
                                </Box>
                                {view === 'grid' ? renderBinGrid() : renderBinList()}
                            </>
                        ) : (
                            <Typography color="primary" align="center">Please select a location to view bins.</Typography>
                        )}
            </Container>
        </Box>
    );
};

export default SupervisorBins;