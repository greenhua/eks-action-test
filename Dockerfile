FROM cypress/included:13.13.0

WORKDIR /e2e

# Копируем package.json
COPY package.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем файлы конфигурации и скрипты
COPY cypress.config.js ./
COPY reportportal-upload.js ./

# Копируем тесты
COPY cypress ./cypress

# Проверяем Cypress
RUN npx cypress verify

# Создаем директорию для отчетов
RUN mkdir -p cypress/reports

# Запускаем тесты и загружаем отчеты
CMD ["sh", "-c", "npm run test && npm run upload-rp"]
