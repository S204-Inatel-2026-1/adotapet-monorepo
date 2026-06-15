describe('Dashboard Filters - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // Mocks de Pets
    cy.intercept('GET', '**/api-backend/pets', {
      body: [
        {
          id: '1',
          name: 'Thor',
          species: 'DOG',
          breed: 'Golden Retriever',
          sex: 'MALE',
          ageInMonths: 24,
          size: 'LARGE',
          city: 'Santa Rita',
          state: 'MG',
          photoUrl: '/pets/thor.jpg'
        },
        {
          id: '2',
          name: 'Luna',
          species: 'CAT',
          breed: 'Siamês',
          sex: 'FEMALE',
          ageInMonths: 12,
          size: 'SMALL',
          city: 'Pouso Alegre',
          state: 'MG',
          photoUrl: '/pets/luna.jpg'
        },
        {
          id: '3',
          name: 'Bob',
          species: 'DOG',
          breed: 'Poodle',
          sex: 'MALE',
          ageInMonths: 36,
          size: 'MEDIUM',
          city: 'Santa Rita',
          state: 'MG',
          photoUrl: '/pets/bob.jpg'
        }
      ]
    }).as('getPets');

    cy.login('adopter');
  });

  it('should display all pets initially', () => {
    cy.visit('/dashboard');
    cy.wait('@getPets');

    cy.contains('3 pets encontrados').should('be.visible');
    cy.get('h3').should('contain', 'Thor');
    cy.get('h3').should('contain', 'Luna');
    cy.get('h3').should('contain', 'Bob');
  });

  it('should filter pets by name search', () => {
    cy.visit('/dashboard');
    cy.wait('@getPets');

    cy.get('input[placeholder="Buscar por nome..."]').type('Thor');
    
    cy.contains('1 pets encontrados').should('be.visible');
    cy.get('#pets h3').should('contain', 'Thor');
    cy.get('#pets h3').should('not.contain', 'Luna');
    cy.get('#pets h3').should('not.contain', 'Bob');
  });

  it('should filter pets by animal type', () => {
    cy.visit('/dashboard');
    cy.wait('@getPets');

    // Clicar em Gatos
    cy.contains('button', 'Gatos').click();
    cy.contains('1 pets encontrados').should('be.visible');
    cy.get('#pets h3').should('contain', 'Luna');
    cy.get('#pets h3').should('not.contain', 'Thor');

    // Clicar em Cães
    cy.contains('button', 'Cães').click();
    cy.contains('2 pets encontrados').should('be.visible');
    cy.get('#pets h3').should('contain', 'Thor');
    cy.get('#pets h3').should('contain', 'Bob');
    cy.get('#pets h3').should('not.contain', 'Luna');
  });

  it('should filter pets by size', () => {
    cy.visit('/dashboard');
    cy.wait('@getPets');

    // Clicar em Grande
    cy.contains('button', 'Grande').click();
    cy.contains('1 pets encontrados').should('be.visible');
    cy.get('#pets h3').should('contain', 'Thor');
    cy.get('#pets h3').should('not.contain', 'Bob');

    // Clicar em Médio
    cy.contains('button', 'Médio').click();
    cy.contains('1 pets encontrados').should('be.visible');
    cy.get('#pets h3').should('contain', 'Bob');
    cy.get('#pets h3').should('not.contain', 'Thor');
  });

  it('should show empty state when no pets match filters', () => {
    cy.visit('/dashboard');
    cy.wait('@getPets');

    cy.get('input[placeholder="Buscar por nome..."]').type('Rex');
    cy.contains('0 pets encontrados').should('be.visible');
    cy.get('#pets h3').should('not.exist');
  });
});
