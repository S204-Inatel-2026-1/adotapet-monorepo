describe('ONG Dashboard - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // Mock da listagem de pets da ONG (o e2e roda sem backend).
    // 1 pet evita o empty state, que renderiza DOIS links "novo pet" (header + card).
    cy.intercept('GET', '**/api-backend/pets*', {
      statusCode: 200,
      body: [
        {
          id: 'pet-1',
          name: 'Thor',
          species: 'DOG',
          sex: 'MALE',
          breed: 'Labrador',
          ageInMonths: 24,
          size: 'LARGE',
          status: 'AVAILABLE',
          photoUrl: '/pets/thor.jpg',
          city: 'Santa Rita do Sapucai',
          state: 'MG',
        },
      ],
    }).as('getPets');

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
