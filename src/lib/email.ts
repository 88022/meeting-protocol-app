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
    const msg = "SMTP not configured (нужны SMTP_HOST и EMAIL_FROM в .env)";
    console.error("[Email]", msg);
    return { ok: false, error: msg };
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
    console.log("[Email] Письмо отправлено на", to);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[Email] Ошибка отправки на", to, ":", message);
    return { ok: false, error: message };
  }
}

/** Письмо заявителю: заявка принята. */
export async function sendRequestReceivedEmail(
  to: string,
  firstName: string
): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.EMAIL_FROM) {
    const msg = "SMTP not configured (нужны SMTP_HOST и EMAIL_FROM в .env)";
    console.error("[Email]", msg);
    return { ok: false, error: msg };
  }

  const baseUrl = process.env.APP_BASE_URL ?? "https://pmassist.ru";
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Заявка на доступ к PM Assist принята",
      text: `Здравствуйте, ${firstName}!\n\nВаша заявка на доступ к сервису PM Assist принята и будет рассмотрена. Мы свяжемся с вами по этой почте после решения.\n\nС уважением,\nКоманда PM Assist\n${baseUrl}`,
      html: `
        <p>Здравствуйте, ${firstName}!</p>
        <p>Ваша заявка на доступ к сервису PM Assist принята и будет рассмотрена.</p>
        <p>Мы свяжемся с вами по этой почте после решения.</p>
        <p>С уважением,<br/>Команда PM Assist<br/><a href="${baseUrl}">${baseUrl}</a></p>
      `.trim(),
    });
    console.log("[Email] Подтверждение заявки отправлено на", to);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[Email] Ошибка отправки подтверждения на", to, ":", message);
    return { ok: false, error: message };
  }
}

/** Уведомление админам о новой заявке. */
export async function sendNewRequestNotificationToAdmins(
  adminEmails: string[],
  applicantEmail: string,
  applicantName: string
): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.EMAIL_FROM || adminEmails.length === 0) return;

  const baseUrl = process.env.APP_BASE_URL ?? "https://pmassist.ru";
  const text = `Новая заявка на доступ к PM Assist.\n\nЗаявитель: ${applicantName}\nEmail: ${applicantEmail}\n\nПроверить заявки: ${baseUrl}/admin/requests`;
  const html = `<p>Новая заявка на доступ к PM Assist.</p><p><strong>Заявитель:</strong> ${applicantName}<br/><strong>Email:</strong> ${applicantEmail}</p><p><a href="${baseUrl}/admin/requests">Проверить заявки</a></p>`;

  for (const to of adminEmails) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: "PM Assist: новая заявка на доступ",
        text,
        html,
      });
      console.log("[Email] Уведомление админу отправлено на", to);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("[Email] Ошибка уведомления админу", to, ":", message);
    }
  }
}
