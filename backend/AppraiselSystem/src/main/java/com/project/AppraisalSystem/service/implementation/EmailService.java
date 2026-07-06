package com.project.AppraisalSystem.service.implementation;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.email.dev-override:}")
    private String devOverrideEmail;


    public enum EmailSentiment {
        POSITIVE("#16A34A", "#DCFCE7", "&#10003;"),   // green, checkmark
        NEGATIVE("#DC2626", "#FEE2E2", "&#10005;"),   // red, x mark
        NEUTRAL("#1089D3", "#DBEAFE", "&#128276;");   // blue, bell

        final String color;
        final String iconBg;
        final String icon;

        EmailSentiment(String color, String iconBg, String icon) {
            this.color = color;
            this.iconBg = iconBg;
            this.icon = icon;
        }
    }

    @Async
    public void sendInviteEmail(String toEmail, String firstName, String inviteToken) {

        String activationLink = frontendUrl + "/setup-account?token=" + inviteToken;

        String html = """
                <div style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%%" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center">

                                <table role="presentation"
                                       width="600"
                                       cellspacing="0"
                                       cellpadding="0"
                                       style="background:#ffffff;
                                              border-radius:16px;
                                              overflow:hidden;
                                              box-shadow:0 6px 20px rgba(0,0,0,.08);">

                                    <tr>
                                        <td style="padding:40px;">

                                            <div style="text-align:center;margin-bottom:16px;">
                                                <div style="display:inline-block;
                                                            width:48px;
                                                            height:48px;
                                                            line-height:48px;
                                                            border-radius:50%%;
                                                            background:#DCFCE7;
                                                            color:#16A34A;
                                                            font-size:22px;
                                                            text-align:center;">
                                                    &#10003;
                                                </div>
                                            </div>

                                            <div style="text-align:center;margin-bottom:28px;">
                                                <h1 style="margin:0;
                                                           color:#1089D3;
                                                           font-size:30px;
                                                           font-weight:700;">
                                                    Welcome to Appraisova
                                                </h1>
                                            </div>

                                            <p style="font-size:16px;color:#374151;margin-bottom:24px;">
                                                Hi <strong>%s</strong>,
                                            </p>

                                            <p style="font-size:15px;
                                                      color:#4B5563;
                                                      line-height:1.8;
                                                      margin-bottom:30px;">
                                                Your HR team has created an Appraisova account for you.
                                                To get started, please verify your details and create
                                                a secure password using the button below.
                                            </p>

                                            <div style="text-align:center;margin:36px 0;">
                                                <a href="%s"
                                                   style="display:inline-block;
                                                          background:#1089D3;
                                                          color:#ffffff;
                                                          text-decoration:none;
                                                          padding:16px 34px;
                                                          border-radius:10px;
                                                          font-size:16px;
                                                          font-weight:600;">
                                                    Activate Your Account
                                                </a>
                                            </div>

                                            <div style="
                                                background:#EFF8FF;
                                                border:1px solid #BFDBFE;
                                                border-radius:10px;
                                                padding:18px;
                                                margin-bottom:28px;
                                                color:#374151;
                                                font-size:14px;
                                                line-height:1.7;">

                                                <strong>Security Notice</strong><br><br>

                                                This activation link will expire in
                                                <strong>12 hours</strong> and can only
                                                be used once.

                                            </div>

                                            <p style="font-size:14px;
                                                      color:#6B7280;
                                                      line-height:1.7;">
                                                If you weren't expecting this email,
                                                you can safely ignore it.
                                            </p>

                                            <hr style="border:none;
                                                       border-top:1px solid #E5E7EB;
                                                       margin:32px 0;">

                                            <p style="font-size:14px;
                                                      color:#6B7280;
                                                      line-height:1.8;">
                                                Regards,<br>
                                                <strong>The Appraisova Team</strong>
                                            </p>

                                            <p style="font-size:12px;
                                                      color:#9CA3AF;">
                                                © 2026 Appraisova. All rights reserved.
                                            </p>

                                            %s

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>
                    </table>
                </div>
                """.formatted(
                capitalize(firstName),
                activationLink,
                buildDevNote(toEmail)
        );

        sendHtmlEmail(getRecipient(toEmail),
                "Welcome to Appraisova - Activate Your Account",
                html);
    }


    @Async
    public void sendNotificationEmail(String toEmail,
                                      String firstName,
                                      String title,
                                      String message) {
        sendNotificationEmail(toEmail, firstName, title, message, EmailSentiment.NEUTRAL, null, null);
    }


    @Async
    public void sendNotificationEmail(String toEmail,
                                      String firstName,
                                      String title,
                                      String message,
                                      EmailSentiment sentiment,
                                      String buttonText,
                                      String buttonUrl) {

        String iconBadge = buildIconBadge(sentiment);
        String button = buildButton(buttonText, buttonUrl);

        String html = """
                <div style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
                    <table width="600" align="center"
                           style="background:#ffffff;
                                  border-radius:16px;
                                  padding:40px;
                                  box-shadow:0 6px 20px rgba(0,0,0,.08);">

                        <tr>
                            <td>

                                %s

                                <h2 style="color:%s;
                                           margin:0 0 20px 0;
                                           text-align:center;
                                           font-size:26px;">
                                    %s
                                </h2>

                                <p style="font-size:16px;color:#374151;margin-bottom:12px;">
                                    Hi <strong>%s</strong>,
                                </p>

                                <p style="font-size:15px;
                                          color:#4B5563;
                                          line-height:1.7;
                                          margin-bottom:8px;">
                                    %s
                                </p>

                                %s

                                <hr style="border:none;
                                           border-top:1px solid #E5E7EB;
                                           margin:24px 0;">

                                <p style="font-size:14px;
                                          color:#6B7280;
                                          margin-bottom:8px;">
                                    Regards,<br>
                                    <strong>The Appraisova Team</strong>
                                </p>

                                <p style="font-size:12px;
                                          color:#9CA3AF;
                                          margin:0;">
                                    © 2026 Appraisova. All rights reserved.
                                </p>

                                %s

                            </td>
                        </tr>

                    </table>
                </div>
                """.formatted(
                iconBadge,
                sentiment.color,
                title,
                capitalize(firstName),
                message,
                button,
                buildDevNote(toEmail)
        );

        sendHtmlEmail(
                getRecipient(toEmail),
                "Appraisova - " + title,
                html
        );
    }


    @Async
    public void sendPasswordChangedEmail(String toEmail, String firstName) {

        String html = """
            <div style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
                <table width="600" align="center"
                       style="background:#ffffff;
                              border-radius:16px;
                              padding:40px;
                              box-shadow:0 6px 20px rgba(0,0,0,.08);">

                    <tr>
                        <td>

                            <div style="text-align:center;margin-bottom:16px;">
                                <div style="display:inline-block;
                                            width:48px;
                                            height:48px;
                                            line-height:48px;
                                            border-radius:50%%;
                                            background:#DBEAFE;
                                            color:#1089D3;
                                            font-size:20px;
                                            text-align:center;">
                                    &#128274;
                                </div>
                            </div>

                            <h2 style="color:#1089D3;
                                       margin-top:0;
                                       text-align:center;
                                       font-size:28px;">
                                Password Changed
                            </h2>

                            <p style="font-size:16px;color:#374151;">
                                Hi <strong>%s</strong>,
                            </p>

                            <p style="font-size:15px;
                                      color:#4B5563;
                                      line-height:1.8;">
                                This is a confirmation that your Appraisova account password
                                was just changed successfully.
                            </p>

                            <div style="
                                background:#FEF3F2;
                                border:1px solid #FECACA;
                                border-radius:10px;
                                padding:18px;
                                margin:24px 0;
                                color:#374151;
                                font-size:14px;
                                line-height:1.7;">

                                <strong>Didn't make this change?</strong><br><br>

                                If you did not request this password change, please contact
                                your HR administrator immediately to secure your account.

                            </div>

                            <hr style="border:none;
                                       border-top:1px solid #E5E7EB;
                                       margin:32px 0;">

                            <p style="font-size:14px;
                                      color:#6B7280;">
                                Regards,<br>
                                <strong>The Appraisova Team</strong>
                            </p>

                            <p style="font-size:12px;
                                      color:#9CA3AF;">
                                © 2026 Appraisova. All rights reserved.
                            </p>

                            %s

                        </td>
                    </tr>

                </table>
            </div>
            """.formatted(
                capitalize(firstName),
                buildDevNote(toEmail)
        );

        sendHtmlEmail(
                getRecipient(toEmail),
                "Appraisova - Your Password Was Changed",
                html
        );
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        String html = """
            <div style="margin:0;padding:40px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
                <table width="600" align="center"
                       style="background:#ffffff;
                              border-radius:16px;
                              padding:40px;
                              box-shadow:0 6px 20px rgba(0,0,0,.08);">
                    <tr>
                        <td>
                            <h2 style="color:#1089D3; margin-top:0; font-size:28px;">
                                Reset Your Password
                            </h2>

                            <p style="font-size:16px;color:#374151;">
                                Hi <strong>%s</strong>,
                            </p>

                            <p style="font-size:15px; color:#4B5563; line-height:1.8;">
                                We received a request to reset your Appraisova password.
                                Click the button below to choose a new one.
                            </p>

                            <div style="text-align:center;margin:36px 0;">
                                <a href="%s"
                                   style="display:inline-block;
                                          background:#1089D3;
                                          color:#ffffff;
                                          text-decoration:none;
                                          padding:16px 34px;
                                          border-radius:10px;
                                          font-size:16px;
                                          font-weight:600;">
                                    Reset Password
                                </a>
                            </div>

                            <div style="
                                background:#FEF3F2;
                                border:1px solid #FECACA;
                                border-radius:10px;
                                padding:18px;
                                margin-bottom:28px;
                                color:#374151;
                                font-size:14px;
                                line-height:1.7;">
                                <strong>Didn't request this?</strong><br><br>
                                If you didn't request a password reset, you can safely ignore
                                this email — your password will remain unchanged.
                            </div>

                            <p style="font-size:14px; color:#6B7280; line-height:1.7;">
                                This link expires in 1 hour.
                            </p>

                            <hr style="border:none; border-top:1px solid #E5E7EB; margin:32px 0;">

                            <p style="font-size:14px; color:#6B7280;">
                                Regards,<br>
                                <strong>The Appraisova Team</strong>
                            </p>

                            <p style="font-size:12px; color:#9CA3AF;">
                                © 2026 Appraisova. All rights reserved.
                            </p>

                            %s

                        </td>
                    </tr>
                </table>
            </div>
            """.formatted(
                capitalize(firstName),
                resetLink,
                buildDevNote(toEmail)
        );

        sendHtmlEmail(getRecipient(toEmail), "Appraisova - Reset Your Password", html);
    }

    private String buildIconBadge(EmailSentiment sentiment) {
        return """
                <div style="text-align:center;margin-bottom:16px;">
                    <div style="display:inline-block;
                                width:48px;
                                height:48px;
                                line-height:48px;
                                border-radius:50%%;
                                background:%s;
                                color:%s;
                                font-size:22px;
                                text-align:center;">
                        %s
                    </div>
                </div>
                """.formatted(sentiment.iconBg, sentiment.color, sentiment.icon);
    }

    private String buildButton(String buttonText, String buttonUrl) {
        if (buttonText == null || buttonText.isBlank() || buttonUrl == null || buttonUrl.isBlank()) {
            return "";
        }

        return """
                <div style="text-align:center;margin:24px 0 8px 0;">
                    <a href="%s"
                       style="display:inline-block;
                              background:#1089D3;
                              color:#ffffff;
                              text-decoration:none;
                              padding:14px 30px;
                              border-radius:10px;
                              font-size:15px;
                              font-weight:600;">
                        %s
                    </a>
                </div>
                """.formatted(buttonUrl, buttonText);
    }

    private void sendHtmlEmail(String to,
                               String subject,
                               String htmlContent) {

        try {

            MimeMessage mimeMessage = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String getRecipient(String actualEmail) {
        return (devOverrideEmail != null && !devOverrideEmail.isBlank())
                ? devOverrideEmail
                : actualEmail;
    }

    private String buildDevNote(String actualEmail) {

        if (devOverrideEmail == null || devOverrideEmail.isBlank()) {
            return "";
        }

        return """
                <p style="font-size:12px;color:#9CA3AF;">
                    <em>Development Mode: Intended recipient was %s</em>
                </p>
                """.formatted(actualEmail);
    }

    private String capitalize(String name) {

        if (name == null || name.isBlank()) {
            return "";
        }

        return Character.toUpperCase(name.charAt(0))
                + name.substring(1);
    }
}