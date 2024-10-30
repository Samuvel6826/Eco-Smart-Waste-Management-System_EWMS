const mongoose = require('mongoose');
const { getFormattedDate } = require('../utils/deviceMonitoring');
const { hashPassword } = require('../common/Auth');
const { number } = require('joi');

// Validation function for email
const emailValidator = {
  validator: (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  },
  message: 'Invalid email format',
};

// Validation function for phone number
const phoneValidator = {
  validator: (phone) => {
    const phonePattern = /^(?:\+?\d{1,3}\s?)?\d{10}$/; // Adjust regex to allow formats with and without country code
    return phone === '' || phonePattern.test(phone);
  },
  message: 'Invalid phone number format',
};

// Validation function for zip code
const pinCodeValidator = {
  validator: (pinCode) => {
    const pinCodePattern = /^\d{6}$/; // 6-digit number
    return pinCode === null || pinCode === '' || pinCodePattern.test(pinCode);
  },
  message: 'Pin code must be a 6-digit number, can be left empty, or can be null.',
};


// Password complexity validation
const passwordValidator = {
  validator: (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*]/.test(password);
    return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
  },
  message: 'Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.',
};

// User Schema
const usersSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: 'Prefer not to say',
    trim: true
  },
  age: {
    type: Number,
    default: '',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: emailValidator,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // validate: passwordValidator, // Add password validation
    trim: true
  },
  phoneNumber: {
    type: String,
    validate: phoneValidator,
    default: "",
    trim: true
  },
  userDescription: {
    type: String,
    default: "",
    trim: true
  },
  profilePic: {
    type: String,
    default: "",
    trim: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Supervisor', 'Technician'],
    required: [true, 'Role is required'],
    trim: true
  },
  assignedBinLocations: [{
    type: String,
    default: []
  }],
  address: {
    country: {
      type: String,
      // required: [true, 'Country is required'],
      default: 'India',
      trim: true
    },
    state: {
      type: String,
      // required: [true, 'State / Union Territory is required'],
      default: 'Tamil Nadu',
      trim: true
    },
    district: {
      type: String,
      // required: [true, 'District is required'],
      default: 'Kanyakumari',
      trim: true
    },
    city: {
      type: String,
      default: 'Nagercoil',
      trim: true
    },
    streetAddress: {
      type: String,
      // required: [true, 'Postal Address is required'],
      trim: true
    },
    pinCode: {
      type: Number,
      validate: pinCodeValidator, // Add zip code validation
      default: '',
      trim: true,
      required: false
    },
  },
  dateOfBirth: {
    type: String,
    default: null
  },
  createdBy: {
    type: String,
    trim: true
  },
  createdAt: {
    type: String,
    default: getFormattedDate // Use Date type instead of String
  },
  updatedBy: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: String,
    default: getFormattedDate // Use Date type instead of String
  },
  lastLogin: {
    type: String,
    default: null
  },
  lastPasswordChangedBy: {
    type: String,
    default: null
  },
  lastPasswordChangedAt: {
    type: String,
    default: null
  }
},
  {
    versionKey: false,
    collection: 'ewms-users',
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false }
  });

// Hash password before saving user
usersSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await hashPassword(this.password);
    } catch (error) {
      console.error('Error hashing password:', error);
      return next(error);
    }
  }
  next();
});

// Middleware to update `updatedAt` timestamp
usersSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: getFormattedDate() });
  next();
});

// User Model
const usersModel = mongoose.model('ewms-users', usersSchema);
module.exports = usersModel;