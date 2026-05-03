<template>
  <div class="pt-home-shell">
    <section class="pt-hero-panel">
      <div class="pt-hero-copy">
        <p class="pt-eyebrow">Docs landing page</p>
        <h2>Use the app the way a real QA team would</h2>
        <p class="pt-lead">
          Start with users, create a project, then trace work from epic to feature to requirement,
          connect test cases, capture test runs, and link bugs back to the same work.
          The docs are built for fast navigation, not decoration.
        </p>

        <div class="pt-action-row">
          <a class="pt-action primary" href="/01-setup">Set up the app</a>
          <a class="pt-action" href="/workflows/users">Create users</a>
          <a class="pt-action" href="/workflows/planning">Create requirements</a>
          <a class="pt-action" href="/workflows/bugs">Create bugs</a>
        </div>

        <div class="pt-stat-grid">
          <article class="pt-stat">
            <span>Total flow</span>
            <strong>Project -> Bug</strong>
            <p>Trace every item through planning, testing, and defect tracking.</p>
          </article>
          <article class="pt-stat">
            <span>Test scale</span>
            <strong>10,000 runs</strong>
            <p>Seeded data gives you enough volume for meaningful load testing.</p>
          </article>
          <article class="pt-stat">
            <span>Access model</span>
            <strong>Admin + editor</strong>
            <p>Admins provision users. Editors work the day-to-day backlog.</p>
          </article>
        </div>
      </div>

      <aside class="pt-console">
        <div class="pt-console-head">
          <span class="pt-pill">Quick workflow</span>
          <span class="pt-console-note">The fastest path through the app</span>
        </div>

        <ol class="pt-steps">
          <li>
            <strong>Create a user</strong>
            <p>Bootstrap the first admin, then provision more users from the Users page.</p>
          </li>
          <li>
            <strong>Create a project</strong>
            <p>Everything else hangs off the project owner and project filters.</p>
          </li>
          <li>
            <strong>Create epics, features, and requirements</strong>
            <p>Keep the hierarchy clean so traceability stays obvious later.</p>
          </li>
          <li>
            <strong>Create test cases and test runs</strong>
            <p>Use the testing flow to verify the requirement coverage.</p>
          </li>
          <li>
            <strong>Create bugs and comments</strong>
            <p>Link defects back to requirements and keep the discussion attached.</p>
          </li>
        </ol>
      </aside>
    </section>

    <section class="pt-section">
      <div class="pt-section-head">
        <p class="pt-eyebrow">How the app is organized</p>
        <h2>Four areas you will use constantly</h2>
      </div>

      <div class="pt-lane-grid">
        <a class="pt-lane-card" href="/workflows/projects">
          <span>Planning</span>
          <h3>Projects, Epics, Features, Requirements</h3>
          <p>Create the work breakdown and keep ownership visible from the start.</p>
        </a>
        <a class="pt-lane-card" href="/workflows/testing">
          <span>Testing</span>
          <h3>Test Cases and Test Runs</h3>
          <p>Turn requirements into executable checks and record the outcome.</p>
        </a>
        <a class="pt-lane-card" href="/workflows/bugs">
          <span>Defects</span>
          <h3>Bugs, Comments, Activity</h3>
          <p>Track defects, discuss them, and keep the change history visible.</p>
        </a>
        <a class="pt-lane-card" href="/workflows/activity">
          <span>System</span>
          <h3>Users and Activity Logs</h3>
          <p>Manage who can work in the system and what has changed recently.</p>
        </a>
      </div>
    </section>

    <section class="pt-section pt-two-col">
      <article class="pt-panel">
        <div class="pt-section-head">
          <p class="pt-eyebrow">First things first</p>
          <h2>How to create the main records</h2>
        </div>

        <div class="pt-create-list">
          <div>
            <strong>Create a user</strong>
            <p>Open <a href="/workflows/users">Users and Auth</a> and create the first admin or a new editor.</p>
          </div>
          <div>
            <strong>Create a project</strong>
            <p>Open <a href="/workflows/projects">Projects</a>, choose the owner, then save the record.</p>
          </div>
          <div>
            <strong>Create a requirement</strong>
            <p>Open <a href="/workflows/planning">Planning Workflow</a>, create an epic and feature first, then add the requirement under the feature.</p>
          </div>
          <div>
            <strong>Create a bug</strong>
            <p>Open <a href="/workflows/bugs">Bugs, Comments, Activity</a>, set severity and assignee, then link the bug back to requirements.</p>
          </div>
          <div>
            <strong>Create a test case</strong>
            <p>Open <a href="/workflows/testing">Testing Workflow</a>, then link the test case to one or more requirements.</p>
          </div>
          <div>
            <strong>Create a test run</strong>
            <p>Run the test case against a project and record whether it passed, failed, blocked, or was skipped.</p>
          </div>
        </div>
      </article>

      <aside class="pt-panel pt-quickref">
        <div class="pt-section-head">
          <p class="pt-eyebrow">Domain model</p>
          <h2>Traceability chain</h2>
        </div>

        <div class="pt-chain">
          <span>Project</span>
          <span>Epic</span>
          <span>Feature</span>
          <span>Requirement</span>
          <span>Test Case</span>
          <span>Test Run</span>
          <span>Bug</span>
        </div>

        <p class="pt-note">
          Requirement links are many-to-many with test cases and bugs, so the same business need can
          stay connected to both validation and defect history.
          OpenAPI is enabled, so the same CRUD endpoints can be driven from curl, Postman, k6, or
          JMeter without adding a separate CLI layer.
        </p>

        <div class="pt-side-links">
          <a href="/what-is-projecttrace">What is ProjectTrace?</a>
          <a href="/02-architecture">Architecture</a>
          <a href="/06-performance-baseline">Performance baseline</a>
        </div>
      </aside>
    </section>

    <section class="pt-section">
      <div class="pt-section-head">
        <p class="pt-eyebrow">Reference</p>
        <h2>Useful docs when you need details</h2>
      </div>

      <div class="pt-reference-grid">
        <a href="/03-api-guide">API Guide</a>
        <a href="/04-k6-guide">k6 Guide</a>
        <a href="/05-jmeter-guide">JMeter Guide</a>
        <a href="/06-performance-baseline">Performance Baseline</a>
        <a href="/07-performance-bug-roadmap">Performance Roadmap</a>
        <a href="/08-results-template">Results Template</a>
      </div>
    </section>
  </div>
</template>
