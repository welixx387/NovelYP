import "server-only";
import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return transporter;
}

// Если SMTP не настроен (нет .env), просто печатаем письмо в консоль сервера —
// этого достаточно, чтобы пройти флоу сброса пароля локально без реального почтового сервиса.
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const client = getTransporter();

  if (!client) {
    console.log("\n----- [DEV EMAIL] -----");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(html.replace(/<[^>]+>/g, " ").trim());
    console.log("------------------------\n");
    return;
  }

  await client.sendMail({
    from: process.env.SMTP_FROM ?? "Ranobe Reader <no-reply@example.com>",
    to,
    subject,
    html,
  });
}

export function renderResetPasswordEmail(resetUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Восстановление пароля</h2>
      <p>Вы запросили сброс пароля. Ссылка действительна 1 час:</p>
      <p><a href="${resetUrl}" style="color:#8b5cf6">${resetUrl}</a></p>
      <p>Если это были не вы — просто проигнорируйте это письмо.</p>
    </div>
  `;
}
