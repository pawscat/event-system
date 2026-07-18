import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || 'dummy_user',
    pass: process.env.SMTP_PASS || 'dummy_pass'
  }
})

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  // If no SMTP credentials provided in env, use mock/console logging
  if (!process.env.SMTP_HOST) {
    console.log('=============================================')
    console.log('[MOCK EMAIL] To:', to)
    console.log('[MOCK EMAIL] Subject:', subject)
    console.log('[MOCK EMAIL] HTML:', html)
    console.log('=============================================')
    return { success: true, messageId: 'mock-id-' + Date.now() }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Event Ku System" <noreply@eventku.id>',
      to,
      subject,
      html
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
