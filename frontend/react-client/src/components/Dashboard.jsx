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
    Chip,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../contexts/AuthContext';
import { useUserContext } from '../contexts/UsersContext';
import { useBinContext } from '../contexts/BinsContext';
import Navbar from './common/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Lazy load the AssignBinLocations component
const AssignBinLocations = React.lazy(() => import('./AssignBinLocations'));

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

    useEffect(() => {
        if (token) {
            fetchUsers(); // Fetch Users data
            fetchBinData(); // Fetch Bin data
        } else {
            toast.error('Unauthorized access. Logging out...');
            logOut();
        }
    }, [token, fetchUsers, fetchBinData, logOut]);

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

    if (!user) return <Typography variant="h6">Loading User Data...</Typography>;

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

                {/* Table and Pagination */}
                <TableContainer component={Paper}>
                    <Table>
                        {/* Add Table Content Here */}
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {/* Lazy Loaded Dialog */}
                <Suspense fallback={<CircularProgress />}>
                    <AssignBinLocations open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} userId={selectedUserId} />
                </Suspense>
            </Container>
        </div>
    );
}

export default Dashboard;