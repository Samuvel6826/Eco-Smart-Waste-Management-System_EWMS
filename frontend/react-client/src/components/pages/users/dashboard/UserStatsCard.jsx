import React from 'react';
import {
    Card,
    CardBody,
    Typography,
    Tooltip
} from "@material-tailwind/react";
import {
    FiUser,
    FiBarChart2,
    FiUsers,
    FiTrendingUp,
    FiCalendar
} from 'react-icons/fi';

export const UserStatsCard = ({
    role,
    count,
    loading = false,
    previousCount = 0,
    lastUpdated = null
}) => {
    // Calculate growth percentage
    const growth = previousCount ? ((count - previousCount) / previousCount) * 100 : 0;
    const isPositiveGrowth = growth > 0;

    const getRoleIcon = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <FiUser className="h-6 w-6" />;
            case 'manager':
                return <FiBarChart2 className="h-6 w-6" />;
            default:
                return <FiUsers className="h-6 w-6" />;
        }
    };

    // Get appropriate color based on role
    const getColorScheme = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'blue';
            case 'manager':
                return 'green';
            default:
                return 'indigo';
        }
    };

    const color = getColorScheme(role);

    return (
        <Card className="relative cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardBody className="p-4">
                {/* Background decoration */}
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-${color}-50/30 blur-sm`} />

                {/* Icon container */}
                <Tooltip content={`Total ${role}s`}>
                    <div className={`absolute right-4 top-4 rounded-full bg-${color}-50/50 p-2 transition-transform hover:scale-110`}>
                        {getRoleIcon(role)}
                    </div>
                </Tooltip>

                {/* Main content */}
                <div className="space-y-3">
                    <Typography variant="h6" color={color} className="flex items-center gap-2">
                        {role}s
                    </Typography>

                    {/* Count display */}
                    <div className="space-y-2">
                        <Typography
                            variant="h3"
                            color="blue-gray"
                            className="flex items-baseline gap-2"
                        >
                            {loading ? (
                                <div className="h-8 w-16 animate-pulse rounded bg-blue-gray-100" />
                            ) : (
                                <>
                                    {count.toLocaleString()}
                                    {previousCount > 0 && (
                                        <Tooltip content="Growth since last period">
                                            <span className={`flex items-center text-sm ${isPositiveGrowth ? 'text-green-500' : 'text-red-500'}`}>
                                                <FiTrendingUp className={`h-4 w-4 ${!isPositiveGrowth && 'rotate-180'}`} />
                                                {Math.abs(growth).toFixed(1)}%
                                            </span>
                                        </Tooltip>
                                    )}
                                </>
                            )}
                        </Typography>

                        {/* Last updated timestamp */}
                        {lastUpdated && !loading && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FiCalendar className="h-3 w-3" />
                                <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default UserStatsCard;