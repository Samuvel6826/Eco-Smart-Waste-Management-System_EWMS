import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useBinsContext } from '../contexts/BinsContext';
import {
    Card, CardContent, Typography, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, LinearProgress, Chip, Box, IconButton,
    Tooltip, Collapse, Avatar, Grid, Divider
} from '@mui/material';
import {
    Delete as DeleteIcon, Edit as EditIcon, LocationOn as LocationIcon,
    WarningAmber as WarningIcon, ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon, Delete as TrashIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const Bin = React.memo(({ locationId, binId, binData }) => {
    const [showModal, setShowModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const { deleteBin } = useBinsContext();

    const handleDelete = useCallback(() => {
        setShowModal(true);
    }, []);

    const confirmDelete = useCallback(async () => {
        try {
            await deleteBin(locationId, binId);
            toast.success('Bin deleted successfully');
        } catch (error) {
            console.error('Error deleting bin:', error);
            toast.error('Error deleting bin. Please try again.');
        } finally {
            setShowModal(false);
        }
    }, [binId, locationId, deleteBin]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleExpand = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

    if (!binData) return <Typography color="error">Loading bin data...</Typography>;

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
        maxBinCapacity = 'N/A'
    } = binData;

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'open':
                return 'success';
            case 'inactive':
            case 'closed':
                return 'error';
            default:
                return 'default';
        }
    };

    const needsAttention = filledBinPercentage > 80 || binLidStatus.toLowerCase() === 'open' || microProcessorStatus.toLowerCase() === 'inactive' || sensorStatus.toLowerCase() === 'inactive';

    const getFilledColor = (percentage) => {
        if (percentage > 80) return 'error';
        if (percentage > 50) return 'warning';
        return 'success';
    };

    return (
        <>
            <Card sx={{ mb: 2, position: 'relative', overflow: 'visible', boxShadow: 3 }}>
                {needsAttention && (
                    <Tooltip title="Needs attention">
                        <WarningIcon color="warning" sx={{ position: 'absolute', top: -10, right: -10 }} />
                    </Tooltip>
                )}
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <Avatar sx={{ bgcolor: getFilledColor(filledBinPercentage) }}>
                                {filledBinPercentage > 80 ? <WarningIcon /> : <TrashIcon />}
                            </Avatar>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h6" component="div">
                                {id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <LocationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {binLocation}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Chip
                                label={`Type: ${binType}`}
                                color="primary"
                                sx={{ fontWeight: 'bold' }}
                            />
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

                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 2 }}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" gutterBottom>Detailed Information</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}>
                                    <Typography variant="body2">Capacity: {maxBinCapacity} cm</Typography>
                                    <Typography variant="body2">Distance: {distance} cm</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2">
                                        Lat: {geoLocation.latitude || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Lon: {geoLocation.longitude || 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                <Chip
                                    icon={binLidStatus.toLowerCase() === 'open' ? <WarningIcon /> : <CheckCircleIcon />}
                                    label={`Lid: ${binLidStatus}`}
                                    size="small"
                                    color={getStatusColor(binLidStatus)}
                                />
                                <Chip
                                    icon={microProcessorStatus.toLowerCase() === 'active' ? <CheckCircleIcon /> : <WarningIcon />}
                                    label={`Processor: ${microProcessorStatus}`}
                                    size="small"
                                    color={getStatusColor(microProcessorStatus)}
                                />
                                <Chip
                                    icon={sensorStatus.toLowerCase() === 'active' ? <CheckCircleIcon /> : <WarningIcon />}
                                    label={`Sensor: ${sensorStatus}`}
                                    size="small"
                                    color={getStatusColor(sensorStatus)}
                                />
                            </Box>
                        </Box>
                    </Collapse>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/users/edit-bin/${locationId}/${binId}`)}
                            size="small"
                        >
                            Edit
                        </Button>
                        <IconButton
                            color="error"
                            onClick={handleDelete}
                            aria-label="delete bin"
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                        <Button
                            variant="text"
                            onClick={handleExpand}
                            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            size="small"
                        >
                            {expanded ? 'Less' : 'More'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={showModal}
                onClose={handleCloseModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this bin? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

Bin.displayName = 'Bin';

export default Bin;