import nodemailer, { Transporter } from 'nodemailer';
import { convert } from 'html-to-text';

// Use a more descriptive interface name
interface UserEmailDetails {
  email: string;
  name?: string;
}

class Email {
  private to: string;
  private url: string;
  private from: string;
  private user: UserEmailDetails;

  constructor(user: UserEmailDetails, url: string) {
    this.to = user.email;
    this.url = url;
    // Securely pull the from address from environment variables
    this.from = process.env.EMAIL_FROM!;
    this.user = user;
  }

  // Private method to create the email transport
  private newTransport(): Transporter {
    if (process.env.NODE_ENV === 'production') {
      // Production: use SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME!,
          pass: process.env.SENDGRID_PASSWORD!,
        },
      });
    }

    // Development: use Mailtrap or SMTP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST!,
      port: Number(process.env.EMAIL_PORT!),
      auth: {
        user: process.env.EMAIL_USERNAME!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });
  }

  // Method to send emails. This is now private as other methods will call it.
  private async send(subject: string, template: string): Promise<void> {
    const text = convert(template);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
      text,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // Sends password reset email
  async sendPasswordReset(): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello, ${this.user.name || 'User'}!</h2>
        <p>You have requested to reset your password. Please use the link below to set a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${this.url}" style="background-color: #3498db; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
            Reset Your Password
          </a>
        </p>
        <p>This link is valid for **10 minutes**.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,<br>The Auth App Team</p>
      </div>
    `;
    await this.send('Your password reset token (valid for 10 minutes)', html);
  }
}

export default Email;
