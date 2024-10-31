import {
    Card,
    CardBody,
    Typography
} from "@material-tailwind/react";
import {
    UserCircleIcon,
    ChartBarIcon,
    UserGroupIcon
} from "@heroicons/react/24/solid";

export const UserStatsCard = ({
    role,
    count,
    loading = false
}) => {

    const getRoleIcon = (role) => {
        switch (role.toLowerCase()) {
            case 'admin':
                return <UserCircleIcon className="h-6 w-6" />;
            case 'manager':
                return <ChartBarIcon className="h-6 w-6" />;
            default:
                return <UserGroupIcon className="h-6 w-6" />;
        }
    };

    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardBody className="p-4">
                {/* Background decoration */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-gray-50/30 blur-sm" />

                {/* Icon container */}
                <div className="absolute right-4 top-4 rounded-full bg-blue-gray-50/50 p-2 transition-transform hover:scale-110">
                    {getRoleIcon(role)}
                </div>

                {/* Main content */}
                <div className="space-y-2">
                    <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                        {role}s
                    </Typography>

                    <Typography
                        variant="h3"
                        color="blue-gray"
                        className="animation-pulse flex items-baseline gap-2"
                    >
                        {loading ? (
                            <div className="h-8 w-16 animate-pulse rounded bg-blue-gray-100" />
                        ) : (
                            <>
                                {count}
                            </>
                        )}
                    </Typography>
                </div>

            </CardBody>
        </Card>
    );
};