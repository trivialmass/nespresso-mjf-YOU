<?php
/**
 * sendMail — thin wrapper around PHPMailer using SMTP credentials from env.
 *
 * @param string $to       Recipient address
 * @param string $subject  Subject line
 * @param string $body     HTML body
 * @param string $fromAddr Override From address (defaults to MAIL_FROM env)
 * @param string $fromName Override From name   (defaults to MAIL_FROM_NAME env)
 * @return bool
 */
function sendMail(string $to, string $subject, string $body, string $fromAddr = '', string $fromName = ''): bool
{
    require_once __DIR__ . '/PHPMailer/Exception.php';
    require_once __DIR__ . '/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/PHPMailer/SMTP.php';

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST') ?: 'mail.infomaniak.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER') ?: '';
        $mail->Password   = getenv('SMTP_PASS') ?: '';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = (int)(getenv('SMTP_PORT') ?: 587);
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom(
            $fromAddr ?: (getenv('MAIL_FROM')      ?: 'nespresso-mjf@trivialmass.com'),
            $fromName ?: (getenv('MAIL_FROM_NAME') ?: 'Nespresso x MJF')
        );
        $mail->addReplyTo(getenv('MAIL_FROM') ?: 'nespresso-mjf@trivialmass.com');
        $mail->addAddress($to);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return true;
    } catch (\Exception $e) {
        error_log('sendMail error: ' . $mail->ErrorInfo);
        return false;
    }
}
