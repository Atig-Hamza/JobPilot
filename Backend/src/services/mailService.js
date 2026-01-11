import nodemailer from 'nodemailer'
import juice from 'juice'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

const generateInlineHtml = (htmlContent) => {
    const css = `
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; margin: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f5; padding-bottom: 40px; }
        .content { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .header { background-color: #000000; padding: 32px; text-align: center; }
        .logo { color: #ffffff; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: -0.5px; }
        .body { padding: 40px 32px; color: #18181b; line-height: 1.6; font-size: 16px; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #71717a; background-color: #fafafa; border-top: 1px solid #e4e4e7; }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #000000; letter-spacing: -0.5px; }
        p { margin-bottom: 16px; color: #3f3f46; }
        .highlight { color: #db2777; font-weight: 600; }
    `
    
    // Wrap content in boilerplate
    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
    </head>
    <body>
        <div class="wrapper">
            <div class="content">
                <div class="body">
                    ${htmlContent}
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} JobPilot. All rights reserved.</p>
                    <p>Designed for the future of work.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `
    
    return juice(fullHtml)
}

export const sendWaitlistEmail = async ({ email, name }) => {
    try {
        const html = generateInlineHtml(`
            <h1>Welcome to the <span class="highlight">Cockpit</span>.</h1>
            <p>Hi ${name || 'there'},</p>
            <p>You've successfully secured your spot on the JobPilot waitlist. We are building the future of autonomous career management, and we're thrilled to have you with us.</p>
            <p>We're rolling out access in waves to ensure the best experience. Keep an eye on your inbox—we'll notify you as soon as you are cleared for takeoff.</p>
            <p>In the meantime, sit back and relax.</p>
            <br>
            <p style="font-weight: 600; color: #000;">The JobPilot Team</p>
        `)

        await transporter.sendMail({
            from: `"JobPilot" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Welcome to JobPilot Waitlist 🚀',
            html: html
        })
        return true
    } catch (error) {
        console.error('Email service error:', error)
        return false
    }
}
