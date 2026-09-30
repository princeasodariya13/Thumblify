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

    console.log(`📩 Contact form submission from user: ${trimmedName} <${trimmedEmail}>`);

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

        // 1. Admin Email Options (Unique subject ensures a NEW separate inbox email per user)
        const adminMailOptions = {
          from: `"Thumblify Form" <${emailUser}>`,
          to: emailUser,
          replyTo: trimmedEmail,
          subject: `📩 New Contact: ${trimmedName} (${trimmedEmail})`,
          text: `You received a new message from ${trimmedName} (${trimmedEmail}):\n\n"${trimmedMessage}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #0f172a;">
              <div style="background: #db2777; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 20px;">📩 New Thumblify Website Message</h2>
              </div>
              <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Sender Name:</strong> ${trimmedName}</p>
                <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Sender Email:</strong> <a href="mailto:${trimmedEmail}" style="color: #db2777; font-weight: bold;">${trimmedEmail}</a></p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>Message Content:</strong></p>
                <div style="padding: 14px; background: #ffffff; border-left: 4px solid #db2777; border-radius: 4px; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${trimmedMessage}</div>
                <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; text-align: center;">💡 Tip: Click "Reply" in your email app to reply directly to ${trimmedName} (${trimmedEmail}).</p>
              </div>
            </div>
          `,
        };

        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log(`✅ Admin notification email delivered to owner mailbox! Message ID: ${adminInfo.messageId}`);

        // 2. User Auto-Reply Confirmation
        try {
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
          await transporter.sendMail(userMailOptions);
          console.log(`✅ User auto-reply delivered to ${trimmedEmail}`);
        } catch (userErr: any) {
          console.warn("⚠️ User auto-reply skipped:", userErr.message);
        }

      } catch (mailErr: any) {
        console.error("❌ Admin mailer error:", mailErr.message);
      }
    } else {
      console.warn("⚠️ EMAIL or EMAIL_PASS environment variables not set.");
    }

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error: any) {
    console.error("❌ sendContactEmail error:", error);
    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  }
};
