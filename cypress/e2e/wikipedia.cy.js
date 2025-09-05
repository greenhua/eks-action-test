describe('Wikipedia.org тесты', () => {
  it('First page is openning', () => {
    cy.visit('/');
    cy.contains('The Free Encyclopedia').should('be.visible');
  });

  it('Search exist and working', () => {
    cy.visit('/');
    cy.get('input[name=search]').type('Cypress.io{enter}');
    cy.url().should('include', 'Cypress.io');
    cy.contains('Cypress').should('be.visible');
  });

  it('link to English Wikipedia is correct', () => {
    cy.visit('/');
    cy.get('#js-link-box-en').click();
    cy.url().should('include', 'en.wikipedia.org');
    cy.contains('Welcome to Wikipedia').should('be.visible');
  });
});
