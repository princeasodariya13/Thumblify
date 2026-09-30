import { Request, Response } from "express";
import nodemailer from "nodemailer";

export const sendContactEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    console.log(`📩 Contact submission received: ${trimmedName} (${trimmedEmail})`);

    const emailUser = process.env.EMAIL;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("⚠️ EMAIL or EMAIL_PASS environment variables not configured.");
      return res.status(500).json({
        success: false,
        message: "Email service is not configured on the server.",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // 1. Admin Email Options (Notification to site owner)
    const adminMailOptions = {
      from: `"Thumblify Contact" <${emailUser}>`,
      to: emailUser,
      replyTo: trimmedEmail,
      subject: `📩 [Thumblify] New Message from ${trimmedName}`,
      text: `You received a new contact message from ${trimmedName} (${trimmedEmail}):\n\n"${trimmedMessage}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #0f172a;">
          <h2 style="color: #db2777; margin-top: 0;">📩 New Contact Message</h2>
          <p style="color: #475569; font-size: 14px;">You received a new inquiry from your website contact form.</p>
          <div style="padding: 16px; background: #f8fafc; border-left: 4px solid #db2777; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Sender Name:</strong> ${trimmedName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Sender Email:</strong> <a href="mailto:${trimmedEmail}" style="color: #db2777;">${trimmedEmail}</a></p>
            <p style="margin: 12px 0 0 0; white-space: pre-wrap; color: #1e293b;">${trimmedMessage}</p>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Tip: Simply click "Reply" in your email client to respond directly to ${trimmedName} (${trimmedEmail}).</p>
        </div>
      `,
    };

    // 2. User Email Options (Confirmation auto-reply)
    const userMailOptions = {
      from: `"Thumblify Support" <${emailUser}>`,
      to: trimmedEmail,
      subject: "✨ Thanks for reaching out to Thumblify!",
      text: `Hi ${trimmedName},\n\nThank you for reaching out to Thumblify! We've received your message:\n"${trimmedMessage}"\n\nBest regards,\nThe Thumblify Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; background: #0f172a; border-radius: 12px; color: #f8fafc;">
          <h2 style="color: #ec4899; margin-top: 0;">Hi ${trimmedName},</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">Thank you for reaching out to <strong>Thumblify</strong>! We've received your message and will get back to you shortly.</p>
          <div style="margin: 20px 0; padding: 16px; background: #1e293b; border-radius: 8px;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">Your Message:</p>
            <p style="margin: 8px 0 0 0; color: #f1f5f9; font-style: italic;">"${trimmedMessage}"</p>
          </div>
          <p style="color: #cbd5e1;">Best regards,<br/><strong>The Thumblify Team</strong></p>
        </div>
      `,
    };

    // Await delivery of admin notification to guarantee owner receives the mail
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log(`✅ Admin notification email delivered to ${emailUser}! Message ID: ${adminInfo.messageId}`);

    // Send user auto-reply in background (non-blocking so invalid user email doesn't throw)
    transporter.sendMail(userMailOptions).then((userInfo) => {
      console.log(`✅ User auto-reply delivered to ${trimmedEmail}! Message ID: ${userInfo.messageId}`);
    }).catch((userErr) => {
      console.warn("⚠️ User auto-reply skipped/failed:", userErr.message);
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error: any) {
    console.error("❌ sendContactEmail controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send email. Please try again later.",
    });
  }
};
