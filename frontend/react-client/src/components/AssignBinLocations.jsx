import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

function AssignBinLocations({ open, onClose }) {
    const { logOut } = useAuth();
    const { users, fetchUsers, error: userError, assignBinsToUser } = useUsersContext();
    const { bins, loading: binLoading, fetchBins, error: binError } = useBinsContext();

    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [selectedBins, setSelectedBins] = useState([]);
    const [loadingAssign, setLoadingAssign] = useState(false);
    const initialFetchDoneRef = useRef(false);

    // Reset the initial fetch flag when the dialog is closed
    useEffect(() => {
        if (!open) {
            initialFetchDoneRef.current = false;
        }
    }, [open]);

    // Fetch data only once when the component is opened for the first time
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([fetchUsers(), fetchBins()]);
                initialFetchDoneRef.current = true;
                console.log("Data fetched");
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data. Please try again.');
            }
        };

        if (open && !initialFetchDoneRef.current) {
            fetchData();
        }
    }, [open, fetchUsers, fetchBins]);  // Dependencies: open, fetchUsers, fetchBins

    // Show error messages if fetching users or bins fails
    useEffect(() => {
        if (userError) toast.error('Error fetching users. Please try again.');
        if (binError) toast.error('Error fetching bins. Please try again.');
    }, [userError, binError]);

    // Update the supervisor and assigned bins when users change
    useEffect(() => {
        if (selectedSupervisor) {
            const updatedSupervisor = users.find(user => user.employeeId === selectedSupervisor.employeeId);
            if (updatedSupervisor) {
                setSelectedSupervisor(updatedSupervisor);
                setSelectedBins(updatedSupervisor.assignedBinLocations || []);
            }
        }
    }, [users, selectedSupervisor]);

    // Assign selected bins to a supervisor
    const handleAssignBins = async () => {
        if (!selectedSupervisor) {
            toast.error('Please select a supervisor.');
            return;
        }
        if (selectedBins.length === 0) {
            toast.error('Please select at least one bin location.');
            return;
        }

        setLoadingAssign(true);

        try {
            await assignBinsToUser(selectedSupervisor.employeeId, selectedBins);
            toast.success('Bins assigned successfully!');
            await fetchUsers();  // Fetch users again to reflect updates
            onClose();  // Close the dialog after successful assignment
        } catch (error) {
            console.error('Error assigning bins:', error);
            toast.error(error?.response?.data?.message || 'An error occurred. Please try again.');
            if (error?.response?.status === 401) {
                logOut();
            }
        } finally {
            setLoadingAssign(false);
        }
    };

    // Filtering supervisors from users
    const supervisors = useMemo(() => users.filter(user => user.role === 'Supervisor'), [users]);
    const binLocations = useMemo(() => Object.keys(bins), [bins]);

    // Handle supervisor selection
    const handleSupervisorChange = (event, newValue) => {
        setSelectedSupervisor(newValue);
        setSelectedBins(newValue?.assignedBinLocations || []);
    };

    // Check if a bin is already assigned to the selected supervisor
    const isBinAssigned = (binLocation) => selectedSupervisor?.assignedBinLocations?.includes(binLocation);

    // Custom rendering for the selected bins as chips
    const renderChip = (option, props) => {
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
    };

    // Custom rendering for the bin options with tooltip
    const renderOption = (props, option) => (
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Assign Bin Locations</DialogTitle>
            <DialogContent>
                {binLoading ? (
                    <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress />
                    </Box>
                ) : (
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
                            onChange={(event, newValue) => setSelectedBins(newValue)}
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
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" variant="outlined">
                    Cancel
                </Button>
                <Tooltip title={!selectedSupervisor || selectedBins.length === 0 ? "Select a supervisor and at least one bin" : "Assign selected bins to the supervisor"}>
                    <span>
                        <Button
                            onClick={handleAssignBins}
                            color="primary"
                            variant="contained"
                            disabled={loadingAssign || !selectedSupervisor || selectedBins.length === 0}
                        >
                            {loadingAssign ? <CircularProgress size={24} /> : 'Assign'}
                        </Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
}

export default AssignBinLocations;