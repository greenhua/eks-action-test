FROM cypress/included:13.13.0

WORKDIR /e2e

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем все зависимости за один раз
RUN npm ci --only=dev

# Копируем файлы конфигурации
COPY cypress.config.js ./
COPY reportportal-upload.js ./

# Копируем тесты
COPY cypress ./cypress

# Проверяем, что Cypress установлен корректно
RUN npx cypress verify

# Запускаем тесты
CMD ["sh", "-c", "npm run test && npm run upload-rp"]
