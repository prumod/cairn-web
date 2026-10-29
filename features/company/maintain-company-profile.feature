Feature: Removed company profile
  Company details are no longer available through the application.

  Scenario: An approved user cannot edit company details
    Given a signed-in user has been approved by the administrator
    When the user opens the home page
    Then no company profile editor is available
    And the former company endpoint is unavailable
