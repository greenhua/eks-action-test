FROM cypress/included:13.13.0

WORKDIR /e2e

COPY package.json ./
RUN npm install

COPY cypress.config.js ./
COPY reportportal-upload.js ./
COPY run-tests.sh ./

# Делаем скрипт исполняемым
RUN chmod +x run-tests.sh

COPY cypress ./cypress

RUN npx cypress verify
RUN mkdir -p cypress/reports
RUN echo "-----------------------"
RUN cat run-tests.sh
CMD ["./run-tests.sh"]
