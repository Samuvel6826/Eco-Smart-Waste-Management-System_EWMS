import React, { useEffect } from 'react';
import {
    Typography,
    Button,
    Select,
    Option,
    Alert
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    InformationCircleIcon,
    XMarkIcon
} from "@heroicons/react/24/solid";

export const UsersListFooter = ({
    page,
    totalPages,
    rowsPerPage,
    handleChangeRowsPerPage,
    handleChangePage,
    filteredUsers,
    loading = false
}) => {
    const [openAlert, setOpenAlert] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");

    const ROWS_PER_PAGE_OPTIONS = [5, 7, 10, 25];

    // Calculate display ranges
    const startIndex = page * rowsPerPage + 1;
    const endIndex = Math.min((page + 1) * rowsPerPage, filteredUsers.length);

    // Show toast when reaching pagination limits
    const handlePaginationClick = (direction) => {
        if (direction === 'next' && page >= totalPages - 1) {
            setAlertMessage("You've reached the last page");
            setOpenAlert(true);
            return;
        }
        if (direction === 'prev' && page === 0) {
            setAlertMessage("You're already on the first page");
            setOpenAlert(true);
            return;
        }
        handleChangePage(direction === 'next' ? page + 1 : page - 1);
    };

    return (
        <div className="relative">
            {/* Toast Alert */}
            <div className="fixed bottom-4 right-4 z-50">
                <Alert
                    open={openAlert}
                    onClose={() => setOpenAlert(false)}
                    animate={{
                        mount: { y: 0 },
                        unmount: { y: 100 },
                    }}
                    icon={<InformationCircleIcon className="h-6 w-6" />}
                    className="border border-blue-gray-50 bg-white text-blue-gray-900 shadow-lg"
                    dismissible={{
                        onClose: () => setOpenAlert(false),
                        action: <XMarkIcon className="h-6 w-6 cursor-pointer" />,
                    }}
                >
                    {alertMessage}
                </Alert>
            </div>

            <div className="flex flex-col gap-6 border-t border-blue-gray-50 px-4 py-4 md:px-6">
                {/* Top section with entries selector and results summary */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-2">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                            Show
                        </Typography>
                        <Select
                            value={rowsPerPage.toString()}
                            onChange={(value) => handleChangeRowsPerPage(Number(value))}
                            disabled={loading}
                            className="w-20 !border-blue-gray-100 focus:!border-blue-500"
                            containerProps={{ className: "min-w-[5rem]" }}
                        >
                            {ROWS_PER_PAGE_OPTIONS.map((option) => (
                                <Option key={option} value={option.toString()}>
                                    {option}
                                </Option>
                            ))}
                        </Select>
                        <Typography variant="small" color="blue-gray" className="font-medium">
                            entries
                        </Typography>
                    </div>

                    {/* Results summary */}
                    <Typography variant="small" color="blue-gray" className="font-medium">
                        Showing {startIndex} to {endIndex} of {filteredUsers.length} entries
                    </Typography>
                </div>

                {/* Pagination controls */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePaginationClick('prev')}
                            disabled={page === 0 || loading}
                            className="flex items-center gap-2 transition-all hover:bg-blue-gray-50"
                            color="blue-gray"
                        >
                            <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <Typography variant="small" color="blue-gray" className="px-2 font-medium">
                            Page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{totalPages}</span>
                        </Typography>

                        <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => handlePaginationClick('next')}
                            disabled={page >= totalPages - 1 || loading}
                            className="flex items-center gap-2 transition-all hover:bg-blue-gray-50"
                            color="blue-gray"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersListFooter;