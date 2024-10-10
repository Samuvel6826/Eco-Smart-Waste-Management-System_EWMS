import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { toast } from 'react-hot-toast';
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
    CircularProgress,
    Chip,
    Grid,
    Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsersContext } from '../contexts/UsersContext';
import { useBinsContext } from '../contexts/BinsContext';
import Navbar from './common/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';

const AssignBinLocations = React.lazy(() => import('./AssignBinLocations'));

function Dashboard() {
    const { user, logout } = useAuth();
    const { users, loading: userLoading, error: userError, fetchUsers, deleteUser: deleteUserFromContext } = useUsersContext();
    const { bins, loading: binLoading, error: binError, fetchBins } = useBinsContext();
    const token = sessionStorage.getItem('token');
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedRole, setSelectedRole] = useState('All');
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (token) {
            fetchUsers();
            fetchBins();
        } else {
            toast.error('Unauthorized access. Logging out...');
            logout();
        }
    }, [token, fetchUsers, fetchBins, logout]);

    useEffect(() => {
        if (userError) {
            toast.error(`User Error: ${userError}`);
        }
        if (binError) {
            toast.error(`Bin Error: ${binError}`);
        }
    }, [userError, binError]);

    useEffect(() => {
        if (user?.employeeId) {
            setSelectedUserId(user.employeeId);
        }
    }, [user]);

    const rolesOrder = {
        Admin: 1,
        Manager: 2,
        Technician: 3,
        Supervisor: 4,
    };

    const filteredUsers = useMemo(() => {
        return (users || [])
            .filter((user) => {
                if (!user) return false;
                const matchesRole = selectedRole === 'All' || user.role === selectedRole;
                const matchesSearch =
                    user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesRole && matchesSearch;
            })
            .sort((a, b) => (rolesOrder[a.role] || 0) - (rolesOrder[b.role] || 0));
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

    const handleDeleteUser = (userId) => {
        setDeleteUserId(userId);
        setShowConfirmation(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await deleteUserFromContext(deleteUserId);
            toast.success('User deleted successfully.');
            setShowConfirmation(false);
            setDeleteUserId(null);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user.');
        }
    };

    const openAssignDialogHandler = () => {
        if (selectedUserId) {
            setOpenAssignDialog(true);
        } else {
            toast.error('User information is not available.');
        }
    };

    const closeAssignDialogHandler = () => {
        setOpenAssignDialog(false);
    };

    if (userLoading || binLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl">
            <Navbar />
            <Typography variant="h4" gutterBottom align="center" color="primary">
                User Dashboard
            </Typography>
            <Grid container spacing={2} justifyContent="center" alignItems="center" mb={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        variant="outlined"
                        placeholder="Search Users"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <IconButton>
                                    <SearchIcon />
                                </IconButton>
                            ),
                        }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} label="Role">
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="Manager">Manager</MenuItem>
                            <MenuItem value="Technician">Technician</MenuItem>
                            <MenuItem value="Supervisor">Supervisor</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={3} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="primary" onClick={() => navigate('/create-user')}>
                        Add User
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={openAssignDialogHandler}
                        disabled={!selectedUserId}
                    >
                        Manage Bin Locations
                    </Button>
                </Grid>
            </Grid>
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Employee ID</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Bin Location</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.map((user, index) => (
                                <TableRow key={user.employeeId}>
                                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                                    <TableCell>{user.employeeId}</TableCell>
                                    <TableCell>{user.firstName}</TableCell>
                                    <TableCell>{user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip label={user.role} color="primary" />
                                    </TableCell>
                                    <TableCell>{user.assignedBinLocations || 'Not Assigned'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit User">
                                            <IconButton onClick={() => navigate(`/edit-user/${user.employeeId}`)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete User">
                                            <IconButton onClick={() => handleDeleteUser(user.employeeId)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View User Details">
                                            <IconButton onClick={() => navigate(`/user-description/${user.employeeId}`)}>
                                                <DescriptionIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this user?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmation(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteUser} color="secondary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            <Suspense fallback={<CircularProgress />}>
                {openAssignDialog && selectedUserId && (
                    <AssignBinLocations
                        open={openAssignDialog}
                        onClose={closeAssignDialogHandler}
                        userId={selectedUserId}
                        bins={bins}
                    />
                )}
            </Suspense>
        </Container>
    );
}

export default Dashboard;