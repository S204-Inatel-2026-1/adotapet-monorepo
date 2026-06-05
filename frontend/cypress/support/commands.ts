/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
Cypress.Commands.add('login', (role: 'adopter' | 'ong' = 'adopter') => {
  // Payload fake com ID para o teste de perfil
  const payload = btoa(JSON.stringify({ sub: 'user-123', role: role.toUpperCase() }));
  const token = `header.${payload}.signature`;
  
  const user = {
    name: 'Lucas Teste',
    email: 'lucas@test.com',
    role: role
  };

  localStorage.setItem('adotapet_token', token);
  localStorage.setItem('adotapet_user', JSON.stringify(user));
  cy.setCookie('adotapet_token', token);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: 'adopter' | 'ong'): Chainable<void>
    }
  }
}