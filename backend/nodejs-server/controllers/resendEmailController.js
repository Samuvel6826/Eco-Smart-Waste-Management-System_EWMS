// emailController.js
const { Resend } = require('resend'); // Note the destructuring here

exports.sendEmail = async (req, res) => {
    try {
        // Add validation to ensure required fields are present
        const { from, to, subject, html } = req.body;

        if (!from || !to || !subject || !html) {
            return res.status(400).json({
                error: 'Missing required fields. Please provide from, to, subject, and html.'
            });
        }

        const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', data);
        return res.status(200).json({
            message: 'Email sent successfully',
            data
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
};