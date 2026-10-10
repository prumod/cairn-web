Feature: Maintain the company profile
  Approved users save and retrieve shared company details.

  Scenario: An approved user saves persistent company details
    Given a signed-in user has been approved by the administrator
    And no company profile has been saved
    When the user saves these company details:
      | field             | value                  |
      | company name      | Example Company        |
      | reference address | Rua do Comércio, Porto |
      | search radius km  | 25                     |
    Then those details remain available after reloading the page
