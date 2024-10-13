import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Navbar from './common/Navbar';
import Bin from './Bin';
import { useBinsContext } from '../contexts/BinsContext';
import { useAuth } from '../contexts/AuthContext'; // Import the Auth context
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Bins = () => {
  const { bins, loading: binLoading, error: binError, fetchBins } = useBinsContext();
  const { user } = useAuth(); // Get user info from Auth context
  const [selectedLocation, setSelectedLocation] = useState('');

  const fetchBinsData = useCallback(async () => {
    try {
      await fetchBins();
    } catch (error) {
      console.error('Failed to fetch bins:', error);
      toast.error('Failed to fetch bins. Please try again.');
    }
  }, [fetchBins]);

  useEffect(() => {
    fetchBinsData();
  }, [fetchBinsData]);

  useEffect(() => {
    const storedLocation = localStorage.getItem('selectedLocation');
    if (Object.keys(bins).length > 0) {
      if (storedLocation && bins.hasOwnProperty(storedLocation)) {
        setSelectedLocation(storedLocation);
      } else {
        const initialLocation = Object.keys(bins)[0];
        setSelectedLocation(initialLocation);
        localStorage.setItem('selectedLocation', initialLocation);
      }
    }
  }, [bins]);

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    localStorage.setItem('selectedLocation', newLocation);
  };

  const binsForSelectedLocation = useMemo(() => {
    return bins[selectedLocation] || {};
  }, [bins, selectedLocation]);

  const renderLoading = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
      <Typography variant="h5" sx={{ ml: 2 }}>Loading bins...</Typography>
    </Box>
  );

  const renderError = () => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh">
      <Typography variant="h5" color="error">{binError}</Typography>
      <Button variant="contained" color="primary" onClick={fetchBinsData} sx={{ mt: 2 }}>
        Retry
      </Button>
    </Box>
  );

  const renderBinsSummary = () => (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Location Summary</Typography>
      <Grid container spacing={2}>
        {Object.entries(bins).map(([location, locationBins]) => (
          <Grid item key={location} xs={12} sm={6} md={4}>
            <Typography>
              <strong>{location}</strong>: {Object.keys(locationBins).length} bins
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  const renderBinGrid = () => (
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
          <Typography color="error">No bins found for this location.</Typography>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>Bins List</Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="location-select-label">Select Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={selectedLocation}
              onChange={handleLocationChange}
              aria-label="Select location"
              disabled={Object.keys(bins).length === 0}
            >
              {Object.keys(bins).map((location) => (
                <MenuItem key={location} value={location}>{location}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Render bins summary only for authorized roles */}
        {user?.role === 'Admin' || user?.role === 'Manager' ? renderBinsSummary() : null}

        <Box sx={{ mb: 3 }}>
          {/* Render create bin button only for authorized roles */}
          {(user?.role === 'Admin' || user?.role === 'Manager') && (
            <Button
              component={Link}
              to={`/users/create-bin/${encodeURIComponent(selectedLocation)}`}
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              disabled={!selectedLocation}
            >
              Create Bin
            </Button>
          )}
        </Box>

        {binLoading ? (
          renderLoading()
        ) : binError ? (
          renderError()
        ) : selectedLocation ? (
          renderBinGrid()
        ) : (
          <Typography color="primary">Please select a location to view bins.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Bins;