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
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        // 1. Send Admin Notification Email
        const sendAdminPromise = transporter.sendMail({
          from: `"Thumblify Contact" <${emailUser}>`,
          to: emailUser,
          replyTo: email,
          subject: `📩 [Thumblify] New Contact Message from ${name}`,
          text: `You received a message from ${name} (${email}):\n\n"${message}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #0f172a;">
              <h2 style="color: #db2777; margin-top: 0;">📩 New Contact Message</h2>
              <p style="color: #475569; font-size: 14px;">You received a new inquiry from your website contact form.</p>
              <div style="padding: 16px; background: #f8fafc; border-left: 4px solid #db2777; border-radius: 6px; margin: 16px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Sender:</strong> ${name}</p>
                <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #db2777;">${email}</a></p>
                <p style="margin: 12px 0 0 0; white-space: pre-wrap; color: #1e293b;">${message}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8;">Click reply in your mail app to respond directly to the sender.</p>
            </div>
          `,
        });

        // 2. Send User Confirmation Auto-Reply Email
        const sendUserPromise = transporter.sendMail({
          from: `"Thumblify Support" <${emailUser}>`,
          to: email,
          subject: "✨ Thanks for reaching out to Thumblify!",
          text: `Hi ${name},\n\nThank you for reaching out to Thumblify! We've received your message:\n"${message}"\n\nBest regards,\nThe Thumblify Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #f8fafc;">
              <h2 style="color: #ec4899; margin-top: 0;">Hi ${name},</h2>
              <p style="color: #cbd5e1; line-height: 1.6;">Thank you for reaching out to <strong>Thumblify</strong>! We've received your message and will get back to you shortly.</p>
              <div style="margin: 20px 0; padding: 16px; background: #1e293b; border-radius: 8px;">
                <p style="margin: 0; color: #94a3b8; font-size: 13px;">Your Message:</p>
                <p style="margin: 8px 0 0 0; color: #f1f5f9; font-style: italic;">"${message}"</p>
              </div>
              <p style="color: #cbd5e1;">Best regards,<br/><strong>The Thumblify Team</strong></p>
            </div>
          `,
        }).catch((err) => console.warn("⚠️ User auto-reply warning:", err.message));

        // Await admin email dispatch with 6-second max safety timeout
        await Promise.race([
          sendAdminPromise,
          new Promise((resolve) => setTimeout(resolve, 6000)),
        ]);

      } catch (mailErr: any) {
        console.warn("⚠️ Nodemailer transport error:", mailErr.message);
      }
    } else {
      console.warn("⚠️ EMAIL or EMAIL_PASS environment variables not set in server environment.");
    }

    return res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error: any) {
    console.error("❌ sendContactEmail error:", error);
    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  }
};
