describe('ONG Adoption Management - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // 1. Simular Login como ONG
    cy.login('ong');

    // 2. Mock das solicitações recebidas
    cy.intercept('GET', '**/adoptions/received', {
      body: [
        {
          id: 'req-abc',
          status: 'PENDING',
          message: 'Quero muito adotar o Thor!',
          createdAt: '2025-06-01T10:00:00Z',
          pet: { name: 'Thor', breed: 'Golden' },
          requester: { fullName: 'João Silva', email: 'joao@test.com' }
        },
        {
          id: 'req-xyz',
          status: 'PENDING',
          message: 'Tenho espaço para a Luna.',
          createdAt: '2025-06-02T15:00:00Z',
          pet: { name: 'Luna', breed: 'Siamês' },
          requester: { fullName: 'Maria Souza', email: 'maria@test.com' }
        }
      ]
    }).as('getReceivedAdoptions');

    // 3. Mocks de aprovação/reprovação
    cy.intercept('PATCH', '**/adoptions/req-abc/status', {
      statusCode: 200,
      body: { id: 'req-abc', status: 'APPROVED' }
    }).as('approveAdoption');

    cy.intercept('PATCH', '**/adoptions/req-xyz/status', {
      statusCode: 200,
      body: { id: 'req-xyz', status: 'REJECTED' }
    }).as('rejectAdoption');
  });

  it('should list all received adoption requests', () => {
    cy.visit('/painel/adocoes');
    cy.wait('@getReceivedAdoptions');

    cy.get('[data-testid="adoption-item"]').should('have.length', 2);
    cy.contains('Thor').should('be.visible');
    cy.contains('João Silva').should('be.visible');
    cy.contains('Luna').should('be.visible');
  });

  it('should allow approving an adoption request', () => {
    cy.visit('/painel/adocoes');
    cy.wait('@getReceivedAdoptions');

    // Clicar no botão de aprovar da primeira solicitação
    cy.get('[data-testid="approve-btn"]').first().click();

    cy.wait('@approveAdoption').its('request.body').should('deep.equal', {
      status: 'APPROVED'
    });

    cy.contains('Aprovada').should('be.visible');
  });

  it('should allow rejecting an adoption request', () => {
    cy.visit('/painel/adocoes');
    cy.wait('@getReceivedAdoptions');

    // Clicar no botão de reprovar da segunda solicitação
    cy.get('[data-testid="reject-btn"]').last().click();

    cy.wait('@rejectAdoption').its('request.body').should('deep.equal', {
      status: 'REJECTED'
    });

    cy.contains('Recusada').should('be.visible');
  });

  it('should show adoption message/details when requested', () => {
    cy.visit('/painel/adocoes');
    cy.wait('@getReceivedAdoptions');

    cy.contains('Quero muito adotar o Thor!').should('be.visible');
  });
});
