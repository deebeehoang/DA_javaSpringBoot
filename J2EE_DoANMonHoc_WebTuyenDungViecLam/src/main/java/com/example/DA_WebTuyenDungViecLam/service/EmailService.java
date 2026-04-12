package com.example.DA_WebTuyenDungViecLam.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void sendNotificationEmail(String toEmail, String title, String message, String link) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("PartTimeHub - " + title);
            helper.setText(buildHtmlContent(title, message, link), true);

            mailSender.send(mimeMessage);
            log.info("Email sent to {}: {}", toEmail, title);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildHtmlContent(String title, String message, String link) {
        String linkHtml = "";
        if (link != null && !link.isEmpty()) {
            linkHtml = "<a href=\"http://localhost:5173" + link + "\" "
                    + "style=\"display:inline-block;padding:10px 24px;background-color:#2563eb;"
                    + "color:#ffffff;text-decoration:none;border-radius:6px;margin-top:16px;\">"
                    + "Xem chi tiết</a>";
        }

        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
                  <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;">
                    <div style="background:#2563eb;padding:20px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:22px;">PartTimeHub</h1>
                    </div>
                    <div style="padding:24px;">
                      <h2 style="color:#1e293b;margin-top:0;">%s</h2>
                      <p style="color:#475569;font-size:15px;line-height:1.6;">%s</p>
                      %s
                    </div>
                    <div style="background:#f8fafc;padding:16px;text-align:center;color:#94a3b8;font-size:12px;">
                      Bạn nhận được email này vì có hoạt động mới trên PartTimeHub.
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(title, message, linkHtml);
    }
}
