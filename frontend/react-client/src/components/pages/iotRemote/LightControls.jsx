import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Typography, Box, CircularProgress } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const LightControls = ({ deviceStates, allDevicesOn, toggleDevice, toggleAllDevices, loading, error }) => {
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="h6" align="center" color="error">
                {error}
            </Typography>
        );
    }

    if (!deviceStates || Object.keys(deviceStates).length === 0) {
        return (
            <Typography variant="h6" align="center">
                No devices found.
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} elevation={3}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="center">
                            <Typography variant="subtitle1" fontWeight="bold">Device</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="subtitle1" fontWeight="bold">Location</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="subtitle1" fontWeight="bold">Status</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="subtitle1" fontWeight="bold">Switch</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="subtitle1" fontWeight="bold">Voice Command</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(deviceStates).map(([category, devices]) => (
                        Object.entries(devices).map(([device, deviceData]) => {
                            const { location, state } = deviceData;
                            return (
                                <TableRow key={`${device}`} hover>
                                    <TableCell align="center">{`${device}`}</TableCell>
                                    <TableCell align="center">{location || "Unknown Location"}</TableCell>
                                    <TableCell align="center">
                                        <Box display="flex" alignItems="center" justifyContent="center">
                                            <Typography variant="body2" sx={{ mr: 1 }}>
                                                {state === 1 ? 'On' : 'Off'}
                                            </Typography>
                                            {state === 1 ? <LightbulbIcon color="primary" /> : <LightbulbOutlinedIcon />}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Switch
                                            checked={state === 1}
                                            onChange={() => toggleDevice(`${device}`, state === 0)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="body2">{`Turn on/off ${device}`}</Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ))}
                    <TableRow hover>
                        <TableCell colSpan={3} align="center">
                            <Typography variant="subtitle1" fontWeight="bold">All Devices</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Switch
                                checked={allDevicesOn}
                                onChange={() => toggleAllDevices(!allDevicesOn)}
                                color="primary"
                            />
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="body2">Turn on/off all devices</Typography>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default LightControls;