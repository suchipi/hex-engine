it("canvas background color", () => {
  cy.createRootWithCanvas(() => {}, { backgroundColor: "green" });
  cy.matchImageSnapshot();
});
