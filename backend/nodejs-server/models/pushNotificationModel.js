const Joi = require('joi');

// Define the schema for the push notification
const sendPushNotificationSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(1)
        .max(255)
        .messages({
            'string.base': 'Title must be a string.',
            'string.empty': 'Title is required.',
            'string.min': 'Title must be at least 1 character long.',
            'string.max': 'Title must be less than or equal to 255 characters long.',
        }),
    body: Joi.string()
        .required()
        .min(1)
        .max(1000)
        .messages({
            'string.base': 'Body must be a string.',
            'string.empty': 'Body is required.',
            'string.min': 'Body must be at least 1 character long.',
            'string.max': 'Body must be less than or equal to 1000 characters long.',
        }),
    deviceToken: Joi.string()
        .required()
        .min(1)
        .max(512)
        .messages({
            'string.base': 'Device token must be a string.',
            'string.empty': 'Device token is required.',
            'string.min': 'Device token must be at least 1 character long.',
            'string.max': 'Device token must be less than or equal to 512 characters long.',
        }),
    userId: Joi.string()
        .required()
        .min(1)
        .max(128)
        .messages({
            'string.base': 'User ID must be a string.',
            'string.empty': 'User ID is required.',
            'string.min': 'User ID must be at least 1 character long.',
            'string.max': 'User ID must be less than or equal to 128 characters long.',
        }),
    notificationType: Joi.string()
        .required()
        .min(1)
        .max(64)
        .messages({
            'string.base': 'Notification type must be a string.',
            'string.empty': 'Notification type is required.',
            'string.min': 'Notification type must be at least 1 character long.',
            'string.max': 'Notification type must be less than or equal to 64 characters long.',
        }),
    timestamp: Joi.date()
        .optional()
        .messages({
            'date.base': 'Timestamp must be a valid date.',
        }),
});

module.exports = {
    sendPushNotificationSchema,
};