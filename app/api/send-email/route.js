import nodemailer from 'nodemailer';

export async function POST(req) {
    const { email, fileName, subjectName, senderEmail, senderName } = await req.json();

    // Create a Nodemailer transporter using your Gmail credentials
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // Gmail as the email service
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASS, // Your app password
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `File Shared: ${fileName}`,
        text: `
            The file "${fileName}" has been shared with you for the subject "${subjectName}".
            
            Shared by:
            Name: ${senderName}
            Email: ${senderEmail}
        `,
    };

    try {
        // Attempt to send the email
        await transporter.sendMail(mailOptions);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}
