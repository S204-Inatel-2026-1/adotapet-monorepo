describe('Adoption Flow - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');
    
    // Mocks de API
    cy.intercept('GET', '**/pets/pet-123', { fixture: 'pet.json' }).as('getPet');
    cy.intercept('POST', '**/adoptions', {
      statusCode: 201,
      body: { id: 'req-456', status: 'PENDING' }
    }).as('submitAdoption');

    // Simula login via comando customizado
    cy.login('adopter');
  });

  it('should complete the full adoption request flow', () => {
    // 1. Visitar página do pet
    cy.visit('/pet/pet-123');
    cy.wait('@getPet');

    // 2. Abrir formulário
    cy.contains('button', /Solicitar adoção/i).should('be.visible').click();

    // 3. Preencher formulário
    cy.get('textarea[name="motivation"]').type('Tenho muito amor para dar e um quintal enorme para correr. Tenho experiência com animais.');
    
    // Selecionar opções usando os inputs diretamente (mesmo que escondidos)
    cy.get('input[name="hasOtherPets"][value="yes"]').check({ force: true });
    cy.get('input[name="hasChildren"][value="no"]').check({ force: true });
    cy.get('input[name="housingType"][value="house"]').check({ force: true });

    // Aceitar termos
    cy.get('input[name="acceptTerms"]').check();

    // 4. Enviar
    cy.contains('button', /Adotar/i).should('not.be.disabled').click();
    cy.wait('@submitAdoption');

    // 5. Verificar sucesso
    cy.contains('Solicitação enviada!').should('be.visible');
    
    // 6. Navegar para Minhas Adoções
    cy.intercept('GET', '**/adoptions/my-requests', {
      body: [
        {
          id: 'req-456',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          pet: { name: 'Thor', photoUrl: '', breed: 'Vira-lata' }
        }
      ]
    }).as('getMyAdoptions');

    cy.contains('a', /Minhas Adoções/i).click();
    cy.url().should('include', '/minhas-adocoes');
    cy.wait('@getMyAdoptions');

    // 7. Verificar se aparece na lista
    cy.contains('Thor').should('be.visible');
    cy.contains('Pendente').should('be.visible');
  });
});
