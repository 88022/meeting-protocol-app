import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export async function sendSetPasswordEmail(
  to: string,
  firstName: string,
  setPasswordLink: string
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.EMAIL_FROM) {
    return { ok: false, error: "SMTP not configured" };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Доступ к PM Assist одобрен — установите пароль",
      text: `Здравствуйте, ${firstName}!\n\nВаш запрос на доступ к сервису PM Assist одобрен.\n\nПерейдите по ссылке, чтобы задать пароль (ссылка действительна 24 часа):\n${setPasswordLink}\n\nПосле установки пароля вы сможете войти на сайт.`,
      html: `
        <p>Здравствуйте, ${firstName}!</p>
        <p>Ваш запрос на доступ к сервису PM Assist одобрен.</p>
        <p>Перейдите по ссылке, чтобы задать пароль (ссылка действительна 24 часа):</p>
        <p><a href="${setPasswordLink}">${setPasswordLink}</a></p>
        <p>После установки пароля вы сможете войти на сайт.</p>
      `.trim(),
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
