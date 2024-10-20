import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBinsContext } from '../../contexts/BinsContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Card, CardContent, CardActions, Typography, Button, Dialog, DialogActions,
    DialogContent, DialogContentText, DialogTitle, LinearProgress, Chip, Box,
    IconButton, Collapse, Grid, Divider, Avatar
} from '@mui/material';
import {
    Delete as DeleteIcon, Edit as EditIcon, LocationOn as LocationIcon,
    Warning as WarningIcon, ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon, Delete as TrashIcon, CheckCircle as CheckCircleIcon,
    PowerSettingsNew as PowerIcon
} from '@mui/icons-material';

const Bin = ({ locationId, binId, binData }) => {
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const { deleteBin } = useBinsContext();
    const { user } = useAuth();

    const {
        binLocation = 'N/A',
        id = 'N/A',
        geoLocation = {},
        distance = 0,
        binType = 'N/A',
        binLidStatus = 'N/A',
        microProcessorStatus = 'N/A',
        sensorStatus = 'N/A',
        filledBinPercentage = 0,
        maxBinCapacity = 'N/A',
        binActiveStatus = 'N/A'
    } = binData;

    const handleDelete = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);
    const handleExpand = () => setExpanded(!expanded);

    const confirmDelete = async () => {
        try {
            await deleteBin(locationId, binId);
            toast.success('Bin deleted successfully');
        } catch (error) {
            console.error('Error deleting bin:', error);
            toast.error('Error deleting bin. Please try again.');
        } finally {
            setShowModal(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'on':
            case 'closed':
                return 'success';
            case 'inactive':
            case 'off':
            case 'open':
                return 'error';
            default:
                return 'default';
        }
    };

    const getFilledColor = (percentage) => {
        if (percentage > 80) return 'error';
        if (percentage > 50) return 'warning';
        return 'success';
    };

    const needsAttention = filledBinPercentage > 80 || binLidStatus.toLowerCase() === 'open' ||
        microProcessorStatus.toLowerCase() === 'off' || sensorStatus.toLowerCase() === 'off' ||
        binActiveStatus.toLowerCase() === 'inactive';

    // Memoize the permissions check to avoid unnecessary re-renders
    const permissions = useMemo(() => ({
        canEdit: user?.role === 'Admin' || user?.role === 'Manager',
        canDelete: user?.role === 'Admin' || user?.role === 'Manager'
    }), [user?.role]);

    return (
        <>
            <Card sx={{ mb: 2, position: 'relative', overflow: 'visible', boxShadow: 3 }}>
                {needsAttention && (
                    <WarningIcon color="warning" sx={{ position: 'absolute', top: -10, right: -10 }} />
                )}
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Avatar sx={{ bgcolor: theme => theme.palette[getStatusColor(binActiveStatus)].main }}>
                                <PowerIcon />
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6">{id}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                <LocationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {binLocation}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Chip label={`Type: ${binType}`} color="primary" />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" gutterBottom>Fill Level:</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={filledBinPercentage}
                            sx={{ height: 10, borderRadius: 5 }}
                            color={getFilledColor(filledBinPercentage)}
                        />
                        <Typography variant="body2" align="right">{filledBinPercentage}% full</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Chip
                            icon={<PowerIcon />}
                            label={`Status: ${binActiveStatus}`}
                            color={getStatusColor(binActiveStatus)}
                            size="small"
                        />
                        <Chip
                            icon={binLidStatus.toLowerCase() === 'closed' ? <CheckCircleIcon /> : <WarningIcon />}
                            label={`Lid: ${binLidStatus}`}
                            size="small"
                            color={getStatusColor(binLidStatus)}
                        />
                    </Box>

                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2">Max Capacity: {maxBinCapacity} cm</Typography>
                                <Typography variant="body2">Distance: {distance} cm</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">Lat: {geoLocation.latitude || 'N/A'}</Typography>
                                <Typography variant="body2">Lon: {geoLocation.longitude || 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            <Chip
                                icon={microProcessorStatus.toLowerCase() === 'on' ? <CheckCircleIcon /> : <WarningIcon />}
                                label={`Processor: ${microProcessorStatus}`}
                                size="small"
                                color={getStatusColor(microProcessorStatus)}
                            />
                            <Chip
                                icon={sensorStatus.toLowerCase() === 'on' ? <CheckCircleIcon /> : <WarningIcon />}
                                label={`Sensor: ${sensorStatus}`}
                                size="small"
                                color={getStatusColor(sensorStatus)}
                            />
                        </Box>
                    </Collapse>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Box>
                        {permissions.canEdit && (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/users/edit-bin/${locationId}/${binId}`)}
                                size="small"
                            >
                                Edit
                            </Button>
                        )}
                        {permissions.canDelete && (
                            <IconButton
                                color="error"
                                onClick={handleDelete}
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>

                    <Button
                        onClick={handleExpand}
                        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        size="small"
                    >
                        {expanded ? 'Less' : 'More'}
                    </Button>
                </CardActions>
            </Card>

            <Dialog
                open={showModal}
                onClose={handleCloseModal}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this bin? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default React.memo(Bin);