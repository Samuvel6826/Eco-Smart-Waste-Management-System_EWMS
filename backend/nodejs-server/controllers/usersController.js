const sanitize = require('../common/Sanitize');
const UsersModel = require('../models/usersModel');
const auth = require('../common/Auth');
const { logger } = require('../utils/logger');

// Helper functions for error handling
const handleClientError = (res, message) => {
    logger.error(`Client Error: ${message}`);
    res.status(400).json({
        message,
        error: {
            code: 400,
            detail: message
        }
    });
};

const handleServerError = (res, error) => {
    logger.error('Server Error:', error.message);
    res.status(500).json({
        message: 'Internal Server Error',
        error: {
            code: 500,
            detail: error.message
        }
    });
};

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
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            phoneNumber,
            profilePic,
            assignedBinLocations,
            employeeId
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !role || !employeeId) {
            return handleClientError(res, 'Missing required fields: firstName, lastName, email, password, role, or employeeId');
        }

        // Check for existing user by email or employeeId
        const existingUser = await UsersModel.findOne({
            $or: [{ email }, { employeeId }]
        });

        if (existingUser) {
            return handleClientError(res,
                existingUser.email === email
                    ? `Email ${email} already exists`
                    : `Employee ID ${employeeId} already exists`
            );
        }

        const hashedPassword = await auth.hashPassword(password);

        await UsersModel.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            profilePic,
            role,
            password: hashedPassword,
            assignedBinLocations,
            employeeId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            message: `User created successfully with employeeId: ${employeeId}`
        });
    } catch (error) {
        handleServerError(res, error);
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
            assignedBinLocations
        } = req.body;

        const updatedUser = await UsersModel.findOneAndUpdate(
            { employeeId },
            {
                ...req.body,
                updatedAt: new Date()
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

        const user = await UsersModel.findOne({ email });

        if (!user) {
            return handleClientError(res, 'Invalid email or password');
        }

        const isValidPassword = await auth.comparePassword(password, user.password);
        if (!isValidPassword) {
            return handleClientError(res, 'Invalid email or password');
        }

        const token = await auth.createToken({
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            employeeId: user.employeeId
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role
        });
    } catch (error) {
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