import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const plansDir = join(rootDir, "plans");

mkdirSync(plansDir, { recursive: true });

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function stringProp(name, value) {
  return `<stringProp name="${esc(name)}">${esc(value)}</stringProp>`;
}

function boolProp(name, value) {
  return `<boolProp name="${esc(name)}">${value ? "true" : "false"}</boolProp>`;
}

function collectionProp(name, items) {
  return `<collectionProp name="${esc(name)}">${items.join("")}</collectionProp>`;
}

function formatXml(xml) {
  const tokens = xml.match(
    /<(?:stringProp|boolProp)\b[^>]*>[\s\S]*?<\/(?:stringProp|boolProp)>|<!\[CDATA\[[\s\S]*?\]\]>|<\?xml[^>]*\?>|<[^>]+>|[^<]+/g,
  ) || [];
  let indent = 0;
  const lines = [];

  for (const rawToken of tokens) {
    const token = rawToken.trim();
    if (!token) {
      continue;
    }

    if (token.startsWith("<?xml")) {
      lines.push(token);
      continue;
    }

    if (token.startsWith("</")) {
      indent = Math.max(indent - 1, 0);
      lines.push(`${"  ".repeat(indent)}${token}`);
      continue;
    }

    if (token.startsWith("<![CDATA[")) {
      lines.push(`${"  ".repeat(indent)}${token}`);
      continue;
    }

    if (token.startsWith("<stringProp") || token.startsWith("<boolProp")) {
      lines.push(`${"  ".repeat(indent)}${token}`);
      continue;
    }

    if (token.startsWith("<")) {
      lines.push(`${"  ".repeat(indent)}${token}`);
      if (!token.endsWith("/>") && !token.startsWith("<?") && !token.startsWith("<!")) {
        indent += 1;
      }
      continue;
    }

    lines.push(`${"  ".repeat(indent)}${token}`);
  }

  return `${lines.join("\n")}\n`;
}

function argumentElement(name, value) {
  return [
    `<elementProp name="${esc(name)}" elementType="Argument">`,
    stringProp("Argument.name", name),
    stringProp("Argument.value", value),
    stringProp("Argument.metadata", "="),
    `</elementProp>`,
  ].join("");
}

function headerElement(name, value) {
  return [
    `<elementProp name="${esc(name)}" elementType="Header">`,
    stringProp("Header.name", name),
    stringProp("Header.value", value),
    `</elementProp>`,
  ].join("");
}

function userDefinedVariables(vars) {
  return [
    `<elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true">`,
    collectionProp(
      "Arguments.arguments",
      vars.map(([name, value]) => argumentElement(name, value)),
    ),
    `</elementProp>`,
  ].join("");
}

function httpRequestDefaults() {
  return [
    `<ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults" enabled="true">`,
    stringProp("HTTPSampler.domain", "${baseHost}"),
    stringProp("HTTPSampler.port", "${basePort}"),
    stringProp("HTTPSampler.protocol", "${protocol}"),
    stringProp("HTTPSampler.contentEncoding", "UTF-8"),
    `</ConfigTestElement>`,
  ].join("");
}

function headerManager() {
  return [
    `<HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="HTTP Header Manager" enabled="true">`,
    collectionProp("HeaderManager.headers", [
      headerElement("Content-Type", "application/json"),
      headerElement("Authorization", "Bearer ${authToken}"),
    ]),
    `</HeaderManager>`,
  ].join("");
}

function jsr223PostProcessor(name, script) {
  return [
    `<JSR223PostProcessor guiclass="TestBeanGUI" testclass="JSR223PostProcessor" testname="${esc(name)}" enabled="true">`,
    stringProp("cacheKey", "true"),
    stringProp("filename", ""),
    stringProp("parameters", ""),
    boolProp("resetInterpreter", false),
    stringProp("scriptLanguage", "groovy"),
    `<stringProp name="script"><![CDATA[${script}]]></stringProp>`,
    `</JSR223PostProcessor>`,
  ].join("");
}

function sampler({ name, method, path, body = null, postProcessor = null }) {
  const argumentsBlock = body
    ? `<elementProp name="HTTPsampler.Arguments" elementType="Arguments"><collectionProp name="Arguments.arguments"><elementProp name="" elementType="HTTPArgument"><boolProp name="HTTPArgument.always_encode">false</boolProp>${stringProp("Argument.value", body)}${stringProp("Argument.metadata", "=")}</elementProp></collectionProp></elementProp>`
    : `<elementProp name="HTTPsampler.Arguments" elementType="Arguments"><collectionProp name="Arguments.arguments"/></elementProp>`;

  return [
    `<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${esc(name)}" enabled="true">`,
    argumentsBlock,
    stringProp("HTTPSampler.domain", "${baseHost}"),
    stringProp("HTTPSampler.port", "${basePort}"),
    stringProp("HTTPSampler.protocol", "${protocol}"),
    stringProp("HTTPSampler.path", path),
    stringProp("HTTPSampler.method", method),
    stringProp("HTTPSampler.contentEncoding", "UTF-8"),
    boolProp("HTTPSampler.follow_redirects", true),
    boolProp("HTTPSampler.auto_redirects", false),
    boolProp("HTTPSampler.use_keepalive", true),
    boolProp("HTTPSampler.DO_MULTIPART_POST", false),
    boolProp("HTTPSampler.embedded_url_re", false),
    body ? boolProp("HTTPSampler.postBodyRaw", true) : boolProp("HTTPSampler.postBodyRaw", false),
    `</HTTPSamplerProxy>`,
    `<hashTree>${postProcessor ? postProcessor : ""}</hashTree>`,
  ].join("");
}

function loginSampler() {
  const body = '{"email":"${seedUserEmail}","password":"${seedUserPassword}"}';
  const script = `
import groovy.json.JsonSlurper
def json = new JsonSlurper().parseText(prev.getResponseDataAsString())
vars.put("authToken", json.access_token.toString())
`;
  return sampler({
    name: "Login",
    method: "POST",
    path: "/api/auth/login",
    body,
    postProcessor: jsr223PostProcessor("Capture auth token", script),
  });
}

function extractFirstIdSampler(name, path, varName) {
  const script = `
import groovy.json.JsonSlurper
def json = new JsonSlurper().parseText(prev.getResponseDataAsString())
def item = json.items && json.items.size() > 0 ? json.items[0] : null
if (item != null && item.id != null) {
  vars.put("${varName}", item.id.toString())
}
`;
  return sampler({
    name,
    method: "GET",
    path,
    postProcessor: jsr223PostProcessor(`Capture ${varName}`, script),
  });
}

function tg({ threads, ramp, loops, duration, forever = false }) {
  return [
    `<ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Thread Group" enabled="true">`,
    stringProp("ThreadGroup.on_sample_error", "continue"),
    stringProp("ThreadGroup.num_threads", String(threads)),
    stringProp("ThreadGroup.ramp_time", String(ramp)),
    boolProp("ThreadGroup.scheduler", Boolean(duration)),
    duration != null ? stringProp("ThreadGroup.duration", String(duration)) : stringProp("ThreadGroup.duration", ""),
    `<elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true">`,
    boolProp("LoopController.continue_forever", forever),
    stringProp("LoopController.loops", String(loops)),
    `</elementProp>`,
    `</ThreadGroup>`,
  ].join("");
}

function planXml({ title, description, variables, threadGroup, steps }) {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">`,
    `<hashTree>`,
    `<TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${esc(title)}" enabled="true">`,
    stringProp("TestPlan.comments", description),
    boolProp("TestPlan.functional_mode", false),
    boolProp("TestPlan.serialize_threadgroups", false),
    boolProp("TestPlan.tearDown_on_shutdown", true),
    userDefinedVariables(variables),
    stringProp("TestPlan.user_define_classpath", ""),
    `</TestPlan>`,
    `<hashTree>`,
    threadGroup,
    `<hashTree>`,
    httpRequestDefaults(),
    `<hashTree />`,
    headerManager(),
    `<hashTree />`,
    loginSampler(),
    steps.join(""),
    `</hashTree>`,
    `</hashTree>`,
    `</hashTree>`,
    `</jmeterTestPlan>`,
  ].join("");
}

const variables = [
  ["baseHost", "${__P(baseHost,backend)}"],
  ["basePort", "${__P(basePort,8000)}"],
  ["protocol", "${__P(protocol,http)}"],
  ["seedUserEmail", "${__P(seedUserEmail,admin@projecttrace.dev)}"],
  ["seedUserPassword", "${__P(seedUserPassword,ProjectTrace123!)}"],
  ["authToken", ""],
  ["projectId", ""],
  ["featureId", ""],
  ["requirementId", ""],
  ["linkedRequirementId", ""],
  ["testCaseId", ""],
  ["linkedTestCaseId", ""],
  ["bugId", ""],
  ["crudRequirementId", ""],
  ["crudTestCaseId", ""],
];

const scenarios = [
  {
    file: "smoke-test.jmx",
    title: "ProjectTrace Smoke Test",
    description: "Smoke test that checks health, summary, and bugs list after login.",
    threadGroup: tg({ threads: 1, ramp: 1, loops: 1 }),
    steps: [
      sampler({ name: "Health", method: "GET", path: "/health" }),
      sampler({ name: "Summary", method: "GET", path: "/api/stats/summary" }),
      sampler({ name: "Bugs list", method: "GET", path: "/api/bugs?page_size=5" }),
    ],
  },
  {
    file: "baseline-load-test.jmx",
    title: "ProjectTrace Baseline Load Test",
    description: "Baseline load covering dashboard, activity, bugs, requirements, and test cases.",
    threadGroup: tg({ threads: 10, ramp: 120, loops: 10 }),
    steps: [
      sampler({ name: "Summary", method: "GET", path: "/api/stats/summary" }),
      sampler({ name: "Activity", method: "GET", path: "/api/activity?page_size=10" }),
      sampler({ name: "Bugs list", method: "GET", path: "/api/bugs?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Requirements list", method: "GET", path: "/api/requirements?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Test cases list", method: "GET", path: "/api/test-cases?page_size=20&sort=created_at&order=desc" }),
    ],
  },
  {
    file: "volume-test.jmx",
    title: "ProjectTrace Volume Test",
    description: "Large page sizes and detail reads across seeded data to surface volume-related issues.",
    threadGroup: tg({ threads: 15, ramp: 120, loops: 8 }),
    steps: [
      extractFirstIdSampler("Projects list", "/api/projects?page_size=100&sort=updated_at&order=desc", "projectId"),
      extractFirstIdSampler("Requirements list", "/api/requirements?page_size=100&sort=updated_at&order=desc", "requirementId"),
      extractFirstIdSampler("Test cases list", "/api/test-cases?page_size=100&sort=created_at&order=desc", "testCaseId"),
      extractFirstIdSampler("Bugs list", "/api/bugs?page_size=100&sort=updated_at&order=desc", "bugId"),
      sampler({ name: "Project detail", method: "GET", path: "/api/projects/${projectId}" }),
      sampler({ name: "Requirement detail", method: "GET", path: "/api/requirements/${requirementId}" }),
      sampler({ name: "Test case detail", method: "GET", path: "/api/test-cases/${testCaseId}" }),
      sampler({ name: "Bug detail", method: "GET", path: "/api/bugs/${bugId}" }),
    ],
  },
  {
    file: "crud-workflow-test.jmx",
    title: "ProjectTrace CRUD Workflow Test",
    description: "End-to-end CRUD workflow covering bug, requirement, test case, comment, linking, and test run actions.",
    threadGroup: tg({ threads: 5, ramp: 60, loops: 8 }),
    steps: [
      extractFirstIdSampler("Users list", "/api/users?page_size=5", "userId"),
      extractFirstIdSampler("Projects list", "/api/projects?page_size=5", "projectId"),
      extractFirstIdSampler("Features list", "/api/features?page_size=5", "featureId"),
      extractFirstIdSampler("Requirements list", "/api/requirements?page_size=5", "linkedRequirementId"),
      extractFirstIdSampler("Test cases list", "/api/test-cases?page_size=5", "linkedTestCaseId"),
      sampler({
        name: "Create requirement",
        method: "POST",
        path: "/api/requirements",
        body:
          '{"title":"JMeter CRUD requirement","description":"Created from the JMeter workflow","feature_id":${featureId},"project_id":${projectId},"priority":"HIGH","status":"READY","created_by":${userId}}',
        postProcessor: jsr223PostProcessor(
          "Capture requirement id",
          `
import groovy.json.JsonSlurper
def json = new JsonSlurper().parseText(prev.getResponseDataAsString())
if (json.id != null) {
  vars.put("crudRequirementId", json.id.toString())
}
`,
        ),
      }),
      sampler({
        name: "Update requirement",
        method: "PUT",
        path: "/api/requirements/${crudRequirementId}",
        body:
          '{"title":"JMeter CRUD requirement updated","description":"Updated from the JMeter workflow","feature_id":${featureId},"project_id":${projectId},"priority":"CRITICAL","status":"IN_PROGRESS","created_by":${userId}}',
      }),
      sampler({
        name: "Link requirement to test case",
        method: "POST",
        path: "/api/requirements/${linkedRequirementId}/test-cases/${linkedTestCaseId}",
      }),
      sampler({
        name: "Unlink requirement from test case",
        method: "DELETE",
        path: "/api/requirements/${linkedRequirementId}/test-cases/${linkedTestCaseId}",
      }),
      sampler({
        name: "Create test case",
        method: "POST",
        path: "/api/test-cases",
        body:
          '{"title":"JMeter CRUD test case","description":"Created from the JMeter workflow","priority":"MEDIUM","project_id":${projectId},"automation_status":"PLANNED","automated_test_name":"tests/jmeter/crud.spec.ts"}',
        postProcessor: jsr223PostProcessor(
          "Capture test case id",
          `
import groovy.json.JsonSlurper
def json = new JsonSlurper().parseText(prev.getResponseDataAsString())
if (json.id != null) {
  vars.put("crudTestCaseId", json.id.toString())
}
`,
        ),
      }),
      sampler({
        name: "Update test case",
        method: "PUT",
        path: "/api/test-cases/${crudTestCaseId}",
        body:
          '{"title":"JMeter CRUD test case updated","description":"Updated from the JMeter workflow","priority":"HIGH","project_id":${projectId},"automation_status":"AUTOMATED","automated_test_name":"tests/jmeter/crud-updated.spec.ts"}',
      }),
      sampler({
        name: "Create bug",
        method: "POST",
        path: "/api/bugs",
        body:
          '{"title":"JMeter CRUD bug","description":"Created from the JMeter workflow","severity":"HIGH","status":"OPEN","project_id":${projectId},"assignee_id":${userId},"reporter_id":${userId}}',
        postProcessor: jsr223PostProcessor(
          "Capture bug id",
          `
import groovy.json.JsonSlurper
def json = new JsonSlurper().parseText(prev.getResponseDataAsString())
if (json.id != null) {
  vars.put("bugId", json.id.toString())
}
`,
        ),
      }),
      sampler({
        name: "Update bug",
        method: "PUT",
        path: "/api/bugs/${bugId}",
        body:
          '{"title":"JMeter CRUD bug updated","description":"Updated from the JMeter workflow","severity":"CRITICAL","status":"IN_PROGRESS","project_id":${projectId},"assignee_id":${userId},"reporter_id":${userId}}',
      }),
      sampler({
        name: "Add comment",
        method: "POST",
        path: "/api/bugs/${bugId}/comments",
        body: '{"bug_id":${bugId},"content":"JMeter workflow comment"}',
      }),
      sampler({
        name: "Link requirement to bug",
        method: "POST",
        path: "/api/requirements/${linkedRequirementId}/bugs/${bugId}",
      }),
      sampler({
        name: "Link requirement to test run case",
        method: "POST",
        path: "/api/requirements/${linkedRequirementId}/test-cases/${linkedTestCaseId}",
      }),
      sampler({
        name: "Create test run",
        method: "POST",
        path: "/api/test-runs",
        body: '{"project_id":${projectId},"test_case_id":${linkedTestCaseId},"status":"PASSED"}',
      }),
      sampler({
        name: "Unlink requirement from bug",
        method: "DELETE",
        path: "/api/requirements/${linkedRequirementId}/bugs/${bugId}",
      }),
      sampler({
        name: "Unlink requirement from test case",
        method: "DELETE",
        path: "/api/requirements/${linkedRequirementId}/test-cases/${linkedTestCaseId}",
      }),
      sampler({ name: "Delete bug", method: "DELETE", path: "/api/bugs/${bugId}" }),
      sampler({ name: "Delete test case", method: "DELETE", path: "/api/test-cases/${crudTestCaseId}" }),
      sampler({ name: "Delete requirement", method: "DELETE", path: "/api/requirements/${crudRequirementId}" }),
    ],
  },
  {
    file: "search-filter-test.jmx",
    title: "ProjectTrace Search and Filter Test",
    description: "Search and filter coverage for bugs, requirements, test cases, and projects.",
    threadGroup: tg({ threads: 5, ramp: 45, loops: 12 }),
    steps: [
      sampler({ name: "Search bugs", method: "GET", path: "/api/bugs?search=bug&page_size=20&severity=HIGH&status=OPEN" }),
      sampler({ name: "Search requirements", method: "GET", path: "/api/requirements?search=flow&page_size=20&priority=HIGH" }),
      sampler({ name: "Search test cases", method: "GET", path: "/api/test-cases?search=flow&page_size=20&priority=MEDIUM" }),
      sampler({ name: "Search projects", method: "GET", path: "/api/projects?search=Platform&page_size=20" }),
    ],
  },
  {
    file: "spike-test.jmx",
    title: "ProjectTrace Spike Test",
    description: "Short spike against dashboard and list endpoints.",
    threadGroup: tg({ threads: 40, ramp: 5, loops: 3 }),
    steps: [
      sampler({ name: "Summary", method: "GET", path: "/api/stats/summary" }),
      sampler({ name: "Bugs list", method: "GET", path: "/api/bugs?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Requirements list", method: "GET", path: "/api/requirements?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Test cases list", method: "GET", path: "/api/test-cases?page_size=20&sort=created_at&order=desc" }),
    ],
  },
  {
    file: "stress-test.jmx",
    title: "ProjectTrace Stress Test",
    description: "Higher concurrency stress on dashboard and list endpoints.",
    threadGroup: tg({ threads: 20, ramp: 60, loops: 25 }),
    steps: [
      sampler({ name: "Summary", method: "GET", path: "/api/stats/summary" }),
      sampler({ name: "Activity", method: "GET", path: "/api/activity?page_size=10" }),
      sampler({ name: "Bugs list", method: "GET", path: "/api/bugs?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Requirements list", method: "GET", path: "/api/requirements?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Test cases list", method: "GET", path: "/api/test-cases?page_size=20&sort=created_at&order=desc" }),
    ],
  },
  {
    file: "soak-test-template.jmx",
    title: "ProjectTrace Soak Test Template",
    description: "Long-running soak template for the dashboard and list workflow.",
    threadGroup: tg({ threads: 10, ramp: 120, loops: 1, duration: 1800, forever: true }),
    steps: [
      sampler({ name: "Summary", method: "GET", path: "/api/stats/summary" }),
      sampler({ name: "Activity", method: "GET", path: "/api/activity?page_size=10" }),
      sampler({ name: "Bugs list", method: "GET", path: "/api/bugs?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Requirements list", method: "GET", path: "/api/requirements?page_size=20&sort=updated_at&order=desc" }),
      sampler({ name: "Test cases list", method: "GET", path: "/api/test-cases?page_size=20&sort=created_at&order=desc" }),
    ],
  },
];

for (const scenario of scenarios) {
  const xml = planXml({
    title: scenario.title,
    description: scenario.description,
    variables,
    threadGroup: scenario.threadGroup,
    steps: scenario.steps,
  });
  writeFileSync(join(plansDir, scenario.file), formatXml(xml), "utf8");
}

console.log(`Wrote ${scenarios.length} JMeter plans to ${plansDir}`);
