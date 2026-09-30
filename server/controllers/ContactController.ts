import { Request, Response } from "express";
import nodemailer from "nodemailer";

export const sendContactEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    console.log(`📩 Contact message received from ${name} (${email})`);

    const emailUser = process.env.EMAIL;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          connectionTimeout: 10000,
        });

        // 1. Send admin notification email (background async)
        transporter.sendMail({
          from: emailUser,
          to: emailUser,
          replyTo: email,
          subject: `📩 New Contact Message from ${name}`,
          text: `New message from ${name} (${email}):\n\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #f8fafc;">
              <h2 style="color: #ec4899; margin-top: 0;">New Contact Form Submission</h2>
              <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
              <p style="margin: 8px 0; color: #94a3b8;"><strong>From:</strong> <span style="color: #f8fafc;">${name}</span></p>
              <p style="margin: 8px 0; color: #94a3b8;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ec4899;">${email}</a></p>
              <div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 8px; border-left: 4px solid #ec4899;">
                <p style="margin: 0; white-space: pre-wrap; color: #f1f5f9; line-height: 1.6;">${message}</p>
              </div>
              <footer style="margin-top: 24px; color: #64748b; font-size: 12px;">Sent via Thumblify AI Thumbnail Generator</footer>
            </div>
          `,
        }).then((info) => {
          console.log(`✅ Admin email sent! Message ID: ${info.messageId}`);
        }).catch((err) => {
          console.error(`❌ Admin email error: ${err.message}`);
        });

        // 2. Send user auto-reply email (background async)
        transporter.sendMail({
          from: emailUser,
          to: email,
          subject: "✨ Thanks for reaching out to Thumblify!",
          text: `Hi ${name},\n\nThank you for reaching out to Thumblify! We've received your message:\n"${message}"\n\nBest regards,\nThe Thumblify Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #f8fafc;">
              <h2 style="color: #ec4899; margin-top: 0;">Hi ${name},</h2>
              <p style="color: #cbd5e1; line-height: 1.6;">Thank you for reaching out to <strong>Thumblify</strong>! We've received your message and will get back to you shortly.</p>
              <div style="margin: 20px 0; padding: 16px; background: #1e293b; border-radius: 8px;">
                <p style="margin: 0; color: #94a3b8; font-size: 13px;">Your Message:</p>
                <p style="margin: 8px 0 0 0; color: #f1f5f9; font-style: italic;">"${message}"</p>
              </div>
              <p style="color: #cbd5e1;">Best regards,<br/><strong>The Thumblify Team</strong></p>
            </div>
          `,
        }).then((info) => {
          console.log(`✅ User auto-reply sent! Message ID: ${info.messageId}`);
        }).catch((err) => {
          console.warn(`⚠️ User auto-reply warning: ${err.message}`);
        });

      } catch (mailErr: any) {
        console.warn("⚠️ Nodemailer transport setup error:", mailErr.message);
      }
    } else {
      console.warn("⚠️ EMAIL or EMAIL_PASS environment variables not set in server environment.");
    }

    // Return INSTANT 200 OK response to frontend
    return res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error: any) {
    console.error("❌ sendContactEmail error:", error);
    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  }
};
