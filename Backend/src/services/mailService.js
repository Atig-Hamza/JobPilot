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

export const sendApprovalNotification = async (userEmail, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>Your JobPilot Access is Approved! 🎉</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>We're excited to inform you that your access to JobPilot has been approved. Welcome aboard!</p>
            <p>You can now log in to your account and start exploring the features we've built to help you manage your career autonomously.</p>
            <p>Click the link below to get started:</p>
            <p><a href="https://myjobpilot.app/login" style="color: #db2777; font-weight: 600;">Log in to JobPilot</a></p>
            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Your JobPilot Access is Approved! 🎉',
            html: html
        })
        return true
    } catch (error) {
        console.error('Approval notification email error:', error)
        return false
    }
}

export const sendApprovedInviteCodeNotification = async (userEmail, code, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>Invite Code Used Successfully!</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>Your invite code <span style="font-weight: 600; color: #db2777;">${code}</span> has been successfully applied to your JobPilot account.</p>
            <p>You can now log in and start exploring all the features JobPilot has to offer.</p>
            <p>Thank you for being part of our exclusive community. We're thrilled to have you on board and can't wait for you to experience all that JobPilot has to offer.</p>
            <p>If you have any questions or need assistance, our support team is here to help.</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Invite Code Used Successfully!',
            html: html
        })
        return true
    } catch (error) {
        console.error('Used invite code notification email error:', error)
        return false
    }
}

export const sendRejectedInviteCodeNotification = async (userEmail, code, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>Invite Code Issue Notification</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>We wanted to inform you that there was an issue with the invite code <span style="font-weight: 600; color: #db2777;">${code}</span> you attempted to use on your JobPilot account.</p>
            <p>This could be due to the code being invalid, expired, or already used. Please double-check the code and try again.</p>
            <p>If you believe this is an error or need further assistance, please don't hesitate to reach out to our support team. We're here to help!</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Invite Code Issue Notification',
            html: html
        })
        return true
    } catch (error) {
        console.error('Rejected invite code notification email error:', error)
        return false
    }
}

export const sendPasswordResetEmail = async (userEmail, resetUrl, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>Reset Your Password</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>We received a request to reset your password for your JobPilot account.</p>
            <p>You can reset it by clicking the link below:</p>
            <p><a href="${resetUrl}" style="color: #db2777; font-weight: 600;">Reset Password</a></p>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot Security" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Reset Your Password - JobPilot',
            html: html
        })
        return true
    } catch (error) {
        console.error('Password reset email error:', error)
        return false
    }
}

export const sendPasswordResetSuccessEmail = async (userEmail, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>Password Changed Successfully</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>Your password for JobPilot has been successfully changed.</p>
            <p>If you did not perform this action, please contact our support team immediately.</p>
            <p><a href="https://myjobpilot.app/login" style="color: #db2777; font-weight: 600;">Log in to your account</a></p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot Security" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Password Changed Successfully - JobPilot',
            html: html
        })
        return true
    } catch (error) {
        return false
    }
}

export const send2FAEnabledEmail = async (userEmail, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>2FA Enabled Successfully! 🛡️</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>Two-Factor Authentication (2FA) has been successfully enabled for your JobPilot account.</p>
            <p>Your account is now more secure. You will need to enter a verification code from your authenticator app each time you log in.</p>
            <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #fbbf24; font-weight: 600;">Important Reminder:</p>
                <p style="margin: 8px 0 0 0; color: #d4d4d8;">Please ensure you have safely stored your recovery codes. If you lose access to your device, these codes are the only way to regain access to your account.</p>
            </div>
            <p>If you did not enable 2FA, please contact support immediately.</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Security Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot Security" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Two-Factor Authentication Enabled - JobPilot',
            html: html
        })
        return true
    } catch (error) {
        console.error('2FA enabled email error:', error)
        return false
    }
}

export const sendLoginOTPEmail = async (userEmail, code, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>Login Verification Code</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>Use the following code to complete your login to JobPilot:</p>
            <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #db2777; letter-spacing: 4px;">${code}</p>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Security Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot Security" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Your Login Verification Code - JobPilot',
            html: html
        })
        return true
    } catch (error) {
        console.error('Login OTP email error:', error)
        return false
    }
}

export const send2FADisabledEmail = async (userEmail, fullName) => {
    try {
        const html = generateInlineHtml(`
            <h1>2FA Disabled ⚠️</h1>
            <p>Hi ${fullName || 'there'},</p>
            <p>Two-Factor Authentication (2FA) has been disabled for your JobPilot account.</p>
            <p>Your account is now less secure. We strongly recommend keeping 2FA enabled to protect your account from unauthorized access.</p>
            <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #ef4444; font-weight: 600;">Was this you?</p>
                <p style="margin: 8px 0 0 0; color: #d4d4d8;">If you did not make this change, please change your password immediately and contact support.</p>
            </div>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Security Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot Security" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Two-Factor Authentication Disabled - JobPilot',
            html: html
        })
        return true
    } catch (error) {
        console.error('2FA disabled email error:', error)
        return false
    }
}

export const sendCreditsReceivedEmail = async (recipientEmail, recipientName, senderName, amount) => {
    try {
        const html = generateInlineHtml(`
            <h1>You Received Credits! 🎁</h1>
            <p>Hi ${recipientName || 'there'},</p>
            <p>Great news! <span class="highlight">${senderName}</span> has sent you credits on JobPilot.</p>
            <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Credits Received</p>
                <p style="margin: 8px 0 0 0; font-size: 48px; color: #22c55e; font-weight: 700;">${amount}</p>
            </div>
            <p>These credits have been automatically added to your account balance. You can use them to access premium features on JobPilot.</p>
            <p><a href="https://myjobpilot.app/user/dashboard" style="color: #db2777; font-weight: 600;">Go to Dashboard</a></p>
            <br>
            <p style="font-weight: 600; color: #fff;">The JobPilot Team</p>
        `)
        await transporter.sendMail({
            from: `"JobPilot" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            subject: `You received ${amount} credits from ${senderName}! 🎁`,
            html: html
        })
        return true
    } catch (error) {
        console.error('Credits received email error:', error)
        return false
    }
}