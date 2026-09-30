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

    // Configure Nodemailer Transporter using Gmail credentials from .env
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminEmail = process.env.EMAIL;

    // 1. Send main message notification to site owner/admin
    const adminMailOptions = {
      from: `"Thumblify Contact" <${process.env.EMAIL}>`,
      to: adminEmail,
      replyTo: email,
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #f8fafc;">
          <h2 style="color: #ec4899; margin-top: 0;">New Contact Form Submission</h2>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 16px 0;" />
          <p style="margin: 8px 0; color: #94a3b8;"><strong>From:</strong> <span style="color: #f8fafc;">${name}</span></p>
          <p style="margin: 8px 0; color: #94a3b8;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ec4899;">${email}</a></p>
          <div style="margin-top: 20px; padding: 16px; background: #1e293b; border-radius: 8px; border-left: 4px solid #ec4899;">
            <p style="margin: 0; white-space: pre-wrap; color: #f1f5f9; line-height: 1.6;">${message}</p>
          </div>
          <footer style="margin-top: 24px; color: #64748b; font-size: 12px;">Sent via Thumblify AI Thumbnail Generator Contact Form</footer>
        </div>
      `,
    };

    await transporter.sendMail(adminMailOptions);

    // 2. Send confirmation auto-reply email to the user
    try {
      const userMailOptions = {
        from: `"Thumblify Team" <${process.env.EMAIL}>`,
        to: email,
        subject: "✨ Thanks for reaching out to Thumblify!",
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
      };
      await transporter.sendMail(userMailOptions);
    } catch (replyErr: any) {
      console.warn("⚠️ User auto-reply email warning:", replyErr.message);
    }

    return res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error: any) {
    console.error("❌ Nodemailer contact error:", error);
    return res.status(500).json({ message: error.message || "Failed to send email. Please try again." });
  }
};
