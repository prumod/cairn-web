@deployed
Feature: Verify the deployed company profile
  The testing deployment uses real Google identities, persistent data, and live access checks.

  Scenario: An approved member saves shared details and loses access in the same session after revocation
    Given the exact testing candidate is live
    And the administrator and approved member have signed in with Google
    And the original profile and approval state are recorded
    When the administrator revokes the member's access
    Then the member sees the pending approval state and profile reads and edits are denied
    When the administrator approves the member again
    And the member saves a company profile and reloads the page
    Then the saved profile remains available after reloading
    When the administrator revokes the member's access again
    Then further profile reads and edits are denied in that same session
    And the original profile and approval state are restored
