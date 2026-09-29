# Mock customer scenario: GitHub Advanced Security data in Cortex

> "I'm looking into the integration between Cortex and GitHub and would like to
> understand what information we can retrieve from GitHub Advanced Security
> (not just events, but also vulnerabilities, metrics, etc.). Do you have any
> examples?"

---

## Part 1: How I would approach this ticket

### What I would check first

1. **What the customer is really asking.** This is a "what's possible" question,
   not a bug report. They want to know if Cortex can replace or add to what they
   see in GitHub's own security tab, and they asked for examples. So the answer
   needs concrete examples, not just a list of features.
2. **The documentation they linked.** Their link
   (`docs.cortex.io/docs/reference/integrations/github`) is the older docs path.
   The current page is
   [GitHub | Cortex](https://docs.cortex.io/ingesting-data-into-cortex/integrations/github).
   I would send them the current link so they read up-to-date material.
3. **Their account setup (internal view).** I would check whether the GitHub
   integration is set up, which connection type it uses (Cortex GitHub App,
   custom GitHub App, or personal access token), and whether it shows errors.
   This decides whether GHAS data can flow in at all.

### What I would validate

- **What the integration pulls from GHAS.** Cortex pulls **code scanning
  (CodeQL) alerts, Dependabot alerts and secret scanning alerts**. These appear
  in each entity's **Code & Security** section. Security advisories come from
  GitHub's GraphQL API. GHAS alerts come from the REST API.
- **Permissions.** GHAS alerts only come through if the GitHub connection can
  read them: read access to code scanning, Dependabot and secret scanning alerts.
  The official Cortex app requests these. A custom app or token may be missing
  them. This is the most common reason people see no GHAS data.
- **The CQL default, a key gotcha.** `git.vulnerabilities()` only searches
  GitHub security advisories by default. To include GHAS alerts, a query must
  say `source=["GITHUB_ADVANCED_SECURITY"]`. Without it, a Scorecard rule can
  quietly miss every GHAS alert.
- **Monorepo limitation.** If an entity is mapped to a folder inside a larger
  repo (a monorepo "basepath"), GHAS vulnerabilities are **not** shown for it.
- **GitHub side.** GHAS must be enabled on the repos. Code scanning and secret
  scanning need a GHAS licence for private repos (they're free on public repos).
  Also, GHAS only reports what has been scanned, so repos with no CodeQL workflow
  will show no code scanning alerts.
- **Reproduce it.** I would check each example in a sandbox before sending: link
  a repo with an open Dependabot alert, confirm it appears on the entity, and run
  the CQL queries in the query builder.

### Clarifying questions I would ask

1. **Goal:** Do you want visibility (see alerts per service), enforcement
   (Scorecard rules and gates), reporting (trends for leadership), or all three?
2. **Setup:** Which GitHub connection do you use (Cortex app, custom app or
   token)? Is it GitHub.com or GitHub Enterprise Server?
3. **GHAS coverage:** Which GHAS features are turned on today (code scanning,
   Dependabot, secret scanning), and on all repos or just some?
4. **Repo layout:** Are services one-per-repo, or do some live in a monorepo?
   (This affects what we can show.)
5. **"Metrics":** Which metrics matter to you? For example, open alerts by
   severity, time to fix, or alerts fixed per month. Open alerts by severity is
   built in through CQL. Trend metrics like time to fix may need custom data
   sent to Cortex through its API, which I would confirm before promising.
6. **Other tools:** Do you also use other security scanners, like Snyk or
   SonarQube, that you would want to see side by side?

---

## Part 2: Response to the customer

**Subject: GitHub Advanced Security data in Cortex (with examples)**

Hi [Name],

Thanks for reaching out, and great question! Here's what Cortex can pull from
GitHub Advanced Security (GHAS), how you can use it, and a few examples to get
you started.

**1. What Cortex retrieves from GHAS**

Once GitHub is connected, Cortex pulls these alerts for each repository linked
to an entity (a service, library and so on):

| GHAS feature | What you get in Cortex |
|---|---|
| **Code scanning (CodeQL)** | Security issues found in your code |
| **Dependabot alerts** | Vulnerable open-source dependencies |
| **Secret scanning** | Credentials or tokens committed to the repo |
| **Security advisories** | Known vulnerabilities (CVEs) affecting the repo |

You'll find these on each entity's page under **Code & Security**. They sit
alongside the other GitHub data Cortex brings in, such as recent commits,
releases, pull requests, top contributors and branch protection settings.

**2. Using the data: vulnerabilities and metrics**

This data works with the **Cortex Query Language (CQL)**, so you can go beyond
viewing alerts to **measuring and enforcing** security standards with
**Scorecards**. A few examples:

- **No critical or high GHAS alerts:**
  ```
  git.vulnerabilities(severity=["CRITICAL", "HIGH"], source=["GITHUB_ADVANCED_SECURITY"]).length < 1
  ```
- **No critical vulnerabilities from any source:**
  ```
  git.vulnerabilities(severity=["CRITICAL"]).length == 0
  ```
- **Fewer than 5 open vulnerabilities in total:**
  ```
  git.vulnerabilities().length < 5
  ```
- **Related GitHub controls you can pair with them:**
  - Branch protection is enabled: `git.branchProtection() != null`
  - At least one approval is required to merge: `git.numOfRequiredApprovals() > 0`

**Tip:** by default, `git.vulnerabilities()` only checks GitHub security
advisories. Add `source=["GITHUB_ADVANCED_SECURITY"]` to include code
scanning, Dependabot and secret scanning alerts.

A common pattern is a **"Security Standards" Scorecard** with levels such as
Bronze (branch protection on), Silver (no critical alerts) and Gold (no critical
or high alerts). That gives you a per-service and per-team view of security
posture, and you can track progress with Initiatives.

**3. A few things to check**

- **Permissions:** your GitHub connection needs read access to code scanning,
  Dependabot and secret scanning alerts. The Cortex GitHub App requests these
  for you. If you use a custom app or token, please check it has them.
- **GHAS enabled in GitHub:** alerts only show up for repos where the GHAS
  features are turned on and scans have run.
- **Monorepos:** if a service is mapped to a folder inside a larger repository,
  GHAS alerts aren't currently shown for that service.

**4. Useful links**

- [GitHub integration docs](https://docs.cortex.io/ingesting-data-into-cortex/integrations/github)
  (this is the current version of the page you linked)
- [Cortex Query Language (CQL)](https://docs.cortex.io/standardize/cql)
- [Enforce security standards with a Scorecard](https://docs.cortex.io/guides/security/scorecard)

To point you to the most useful setup, could you share a bit more about your goals?

1. Are you mainly looking for **visibility**, **enforcement** (Scorecard rules)
   or **reporting** (trends over time)?
2. Which GHAS features do you have turned on, and how are you connecting GitHub
   to Cortex (Cortex app, custom app or token)?
3. Are any of your services in a monorepo?

Happy to set up a short call to walk through this in your workspace and help
build a starter security Scorecard.

Best regards,
[Your name]
Cortex Technical Support
