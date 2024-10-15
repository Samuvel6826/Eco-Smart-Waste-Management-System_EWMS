import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Navbar from './common/Navbar';
import Bin from './Bin';
import { useBinsContext } from '../contexts/BinsContext';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Container,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Bins = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { bins, loading: binLoading, error: binError, fetchBins } = useBinsContext();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchBinsData = useCallback(async () => {
    try {
      await fetchBins();
      toast.success('Bins data refreshed successfully!');
    } catch (error) {
      console.error('Failed to fetch bins:', error);
      toast.error('Failed to fetch bins. Please try again.');
    }
  }, [fetchBins]);

  useEffect(() => {
    fetchBinsData();
  }, [fetchBinsData, refreshKey]);

  useEffect(() => {
    if (Object.keys(bins).length > 0) {
      const storedLocation = localStorage.getItem('selectedLocation');
      const validLocation = storedLocation && bins.hasOwnProperty(storedLocation)
        ? storedLocation
        : Object.keys(bins)[0];

      setSelectedLocation(validLocation);
      localStorage.setItem('selectedLocation', validLocation);
    }
  }, [bins]);

  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation);
  };

  const binsForSelectedLocation = useMemo(() => bins[selectedLocation] || {}, [bins, selectedLocation]);

  const renderLoading = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
      <Typography variant="h5" sx={{ ml: 2 }}>Loading bins...</Typography>
    </Box>
  );

  const renderError = () => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
      <Typography variant="h5" color="error" gutterBottom>{binError}</Typography>
      <Button variant="contained" color="primary" onClick={fetchBinsData} startIcon={<RefreshIcon />}>
        Retry
      </Button>
    </Box>
  );

  const renderBinsSummary = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Location Summary</Typography>
      <Grid container spacing={2}>
        {Object.entries(bins).map(([location, locationBins]) => (
          <Grid item key={location} xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{
                bgcolor: location === selectedLocation ? 'primary.light' : 'background.paper',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'primary.light',
                  transition: 'background-color 0.3s',
                },
              }}
              onClick={() => handleLocationChange(location)}
            >
              <CardContent>
                <Typography variant="subtitle1" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1 }} />
                  <strong>{location}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Object.keys(locationBins).length} bins
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
        {Object.entries(binsForSelectedLocation).length > 0 ? (
          Object.entries(binsForSelectedLocation).map(([binId, binData]) => (
            <Grid item key={binId} xs={12} sm={6} md={4} lg={3}>
              <Bin
                locationId={selectedLocation}
                binId={binId}
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
            Bins Management
          </Typography>
          <Button
            component={Link}
            to={`/users/create-bin/${encodeURIComponent(selectedLocation)}`}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            disabled={!selectedLocation}
            sx={{ mr: 2 }}
          >
            Create New Bin
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth={isMobile} sx={{ minWidth: 200 }}>
            <InputLabel id="location-select-label">Select Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              aria-label="Select location"
              disabled={Object.keys(bins).length === 0}
            >
              {Object.keys(bins).map((location) => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {renderBinsSummary()}

        {binLoading ? renderLoading() :
          binError ? renderError() :
            selectedLocation ? renderBinGrid() :
              <Typography color="primary" align="center">Please select a location to view bins.</Typography>}
      </Container>
    </Box>
  );
};

export default Bins;