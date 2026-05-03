import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, firstItemId, getJson, login, postJson, putJson, deleteJson } from "./common.js";

export const options = {
  vus: 5,
  iterations: 10,
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1000"],
  },
};

export function setup() {
  const token = login();
  return {
    token,
    userId: firstItemId(getJson("/users?page_size=5", token)),
    projectId: firstItemId(getJson("/projects?page_size=5", token)),
    requirementId: firstItemId(getJson("/requirements?page_size=5", token)),
    testCaseId: firstItemId(getJson("/test-cases?page_size=5", token)),
  };
}

export default function (data) {
  const headers = authHeaders(data.token);

  const createBug = postJson(
    "/bugs",
    {
      title: `Load test bug ${Date.now()}`,
      description: "Created during k6 CRUD workflow",
      severity: "HIGH",
      status: "OPEN",
      project_id: data.projectId,
    },
    data.token,
  );
  check(createBug, { "bug created": (r) => r.status === 201 });
  const bugId = createBug.json()?.id;

  const updateBug = putJson(
    `/bugs/${bugId}`,
    {
      status: "IN_PROGRESS",
      severity: "HIGH",
    },
    data.token,
  );
  check(updateBug, { "bug updated": (r) => r.status === 200 });

  const comment = postJson(
    `/bugs/${bugId}/comments`,
    {
      bug_id: bugId,
      content: "k6 workflow comment",
    },
    data.token,
  );
  check(comment, { "comment created": (r) => r.status === 201 });

  const linkRequirement = http.post(apiUrl(`/requirements/${data.requirementId}/test-cases/${data.testCaseId}`), null, headers);
  check(linkRequirement, { "requirement linked to test case": (r) => r.status === 204 });

  const testRun = postJson(
    "/test-runs",
    {
      project_id: data.projectId,
      test_case_id: data.testCaseId,
      status: "PASSED",
    },
    data.token,
  );
  check(testRun, { "test run created": (r) => r.status === 201 });

  const unlinkRequirement = http.del(apiUrl(`/requirements/${data.requirementId}/test-cases/${data.testCaseId}`), null, headers);
  check(unlinkRequirement, { "requirement unlinked from test case": (r) => r.status === 204 });

  const deleteBug = deleteJson(`/bugs/${bugId}`, data.token);
  check(deleteBug, { "bug deleted": (r) => r.status === 204 });

  sleep(1);
}
