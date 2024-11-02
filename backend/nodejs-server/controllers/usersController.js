const sanitize = require('../common/Sanitize');
const UsersModel = require('../models/usersModel');
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const { getFormattedDate } = require('../utils/deviceMonitoring');
const { handleClientError, handleServerError } = require('../middlewares/errorHandlers');

/**
 * Fetch all users with pagination and sorting
 * @route GET /api/user
 * @access Private (Admin)
 */
const getAllUsers = async (req, res) => {
    try {
        const data = await UsersModel.find()
            .sort({ employeeId: 1 })  // Sort by employeeId in ascending order
            .select('-password');     // Exclude password from the response

        res.status(200).json({
            data,
            message: 'Users fetched successfully'
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

/**
 * Fetch user by employeeId
 * @route GET /api/user/employee
 * @access Private
 */
const getUserByEmployeeId = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.query.employeeId);
        const data = await UsersModel.findOne({ employeeId })
            .select('-password');  // Exclude password from response

        if (!data) {
            return handleClientError(res, `User not found with employeeId: ${employeeId}`);
        }

        res.status(200).json({
            data,
            message: `User fetched successfully with employeeId: ${employeeId}`
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

/**
 * Fetch assigned bin locations for a user
 * @route GET /api/user/bins
 * @access Private
 */
const getAssignedBinLocations = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.query.employeeId);
        const employee = await UsersModel.findOne({ employeeId })
            .select('assignedBinLocations -_id');  // Select only assignedBinLocations field

        if (!employee) {
            return handleClientError(res, `Employee not found with employeeId: ${employeeId}`);
        }

        res.status(200).json({
            assignedBinLocations: employee.assignedBinLocations,
            message: `Assigned bin locations fetched successfully for employeeId: ${employeeId}`
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

/**
 * Create a new user
 * @route POST /api/users
 * @access Private (Admin)
 */
const createUser = async (req, res) => {
    try {
        const {
            employeeId,
            profilePic,
            firstName,
            lastName,
            email,
            password,
            role,
            phoneNumber,
            assignedBinLocations,
            userDescription,
            address,
            dateOfBirth,
            gender,
            age,
            createdBy,
            createdAt
        } = req.body;

        // Validate required fields
        // const requiredFields = ['employeeId', 'firstName', 'lastName', 'email', 'password', 'role', 'gender', 'address'];
        // for (const field of requiredFields) {
        //     if (!req.body[field]) {
        //         return handleClientError(res, `Missing required field: ${field}. Please ensure all required fields are provided.`);
        //     }
        // }

        // Validate address fields
        // const addressFields = ['country', 'state', 'district', 'city', 'streetAddress', 'pinCode'];
        // for (const field of addressFields) {
        //     if (!address[field]) {
        //         return handleClientError(res, `Missing required address field: ${field}. Please ensure all required address fields are provided.`);
        //     }
        // }

        // Check for existing user by email or employeeId
        const existingUser = await UsersModel.findOne({
            $or: [{ email }, { employeeId }]
        });

        if (existingUser) {
            return handleClientError(res,
                existingUser.email === email
                    ? `The email address ${email} is already associated with another account.`
                    : `The Employee ID ${employeeId} is already in use.`
            );
        }

        // Create the user record in the database
        const newUser = await UsersModel.create(req.body);

        return res.status(201).json({
            message: `User created successfully with Employee ID: ${newUser.employeeId}.`
        });
    } catch (error) {
        // Handle unauthorized access error specifically
        if (error.name === 'UnauthorizedError') {
            return res.status(401).json({
                message: 'Unauthorized access. Please ensure you have the necessary permissions to perform this action.'
            });
        }

        console.error('Error creating user:', error);
        return handleServerError(res, error);
    }
};

/**
 * Update user by employeeId
 * @route PUT /api/user
 * @access Private
 */
const editUserByEmployeeId = async (req, res) => {
    try {
        const employeeId = req.query.employeeId; // Get employeeId from query params
        const {
            firstName,
            lastName,
            email,
            role,
            phoneNumber,
            profilePic,
            assignedBinLocations,
            userDescription,
            address,
            dateOfBirth,
            gender,
            age,
            updatedBy, // Include updatedBy here
            updatedAt, // Include updatedBy here
        } = req.body;

        const updatedUser = await UsersModel.findOneAndUpdate(
            { employeeId },
            (req.body),
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return handleClientError(res, `User not found with employeeId: ${employeeId}`);
        }

        res.status(200).json({
            message: `User updated successfully with employeeId: ${employeeId}`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        handleServerError(res, error);
    }
};


/**
 * Delete user by employeeId
 * @route DELETE /api/user
 * @access Private (Admin)
 */
const deleteUserByEmployeeId = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.query.employeeId);
        const deletedUser = await UsersModel.findOneAndDelete({ employeeId });

        if (!deletedUser) {
            return handleClientError(res, `User not found with employeeId: ${employeeId}`);
        }

        res.status(200).json({
            message: `User deleted successfully with employeeId: ${employeeId}`,
            deletedUser: {
                employeeId: deletedUser.employeeId,
                email: deletedUser.email
            }
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

/**
 * User login
 * @route POST /api/user/login
 * @access Public
 */
const loginUser = async (req, res) => {
    try {
        const email = sanitize.isString(req.body.email);
        const password = sanitize.isString(req.body.password);

        logger.info(`Login attempt for email: ${email}`);

        if (!email || !password) {
            return handleClientError(res, 'Email and password are required');
        }

        const user = await UsersModel.findOne({ email });

        if (!user) {
            logger.warn(`Login attempt failed: User not found for email ${email}`);
            return handleClientError(res, 'Invalid email or password');
        }

        const isValidPassword = await auth.comparePassword(password, user.password);
        if (!isValidPassword) {
            logger.warn(`Login attempt failed: Invalid password for email ${email}`);
            return handleClientError(res, 'Invalid email or password');
        }

        const lastLoginBy = `${user.role || 'Unknown'} ${user.firstName || ''} ${user.lastName || ''} ${user.employeeId || 'Unknown'}`.trim();

        const lastLoginAt = req.body.lastLoginAt ? sanitize.isString(req.body.lastLoginAt) : getFormattedDate();

        const updateResult = await UsersModel.updateOne(
            { email },
            {
                $set: {
                    lastLoginBy,
                    lastLoginAt
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            logger.warn(`Failed to update login fields for user ${email}`);
        }

        const token = await auth.createToken({
            employeeId: user.employeeId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        });

        logger.info(`Login successful for user: ${email}`);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                employeeId: user.employeeId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                lastLoginBy,
                lastLoginAt
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        handleServerError(res, error);
    }
};

/**
 * Change user password
 * @route PUT /api/user/password
 * @access Private
 */
const changePassword = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.body.employeeId);
        const password = sanitize.isString(req.body.password);
        const confirmPassword = sanitize.isString(req.body.confirmPassword);

        // Find user by employeeId first
        const user = await UsersModel.findOne({ employeeId });
        if (!user) {
            return handleClientError(res, 'User not found with the provided employeeId');
        }

        // Use lastPasswordChangedAt and lastPasswordChangedBy from the frontend or provide defaults
        const lastPasswordChangedAt = sanitize.isString(req.body.lastPasswordChangedAt) || getFormattedDate();
        const lastPasswordChangedBy = sanitize.isString(req.body.lastPasswordChangedBy) ||
            `${user.role || 'Unknown'} ${user.firstName || ''} ${user.lastName || ''} ${user.employeeId || 'Unknown'}`.trim();

        // Check if password and confirmPassword are provided
        if (!password || !confirmPassword) {
            return handleClientError(res, 'Password and confirm password are required');
        }

        // Ensure password and confirmPassword match
        if (password !== confirmPassword) {
            return handleClientError(res, 'Passwords do not match');
        }

        // Set and hash the new password (hashing happens in the schema)
        user.password = password;
        user.lastPasswordChangedAt = lastPasswordChangedAt;
        user.lastPasswordChangedBy = lastPasswordChangedBy;
        user.updatedBy = lastPasswordChangedBy;
        user.updatedAt = lastPasswordChangedAt;

        await user.save(); // Invoke the pre-save hook to hash the password

        // Log request details and respond with success message
        logger.info(`Password changed successfully for employeeId: ${employeeId}`);
        res.status(200).json({
            message: `Password changed successfully for employeeId: ${employeeId}`
        });
    } catch (error) {
        logger.error('Change password error:', error);
        handleServerError(res, error);
    }
};

/**
 * Assign bins to supervisor
 * @route PUT /api/user/bins/assign
 * @access Private (Admin)
 */
const assignBinsBySupervisorId = async (req, res) => {
    try {
        // Retrieve and validate `supervisorId` from `req.body`
        const supervisorId = req.body.supervisorId ? sanitize.isString(req.body.supervisorId) : null;
        if (!supervisorId) {
            return handleClientError(res, 'Supervisor ID is required');
        }

        // Validate and assign `assignedBinLocations` from `req.body`
        const assignedBinLocations = req.body.assignedBinLocations && Array.isArray(req.body.assignedBinLocations)
            ? req.body.assignedBinLocations
            : null;
        if (!assignedBinLocations) {
            return handleClientError(res, 'Invalid assigned bin locations data');
        }

        // Fetch the supervisor document to access user details
        const supervisor = await UsersModel.findOne({ employeeId: supervisorId });
        if (!supervisor) {
            return handleClientError(res, `Supervisor not found with ID: ${supervisorId}`);
        }

        // Optional fields with defaults if not provided
        const assignedBinsBy = req.body.assignedBinsBy
            ? sanitize.isString(req.body.assignedBinsBy)
            : `${supervisor.role || 'Unknown'} ${supervisor.firstName || ''} ${supervisor.lastName || ''} ${supervisor.employeeId || 'Unknown'}`.trim();

        const assignedBinsAt = req.body.assignedBinsAt ? sanitize.isString(req.body.assignedBinsAt) : getFormattedDate();
        const updatedBy = req.body.updatedBy ? sanitize.isString(req.body.updatedBy) : assignedBinsBy;
        const updatedAt = req.body.updatedAt ? sanitize.isString(req.body.updatedAt) : assignedBinsAt;

        // Prepare the update data with the provided or default values
        const updateData = {
            assignedBinLocations,
            assignedBinsBy,
            assignedBinsAt,
            updatedBy,
            updatedAt
        };

        // Update the user document with `supervisorId`
        const updatedUser = await UsersModel.findOneAndUpdate(
            { employeeId: supervisorId },  // Find user by `employeeId` (acting as supervisor ID)
            updateData,
            { new: true, runValidators: true }
        );

        // Check if the user with the specified supervisor ID was found and updated
        if (!updatedUser) {
            return handleClientError(res, `Supervisor not found with ID: ${supervisorId}`);
        }

        // Respond with a success message and updated user data
        res.status(200).json({
            message: `Bins assigned successfully to supervisor ID: ${supervisorId}`,
            data: updatedUser
        });
    } catch (error) {
        logger.error('Error assigning bins:', error);
        handleServerError(res, error);
    }
};

module.exports = {
    getAllUsers,
    getUserByEmployeeId,
    getAssignedBinLocations,
    createUser,
    editUserByEmployeeId,
    deleteUserByEmployeeId,
    loginUser,
    changePassword,
    assignBinsBySupervisorId
};