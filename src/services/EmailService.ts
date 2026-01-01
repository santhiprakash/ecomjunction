/**
 * Email Service using Emailit.com API
 * Handles all email notifications with CAN-SPAM compliance
 */

interface EmailitConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailData {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private config: EmailitConfig;
  private baseUrl = 'https://api.emailit.com/v1';

  constructor() {
    this.config = {
      apiKey: import.meta.env.EMAILIT_API_KEY || '',
      fromEmail: import.meta.env.EMAILIT_FROM_EMAIL || 'notifications@shopmatic.cc',
      fromName: import.meta.env.EMAILIT_FROM_NAME || 'Shopmatic',
    };
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey && this.config.fromEmail);
  }

  /**
   * Send an email via Emailit API
   */
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    if (!this.isConfigured()) {
      console.warn('Email service not configured. Email not sent.');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName,
          },
          to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          replyTo: emailData.replyTo,
          cc: emailData.cc,
          bcc: emailData.bcc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResponse> {
    const unsubscribeUrl = `${import.meta.env.VITE_PRODUCTION_URL || 'https://shopmatic.cc'}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

    const html = this.getWelcomeEmailTemplate(userName, unsubscribeUrl);
    const text = this.getWelcomeEmailText(userName);

    return this.sendEmail({
      to: { email: userEmail, name: userName },
      subject: 'Welcome to Shopmatic - Get Started with Your Affiliate Store',
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<EmailResponse> {
    const resetUrl = `${import.meta.env.VITE_PRODUCTION_URL || 'https://shopmatic.cc'}/reset-password?token=${resetToken}`;
    const unsubscribeUrl = `${import.meta.env.VITE_PRODUCTION_URL || 'https://shopmatic.cc'}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

    const html = this.getPasswordResetTemplate(userName, resetUrl, unsubscribeUrl);
    const text = this.getPasswordResetText(userName, resetUrl);

    return this.sendEmail({
      to: { email: userEmail, name: userName },
      subject: 'Reset Your Shopmatic Password',
      html,
      text,
    });
  }

  /**
   * Send product analytics report
   */
  async sendAnalyticsReport(
    userEmail: string,
    userName: string,
    reportData: any
  ): Promise<EmailResponse> {
    const unsubscribeUrl = `${import.meta.env.VITE_PRODUCTION_URL || 'https://shopmatic.cc'}/unsubscribe?email=${encodeURIComponent(userEmail)}`;

    const html = this.getAnalyticsReportTemplate(userName, reportData, unsubscribeUrl);
    const text = this.getAnalyticsReportText(userName, reportData);

    return this.sendEmail({
      to: { email: userEmail, name: userName },
      subject: 'Your Weekly Shopmatic Analytics Report',
      html,
      text,
    });
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(
    inviteeEmail: string,
    inviterName: string,
    pageName: string,
    role: string,
    invitationToken: string,
    personalMessage?: string
  ): Promise<EmailResponse> {
    const invitationUrl = `${import.meta.env.VITE_PRODUCTION_URL || 'https://shopmatic.cc'}/accept-invitation/${invitationToken}`;
    const unsubscribeUrl = `${import.meta.env.VITE_PRODUCTION_URL || 'https://shopmatic.cc'}/unsubscribe?email=${encodeURIComponent(inviteeEmail)}`;

    const html = this.getTeamInvitationTemplate(
      inviterName,
      pageName,
      role,
      invitationUrl,
      personalMessage,
      unsubscribeUrl
    );
    const text = this.getTeamInvitationText(
      inviterName,
      pageName,
      role,
      invitationUrl,
      personalMessage
    );

    return this.sendEmail({
      to: { email: inviteeEmail },
      subject: `${inviterName} invited you to collaborate on "${pageName}"`,
      html,
      text,
    });
  }

  /**
   * Welcome Email HTML Template (CAN-SPAM Compliant)
   */
  private getWelcomeEmailTemplate(userName: string, unsubscribeUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Shopmatic</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Shopmatic</h1>
              <p style="margin: 10px 0 0; color: #e6e6ff; font-size: 16px;">Your Affiliate Marketing Platform</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Welcome, ${userName}! 🎉</h2>

              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                Thank you for joining Shopmatic! We're excited to help you showcase and organize your product recommendations.
              </p>

              <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.6;">
                Here's what you can do to get started:
              </p>

              <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea; margin-bottom: 10px;">
                    <strong style="color: #333333; font-size: 16px;">✨ Add Your First Product</strong>
                    <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Use our AI-powered product extractor or add products manually</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea; margin-bottom: 10px;">
                    <strong style="color: #333333; font-size: 16px;">🎨 Customize Your Theme</strong>
                    <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Make your showcase page uniquely yours</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #667eea;">
                    <strong style="color: #333333; font-size: 16px;">📊 Track Your Performance</strong>
                    <p style="margin: 5px 0 0; color: #666666; font-size: 14px;">Monitor clicks, conversions, and engagement</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://shopmatic.cc/dashboard" style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Get Started Now</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Need help? Visit our <a href="https://shopmatic.cc/help" style="color: #667eea; text-decoration: none;">Help Center</a> or reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer (CAN-SPAM Compliance) -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5;">
                <strong>Shopmatic</strong><br>
                notifications@shopmatic.cc<br>
                shopmatic.cc
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                You're receiving this email because you created an account at Shopmatic.
                This is a transactional email related to your account activity.
              </p>

              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: underline;">Unsubscribe from marketing emails</a> |
                <a href="https://shopmatic.cc/privacy" style="color: #667eea; text-decoration: underline;">Privacy Policy</a> |
                <a href="https://shopmatic.cc/terms" style="color: #667eea; text-decoration: underline;">Terms of Service</a>
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} Shopmatic. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Welcome Email Plain Text Version
   */
  private getWelcomeEmailText(userName: string): string {
    return `Welcome to Shopmatic, ${userName}!

Thank you for joining Shopmatic! We're excited to help you showcase and organize your product recommendations.

Here's what you can do to get started:

• Add Your First Product
  Use our AI-powered product extractor or add products manually

• Customize Your Theme
  Make your showcase page uniquely yours

• Track Your Performance
  Monitor clicks, conversions, and engagement

Get started now: https://shopmatic.cc/dashboard

Need help? Visit our Help Center at https://shopmatic.cc/help or reply to this email.

---
Shopmatic
notifications@shopmatic.cc
shopmatic.cc

You're receiving this email because you created an account at Shopmatic.
Unsubscribe: https://shopmatic.cc/unsubscribe

© ${new Date().getFullYear()} Shopmatic. All rights reserved.`;
  }

  /**
   * Password Reset Email HTML Template (CAN-SPAM Compliant)
   */
  private getPasswordResetTemplate(userName: string, resetUrl: string, unsubscribeUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Shopmatic Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Shopmatic</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Reset Your Password</h2>

              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                Hi ${userName},
              </p>

              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                We received a request to reset your Shopmatic password. Click the button below to create a new password:
              </p>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 15px; color: #666666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="margin: 0 0 25px; padding: 15px; background-color: #f8f9fa; color: #667eea; font-size: 12px; word-break: break-all; border-radius: 4px;">
                ${resetUrl}
              </p>

              <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                </p>
              </div>

              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Need help? Contact us at <a href="mailto:notifications@shopmatic.cc" style="color: #667eea; text-decoration: none;">notifications@shopmatic.cc</a>
              </p>
            </td>
          </tr>

          <!-- Footer (CAN-SPAM Compliance) -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5;">
                <strong>Shopmatic</strong><br>
                notifications@shopmatic.cc<br>
                shopmatic.cc
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                This is a transactional email related to your account security.
                You're receiving this because a password reset was requested for your account.
              </p>

              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: underline;">Unsubscribe from marketing emails</a> |
                <a href="https://shopmatic.cc/privacy" style="color: #667eea; text-decoration: underline;">Privacy Policy</a>
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} Shopmatic. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Password Reset Email Plain Text Version
   */
  private getPasswordResetText(userName: string, resetUrl: string): string {
    return `Reset Your Shopmatic Password

Hi ${userName},

We received a request to reset your Shopmatic password. Click the link below to create a new password:

${resetUrl}

SECURITY NOTICE: This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.

Need help? Contact us at notifications@shopmatic.cc

---
Shopmatic
notifications@shopmatic.cc
shopmatic.cc

This is a transactional email related to your account security.

© ${new Date().getFullYear()} Shopmatic. All rights reserved.`;
  }

  /**
   * Analytics Report Email HTML Template
   */
  private getAnalyticsReportTemplate(userName: string, reportData: any, unsubscribeUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Analytics Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📊 Weekly Analytics Report</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hi ${userName}! 👋</h2>

              <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.6;">
                Here's how your products performed this week:
              </p>

              <!-- Stats Cards -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                <tr>
                  <td style="width: 50%; padding-right: 10px;">
                    <div style="padding: 20px; background-color: #f0f7ff; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 5px; color: #667eea; font-size: 32px; font-weight: 700;">${reportData?.totalViews || 0}</p>
                      <p style="margin: 0; color: #666666; font-size: 14px;">Total Views</p>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 10px;">
                    <div style="padding: 20px; background-color: #f0fff4; border-radius: 8px; text-align: center;">
                      <p style="margin: 0 0 5px; color: #10b981; font-size: 32px; font-weight: 700;">${reportData?.totalClicks || 0}</p>
                      <p style="margin: 0; color: #666666; font-size: 14px;">Total Clicks</p>
                    </div>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://shopmatic.cc/analytics" style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Full Report</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Keep up the great work! 🚀
              </p>
            </td>
          </tr>

          <!-- Footer (CAN-SPAM Compliance) -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5;">
                <strong>Shopmatic</strong><br>
                notifications@shopmatic.cc<br>
                shopmatic.cc
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                You're receiving this weekly analytics report because you have an active Shopmatic account.
              </p>

              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: underline;">Unsubscribe from weekly reports</a> |
                <a href="https://shopmatic.cc/privacy" style="color: #667eea; text-decoration: underline;">Privacy Policy</a>
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} Shopmatic. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Analytics Report Email Plain Text Version
   */
  private getAnalyticsReportText(userName: string, reportData: any): string {
    return `Weekly Analytics Report

Hi ${userName}!

Here's how your products performed this week:

Total Views: ${reportData?.totalViews || 0}
Total Clicks: ${reportData?.totalClicks || 0}

View full report: https://shopmatic.cc/analytics

Keep up the great work!

---
Shopmatic
notifications@shopmatic.cc
shopmatic.cc

You're receiving this weekly analytics report because you have an active Shopmatic account.
Unsubscribe: https://shopmatic.cc/unsubscribe

© ${new Date().getFullYear()} Shopmatic. All rights reserved.`;
  }

  /**
   * Team Invitation Email HTML Template
   */
  private getTeamInvitationTemplate(
    inviterName: string,
    pageName: string,
    role: string,
    invitationUrl: string,
    personalMessage: string | undefined,
    unsubscribeUrl: string
  ): string {
    const roleDescriptions: Record<string, string> = {
      admin: 'Full page management and team control',
      editor: 'Add, edit, and delete products',
      viewer: 'View-only access to analytics',
    };

    const roleDescription = roleDescriptions[role.toLowerCase()] || 'Collaborate on this page';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Shopmatic</h1>
              <p style="margin: 10px 0 0; color: #e6e6ff; font-size: 16px;">Team Collaboration</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">You're Invited! 🎉</h2>

              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join their team as a <strong style="color: #667eea;">${role.charAt(0).toUpperCase() + role.slice(1)}</strong> on the page:
              </p>

              <div style="padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600;">${pageName}</p>
                <p style="margin: 8px 0 0; color: #666666; font-size: 14px;">${roleDescription}</p>
              </div>

              ${personalMessage ? `
              <div style="padding: 15px; background-color: #fff8e1; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0 0 5px; color: #856404; font-size: 12px; font-weight: 600; text-transform: uppercase;">Personal Message</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; font-style: italic;">"${personalMessage}"</p>
              </div>
              ` : ''}

              <p style="margin: 25px 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                As a <strong>${role}</strong>, you'll be able to:
              </p>

              <table role="presentation" style="width: 100%; margin-bottom: 25px;">
                ${role === 'admin' ? `
                <tr>
                  <td style="padding: 12px; background-color: #f8f9fa;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Edit page settings and theme</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #ffffff;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Add, edit, and delete products</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f8f9fa;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">View analytics and insights</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #ffffff;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Invite and manage team members</span>
                  </td>
                </tr>
                ` : role === 'editor' ? `
                <tr>
                  <td style="padding: 12px; background-color: #f8f9fa;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Add new products to the page</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #ffffff;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Edit and update product listings</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f8f9fa;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Delete products from the page</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #ffffff;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">View analytics and performance data</span>
                  </td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 12px; background-color: #f8f9fa;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">View page analytics</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #ffffff;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">Preview the page</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; background-color: #f8f9fa;">
                    <span style="color: #10b981; font-size: 16px; margin-right: 8px;">✓</span>
                    <span style="color: #333333; font-size: 14px;">View performance insights</span>
                  </td>
                </tr>
                `}
              </table>

              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${invitationUrl}" style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 15px; color: #666666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="margin: 0 0 25px; padding: 15px; background-color: #f8f9fa; color: #667eea; font-size: 12px; word-break: break-all; border-radius: 4px;">
                ${invitationUrl}
              </p>

              <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⏱️ Note:</strong> This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer (CAN-SPAM Compliance) -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5;">
                <strong>Shopmatic</strong><br>
                notifications@shopmatic.cc<br>
                shopmatic.cc
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                This is a team invitation email sent on behalf of ${inviterName}.
                You're receiving this because someone invited you to collaborate on their Shopmatic page.
              </p>

              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: underline;">Unsubscribe from marketing emails</a> |
                <a href="https://shopmatic.cc/privacy" style="color: #667eea; text-decoration: underline;">Privacy Policy</a>
              </p>

              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} Shopmatic. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Team Invitation Email Plain Text Version
   */
  private getTeamInvitationText(
    inviterName: string,
    pageName: string,
    role: string,
    invitationUrl: string,
    personalMessage: string | undefined
  ): string {
    const roleDescriptions: Record<string, string> = {
      admin: 'Full page management and team control',
      editor: 'Add, edit, and delete products',
      viewer: 'View-only access to analytics',
    };

    const roleDescription = roleDescriptions[role.toLowerCase()] || 'Collaborate on this page';

    return `You're Invited to Collaborate!

${inviterName} has invited you to join their team as a ${role.charAt(0).toUpperCase() + role.slice(1)} on the page: "${pageName}"

Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
${roleDescription}
${personalMessage ? `\nPersonal Message:\n"${personalMessage}"\n` : ''}
Accept the invitation:
${invitationUrl}

NOTE: This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
Shopmatic
notifications@shopmatic.cc
shopmatic.cc

This is a team invitation email sent on behalf of ${inviterName}.

© ${new Date().getFullYear()} Shopmatic. All rights reserved.`;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
