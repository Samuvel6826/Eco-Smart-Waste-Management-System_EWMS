import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useUsersContext } from '../../../contexts/UsersContext';
import { useBinsContext } from '../../../contexts/BinsContext';
import { toast } from 'react-hot-toast';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Select,
    Option,
    Input,
    Button,
    Spinner,
    Chip
} from "@material-tailwind/react";

const AssignBinLocations = React.memo(({ open, onClose, onAssignSuccess }) => {
    const { logout } = useAuth();
    const { users, fetchUsers, assignBinsToUser } = useUsersContext();
    const { bins, fetchBins } = useBinsContext();
    const contentRef = useRef(null);

    const [state, setState] = useState({
        selectedSupervisor: null,
        selectedBins: [],
        loading: false,
        loadingAssign: false,
        searchTerm: ""
    });

    const supervisors = useMemo(() =>
        users.filter(user => user.role === 'Supervisor'),
        [users]
    );

    const binLocations = useMemo(() => {
        const locations = Object.keys(bins);
        return state.searchTerm
            ? locations.filter(location =>
                location.toLowerCase().includes(state.searchTerm.toLowerCase()))
            : locations;
    }, [bins, state.searchTerm]);

    const fetchData = useCallback(async () => {
        if (state.loading || (users.length > 0 && Object.keys(bins).length > 0)) return;

        setState(prev => ({ ...prev, loading: true }));
        try {
            await Promise.all([
                users.length === 0 ? fetchUsers() : Promise.resolve(),
                Object.keys(bins).length === 0 ? fetchBins() : Promise.resolve()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [fetchUsers, fetchBins, state.loading, users.length, bins]);

    useEffect(() => {
        if (open) fetchData();
    }, [open, fetchData]);

    useEffect(() => {
        if (!open) {
            setState(prev => ({
                ...prev,
                selectedSupervisor: null,
                selectedBins: [],
                searchTerm: ""
            }));
        }
    }, [open]);

    const handleSupervisorChange = useCallback((value) => {
        const supervisor = supervisors.find(s =>
            `${s.firstName} ${s.lastName}` === value
        );
        setState(prev => ({
            ...prev,
            selectedSupervisor: supervisor,
            selectedBins: supervisor?.assignedBinLocations || []
        }));
    }, [supervisors]);

    const toggleBinSelection = useCallback((binLocation) => {
        setState(prev => ({
            ...prev,
            selectedBins: prev.selectedBins.includes(binLocation)
                ? prev.selectedBins.filter(bin => bin !== binLocation)
                : [...prev.selectedBins, binLocation]
        }));
    }, []);

    const handleSearchChange = useCallback((e) => {
        setState(prev => ({ ...prev, searchTerm: e.target.value }));
    }, []);

    const getBinStatus = useCallback((binLocation) => {
        if (!state.selectedSupervisor) return 'unassigned';
        if (state.selectedSupervisor.assignedBinLocations?.includes(binLocation)) {
            return 'Assigned';
        }
        return users.some(user =>
            user.role === 'Supervisor' &&
            user.employeeId !== state.selectedSupervisor.employeeId &&
            user.assignedBinLocations?.includes(binLocation)
        ) ? 'Other' : 'unassigned';
    }, [state.selectedSupervisor, users]);

    const handleAssignBins = async () => {
        if (!state.selectedSupervisor) return;

        setState(prev => ({ ...prev, loadingAssign: true }));
        try {
            await assignBinsToUser(state.selectedSupervisor.employeeId, state.selectedBins);
            toast.success('Bins assigned successfully!');
            onAssignSuccess();
            onClose();
        } catch (error) {
            if (error?.response?.status === 401) {
                toast.error('Session expired. Logging out.');
                logout();
            } else {
                toast.error('Error assigning bins. Please try again.');
            }
        } finally {
            setState(prev => ({ ...prev, loadingAssign: false }));
        }
    };

    if (state.loading) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <Typography variant="h5" className="mb-4">Loading content...</Typography>
                        <Spinner className="h-6 w-6" />
                    </div>
                </div>
            </Card>
        );
    }

    const assignedCount = state.selectedBins.filter(bin =>
        state.selectedSupervisor?.assignedBinLocations?.includes(bin)
    ).length;

    return (
        <Card className="p-6" ref={contentRef}>
            <CardHeader floated={false} shadow={false}>
                <Typography variant="h4">Assign Bin Locations</Typography>
            </CardHeader>

            <CardBody className="space-y-6">
                <div>
                    <Typography variant="h6" className="mb-2">
                        Select Supervisor
                    </Typography>
                    <Select
                        label="Choose a supervisor"
                        onChange={handleSupervisorChange}
                        value={state.selectedSupervisor ? `${state.selectedSupervisor.firstName} ${state.selectedSupervisor.lastName}` : ''}
                    >
                        {supervisors.map(supervisor => (
                            <Option
                                key={supervisor.employeeId}
                                value={`${supervisor.firstName} ${supervisor.lastName}`}
                            >
                                {supervisor.firstName} {supervisor.lastName}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Typography variant="h6" className="mb-2">
                        Select Bin Locations
                    </Typography>
                    <Input
                        label="Search bin locations..."
                        value={state.searchTerm}
                        onChange={handleSearchChange}
                        className="mb-4"
                    />

                    <div className="mt-4 grid max-h-[400px] grid-cols-2 gap-3 overflow-y-auto">
                        {binLocations.map(location => {
                            const status = getBinStatus(location);
                            const isSelected = state.selectedBins.includes(location);

                            return (
                                <Button
                                    key={location}
                                    variant={isSelected ? "filled" : "outlined"}
                                    color={isSelected ? "blue" : "gray"}
                                    onClick={() => toggleBinSelection(location)}
                                    className="flex h-auto items-center justify-between p-4 normal-case"
                                    fullWidth
                                >
                                    <Typography className="font-medium">
                                        {location}
                                    </Typography>
                                    <Chip
                                        value={status}
                                        color={status === 'Assigned' ? "blue" :
                                            status === 'Other' ? "gray" :
                                                "blue-gray"}
                                        variant="ghost"
                                        size="sm"
                                    />
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <Typography variant="small" color="blue-gray">
                    Selected: {state.selectedBins.length}
                    {state.selectedBins.length > 0 && (
                        <span>
                            {' '}(Already Assigned: {assignedCount},
                            To Assign: {state.selectedBins.length - assignedCount})
                        </span>
                    )}
                </Typography>
            </CardBody>

            <CardFooter className="flex justify-end gap-3 pt-4">
                <Button
                    variant="outlined"
                    color="blue-gray"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleAssignBins}
                    disabled={state.loadingAssign || !state.selectedSupervisor}
                    className="flex items-center gap-2"
                >
                    {state.loadingAssign ? (
                        <>
                            <span className="sr-only">Assigning bins...</span>
                            <Spinner className="h-4 w-4" />
                        </>
                    ) : 'Assign'}
                </Button>
            </CardFooter>
        </Card>
    );
});

AssignBinLocations.displayName = 'AssignBinLocations';

export default AssignBinLocations;