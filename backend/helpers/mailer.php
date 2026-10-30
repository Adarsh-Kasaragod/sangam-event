<?php
declare(strict_types=1);

require_once __DIR__ . '/../phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../phpmailer/src/SMTP.php';
require_once __DIR__ . '/../phpmailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendRegistrationEmail(string $toEmail, string $toName, array $event): bool
{
    $smtpHost = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST') ?: '';
    $smtpPort = (int) ($_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT') ?: 587);
    $smtpUser = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER') ?: '';
    $smtpPass = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS') ?: '';
    $fromName = $_ENV['SMTP_FROM_NAME'] ?? getenv('SMTP_FROM_NAME') ?: 'Sangam Event Portal';

    if (empty($smtpHost) || empty($smtpUser) || empty($smtpPass)) {
        return false;
    }

    $eventDate = date('l, d F Y \a\t h:i A', strtotime($event['event_date']));
    $venue     = htmlspecialchars($event['venue']);
    $title     = htmlspecialchars($event['title']);
    $userName  = htmlspecialchars($toName);

    $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#fdf8f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf8f0; padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background-color:#fffdf7; border-radius:16px; overflow:hidden; box-shadow: 0 2px 16px rgba(100,60,10,0.08);">

    <tr>
        <td style="background: linear-gradient(135deg, #d4900a, #c2541a); padding: 32px 40px; text-align:center;">
            <h1 style="margin:0; color:#fff; font-size:24px; font-weight:700;">Registration Confirmed!</h1>
        </td>
    </tr>

    <tr>
        <td style="padding: 36px 40px;">
            <p style="margin:0 0 20px; color:#1a1208; font-size:16px; line-height:1.6;">
                Hi <strong>{$userName}</strong>,
            </p>
            <p style="margin:0 0 24px; color:#5c4a2a; font-size:15px; line-height:1.6;">
                You have been successfully registered for the following event. We're excited to have you!
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5ede0; border-radius:12px; padding:24px; margin-bottom:24px;">
            <tr><td style="padding:24px;">
                <h2 style="margin:0 0 16px; color:#1a1208; font-size:20px; font-weight:700;">{$title}</h2>
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                    <tr>
                        <td style="padding:6px 0; color:#9a8060; font-size:13px; font-weight:600; text-transform:uppercase; width:100px;">Date</td>
                        <td style="padding:6px 0; color:#1a1208; font-size:14px; font-weight:500;">{$eventDate}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0; color:#9a8060; font-size:13px; font-weight:600; text-transform:uppercase; width:100px;">Venue</td>
                        <td style="padding:6px 0; color:#1a1208; font-size:14px; font-weight:500;">{$venue}</td>
                    </tr>
                </table>
            </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8e8; border-left:4px solid #d4900a; border-radius:0 8px 8px 0; margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
                <p style="margin:0; color:#5c4a2a; font-size:14px; line-height:1.6;">
                    <strong style="color:#1a1208;">Reminders:</strong><br>
                    &bull; Please arrive 15 minutes before the event starts<br>
                    &bull; Carry your college ID card for verification<br>
                    &bull; This email serves as your registration confirmation
                </p>
            </td></tr>
            </table>

            <p style="margin:0; color:#5c4a2a; font-size:14px; line-height:1.6;">
                If you have any questions, reach out to the event coordinator or visit the portal.
            </p>
        </td>
    </tr>

    <tr>
        <td style="padding: 24px 40px; background-color:#f5ede0; text-align:center; border-top:1px solid #e8d5b5;">
            <p style="margin:0; color:#9a8060; font-size:12px;">
                Sangam Event Portal &mdash; Your campus, your events.
            </p>
        </td>
    </tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;

    $plainText = "Hi {$toName},\n\n"
        . "You have been successfully registered for: {$event['title']}\n\n"
        . "Date: {$eventDate}\n"
        . "Venue: {$event['venue']}\n\n"
        . "Reminders:\n"
        . "- Please arrive 15 minutes before the event starts\n"
        . "- Carry your college ID card for verification\n"
        . "- This email serves as your registration confirmation\n\n"
        . "See you there!\n"
        . "— Sangam Event Portal";

    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpPort;

        $mail->setFrom($smtpUser, $fromName);
        $mail->addAddress($toEmail, $toName);

        $mail->isHTML(true);
        $mail->Subject = "Registration Confirmed — {$event['title']}";
        $mail->Body    = $htmlBody;
        $mail->AltBody = $plainText;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email send failed for {$toEmail}: " . $e->getMessage());
        return false;
    }
}
