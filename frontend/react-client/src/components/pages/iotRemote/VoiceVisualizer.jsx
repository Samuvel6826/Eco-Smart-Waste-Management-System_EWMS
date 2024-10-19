import React, { useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const VoiceVisualizer = ({ isListening }) => {
    const canvasRef = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const dataArray = useRef(null);
    const animationFrameId = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const setupCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = canvas.offsetWidth * dpr;
                canvas.height = canvas.offsetHeight * dpr;
                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);
            }
        };

        setupCanvas();
        window.addEventListener('resize', setupCanvas);

        return () => {
            window.removeEventListener('resize', setupCanvas);
        };
    }, []);

    useEffect(() => {
        let mounted = true;

        const initializeVisualization = async () => {
            if (isListening) {
                try {
                    await startVisualization();
                } catch (err) {
                    if (mounted) {
                        toast.error("Could not access microphone. Please check permissions.");
                        console.error("Visualization error:", err);
                    }
                }
            } else {
                stopVisualization();
            }
        };

        initializeVisualization();

        return () => {
            mounted = false;
            stopVisualization();
        };
    }, [isListening]);

    const startVisualization = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });

            streamRef.current = stream;
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            analyser.current = audioContext.current.createAnalyser();
            const source = audioContext.current.createMediaStreamSource(stream);
            source.connect(analyser.current);

            analyser.current.fftSize = 256;
            analyser.current.smoothingTimeConstant = 0.8;
            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);

            drawVisualization();
        } catch (error) {
            console.error("Error accessing microphone:", error);
            throw error;
        }
    };

    const stopVisualization = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
            audioContext.current = null;
        }

        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const getColor = (intensity) => {
        const hue = 250 - (intensity * 120);
        const saturation = 70 + (intensity * 30);
        const lightness = 40 + (intensity * 20);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const drawVisualization = () => {
        if (!analyser.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const WIDTH = canvas.offsetWidth;
        const HEIGHT = canvas.offsetHeight;

        analyser.current.getByteFrequencyData(dataArray.current);

        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, 'rgba(30, 30, 50, 0.95)');
        gradient.addColorStop(1, 'rgba(20, 20, 40, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / dataArray.current.length) * 2.5;
        let x = 0;

        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

        for (let i = 0; i < dataArray.current.length; i++) {
            const intensity = dataArray.current[i] / 255;
            const barHeight = (intensity * HEIGHT * 0.8) + 2;

            const barGradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight);
            barGradient.addColorStop(0, getColor(intensity * 0.5));
            barGradient.addColorStop(1, getColor(intensity));

            ctx.fillStyle = barGradient;
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
            background: 'linear-gradient(to right, rgba(76, 29, 149, 0.8), rgba(219, 39, 119, 0.8))',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            margin: '20px',
            width: '90%',
            maxWidth: '800px',
            height: '300px'
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(to right, #9333ea, #ec4899)'
                }}
            />
        </div>
    );
};

export default VoiceVisualizer;