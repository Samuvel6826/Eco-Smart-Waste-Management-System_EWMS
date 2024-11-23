const { Resend } = require('resend');
const { logger } = require('../utils/logger');
const validator = require('email-validator');

exports.sendEmail = async (req, res) => {
    try {
        const { from, to, subject, html, text, cc, bcc, reply_to, attachments, tags } = req.body;

        // Validate required fields
        if (!from || !to || !subject) {
            logger.warn('Missing required fields');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: from, to, and subject are required'
            });
        }

        // Validate email addresses
        const emailValidation = validateEmailAddresses({ from, to, cc, bcc, reply_to });
        if (emailValidation.errors.length > 0) {
            logger.warn('Email validation failed', { errors: emailValidation.errors });
            return res.status(400).json({
                success: false,
                error: emailValidation.errors
            });
        }

        const emailData = {
            from,
            to,
            subject: subject.trim(),
            ...(html && { html }),
            ...(text && { text }),
            ...(cc && { cc }),
            ...(bcc && { bcc }),
            ...(reply_to && { reply_to }),
            ...(attachments && { attachments }),
            ...(tags && { tags })
        };

        const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
        const { data, error } = await resend.emails.send(emailData);

        if (error) {
            // Check for domain verification error and send warning instead of error
            if (error.message.includes('domain is not verified')) {
                logger.warn('Domain verification issue', { error: error.message });

                return res.status(200).json({
                    success: false,
                    warning: error.message,  // Send the specific error message as a warning
                });
            }

            throw error;  // Throw any other error as usual
        }

        logger.info('Email sent successfully', { emailId: data.id });

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            id: data.id
        });

    } catch (error) {
        logger.warn('Email sending failed', { error: error.message });
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function validateEmailAddresses({ from, to, cc, bcc, reply_to }) {
    const errors = [];

    // Validate From
    if (!validator.validate(from)) {
        errors.push(`Invalid from email address: ${from}`);
    }

    // Validate To
    const toAddresses = Array.isArray(to) ? to : [to];
    toAddresses.forEach(email => {
        if (!validator.validate(email)) {
            errors.push(`Invalid to email address: ${email}`);
        }
    });

    // Validate CC if present
    if (cc) {
        const ccAddresses = Array.isArray(cc) ? cc : [cc];
        ccAddresses.forEach(email => {
            if (!validator.validate(email)) {
                errors.push(`Invalid cc email address: ${email}`);
            }
        });
    }

    // Validate BCC if present
    if (bcc) {
        const bccAddresses = Array.isArray(bcc) ? bcc : [bcc];
        bccAddresses.forEach(email => {
            if (!validator.validate(email)) {
                errors.push(`Invalid bcc email address: ${email}`);
            }
        });
    }

    // Validate Reply-To if present
    if (reply_to && !validator.validate(reply_to)) {
        errors.push(`Invalid reply_to email address: ${reply_to}`);
    }

    return { errors };
}