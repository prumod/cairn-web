# Manages the GitHub environment that gates the deployed E2E workflow.
# Secret values are not managed here: they stay out of OpenTofu state.
# Set them with `gh secret set NAME --env cairn-testing-e2e --repo prumod/cairn-web < file`.

provider "github" {
  owner = "prumod"
}

resource "github_repository_environment" "cairn_testing_e2e" {
  repository  = "cairn-web"
  environment = "cairn-testing-e2e"

  deployment_branch_policy {
    protected_branches     = false
    custom_branch_policies = true
  }
}

resource "github_repository_environment_deployment_policy" "main" {
  repository     = "cairn-web"
  environment    = github_repository_environment.cairn_testing_e2e.environment
  branch_pattern = "main"
}
