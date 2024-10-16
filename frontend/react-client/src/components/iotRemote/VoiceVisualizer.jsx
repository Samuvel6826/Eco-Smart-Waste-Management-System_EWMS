import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

const VoiceVisualizer = ({ audioLevel }) => {
    // Ensure audioLevel is a number between 0 and 100
    const normalizedAudioLevel = Math.min(Math.max(Number(audioLevel) || 0, 0), 100);

    // Determine background color based on audio level
    let barColor;
    if (normalizedAudioLevel > 75) {
        barColor = 'green'; // High level
    } else if (normalizedAudioLevel > 30) {
        barColor = 'orange'; // Medium level
    } else {
        barColor = 'red'; // Low level
    }

    return (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>
                Voice Input Level
            </Typography>
            <Tooltip title={`${normalizedAudioLevel.toFixed(0)}%`} arrow>
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '300px', // Limit max width for better appearance
                        height: '20px', // Increased height for better visibility
                        backgroundColor: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)', // Added shadow
                    }}
                    role="progressbar" // Accessibility role
                    aria-valuenow={normalizedAudioLevel} // Current value
                    aria-valuemin={0} // Minimum value
                    aria-valuemax={100} // Maximum value
                >
                    <Box
                        sx={{
                            height: '100%',
                            width: `${normalizedAudioLevel}%`,
                            backgroundColor: barColor, // Dynamic color
                            transition: 'width 0.2s ease-in-out', // Smoother transition
                        }}
                    />
                </Box>
            </Tooltip>
            <Typography variant="body2" sx={{ mt: 1 }}>
                {normalizedAudioLevel.toFixed(0)}%
            </Typography>
        </Box>
    );
};

export default VoiceVisualizer;