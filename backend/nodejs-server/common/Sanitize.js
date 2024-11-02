// Check if the value is a non-empty string
const isString = (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return undefined;  // Return undefined if value is not a string or is empty
    }
    return value.trim();
};

// Check if the value is a boolean and returns true if it's true
const isBoolean = (value) => {
    if (typeof value !== 'boolean') {
        throw new TypeError("Expected a boolean value");
    }
    return value === true;
};

// Check if the value is an array
const isArray = (value) => {
    if (!Array.isArray(value)) {
        throw new TypeError("Expected an array");
    }
    return value;
};

// Check if the value is an integer
const isNumber = (value) => {
    if (typeof value !== 'number') {
        throw new TypeError("Expected a number");
    }
    if (!Number.isInteger(value)) {
        throw new Error("Expected an integer value");
    }
    return value;
};

// Check if the value is a non-null object
const isObject = (value) => {
    if (value === null) {
        throw new TypeError("Expected an object but received null");
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError("Expected a plain object");
    }
    return value;
};

module.exports = {
    isString,
    isBoolean,
    isArray,
    isNumber,
    isObject
};