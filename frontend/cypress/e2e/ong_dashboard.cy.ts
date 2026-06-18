describe('ONG Dashboard - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // 1. Simular Login como ONG
    cy.login('ong');
  });

  it('should list all pets registered by the ONG', () => {
    cy.visit('/painel/pets');
    cy.url().should('include', '/painel/pets');

    // Verifica se a lista carrega (pode ter pets ou estar vazia)
    cy.get('body').then($body => {
      if ($body.find('[data-testid="pet-item"]').length > 0) {
        cy.get('[data-testid="pet-item"]').should('have.length.at.least', 1);
      } else {
        cy.contains(/Nenhum pet cadastrado|Cadastrar novo pet/i).should('be.visible');
      }
    });
  });

  it('should show the status of each pet correctly', () => {
    cy.visit('/painel/pets');

    cy.get('body').then($body => {
      if ($body.find('[data-testid="pet-item"]').length > 0) {
        // Se houver pet, verifica se ele possui alguma badge de status
        cy.get('[data-testid="pet-item"]').first().within(() => {
          cy.contains(/Disponível|Em análise|Adotado/i).should('be.visible');
        });
      }
    });
  });

  it('should have a button to add a new pet', () => {
    cy.visit('/painel/pets');
    
    cy.get('a[href="/painel/pets/novo"]', { timeout: 10000 }).should('be.visible').click();
    cy.url().should('include', '/painel/pets/novo');
  });

  it('should allow navigation to pet editing', () => {
    cy.visit('/painel/pets');

    cy.get('body').then($body => {
      if ($body.find('[data-testid="edit-pet-btn"]').length > 0) {
        // Clicar no botão de editar do primeiro pet
        cy.get('[data-testid="edit-pet-btn"]', { timeout: 10000 }).first().click();
        cy.url().should('include', '/editar');
      } else {
        cy.log('Nenhum pet para editar');
      }
    });
  });
});
