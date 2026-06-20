describe('Pet Adoption Flow E2E Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.viewport('macbook-15');

    // Realiza login utilizando o comando customizado do Cypress (definido em cypress/support)
    cy.login('adopter');

    // Intercepta a listagem de pets retornando um pet controlado
    cy.intercept('GET', '**/api-backend/pets*', {
      statusCode: 200,
      body: [
        {
          id: 'pet-999',
          name: 'Oliver Mock',
          species: 'CAT',
          status: 'AVAILABLE',
          photoUrl: '/pets/oliver.jpg',
          description: 'Um gatinho muito brincalhão e amoroso.',
          city: 'Santa Rita do Sapucaí',
          state: 'MG',
          registeredBy: { name: 'ONG Protetora', id: 'ong-2' }
        }
      ]
    }).as('getPetsList');

    // Intercepta a requisição de detalhes do pet para quando abrirmos a página do pet-999
    cy.intercept('GET', '**/api-backend/pets/pet-999', {
      statusCode: 200,
      body: {
        id: 'pet-999',
        name: 'Oliver Mock',
        species: 'CAT',
        status: 'AVAILABLE',
        photoUrl: '/pets/oliver.jpg',
        description: 'Um gatinho muito brincalhão e amoroso.',
        city: 'Santa Rita do Sapucaí',
        state: 'MG',
        registeredBy: { name: 'ONG Protetora', id: 'ong-2' }
      }
    }).as('getPetDetails');

    // Intercepta o envio do formulário de solicitação de adoção
    cy.intercept('POST', '**/api-backend/adoptions', {
      statusCode: 201,
      body: {
        id: 'adoc-999',
        petId: 'pet-999',
        status: 'PENDING',
        message: 'Motivação: Quero muito adotar este gatinho!\nPossui outros pets: Não\nPossui crianças: Não\nTipo de moradia: Casa'
      }
    }).as('submitAdoption');
  });

  it('should navigate from dashboard to pet details, fill the adoption form and submit it successfully', () => {
    // 1. Entrar no dashboard
    cy.visit('/dashboard');
    cy.wait('@getPetsList');

    // Verifica que o card do pet mockado é exibido
    cy.contains('Oliver Mock').should('be.visible');

    // 2. Clicar no card do pet para navegar para a tela de detalhes
    cy.contains('Oliver Mock').click();

    // Valida que foi redirecionado para a rota correta e espera carregar os detalhes do pet
    cy.url().should('include', '/pet/pet-999');
    cy.wait('@getPetDetails');

    // Garante que as informações do pet aparecem na tela
    cy.contains('h1', 'Oliver Mock').should('be.visible');
    cy.contains('Um gatinho muito brincalhão e amoroso.').should('be.visible');

    // 3. Clicar no botão "Solicitar adoção" para exibir o formulário
    cy.contains('button', /Solicitar adoção/i).should('be.visible').click();

    // 4. Preencher o formulário de intenção de adoção
    // Motivação com no mínimo 20 caracteres (conforme schema do Zod)
    cy.get('textarea[name="motivation"]')
      .type('Olá! Tenho muito espaço em casa e muito carinho para oferecer ao Oliver Mock.')
      .should('have.value', 'Olá! Tenho muito espaço em casa e muito carinho para oferecer ao Oliver Mock.');

    // Marcar as opções de rádio (precisam de force: true pois os inputs de rádio originais estão ocultados por className sr-only)
    cy.get('input[name="hasOtherPets"][value="no"]').check({ force: true });
    cy.get('input[name="hasChildren"][value="no"]').check({ force: true });
    cy.get('input[name="housingType"][value="house"]').check({ force: true });

    // Aceitar os termos de responsabilidade
    cy.get('input[name="acceptTerms"]').check({ force: true }).should('be.checked');

    // 5. Enviar a solicitação de adoção
    cy.contains('button', /Adotar Oliver Mock/i).should('not.be.disabled').click();

    // Espera a interceptação do POST da adoção ser executado
    cy.wait('@submitAdoption');

    // 6. Verificar se a tela de sucesso foi renderizada no formulário
    cy.contains('Solicitação enviada!').should('be.visible');
    cy.contains('Sua solicitação para adotar Oliver Mock foi enviada.').should('be.visible');
    
    // Validar se há o link de "Minhas Adoções" para direcionar o usuário
    cy.contains('a', 'Minhas Adoções')
      .should('have.attr', 'href', '/minhas-solicitacoes')
      .click();

    cy.url().should('include', '/minhas-solicitacoes');
  });
});
