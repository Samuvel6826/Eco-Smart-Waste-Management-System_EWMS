import { useState, useEffect, useCallback, useRef } from 'react';

const useVoiceRecognitionHook = (deviceStates, toggleDevice, toggleAllDevices) => {
    const [isListening, setIsListening] = useState(false);
    const [recognizedCommand, setRecognizedCommand] = useState('');
    const [error, setError] = useState(null);
    const [lastExecutedCommand, setLastExecutedCommand] = useState(null);
    const [remainingTime, setRemainingTime] = useState(10);
    const recognitionRef = useRef(null);
    const commandBufferRef = useRef([]);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);
    const confidenceThreshold = 0.7;
    const inactivityTimeout = 10000; // 10 seconds

    const wordMappings = {
        'stop': ['stop', 'top', 'hop', 'stock'],
        'turn': ['turn', 'term', 'tone', 'torn', 'stand'],
        'on': ['on', 'own', 'wan'],
        'off': ['off', 'of', 'often'],
        'all': ['all', 'call', 'fall'],
        'one': ['one', '1', 'won'],
        'two': ['two', '2', 'to', 'too', 'through'],
        'three': ['three', '3', 'tree'],
        'four': ['four', '4', 'for'],
        'five': ['five', '5'],
        'led': ['led', 'lead', 'let', 'lad', 'light'],
        'fan': ['fan', 'van', 'flan'],
        'listening': ['listening', 'listing', 'loosening']
    };

    const mapWord = (word) => {
        for (const [key, variants] of Object.entries(wordMappings)) {
            if (variants.includes(word.toLowerCase())) {
                return key;
            }
        }
        return word;
    };

    const mapPhrase = (phrase) => {
        const words = phrase.toLowerCase().split(' ');
        let mappedWords = [];

        for (let i = 0; i < words.length; i++) {
            let mapped = mapWord(words[i]);

            // Handle "LED" or "FAN" followed by a number
            if ((mapped === 'led' || mapped === 'fan') && i + 1 < words.length) {
                const nextWord = mapWord(words[i + 1]);
                if (['one', 'two', 'three', 'four', 'five'].includes(nextWord)) {
                    mappedWords.push(`${mapped}-${nextWord}`);
                    i++; // Skip the next word as we've already processed it
                } else {
                    mappedWords.push(mapped);
                }
            } else {
                mappedWords.push(mapped);
            }
        }

        return mappedWords.join(' ');
    };

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            console.log("Stopping speech recognition...");
            recognitionRef.current.stop();
            setIsListening(false);
            clearTimeout(timeoutRef.current);
            clearInterval(intervalRef.current);
            setRemainingTime(10);
            processCommandBuffer();
        }
    }, [isListening]);

    const resetInactivityTimer = useCallback(() => {
        clearTimeout(timeoutRef.current);
        clearInterval(intervalRef.current);
        setRemainingTime(10);

        timeoutRef.current = setTimeout(() => {
            console.log("Inactivity detected. Stopping listening.");
            stopListening();
        }, inactivityTimeout);

        intervalRef.current = setInterval(() => {
            setRemainingTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }, [stopListening]);

    const getAvailableDevices = useCallback(() => {
        return Object.entries(deviceStates).flatMap(([, devices]) => Object.keys(devices));
    }, [deviceStates]);

    const findBestMatchDevice = useCallback((deviceName, availableDevices) => {
        console.log(`Finding best match for device: "${deviceName}"`);
        console.log("Available devices:", availableDevices);

        const normalizeString = str => str.toLowerCase().replace(/[^a-z0-9-]/g, '');

        let normalizedDeviceName = normalizeString(deviceName);
        console.log(`Normalized device name: "${normalizedDeviceName}"`);

        const bestMatch = availableDevices.reduce((best, device) => {
            const normalizedDevice = normalizeString(device);
            console.log(`Comparing with normalized device: "${normalizedDevice}"`);

            if (normalizedDevice === normalizedDeviceName) {
                console.log(`Exact match found: "${device}"`);
                return { device, score: 0 };
            }

            // Improved partial matching
            const deviceParts = normalizedDevice.split('-');
            const nameParts = normalizedDeviceName.split('-');

            if (deviceParts.length !== nameParts.length) {
                return best;
            }

            let score = deviceParts.reduce((acc, part, index) => {
                if (index === 0) {
                    // Device type (LED or FAN) must match exactly
                    return part === nameParts[index] ? acc : Infinity;
                } else {
                    // For the number part, check for exact match or word-to-number conversion
                    const wordToNumber = {
                        'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5'
                    };
                    const normalizedNamePart = wordToNumber[nameParts[index]] || nameParts[index];
                    return normalizedNamePart === part ? acc : acc + 1;
                }
            }, 0);

            console.log(`Partial match found: "${device}" with score ${score}`);

            return score < best.score ? { device, score } : best;
        }, { device: null, score: Infinity });

        if (bestMatch.device) {
            console.log(`Best match found: "${bestMatch.device}" with score ${bestMatch.score}`);
            return bestMatch.device;
        }

        console.log(`No match found for: "${deviceName}"`);
        return null;
    }, []);


    const executeCommand = useCallback((command, confidence) => {
        console.log(`Executing command: ${command} (Confidence: ${confidence})`);

        if (confidence < confidenceThreshold) {
            console.warn(`Command confidence (${confidence}) below threshold (${confidenceThreshold}). Ignoring command.`);
            setError(`Command not recognized with sufficient confidence. Please try again.`);
            return;
        }

        const mappedCommand = mapPhrase(command);
        console.log(`Mapped command: ${mappedCommand}`);

        if (/^stop listening$/i.test(mappedCommand.trim())) {
            stopListening();
            setLastExecutedCommand({ type: 'system', action: 'stop_listening' });
            return;
        }

        const availableDevices = getAvailableDevices();
        console.log("Available devices:", availableDevices);

        if (/turn (on|off) all/i.test(mappedCommand)) {
            const state = /turn on all/i.test(mappedCommand);
            console.log(`Toggling all devices to: ${state}`);
            toggleAllDevices(state);
            setLastExecutedCommand({ type: 'all', state });
            return;
        }

        const deviceMatch = mappedCommand.match(/turn (on|off) ([\w-]+)/i);
        if (deviceMatch) {
            const [, action, deviceName] = deviceMatch;
            const state = action.toLowerCase() === 'on';
            console.log(`Attempting to find device: "${deviceName}"`);
            const foundDevice = findBestMatchDevice(deviceName, availableDevices);

            if (foundDevice) {
                console.log(`Toggling device: ${foundDevice}`);
                console.log(`Current device states:`, deviceStates);
                console.log(`New state for ${foundDevice}: ${state}`);
                toggleDevice(foundDevice, state);
                setLastExecutedCommand({ type: 'device', device: foundDevice, state });
            } else {
                console.log(`Device "${deviceName}" not found.`);
                setError(`Device "${deviceName}" not found. Please try again with a valid device name.`);
            }
        } else {
            console.log(`Unrecognized command: "${mappedCommand}"`);
            setError(`Unrecognized command: "${mappedCommand}". Please try saying "turn on/off [device name]", "turn on/off all", or "stop listening".`);
        }
    }, [deviceStates, toggleDevice, toggleAllDevices, getAvailableDevices, findBestMatchDevice, stopListening]);



    const processCommandBuffer = useCallback(() => {
        const fullCommand = commandBufferRef.current.join(' ').toLowerCase().trim();
        if (fullCommand) {
            setRecognizedCommand(fullCommand);
            executeCommand(fullCommand, 1);
            commandBufferRef.current = [];
            resetInactivityTimer();
        }
    }, [executeCommand, resetInactivityTimer]);

    const initSpeechRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition && !recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                console.log("Speech recognition started");
                setIsListening(true);
                setError(null);
                resetInactivityTimer();
            };

            recognitionRef.current.onresult = (event) => {
                const last = event.results.length - 1;
                const transcript = event.results[last][0].transcript.trim();
                const confidence = event.results[last][0].confidence;

                if (event.results[last].isFinal) {
                    commandBufferRef.current.push(transcript);
                    processCommandBuffer();
                } else {
                    setRecognizedCommand(transcript);
                }
                resetInactivityTimer();
            };

            recognitionRef.current.onerror = (event) => {
                console.log("Speech recognition error:", event.error);
                if (event.error === 'aborted') {
                    // This is an expected error when we stop listening
                    console.log("Speech recognition aborted");
                } else {
                    setError(`Speech recognition error: ${event.error}`);
                }
            };

            recognitionRef.current.onend = () => {
                console.log("Speech recognition ended");
                setIsListening(false);
                if (isListening) {
                    console.log("Attempting to restart speech recognition");
                    startListening();
                }
            };
        } else if (!SpeechRecognition) {
            console.error('Speech recognition is not supported in this browser.');
            setError('Speech recognition is not supported in this browser.');
        }
    }, [isListening, processCommandBuffer, resetInactivityTimer]);

    const startListening = useCallback(() => {
        const setupAndStart = async () => {
            if (!recognitionRef.current) {
                initSpeechRecognition();
            }

            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (err) {
                console.error('Error accessing microphone:', err);
                setError('Unable to access the microphone. Please check your browser permissions.');
                return;
            }

            if (recognitionRef.current && !isListening) {
                setError(null);
                commandBufferRef.current = [];

                try {
                    recognitionRef.current.start();
                    console.log("Speech recognition started successfully");
                } catch (err) {
                    console.error('Error starting speech recognition:', err);
                    setError('Failed to start speech recognition. Please refresh the page and try again.');
                }
            }
        };

        setupAndStart();
    }, [isListening, initSpeechRecognition]);

    useEffect(() => {
        initSpeechRecognition();
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
            clearTimeout(timeoutRef.current);
        };
    }, [initSpeechRecognition]);

    return {
        isListening,
        startListening,
        stopListening,
        recognizedCommand,
        error,
        lastExecutedCommand,
        remainingTime,
    };
};

export { useVoiceRecognitionHook };