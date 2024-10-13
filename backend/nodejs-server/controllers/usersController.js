const sanitize = require('../common/Sanitize');
const UsersModel = require('../models/usersModel');
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');
const { getFormattedDate } = require('../utils/deviceMonitoring'); // Import the helper function
const { handleClientError, handleServerError } = require('../middlewares/errorHandlers');


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

const createUser = async (req, res) => {
    try {
        // Destructure user data from the request body
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phoneNumber,
            profilePic,
            assignedBinLocations,
            employeeId,
            userDesc
        } = req.body;

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role', 'employeeId'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return handleClientError(res, `Missing required field: ${field}. Please ensure all required fields are provided.`);
            }
        }

        // Check for existing user by email or employeeId
        const existingUser = await UsersModel.findOne({
            $or: [{ email }, { employeeId }]
        });

        if (existingUser) {
            return handleClientError(res,
                existingUser.email === email
                    ? `The email address ${email} is already associated with another account. Please use a different email.`
                    : `The Employee ID ${employeeId} is already in use. Please provide a unique Employee ID.`
            );
        }

        // Hash the password securely
        const hashedPassword = await auth.hashPassword(password);

        // Create the user record in the database
        const newUser = await UsersModel.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            profilePic,
            role,
            password: hashedPassword,
            assignedBinLocations,
            employeeId,
            userDesc,
            createdAtString: getFormattedDate(),
            updatedAtString: getFormattedDate()
        });

        // Respond with success message
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

        // Log the error for debugging
        console.error('Error creating user:', error);

        // Handle server error
        return handleServerError(res, error);
    }
};


const editUserByEmployeeId = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.query.employeeId);
        const {
            firstName,
            lastName,
            email,
            role,
            phoneNumber,
            profilePic,
            assignedBinLocations,
            userDesc // Include userDesc
        } = req.body;

        const updatedUser = await UsersModel.findOneAndUpdate(
            { employeeId },
            {
                ...req.body,
                updatedAt: getFormattedDate() // Use getFormattedDate here
            },
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
        handleServerError(res, error);
    }
};

const deleteUserByEmployeeId = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.query.employeeId);
        const deletedUser = await UsersModel.findOneAndDelete({ employeeId });

        if (!deletedUser) {
            return handleClientError(res, `User not found with employeeId: ${employeeId}`);
        }

        res.status(200).json({
            message: `User deleted successfully with employeeId: ${employeeId}`
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const loginUser = async (req, res) => {
    try {
        const email = sanitize.isString(req.body.email);
        const password = sanitize.isString(req.body.password);

        logger.info(`Login attempt for email: ${email}`);

        if (!email || !password) {
            logger.warn('Login attempt with missing email or password');
            return handleClientError(res, 'Email and password are required');
        }

        const user = await UsersModel.findOne({ email });

        if (!user) {
            logger.warn(`Login attempt failed: User not found for email ${email}`);
            return handleClientError(res, 'Invalid email or password');
        }

        logger.info(`User found`);

        const isValidPassword = await auth.comparePassword(password, user.password);
        if (!isValidPassword) {
            logger.warn(`Login attempt failed: Invalid password for email ${email}`);
            return handleClientError(res, 'Invalid email or password');
        }

        const token = await auth.createToken({
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            employeeId: user.employeeId
        });

        logger.info(`Login successful for user: ${email}`);
        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role,
            employeeId: user.employeeId,
            firstName: user.firstName,
            lastName: user.lastName
        });
    } catch (error) {
        logger.error('Login error:', error);
        logger.error('Stack trace:', error.stack);
        handleServerError(res, error);
    }
};

const changePassword = async (req, res) => {
    try {
        const employeeId = sanitize.isString(req.query.employeeId);
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return handleClientError(res, 'Password and confirm password are required');
        }

        if (password !== confirmPassword) {
            return handleClientError(res, 'Passwords do not match');
        }

        const user = await UsersModel.findOne({ employeeId: employeeId });
        if (!user) {
            return handleClientError(res, 'User not found with the provided employeeId');
        }

        user.password = await auth.hashPassword(password);
        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({
            message: `Password changed successfully with employeeId: ${employeeId}`
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const assignBinsByEmployeeId = async (req, res) => {
    try {
        const { bins, supervisorId } = req.body;
        const employeeId = sanitize.isString(req.query.employeeId);

        if (!bins || !Array.isArray(bins)) {
            return handleClientError(res, 'Invalid bins data');
        }

        const updatedUser = await UsersModel.findOneAndUpdate(
            { employeeId },
            {
                assignedBinLocations: bins,
                supervisorId,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return handleClientError(res, `User not found with employeeId: ${employeeId}`);
        }

        res.status(200).json({
            message: `Bins assigned successfully with employeeId: ${employeeId}`,
            data: updatedUser
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

module.exports = {
    getAllUsers,
    getUserByEmployeeId,
    createUser,
    editUserByEmployeeId,
    deleteUserByEmployeeId,
    loginUser,
    changePassword,
    assignBinsByEmployeeId
};