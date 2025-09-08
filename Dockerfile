FROM cypress/included:13.13.0

WORKDIR /e2e

# Копируем package.json
COPY package*.json ./

# Используем npm install вместо npm ci, так как нет package-lock.json
RUN npm install

# Копируем файлы конфигурации
COPY cypress.config.js ./
COPY reportportal-upload.js ./

# Копируем тесты
COPY cypress ./cypress

# Проверяем, что Cypress установлен корректно
RUN npx cypress verify

# Запускаем тесты
CMD ["sh", "-c", "npm run test && npm run upload-rp"]
