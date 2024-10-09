import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Import your custom hook

function Navbar() {
    const { user, logout } = useAuth(); // Get user info and logOut function from context
    const [isAdmin, setIsAdmin] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (user) {
            setIsAdmin(user.role === "Admin");
        }
    }, [user]);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
    };

    // Create an array of links
    const links = isAdmin
        ? [
            <MenuItem key="dashboard" component={Link} to="/dashboard">Dashboard</MenuItem>,
            <MenuItem key="lists-bins" component={Link} to="/users/bins">Lists Bins</MenuItem>,
            <MenuItem key="create-bin" component={Link} to="/users/create-bin/:locationId">Create Bin</MenuItem>,
        ]
        : []; // Non-admins might have different links, adjust accordingly

    return (
        <AppBar position="static" className="bg-gray-800">
            <Toolbar>
                <Typography variant="h6" className="flex-grow">
                    Eco-Smart Waste Management System (EWMS)
                </Typography>
                {user && (
                    <div className="flex items-center">
                        <Typography variant="body1" className="mr-4 text-white">
                            {`${user.role} : ${user.firstName}`}
                        </Typography>
                        <Button variant="contained" color="error" onClick={handleMenuOpen}>
                            Menu
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            {links} {/* Pass the array of links directly */}
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </div>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;