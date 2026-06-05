describe('ONG Dashboard - E2E (TDD)', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // 1. Simular Login como ONG
    cy.login('ong');

    // 2. Mock da lista de pets da ONG (Supondo que existe um filtro ou rota específica)
    // Se o backend usar GET /pets e filtrar no front, ou tiver GET /pets/my-pets
    cy.intercept('GET', '**/pets*', {
      body: [
        {
          id: 'pet-1',
          name: 'Thor',
          species: 'DOG',
          breed: 'Golden',
          status: 'AVAILABLE',
          photoUrl: '/pets/thor.jpg'
        },
        {
          id: 'pet-2',
          name: 'Bolinha',
          species: 'CAT',
          breed: 'Vira-lata',
          status: 'ADOPTED',
          photoUrl: '/pets/bolinha.jpg'
        }
      ]
    }).as('getMyPets');
  });

  it('should list all pets registered by the ONG', () => {
    cy.visit('/painel/pets');
    cy.wait('@getMyPets');

    cy.get('[data-testid="pet-item"]').should('have.length', 2);
    cy.contains('Thor').should('be.visible');
    cy.contains('Bolinha').should('be.visible');
  });

  it('should show the status of each pet correctly', () => {
    cy.visit('/painel/pets');
    cy.wait('@getMyPets');

    cy.contains('Disponível').should('be.visible'); // Referente ao Thor
    cy.contains('Adotado').should('be.visible');    // Referente à Bolinha
  });

  it('should have a button to add a new pet', () => {
    cy.visit('/painel/pets');
    
    cy.get('a[href="/painel/pets/novo"]').should('be.visible').click();
    cy.url().should('include', '/painel/pets/novo');
  });

  it('should allow navigation to pet editing', () => {
    cy.visit('/painel/pets');
    cy.wait('@getMyPets');

    // Clicar no botão de editar do primeiro pet
    cy.get('[data-testid="edit-pet-btn"]').first().click();
    cy.url().should('include', '/painel/pets/pet-1/editar');
  });
});
