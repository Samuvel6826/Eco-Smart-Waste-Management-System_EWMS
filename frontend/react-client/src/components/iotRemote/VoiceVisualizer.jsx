import React, { useRef, useEffect } from 'react';

const VoiceVisualizer = ({ isListening }) => {
    const canvasRef = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const dataArray = useRef(null);
    const animationFrameId = useRef(null);

    useEffect(() => {
        if (isListening) {
            startVisualization();
        } else {
            stopVisualization();
        }

        return () => {
            stopVisualization();
        };
    }, [isListening]);

    const startVisualization = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            const source = audioContext.current.createMediaStreamSource(stream);
            source.connect(analyser.current);

            analyser.current.fftSize = 256;
            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);

            drawVisualization();
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopVisualization = () => {
        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
        }
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getColor = (intensity) => {
        // Smooth transition colors: purple to pink gradient
        const r = intensity < 0.5 ? 255 : Math.floor(510 * (1 - intensity));
        const g = 0;
        const b = intensity > 0.5 ? 255 : Math.floor(510 * intensity);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const drawVisualization = () => {
        if (!analyser.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        analyser.current.getByteFrequencyData(dataArray.current);

        ctx.fillStyle = 'rgba(30, 30, 50, 0.9)'; // Dark background
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / dataArray.current.length) * 2.5;
        let x = 0;

        for (let i = 0; i < dataArray.current.length; i++) {
            const intensity = dataArray.current[i] / 255;
            const barHeight = intensity * HEIGHT;

            ctx.fillStyle = getColor(intensity);
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        animationFrameId.current = requestAnimationFrame(drawVisualization);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
            margin: '20px',
            width: '90%',
            maxWidth: '800px',
            height: '300px'
        }}>
            <canvas ref={canvasRef} width="800" height="300" style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'linear-gradient(45deg, #ff00cc, #3333ff)',
            }} />
        </div>
    );
};

export default VoiceVisualizer;