import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';

const VoiceMonitor = () => {
    const [isListening, setIsListening] = useState(false);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const dataArray = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            const source = audioContext.current.createMediaStreamSource(stream);
            source.connect(analyser.current);

            analyser.current.fftSize = 2048;
            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);

            setIsListening(true);
            drawWaveform();
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopListening = () => {
        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        setIsListening(false);

        // Clear the canvas
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const drawWaveform = () => {
        if (!analyser.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        analyser.current.getByteTimeDomainData(dataArray.current);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, width, height);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();

        const sliceWidth = width * 1.0 / dataArray.current.length;
        let x = 0;

        for (let i = 0; i < dataArray.current.length; i++) {
            const v = dataArray.current[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();

        animationFrameId.current = requestAnimationFrame(drawWaveform);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 3 }}>
            <Typography variant="h4">Voice Monitor</Typography>

            <Button
                variant="contained"
                onClick={isListening ? stopListening : startListening}
                color={isListening ? "secondary" : "primary"}
            >
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>

            <Box sx={{ width: '100%', maxWidth: 600, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Waveform Visualizer</Typography>
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    style={{
                        width: '100%',
                        height: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
            </Box>
        </Box>
    );
};

export default VoiceMonitor;