Feature: Company access approval
  An administrator controls access to the shared company profile.

  Scenario: A pending user cannot access company data
    Given a user has signed in with Google
    And that user awaits approval
    When the user requests the company profile
    Then access is denied
    And the user sees that their account awaits approval

  Scenario: Revocation blocks an existing session
    Given an approved user has an active session
    And an administrator is signed in
    When the administrator revokes that user's access
    Then further company profile reads and edits are denied
