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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #18181b; padding: 40px 0; margin: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #18181b; padding-bottom: 10px; }
        .content { max-width: 600px; margin: 0 auto; background-color: #313131; overflow: hidden;}
        .header { background-color: #313133; padding: 32px; text-align: center; }
        .logo { color: #ffffff; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: -0.5px; }
        .body { padding: 40px 32px; color: #e4e4e7; line-height: 1.6; font-size: 16px; }
        .footer { padding: 32px; text-align: center; font-size: 12px; color: #9ca3af; background-color: #313131; border-top: 1px solid #3f3f46; }
        h1 { font-size: 24px; font-weight: 700; margin-bottom: 24px; color: #ffffff; letter-spacing: -0.5px; }
        p { margin-bottom: 16px; color: #d4d4d8; }
        .highlight { color: #db2777; font-weight: 600; }
    `
    
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
                <div class="header" style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px;">
                    <img style="width: 30px; height: 30px;" src="https://myjobpilot.app/src/assets/Main/logo-white-without-bg.png" alt="JobPilot" class="logo" />
                    <p style="color: #ffffff; margin-top: 8px; text-align: center; font-size: 30px; font-weight: 700;">JobPilot</p>
                </div>
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
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
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

export const sendNewJoinWaitlistToAdmins = async (fullName) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL
        if (!adminEmail) throw new Error('Admin email not configured.')
        const html = generateInlineHtml(`
            <h1>New Explorer Detected</h1>
            <p>A new user has requested access to the JobPilot platform.</p>
            <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Full Name</p>
            <p style="margin: 8px 0 0 0; font-size: 18px; color: #ffffff; font-weight: 500;">${fullName}</p>
            </div>
            <p>This user has been added to the database and represents another step forward for the community.</p>
        `)
        const subject = `New Waitlist Signup: ${fullName}`
        await transporter.sendMail({
            from: `"JobPilot Notifications" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: subject,
            html: html
        })
        return true
    } catch (error) {
        console.error('Admin notification email error:', error)
        return false
    }
}


export const sendNewLoginAlert = async (userEmail, date, loginDetails = {}) => {
    try {
        const { ip, location, device } = loginDetails
        
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'full',
            timeStyle: 'medium'
        }).format(new Date(date))

        const locationString = location 
            ? `${location.city || ''}, ${location.country || ''}`.trim().replace(/^,/, '') || 'Unknown Location'
            : 'Unknown Location'

        const deviceString = device && device.browser && device.os
            ? `${device.browser.name || 'Unknown Browser'} on ${device.os.name || 'Unknown OS'}`
            : 'Unknown Device'

        const html = generateInlineHtml(`
            <h1>New Login Alert</h1>
            <p>Hi,</p>
            <p>We detected a new login to your JobPilot account.</p>
            <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Login Details</p>
                <div style="margin-top: 16px;">
                    <p style="margin: 4px 0; font-size: 16px; color: #ffffff;"><strong>Time:</strong> ${formattedDate}</p>
                    <p style="margin: 4px 0; font-size: 16px; color: #ffffff;"><strong>Device:</strong> ${deviceString}</p>
                    <p style="margin: 4px 0; font-size: 16px; color: #ffffff;"><strong>Location:</strong> ${locationString}</p>
                    <p style="margin: 4px 0; font-size: 16px; color: #ffffff;"><strong>IP Address:</strong> ${ip}</p>
                </div>
            </div>
            <p>If this was you, no further action is needed. If you did not authorize this login, please reset your password immediately.</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Security Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot Security" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'New Login Detected on Your JobPilot Account',
            html: html
        })
        return true
    } catch (error) {
        console.error('New login alert email error:', error)
        return false
    }
}