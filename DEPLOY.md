# Деплой на VPS (Reg.ru и др.)

## 1. Подготовка сервера

- Ubuntu 20.04 LTS, предустановка Node.js (или установить вручную).
- Домен pmassist.ru: A-запись на IP сервера.

## 2. Код на сервере

```bash
sudo mkdir -p /var/www/pmassist
sudo chown $USER:$USER /var/www/pmassist
cd /var/www/pmassist
```

Залить код (git clone или scp архива):

```bash
git clone https://github.com/ВАШ_РЕПОЗИТОРИЙ/meeting-protocol-app.git .
```

## 3. Переменные окружения

Скопировать пример и заполнить:

```bash
cp .env.example .env
nano .env
```

Обязательно задать:

- `APP_BASE_URL="https://pmassist.ru"`
- `DATABASE_URL="file:./prisma/dev.db"`
- `OPENAI_API_KEY="..."`
- При необходимости `HTTP_PROXY="..."`
- Для писем при одобрении заявки: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.

## 4. Сборка и запуск

```bash
cd /var/www/pmassist
npm ci
npx prisma generate
npm run build
```

Запуск через PM2:

```bash
sudo npm install -g pm2
pm2 start npm --name "pmassist" -- start
pm2 save
sudo pm2 startup
```

Проверка: `http://IP_СЕРВЕРА:3000`

## 5. Nginx + SSL

Создать конфиг (путь может отличаться в ispmanager):

```bash
sudo nano /etc/nginx/sites-available/pmassist.ru
```

Содержимое:

```nginx
server {
    listen 80;
    server_name pmassist.ru www.pmassist.ru;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Включить и перезагрузить nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/pmassist.ru /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

SSL (Let's Encrypt):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pmassist.ru -d www.pmassist.ru
```

## 6. Обновление после изменений

```bash
cd /var/www/pmassist
git pull
npm ci
npx prisma generate
npm run build
pm2 restart pmassist
```

Если добавлялись миграции Prisma:

```bash
npx prisma migrate deploy
```

## 7. Письма при одобрении заявки

В `.env` на сервере задать SMTP (например, почта Reg.ru, Яндекс, Mail.ru, SendGrid):

- `SMTP_HOST` — хост SMTP (например `smtp.reg.ru`, `smtp.yandex.ru`).
- `SMTP_PORT` — обычно 587 (TLS) или 465 (SSL).
- `SMTP_USER` / `SMTP_PASS` — логин и пароль почты (или пароль приложения).
- `EMAIL_FROM` — адрес отправителя (например `noreply@pmassist.ru` или ящик на том же домене).

После одобрения заявки в админке письмо со ссылкой на установку пароля уйдёт на почту пользователя автоматически.

## 8. Если при регистрации «Ошибка сервера. Попробуйте позже»

Чаще всего причина — база данных на сервере не создана или миграции не применены.

**На сервере выполните по порядку:**

```bash
cd /var/www/pmassist
npx prisma migrate deploy
pm2 restart pmassist
```

Проверьте, что в `.env` задано и приложение имеет право писать в каталог:

```bash
# Должно быть что-то вроде:
DATABASE_URL="file:./prisma/dev.db"

# Проверка: после migrate deploy должен появиться файл
ls -la prisma/dev.db
```

**Увидеть точную причину ошибки:**

```bash
pm2 logs pmassist --lines 50
```

В логах будет строка `Register error:` и текст ошибки (например, что таблицы нет или нет прав на запись).

## 9. Почему не уходит письмо при одобрении заявки

**1. Посмотреть, что пишет приложение**

После одобрения заявки в админке смотрите зелёный блок под кнопкой «Одобрить» — там текст вроде «Письмо со ссылкой отправлено…» или «Заявка одобрена, но письмо не отправлено: …». Там же может быть причина (SMTP не настроен, ошибка сервера и т.д.).

**2. Логи PM2**

На сервере:

```bash
pm2 logs pmassist --lines 100
```

При отправке письма в логах будет:
- `[Email] Письмо отправлено на …` — успех;
- `[Email] Ошибка отправки на … : …` — текст ошибки (например, таймаут, неверный логин/пароль, порт закрыт).

**3. Проверить SMTP отдельно**

На сервере в папке проекта:

```bash
cd /var/www/pmassist
npx tsx scripts/test-smtp.ts ваш@email.targetai.ai
```

Скрипт проверит подключение к SMTP и отправит тестовое письмо. Если что-то не так — выведет ошибку (нет переменных в `.env`, неверный хост/порт, авторизация и т.д.).

**4. Что должно быть в `.env`**

- `SMTP_HOST` — хост (например `smtp.yandex.ru`, `smtp.mail.ru`).
- `SMTP_PORT` — 587 или 465.
- `SMTP_SECURE` — для порта 465 задать `true`, для 587 — `false` или не задавать.
- `SMTP_USER` и `SMTP_PASS` — логин и пароль (для Яндекса часто нужен «пароль приложения», не основной пароль).
- `EMAIL_FROM` — адрес отправителя (обычно тот же ящик, что в SMTP_USER).
