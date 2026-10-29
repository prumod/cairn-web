Feature: Account access approval
  An administrator controls account approval.

  Scenario: A pending user remains unapproved
    Given a user has signed in with Google
    And that user awaits approval
    When the user checks their session
    Then their account remains unapproved

  Scenario: Revocation updates an existing session
    Given an approved user has an active session
    And an administrator is signed in
    When the administrator revokes that user's access
    Then their existing session reports that approval was revoked
