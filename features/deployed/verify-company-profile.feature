@deployed
Feature: Verify the deployed company profile
  The testing deployment uses real Google identities, persistent data, and live access checks.

  Scenario: A pending Google member cannot access the company profile
    Given the exact testing candidate is live
    And the administrator has recorded the baseline and marked the member pending
    When the pending member signs in with Google
    Then the member sees the pending approval state and profile reads and edits are denied
    And the original company profile remains unchanged

  Scenario: Approving a pending member grants profile access in the same session
    Given the exact testing candidate is live
    And the administrator and pending member have signed in with Google after the baseline was recorded
    When the administrator approves the member
    Then the member can access the company profile

  Scenario: An approved member saves shared details across a reload
    Given the exact testing candidate is live
    And the administrator and approved member have signed in with Google after the baseline was recorded
    When the member saves a company profile and reloads the page
    Then the saved profile remains available after reloading

  Scenario: Revocation denies profile access in the member's existing session
    Given the exact testing candidate is live
    And the administrator and approved member have signed in with Google after the baseline was recorded
    When the administrator revokes the member's access
    Then the member sees the pending approval state and profile reads and edits are denied
    And the original company profile remains unchanged
