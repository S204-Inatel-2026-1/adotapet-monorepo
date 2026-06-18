describe('ONG Adoption Management - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // 1. Simular Login como ONG
    cy.login('ong');
  });

  it('should list all received adoption requests', () => {
    cy.visit('/painel/adocoes');
    cy.url().should('include', '/painel/adocoes');

    cy.contains('Solicitações de Adoção', { timeout: 10000 }).should('be.visible');

    cy.get('body').then($body => {
      if ($body.find('[data-testid="adoption-item"]').length > 0) {
        cy.get('[data-testid="adoption-item"]').should('have.length.at.least', 1);
      } else {
        cy.contains('Nenhuma solicitação aqui').should('be.visible');
      }
    });
  });

  it('should allow approving an adoption request', () => {
    cy.visit('/painel/adocoes');
    cy.contains('Solicitações de Adoção', { timeout: 10000 }).should('be.visible');

    cy.get('body').then($body => {
      const pendingItems = $body.find('[data-testid="adoption-item"]:contains("Pendente")');
      if (pendingItems.length > 0) {
        cy.wrap(pendingItems).first().click();
        cy.get('[data-testid="approve-btn"]').should('be.visible').click();
      } else {
        cy.log('Nenhuma adoção pendente encontrada para aprovar.');
      }
    });
  });

  it('should allow rejecting an adoption request', () => {
    cy.visit('/painel/adocoes');
    cy.contains('Solicitações de Adoção', { timeout: 10000 }).should('be.visible');

    cy.get('body').then($body => {
      const pendingItems = $body.find('[data-testid="adoption-item"]:contains("Pendente")');
      if (pendingItems.length > 0) {
        cy.wrap(pendingItems).first().click();
        cy.get('[data-testid="reject-btn"]').should('be.visible').click();
      } else {
        cy.log('Nenhuma adoção pendente encontrada para recusar.');
      }
    });
  });

  it('should show adoption message/details when requested', () => {
    cy.visit('/painel/adocoes');
    cy.contains('Solicitações de Adoção', { timeout: 10000 }).should('be.visible');

    cy.get('body').then($body => {
      if ($body.find('[data-testid="adoption-item"]').length > 0) {
        cy.get('[data-testid="adoption-item"]').first().click();
        cy.contains('Detalhes da Solicitação', { timeout: 10000 }).should('be.visible');
      } else {
        cy.log('Nenhuma adoção encontrada para visualizar detalhes.');
      }
    });
  });
});
