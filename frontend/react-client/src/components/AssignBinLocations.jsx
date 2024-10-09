import React, { useState, useMemo, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Box,
    TextField,
    IconButton,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { useUserAuth } from '../contexts/AuthContext';
import { useUserContext } from '../contexts/UsersContext';
import { useBinContext } from '../contexts/BinsContext';
import ClearIcon from '@mui/icons-material/Clear';

function AssignBinLocations({ open, onClose, refreshData }) {
    const { logOut } = useUserAuth();
    const { users } = useUserContext();
    const { bins, loading, error, fetchAllBinData, assignBinsToSupervisor } = useBinContext();

    const [selectedBins, setSelectedBins] = useState([]);
    const [supervisorId, setSupervisorId] = useState('');
    const [loadingAssign, setLoadingAssign] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter the supervisors from the user context
    const supervisors = useMemo(
        () => users.filter(user => user.role === 'Supervisor'),
        [users]
    );

    // Fetch bin data only if the dialog is opened
    useEffect(() => {
        if (open) {
            fetchAllBinData(); // Fetch bin data using the context function
        }
    }, [open, fetchAllBinData]);

    // Assign selected bins to the chosen supervisor
    const handleAssignBins = async () => {
        if (!supervisorId) {
            toast.error('Please select a supervisor.');
            return;
        }
        if (selectedBins.length === 0) {
            toast.error('Please select at least one bin location.');
            return;
        }

        setLoadingAssign(true);
        try {
            // Use the context function to assign bins
            const successMessage = await assignBinsToSupervisor(supervisorId, selectedBins);
            toast.success(successMessage);
            refreshData();
            onClose();
        } catch (error) {
            console.error('Error assigning bins:', error);
            toast.error(error.message || 'An error occurred. Please try again.');
            if (error.status === 401) {
                logOut();
            }
        } finally {
            setLoadingAssign(false);
        }
    };

    // Bin locations available for assignment
    const binLocations = useMemo(() => Object.keys(bins), [bins]);

    // Filtered bin locations based on the search term
    const filteredBins = useMemo(() => {
        const prioritizedBins = binLocations.filter(location => !bins[location].assignedTo);
        const assignedBins = binLocations.filter(location => bins[location].assignedTo);

        return [...prioritizedBins.sort(), ...assignedBins.sort()].filter(location =>
            location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, binLocations, bins]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Assign Bin Locations</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="supervisor-select-label">Select Supervisor</InputLabel>
                    <Select
                        labelId="supervisor-select-label"
                        id="supervisor-select"
                        value={supervisorId}
                        onChange={(e) => setSupervisorId(e.target.value)}
                    >
                        <MenuItem value="" disabled>Select a supervisor</MenuItem>
                        {supervisors.map((supervisor) => (
                            <MenuItem key={supervisor._id} value={supervisor._id}>
                                {supervisor.firstName} {supervisor.lastName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography className="mt-3">Select Bin Locations:</Typography>

                {/* Search Input Field with Clear Button */}
                <Box display="flex" alignItems="center">
                    <TextField
                        label="Search Bin Locations"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type to search..."
                    />
                    <IconButton
                        onClick={() => setSearchTerm('')}
                        color="secondary"
                        disabled={!searchTerm}
                    >
                        <ClearIcon />
                    </IconButton>
                </Box>

                {loading ? (
                    <CircularProgress className="mt-2" />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <Box
                        mt={2}
                        border={1}
                        borderColor="grey.300"
                        borderRadius={2}
                        p={1}
                        maxHeight={200}
                        overflow="auto"
                    >
                        {filteredBins.length > 0 ? (
                            filteredBins.map((location) => (
                                <Box
                                    key={location}
                                    onClick={() => {
                                        setSelectedBins((prev) =>
                                            prev.includes(location)
                                                ? prev.filter(bin => bin !== location)
                                                : [...prev, location]
                                        );
                                    }}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{
                                        padding: '8px',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'grey.200',
                                        },
                                        backgroundColor: selectedBins.includes(location) ? 'grey.300' : 'white',
                                    }}
                                >
                                    <Typography>{location}</Typography>
                                    {selectedBins.includes(location) && (
                                        <Chip label="Selected" size="small" color="primary" />
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography>No matching bins found</Typography>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button onClick={handleAssignBins} color="primary" disabled={loadingAssign}>
                    {loadingAssign ? <CircularProgress size={24} /> : 'Assign'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AssignBinLocations;