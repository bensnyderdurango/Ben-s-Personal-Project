# Mock customer scenario: GitHub Advanced Security data in Cortex

> "I'm looking into the integration between Cortex and GitHub and would like to
> understand what information we can retrieve from GitHub Advanced Security
> (not just events, but also vulnerabilities, metrics, etc.). Do you have any
> examples?"

---

## Part 1: How I would approach this ticket

### What I would check first

1. **What the customer is really asking.** This is a "what's possible"
   question, not a bug report. They name three things: **events,
   vulnerabilities and metrics**, and they ask for examples. My answer should
   cover all three and be honest about what is and isn't supported, so they
   don't build plans on features that don't exist.
2. **The documentation they linked.** Their link
   (`docs.cortex.io/docs/reference/integrations/github`) is the older docs
   path. The current page is
   [GitHub | Cortex](https://docs.cortex.io/ingesting-data-into-cortex/integrations/github).
   I would send them the current link so they read up-to-date material.
3. **Their account setup (internal view).** I would check whether the GitHub
   integration is set up, which connection type it uses (Cortex GitHub App,
   custom GitHub App or personal access token), and whether it shows errors.
   This decides whether GHAS data can reach Cortex at all.

### What I would validate

- **What Cortex pulls from GHAS.** Vulnerabilities from four GHAS sources:
  code scanning (SAST: CodeQL and other tools), Dependabot alerts (dependency
  scanning), secret scanning, and CodeQL results.
- **What each vulnerability record contains.** Through
  `git.vulnerabilities()`, each record has: `id`, `name`, `severity`
  (CRITICAL, HIGH, MEDIUM, LOW, INFO, UNKNOWN), `state` (for example open or
  dismissed), `reportType` (SAST, DEPENDENCY_SCANNING, SECRET_DETECTION,
  CONTAINER_SCANNING and others), `createdAt`, and `url` (a link back to
  GitHub).
- **Which CQL functions are available.**
  - `git.vulnerabilities(...)` returns the list of vulnerabilities.
  - `git.numOfVulnerabilities(...)` returns a count.
  - Both can be filtered by severity, source (`GITHUB_ADVANCED_SECURITY` or
    `GITHUB_SECURITY_ADVISORY`), scan type and report type.
  - `git.hasCodeScan()` checks whether code scanning is enabled on the repo.
- **What is not supported.** This matters most for this ticket, because the
  customer asked about events and metrics:
  - **Dependency review is not supported.**
  - **No event source for GHAS alerts.** Alerts don't show up as events on the
    timeline the way deployments or incidents do.
  - **No time-series metrics.** Vulnerability counts aren't in Cortex's
    metrics catalog, so they can't be trended over time. GHAS data is scored
    through CQL Scorecard rules instead.
  - **Monorepos are not covered.** GHAS vulnerabilities aren't shown for
    entities mapped to a folder inside a larger repo.
- **The default source.** Search results for the docs suggest that
  `git.vulnerabilities()` only searches GitHub security advisories unless you
  pass a `source`. I would confirm that in a sandbox. If it's true, a rule
  without `source=["GITHUB_ADVANCED_SECURITY"]` quietly ignores all GHAS
  alerts.
- **Permissions and setup on the GitHub side.**
  - The GitHub connection needs read access to code scanning, Dependabot and
    secret scanning alerts.
  - GHAS must be turned on for the repos.
  - Code scanning only reports repos where a scan has actually run.
- **Reproduce it.** Before sending, I would test each example in a sandbox:
  link a repo with an open Dependabot alert, check that it appears under
  **Code & security**, and run every CQL example in the query builder.

### Clarifying questions I would ask

1. **Goal:** Do you want visibility (see alerts per service), enforcement
   (Scorecard rules), or reporting (trends for leadership)? The first two are
   well supported. Trends are not supported for GHAS data today.
2. **"Events" and "metrics":** What do you have in mind? For example, a
   timeline entry when a new critical alert opens, or a chart of open alerts
   per month or time to fix. This tells me whether a workaround or a feature
   request is the right next step.
3. **Setup:** Which GitHub connection do you use (Cortex app, custom app or
   token)? Is it GitHub.com or GitHub Enterprise Server?
4. **GHAS coverage:** Which GHAS features are turned on today, and on all
   repos or just some?
5. **Repo layout:** Are any services in a monorepo?
6. **Other tools:** Do you use other security scanners, like Snyk or
   SonarQube, that you would want to see side by side?

### If they need trends

GHAS data has no native event or metric support, so I would not promise
trends. Instead I would:

- log a **feature request** with their use case;
- explore **workarounds** with our product team first. Possible options are
  Scorecard score history, or sending custom data or events to Cortex through
  its API from a scheduled job. I would only offer these once I've confirmed
  they fit.

---

## Part 2: Response to the customer

**Subject: GitHub Advanced Security data in Cortex (with examples)**

Hi [Name],

Thanks for reaching out, and great question! Below is what Cortex pulls from
GitHub Advanced Security (GHAS), how you can use it, and some examples.
You asked about events and metrics too, so I've also covered what isn't
available today, to help you plan.

**1. What Cortex retrieves from GHAS**

For each repository linked to an entity (a service, library and so on), Cortex
brings in vulnerabilities from:

| GHAS source | What it finds |
|---|---|
| **Code scanning** (CodeQL and other tools) | Security issues in your own code |
| **CodeQL results** | Findings from GitHub's CodeQL analysis |
| **Dependabot alerts** | Vulnerable open-source dependencies |
| **Secret scanning** | Credentials or tokens committed to the repo |

Cortex can also bring in **GitHub security advisories** (known CVEs). This is
a separate source from GHAS, and you can include or exclude it in your rules.

**Where to see it:**
- On each entity's overview page, the **Vulnerabilities** block gives a quick
  summary.
- The **Code & security** section lists every vulnerability, with its
  severity, state, type, date found and a link back to GitHub.

**2. Using the data: examples**

Each vulnerability has fields you can query with the **Cortex Query Language
(CQL)**: `name`, `severity`, `state`, `reportType` (for example SAST,
DEPENDENCY_SCANNING or SECRET_DETECTION), `createdAt` and `url`. This lets you
turn GHAS data into **Scorecard rules** that measure every service against the
same standard. Some examples:

- **Code scanning is turned on:**
  ```
  git.hasCodeScan()
  ```
- **No critical GHAS vulnerabilities:**
  ```
  git.numOfVulnerabilities(severity=["CRITICAL"], source=["GITHUB_ADVANCED_SECURITY"]) == 0
  ```
- **No critical or high GHAS vulnerabilities:**
  ```
  git.numOfVulnerabilities(severity=["CRITICAL", "HIGH"], source=["GITHUB_ADVANCED_SECURITY"]) == 0
  ```
- **No leaked secrets:**
  ```
  git.numOfVulnerabilities(source=["GITHUB_ADVANCED_SECURITY"], reportType=["SECRET_DETECTION"]) == 0
  ```

**Tip:** always include `source=["GITHUB_ADVANCED_SECURITY"]` when you mean
GHAS alerts, so the rule covers the right data.

**A starter "Security Standards" Scorecard could look like this:**

| Level | Rule |
|---|---|
| Bronze | Code scanning is enabled |
| Silver | No critical vulnerabilities and no leaked secrets |
| Gold | No critical or high vulnerabilities |

This gives each service and team a clear, comparable security score, and
shows exactly what to fix to reach the next level.

**3. What isn't available today**

You asked about events and metrics, so to be upfront about the current limits:

- **Events:** new GHAS alerts don't appear as events on the Cortex timeline
  (unlike deployments or incidents).
- **Metrics and trends:** vulnerability counts aren't stored over time, so
  you can't chart things like open alerts per month or time to fix within
  Cortex. GHAS data works as a current snapshot, used through Scorecard rules.
- **Dependency review** (GitHub's pull request dependency check) isn't
  supported.
- **Monorepos:** if a service is mapped to a folder inside a larger repo,
  GHAS vulnerabilities aren't shown for it.

If tracking trends is important to you, let me know what you'd like to
measure. I'll share it with our product team as a feature request and look
into whether there's a workaround that fits your setup.

**4. Before you start**

- Your GitHub connection needs read access to code scanning, Dependabot and
  secret scanning alerts. The Cortex GitHub App requests these for you. If you
  use a custom app or token, please check it has them.
- Alerts only appear for repos where the GHAS features are turned on and a
  scan has run.

**5. Useful links**

- [GitHub integration docs](https://docs.cortex.io/ingesting-data-into-cortex/integrations/github)
  (this is the current version of the page you linked)
- [Cortex Query Language (CQL)](https://docs.cortex.io/standardize/cql)
- [Enforce security standards with a Scorecard](https://docs.cortex.io/guides/security/scorecard)

To point you to the most useful setup, could you tell me:

1. Are you mainly looking for **visibility**, **enforcement** (Scorecard
   rules) or **reporting** (trends over time)?
2. Which GHAS features do you have turned on, and how are you connecting
   GitHub to Cortex (Cortex app, custom app or token)?
3. Are any of your services in a monorepo?

Happy to set up a short call to walk through this in your workspace and build
a starter security Scorecard together.

Best regards,
[Your name]
Cortex Technical Support
