describe('Wikipedia.org тесты', () => {
  it('Главная страница открывается', () => {
    cy.visit('/');
    cy.contains('The Free Encyclopedia').should('be.visible');
  });

  it('Есть поиск и он работает', () => {
    cy.visit('/');
    cy.get('input[name=search]').type('Cypress.io{enter}');
    cy.url().should('include', 'Cypress.io');
    cy.contains('Cypress').should('be.visible');
  });

  it('Ссылка на English Wikipedia ведёт на правильную страницу', () => {
    cy.visit('/');
    cy.get('#js-link-box-en').click();
    cy.url().should('include', 'en.wikipedia.org');
    cy.contains('Welcome to Wikipedia').should('be.visible');
  });
});
