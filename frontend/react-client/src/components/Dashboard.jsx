import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './common/Navbar';
import axios from 'axios';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Container,
    Typography,
    TextField,
    IconButton,
    TablePagination,
    Box,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import { useUserContext } from '../contexts/UserContext';
import { useBinContext } from '../contexts/BinContext';
import AssignBinLocations from './AssignBinLocations';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Dashboard() {
    const { user, logOut } = useUserAuth();
    const { users, loading: userLoading, error: userError, fetchUsers } = useUserContext();
    const { bins, loading: binLoading, error: binError, fetchBinData } = useBinContext();
    const token = sessionStorage.getItem('token');
    const [deleteUser, setDeleteUser] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedRole, setSelectedRole] = useState('All');
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const navigate = useNavigate();

    // New state variables for search and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST_URL}/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200) {
                toast.success(`${res.data.message} successfully deleted.`);
                fetchUsers();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete user. Please try again later.';
            toast.error(errorMsg);
            if (error.response?.status === 401) {
                toast.error('Session expired. Logging out...');
                logOut();
            }
        }
    };

    const handleOpenConfirmation = (user) => {
        setDeleteUser(user);
        setShowConfirmation(true);
    };

    const handleCloseConfirmation = () => {
        setDeleteUser(null);
        setShowConfirmation(false);
    };

    const handleConfirmDelete = async () => {
        if (deleteUser) {
            await handleDelete(deleteUser._id);
            handleCloseConfirmation();
        }
    };

    const handleOpenAssignDialog = (userId) => {
        setSelectedUserId(userId);
        setOpenAssignDialog(true);
    };

    const handleCloseAssignDialog = () => {
        setOpenAssignDialog(false);
        setSelectedUserId(null);
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        } else {
            toast.error('Unauthorized access. Logging out...');
            logOut();
        }
    }, [token, fetchUsers, logOut]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesRole = selectedRole === 'All' || user.role === selectedRole;
            const matchesSearch =
                user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [users, selectedRole, searchTerm]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (userLoading) return <div>Loading user data...</div>;
    if (userError) return <div>Error: {userError}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar title="User Dashboard" />

            <Container maxWidth="lg" className="mt-8">
                <Typography variant="h4" className="mb-5 text-center font-bold">
                    User Management Dashboard
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    {user.role === 'Admin' && (
                        <FormControl variant="outlined" style={{ minWidth: 200 }}>
                            <InputLabel id="role-select-label">Filter by Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                label="Filter by Role"
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                                <MenuItem value="Manager">Manager</MenuItem>
                                <MenuItem value="Supervisor">Supervisor</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        variant="outlined"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <IconButton>
                                    <SearchIcon />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee ID</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Assigned Bin Locations</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                                <TableRow key={user._id} hover>
                                    <TableCell>{user.employeeId}</TableCell>
                                    <TableCell>
                                        <Chip label={user.role} color={
                                            user.role === 'Admin' ? 'error' :
                                                user.role === 'Manager' ? 'warning' :
                                                    'success'
                                        } />
                                    </TableCell>
                                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                                    <TableCell>
                                        {user.assignedBinLocations?.length ? (
                                            <Chip
                                                icon={<LocationOnIcon />}
                                                label={`${user.assignedBinLocations}`}
                                                color="info"
                                            />
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/edit-user/${user._id}`)}
                                            title="Edit User"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => navigate(`/change-password/${user._id}`)}
                                            title="Change Password"
                                        >
                                            <LockResetIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenConfirmation(user)}
                                            title="Delete User"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                        {user.role !== 'Supervisor' && (
                                            <IconButton
                                                color="info"
                                                onClick={() => handleOpenAssignDialog(user._id)}
                                                title="Assign Bins"
                                            >
                                                <LocationOnIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Rows per page"
                />

                {/* Assign Bin Dialog */}
                <AssignBinLocations
                    open={openAssignDialog}
                    onClose={handleCloseAssignDialog}
                    userId={selectedUserId}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete user {deleteUser?.employeeId}?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmation}>Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}

export default Dashboard;