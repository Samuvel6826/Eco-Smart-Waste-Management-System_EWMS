import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    CircularProgress,
    TextField,
    Tooltip,
    Box,
    Chip,
    Autocomplete,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useUsersContext } from '../contexts/UsersContext';
import { useBinsContext } from '../contexts/BinsContext';

function AssignBinLocations({ open, onClose, onAssignSuccess }) {
    const { logout } = useAuth();
    const { users, fetchUsers, error: userError, assignBinsToUser } = useUsersContext();
    const { bins, fetchBins, error: binError } = useBinsContext();

    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [selectedBins, setSelectedBins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAssign, setLoadingAssign] = useState(false);

    const fetchData = useCallback(async () => {
        if (loading || (users.length > 0 && Object.keys(bins).length > 0)) return;

        setLoading(true);
        try {
            await Promise.all([
                users.length === 0 ? fetchUsers() : Promise.resolve(),
                Object.keys(bins).length === 0 ? fetchBins() : Promise.resolve()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [fetchUsers, fetchBins, loading, users.length, bins]);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open, fetchData]);

    useEffect(() => {
        if (!open) {
            setSelectedSupervisor(null);
            setSelectedBins([]);
        }
    }, [open]);

    useEffect(() => {
        if (userError) {
            console.error('User Error:', userError);
            toast.error(`User Error: ${userError}`);
        }
        if (binError) {
            console.error('Bin Error:', binError);
            toast.error(`Bin Error: ${binError}`);
        }
    }, [userError, binError]);

    const handleAssignBins = async () => {
        if (!selectedSupervisor) {
            toast.error('Please select a supervisor.');
            return;
        }

        setLoadingAssign(true);

        try {
            await assignBinsToUser(selectedSupervisor.employeeId, selectedBins);
            toast.success('Bins assigned successfully!');
            onAssignSuccess(); // Call the callback function after successful assignment
            onClose();
        } catch (error) {
            console.error('Error assigning bins:', error);
            toast.error(error?.response?.data?.message || 'An error occurred. Please try again.');
            if (error?.response?.status === 401) {
                logout();
            }
        } finally {
            setLoadingAssign(false);
        }
    };

    const supervisors = useMemo(() => {
        return users.filter(user => user.role === 'Supervisor');
    }, [users]);

    const binLocations = useMemo(() => {
        return Object.keys(bins);
    }, [bins]);

    const handleSupervisorChange = useCallback((event, newValue) => {
        setSelectedSupervisor(newValue);
        setSelectedBins(newValue?.assignedBinLocations || []);
    }, []);

    const isBinAssigned = useCallback((binLocation) => {
        return selectedSupervisor?.assignedBinLocations?.includes(binLocation);
    }, [selectedSupervisor]);

    const renderChip = useCallback((option, props) => {
        const isAssigned = isBinAssigned(option);
        return (
            <Chip
                {...props}
                key={option}
                variant="outlined"
                label={option}
                color={isAssigned ? "primary" : "default"}
            />
        );
    }, [isBinAssigned]);

    const renderOption = useCallback((props, option) => {
        return (
            <li {...props} key={option}>
                <Tooltip title={isBinAssigned(option) ? "Already assigned" : "Not assigned"} arrow>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                            size="small"
                            label={isBinAssigned(option) ? "Assigned" : "Unassigned"}
                            color={isBinAssigned(option) ? "primary" : "default"}
                            sx={{ marginRight: 1 }}
                        />
                        {option}
                    </Box>
                </Tooltip>
            </li>
        );
    }, [isBinAssigned]);

    const handleBinChange = useCallback((event, newValue) => {
        setSelectedBins(newValue);
    }, []);

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Assign Bin Locations</DialogTitle>
            <DialogContent>
                {/* Rest of the component remains the same */}
                {/* ... */}

                <Box sx={{ '& > *': { marginBottom: 2 } }}>
                    <Autocomplete
                        options={supervisors}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Supervisor"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                        onChange={handleSupervisorChange}
                        value={selectedSupervisor}
                    />
                    <Autocomplete
                        multiple
                        options={binLocations}
                        value={selectedBins}
                        onChange={handleBinChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Bin Locations"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => renderChip(option, getTagProps({ index })))
                        }
                        renderOption={renderOption}
                    />
                    <Typography variant="body2" color="textSecondary">
                        Selected Bins: {selectedBins.length} (Assigned: {selectedBins.filter(isBinAssigned).length}, Unassigned: {selectedBins.filter(bin => !isBinAssigned(bin)).length})
                    </Typography>
                </Box>


            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">
                    Cancel
                </Button>
                <Tooltip title="Assign selected bins to the supervisor">
                    <span>
                        <Button
                            onClick={handleAssignBins}
                            color="primary"
                            variant="contained"
                            disabled={loadingAssign || !selectedSupervisor}
                        >
                            {loadingAssign ? <CircularProgress size={24} /> : 'Assign'}
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default React.memo(AssignBinLocations);