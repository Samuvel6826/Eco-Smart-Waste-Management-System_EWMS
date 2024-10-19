import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const InactivityTimer = ({ remainingTime }) => {
    const progress = (remainingTime / 10) * 100; // Assuming 10 seconds is the full duration

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
                Inactivity Timer: {remainingTime} seconds
            </Typography>
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 10,
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor: progress > 50 ? '#4caf50' : progress > 20 ? '#ff9800' : '#f44336',
                    },
                }}
            />
        </Box>
    );
};

export default InactivityTimer;