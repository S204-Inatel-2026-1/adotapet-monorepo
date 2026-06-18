import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 90000,

  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
