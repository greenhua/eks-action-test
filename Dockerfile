FROM cypress/included:13.13.0

WORKDIR /e2e

COPY package*.json ./
RUN npm install
RUN npm install --save-dev cypress-mochawesome-reporter


COPY cypress.config.js ./
COPY cypress ./cypress

COPY reportportal-upload.js ./

CMD npx cypress run --reporter mochawesome && node reportportal-upload.js
