import React, { forwardRef, useMemo } from 'react';
import { Tooltip } from "@material-tailwind/react";

const DynamicBatteryIcon = forwardRef(({
    batteryLevel,
    isCharging = false,
    isFault = false,
    temperature = null,
    className,
    ...props
}, ref) => {
    // Enhanced color states with gradient support
    const getBatteryState = useMemo(() => {
        if (isFault) return {
            fillColor: '#ef4444', // red-500
            gradientStart: '#fee2e2', // red-100
            gradientEnd: '#ef4444', // red-500
            pulseColor: '#dc2626', // red-600
            status: 'Fault Detected',
            icon: '⚠️'
        };

        if (isCharging) return {
            fillColor: '#2563eb', // blue-600
            gradientStart: '#dbeafe', // blue-100
            gradientEnd: '#2563eb', // blue-600
            pulseColor: '#1d4ed8', // blue-700
            status: 'Charging',
            icon: '⚡'
        };

        if (batteryLevel >= 80) return {
            fillColor: '#16a34a', // green-600
            gradientStart: '#dcfce7', // green-100
            gradientEnd: '#16a34a', // green-600
            pulseColor: '#15803d', // green-700
            status: 'Healthy',
            icon: '✓'
        };

        if (batteryLevel >= 40) return {
            fillColor: '#ca8a04', // yellow-600
            gradientStart: '#fef9c3', // yellow-100
            gradientEnd: '#ca8a04', // yellow-600
            pulseColor: '#a16207', // yellow-700
            status: 'Moderate',
            icon: '!'
        };

        return {
            fillColor: '#dc2626', // red-600
            gradientStart: '#fee2e2', // red-100
            gradientEnd: '#dc2626', // red-600
            pulseColor: '#b91c1c', // red-700
            status: 'Critical',
            icon: '⚠️'
        };
    }, [batteryLevel, isCharging, isFault]);

    // Enhanced status text with temperature
    const getDetailedStatus = () => {
        let status = `Battery Status: ${getBatteryState.status} (${batteryLevel}%)`;
        if (temperature) {
            status += ` | Temp: ${temperature}°C`;
        }
        return status;
    };

    return (
        <div ref={ref} {...props} className={`flex items-center gap-1 ${className || ''}`}>
            <Tooltip content={getDetailedStatus()}>
                <div className="relative flex items-center gap-1.5">
                    {/* Main Battery Icon */}
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`transform transition-transform duration-300 ${isCharging ? 'scale-110' : ''
                            }`}
                    >
                        {/* Battery Case - Enhanced with gradient */}
                        <rect
                            x="1"
                            y="1"
                            width="20"
                            height="10"
                            rx="2"
                            stroke={getBatteryState.fillColor}
                            strokeWidth="1.5"
                            fill="none"
                            className="transition-colors duration-300"
                        />

                        {/* Battery Terminal - Animated when charging */}
                        <rect
                            x="21"
                            y="4"
                            width="3"
                            height="4"
                            fill={getBatteryState.fillColor}
                            className={`transition-colors duration-300 ${isCharging ? 'animate-pulse' : ''
                                }`}
                        />

                        {/* Battery Fill - Enhanced with gradient and animation */}
                        <defs>
                            <linearGradient id="batteryFill" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={getBatteryState.gradientStart} />
                                <stop offset="100%" stopColor={getBatteryState.gradientEnd} />
                            </linearGradient>
                        </defs>
                        <rect
                            x="3"
                            y="3"
                            width={16 * (batteryLevel / 100)}
                            height="6"
                            rx="1"
                            fill="url(#batteryFill)"
                            className={`transition-all duration-300 ${isCharging ? 'animate-[battery-charge_2s_ease-in-out_infinite]' : ''
                                } ${batteryLevel <= 20 && !isCharging ? 'animate-pulse' : ''}`}
                        />

                        {/* Charging Lightning Bolt or Warning Icon */}
                        {(isCharging || isFault) && (
                            <path
                                d="M10 2 L14 6 L11 6 L14 10 L10 6 L13 6 L10 2"
                                fill="white"
                                className="animate-[charging_1.5s_ease-in-out_infinite]"
                            />
                        )}
                    </svg>

                    {/* Status Text and Icon */}
                    <div className="flex items-center gap-1">
                        <span
                            className="text-sm font-medium transition-colors duration-300"
                            style={{ color: getBatteryState.fillColor }}
                        >
                            {batteryLevel}%
                        </span>
                        <span className={`
                            text-xs
                            ${isCharging ? 'animate-[charging_1.5s_ease-in-out_infinite]' : ''}
                        `}>
                            {getBatteryState.icon}
                        </span>
                    </div>

                    {/* Temperature Indicator (if provided) */}
                    {temperature && (
                        <span
                            className="ml-1 text-xs opacity-75"
                            style={{ color: getBatteryState.fillColor }}
                        >
                            {temperature}°C
                        </span>
                    )}
                </div>
            </Tooltip>
        </div>
    );
});

DynamicBatteryIcon.displayName = 'DynamicBatteryIcon';

// Add these enhanced styles to your global CSS or style sheet
const styles = `
@keyframes battery-charge {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.8;
        transform: scale(0.98);
    }
}

@keyframes charging {
    0%, 100% {
        transform: scale(1) translateY(0);
    }
    50% {
        transform: scale(1.1) translateY(-1px);
    }
}

@keyframes pulse-glow {
    0%, 100% {
        filter: drop-shadow(0 0 2px currentColor);
    }
    50% {
        filter: drop-shadow(0 0 6px currentColor);
    }
}
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default DynamicBatteryIcon;