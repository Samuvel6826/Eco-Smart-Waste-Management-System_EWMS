import React, { useEffect, useMemo, useState, Suspense, useCallback } from 'react';
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
    useTheme,
    useMediaQuery,
    Card,
    CardContent,
    Fade,
    Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUsersContext } from '../contexts/UsersContext';
import Navbar from './common/Navbar';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';

const AssignBinLocations = React.lazy(() => import('./AssignBinLocations'));

function Dashboard() {
    const { user, logout } = useAuth();
    const { users, loading: userLoading, error: userError, fetchUsers, deleteUser: deleteUserFromContext, changePassword } = useUsersContext();
    const token = sessionStorage.getItem('token');
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedRole, setSelectedRole] = useState('All');
    const [openAssignDialog, setOpenAssignDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [changePasswordDialog, setChangePasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
    const [changePasswordUserId, setChangePasswordUserId] = useState(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchData = useCallback(async () => {
        if (token) {
            try {
                await fetchUsers();
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Error fetching data. Please try again.');
                if (error?.response?.status === 401) {
                    logout();
                }
            }
        }
    }, [token, fetchUsers, logout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (userError) {
            toast.error(`User Error: ${userError}`);
        }
    }, [userError]);

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

    const handleChangePassword = (userId) => {
        setChangePasswordUserId(userId);
        setChangePasswordDialog(true);
    };

    const closeChangePasswordDialog = () => {
        setChangePasswordDialog(false);
        setPasswordData({ password: '', confirmPassword: '' });
    };

    const submitChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }
        setIsChangingPassword(true);
        try {
            await changePassword(changePasswordUserId, passwordData.newPassword);
            closeChangePasswordDialog();
            toast.success('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
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

    const openAssignDialogHandler = useCallback(() => {
        setOpenAssignDialog(true);
    }, []);

    const closeAssignDialogHandler = useCallback(() => {
        setOpenAssignDialog(false);
        fetchData();
    }, [fetchData]);

    const MemoizedAssignBinLocations = useMemo(() => React.memo(AssignBinLocations), []);

    const renderUserCard = (user, index) => (
        <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
            <Card elevation={3} sx={{ mb: 2, position: 'relative' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Employee ID: {user.employeeId}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Email: {user.email}
                    </Typography>
                    <Box mt={1}>
                        <Chip label={user.role} color="primary" size="small" />
                    </Box>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                        Bin Locations: {user.assignedBinLocations?.join(', ') || 'Not Assigned'}
                    </Typography>
                    <Box position="absolute" top={8} right={8}>
                        <Tooltip title="Change Password">
                            <IconButton size="small" onClick={() => handleChangePassword(user.employeeId)}>
                                <LockIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => navigate(`/edit-user/${user.employeeId}`)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                            <IconButton size="small" onClick={() => handleDeleteUser(user.employeeId)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="View User Details">
                            <IconButton size="small" onClick={() => navigate(`/user-description/${user.employeeId}`)}>
                                <DescriptionIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );

    if (userLoading) {
        return (
            <Container maxWidth="xl">
                <Navbar />
                <Box my={4}>
                    <Skeleton variant="rectangular" height={50} />
                    <Box mt={2}>
                        <Skeleton variant="rectangular" height={40} />
                    </Box>
                    <Box mt={2} display="flex" justifyContent="space-between">
                        <Skeleton variant="rectangular" width={120} height={40} />
                        <Skeleton variant="rectangular" width={120} height={40} />
                    </Box>
                    {[...Array(5)].map((_, index) => (
                        <Box key={index} mt={2}>
                            <Skeleton variant="rectangular" height={100} />
                        </Box>
                    ))}
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Navbar />
            <Box my={4}>
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
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/create-user')}
                            startIcon={<AddIcon />}
                        >
                            Add User
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={openAssignDialogHandler}
                            startIcon={<AssignmentIcon />}
                        >
                            Manage Bins
                        </Button>
                    </Grid>
                </Grid>
                {isMobile ? (
                    <Box>
                        {paginatedUsers.map((user, index) => renderUserCard(user, index))}
                    </Box>
                ) : (
                    <Paper elevation={3}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Employee ID</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Bin Location</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedUsers.map((user, index) => (
                                        <TableRow key={user.employeeId} hover>
                                            <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                                            <TableCell>{user.employeeId}</TableCell>
                                            <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip label={user.role} color="primary" size="small" />
                                            </TableCell>
                                            <TableCell>{user.assignedBinLocations?.join(', ') || 'Not Assigned'}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Change Password">
                                                    <IconButton size="small" onClick={() => handleChangePassword(user.employeeId)}>
                                                        <LockIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete User">
                                                    <IconButton size="small" onClick={() => handleDeleteUser(user.employeeId)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="View User Profile">
                                                    <IconButton size="small" onClick={() => navigate(`/user-profile/${user.employeeId}`)}>
                                                        <DescriptionIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[7, 10, 25, 50]}
                            component="div"
                            count={filteredUsers.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                )}
            </Box>

            {/* Enhanced Change Password Dialog */}
            <Dialog open={changePasswordDialog} onClose={closeChangePasswordDialog}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeChangePasswordDialog} disabled={isChangingPassword}>Cancel</Button>
                    <Button onClick={submitChangePassword} disabled={isChangingPassword}>
                        {isChangingPassword ? <CircularProgress size={24} /> : 'Change Password'}
                    </Button>
                </DialogActions>
            </Dialog>

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

            <Dialog
                open={openAssignDialog}
                onClose={closeAssignDialogHandler}
                fullWidth
                maxWidth="md"
            >
                <Suspense fallback={<CircularProgress />}>
                    <MemoizedAssignBinLocations
                        open={openAssignDialog}
                        onClose={closeAssignDialogHandler}
                        onAssignSuccess={fetchData}
                    />
                </Suspense>
            </Dialog>
        </Container >
    );
}

export default React.memo(Dashboard);