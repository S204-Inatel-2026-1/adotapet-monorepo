describe('Adoption Flow - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');
    
    // Simula login via comando customizado
    cy.login('adopter');

    // Intercepta a listagem de pets para garantir que sempre tenha um pet para clicar
    cy.intercept('GET', '**/api-backend/pets*', {
      statusCode: 200,
      body: [
        {
          id: 'pet-123',
          name: 'Thor Mock',
          species: 'DOG',
          status: 'AVAILABLE',
          photoUrl: '/pets/thor.jpg',
          description: 'Cachorro dócil.',
          city: 'São Paulo',
          state: 'SP',
          registeredBy: { name: 'ONG Teste', id: 'ong-1' }
        }
      ]
    }).as('getPetsList');

    // Intercepta os detalhes do pet para a próxima página
    cy.intercept('GET', '**/api-backend/pets/pet-123', {
      statusCode: 200,
      body: {
        id: 'pet-123',
        name: 'Thor Mock',
        species: 'DOG',
        status: 'AVAILABLE',
        photoUrl: '/pets/thor.jpg',
        description: 'Cachorro dócil.',
        city: 'São Paulo',
        state: 'SP',
        registeredBy: { name: 'ONG Teste', id: 'ong-1' }
      }
    }).as('getPetDetails');

    // Intercepta o POST da adoção para não poluir o banco real durante o E2E
    cy.intercept('POST', '**/api-backend/adoptions', {
      statusCode: 201,
      body: { id: 'adoc-123', status: 'PENDING' }
    }).as('postAdoption');
  });

  it('should complete the full adoption request flow', () => {
    cy.visit('/dashboard');
    cy.wait('@getPetsList');

    cy.contains('Thor Mock', { timeout: 10000 }).should('be.visible');

    // Clicar no texto do card que engatilha o link
    cy.contains('Thor Mock').click();

    // Aguarda a rota e o mock dos detalhes
    cy.url().should('include', '/pet/pet-123');
    cy.wait('@getPetDetails');

    // 2. Abrir formulário na página de detalhes do pet
    cy.contains('button', /Solicitar adoção/i, { timeout: 10000 }).should('be.visible').click();

    // 3. Preencher formulário
    cy.get('textarea[name="motivation"]').type('Tenho muito amor para dar e um quintal enorme para correr.');
    cy.get('input[name="hasOtherPets"][value="yes"]').check({ force: true });
    cy.get('input[name="hasChildren"][value="no"]').check({ force: true });
    cy.get('input[name="housingType"][value="house"]').check({ force: true });
    cy.get('input[name="acceptTerms"]').check({ force: true });

    // 4. Enviar
    // O texto no botão é dinâmico: "Adotar [Nome do Pet] ♡"
    cy.contains('button', /Adotar Thor Mock/i).should('not.be.disabled').click();

    // 5. Verifica se o POST foi chamado
    cy.wait('@postAdoption');

    // 6. Verifica a mensagem de sucesso na tela de Pet (já que o POST foi bem sucedido)
    // Se o componente renderiza "Solicitação enviada!", testamos isso:
    cy.contains(/Solicitação enviada!|Sucesso/i, { timeout: 10000 }).should('be.visible');

    // Navega manualmente clicando no link do componente
    cy.contains('a', 'Minhas Adoções').click();
    cy.url({ timeout: 15000 }).should('include', '/minhas');
  });
});
