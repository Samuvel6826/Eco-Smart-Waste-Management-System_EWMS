import React from 'react';
import {
    Typography,
    Button,
    Select,
    Option,
} from "@material-tailwind/react";
import {
    ArrowLeftIcon,
    ArrowRightIcon
} from "@heroicons/react/24/solid";

// Define component with explicit named export
export const UsersListFooter = ({
    page,
    totalPages,
    rowsPerPage,
    handleChangeRowsPerPage,
    handleChangePage,
    filteredUsers,
    loading = false
}) => {
    const ROWS_PER_PAGE_OPTIONS = [5, 7, 10, 25];

    // Calculate display ranges
    const startIndex = page * rowsPerPage + 1;
    const endIndex = Math.min((page + 1) * rowsPerPage, filteredUsers.length);

    return (
        <div className="flex flex-col gap-4 border-t border-blue-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray">
                    Show
                </Typography>
                <Select
                    value={rowsPerPage.toString()}
                    onChange={(value) => handleChangeRowsPerPage(Number(value))}
                    disabled={loading}
                    className="w-20"
                    containerProps={{ className: "min-w-[5rem]" }}
                >
                    {ROWS_PER_PAGE_OPTIONS.map((option) => (
                        <Option key={option} value={option.toString()}>
                            {option}
                        </Option>
                    ))}
                </Select>
                <Typography variant="small" color="blue-gray">
                    entries
                </Typography>
            </div>

            {/* Results summary */}
            <Typography variant="small" color="blue-gray">
                Showing {startIndex} to {endIndex} of {filteredUsers.length} entries
            </Typography>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => handleChangePage(page - 1)}
                    disabled={page === 0 || loading}
                    className="flex items-center gap-2"
                >
                    <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Previous
                </Button>

                <Typography variant="small" color="blue-gray" className="font-normal">
                    Page {page + 1} of {totalPages}
                </Typography>

                <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => handleChangePage(page + 1)}
                    disabled={page >= totalPages - 1 || loading}
                    className="flex items-center gap-2"
                >
                    Next <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

// Add both default and named exports
export default UsersListFooter;