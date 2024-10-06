const sanitize = require('../common/Sanitize');
const userModel = require('../models/usersModel');
const auth = require('../common/Auth');

// Helper functions for error handling
const handleClientError = (res, message) => {
    res.status(400).send({ message });
};

const handleServerError = (res, error) => {
    console.error('Error:', error.message);
    res.status(500).send({
        message: 'Internal Server Error',
        errorMessage: error.message,
    });
};

const getUsers = async (req, res) => {
    try {
        const data = await userModel.find().sort({ _id: 1 });

        res.status(200).send({
            data,
            message: 'User Data Fetch Successful',
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = sanitize.isString(req.params.id);
        const data = await userModel.findById(userId);
        if (data) {
            res.status(200).send({
                data,
                message: 'User Data Fetch Successful',
            });
        } else {
            handleClientError(res, 'User not found with the provided ID');
        }
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
            employeeId // Make sure to include employeeId in your request
        } = req.body;

        // Check if any required fields are missing
        if (!firstName || !lastName || !email || !password || !role || !employeeId) {
            return handleClientError(res, 'Missing required fields: firstName, lastName, email, password, role, or employeeId');
        }

        // Hash the password before saving
        const hashedPassword = await auth.hashPassword(password);

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return handleClientError(res, `Email ${email} already exists`);
        }

        await userModel.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            profilePic,
            role,
            password: hashedPassword,
            assignedBinLocations,
            employeeId, // Include employeeId when creating the user
        });

        res.status(201).send({
            message: 'User Created Successfully',
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const editUserById = async (req, res) => {
    try {
        const { firstName, lastName, email, role, phoneNumber, profilePic, assignedBinLocations } = req.body;
        const userId = sanitize.isString(req.params.id);

        const user = await userModel.findById(userId);
        if (user) {
            // Update only fields that are provided
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.role = role || user.role;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.profilePic = profilePic || user.profilePic;
            user.assignedBinLocations = assignedBinLocations || user.assignedBinLocations;

            await user.save();

            res.status(200).send({
                message: 'User Data Edited Successfully',
            });
        } else {
            handleClientError(res, 'User not found with the provided ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const deleteUserById = async (req, res) => {
    try {
        const userId = sanitize.isString(req.params.id);
        const user = await userModel.findById(userId);

        if (user) {
            await userModel.deleteOne({ _id: userId });
            res.status(200).send({
                message: 'User Data Deleted Successfully',
            });
        } else {
            handleClientError(res, 'User not found with the provided ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const loginUser = async (req, res) => {
    try {
        const email = sanitize.isString(req.body.email);
        const password = sanitize.isString(req.body.password);
        const user = await userModel.findOne({ email });

        if (user) {
            if (await auth.comparePassword(password, user.password)) {
                const token = await auth.createToken({
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
                res.status(200).send({
                    message: 'Login Successful',
                    token,
                    role: user.role
                });
            } else {
                handleClientError(res, 'Invalid password');
            }
        } else {
            handleClientError(res, 'No user found with the provided email');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = sanitize.isString(req.params.id);
        const password = sanitize.isString(req.body.password);
        const user = await userModel.findById(userId);

        if (user) {
            user.password = await auth.hashPassword(password);
            await user.save();
            res.status(200).send({
                message: 'Password Changed Successfully',
            });
        } else {
            handleClientError(res, 'User not found with the provided ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const assignBins = async (req, res) => {
    const { bins, supervisorId } = req.body;
    const userId = sanitize.isString(req.params.id);

    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                assignedBinLocations: bins,
                supervisorId
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Bins assigned successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning bins', error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    editUserById,
    deleteUserById,
    loginUser,
    changePassword,
    assignBins
};