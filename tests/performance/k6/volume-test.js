import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, firstItemId, getJson, login } from "./common.js";

export const options = {
  // Volume: bigger pages and detail reads over a larger seeded data set.
  stages: [
    { duration: "2m", target: 15 },
    { duration: "8m", target: 15 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.03"],
    http_req_duration: ["p(95)<1000"],
  },
};

export function setup() {
  // Grab a login token and a few seeded IDs once, before the load starts.
  const token = login();
  return {
    token,
    projectId: firstItemId(getJson("/projects?page_size=1", token)),
    requirementId: firstItemId(getJson("/requirements?page_size=1", token)),
    testCaseId: firstItemId(getJson("/test-cases?page_size=1", token)),
    bugId: firstItemId(getJson("/bugs?page_size=1", token)),
  };
}

export default function (data) {
  const headers = authHeaders(data.token);

  // Larger list pages to surface slow paging and filtering behavior.
  const projects = http.get(apiUrl("/projects?page_size=100&sort=updated_at&order=desc"), headers);
  check(projects, { "projects page ok": (r) => r.status === 200 });

  const requirements = http.get(apiUrl("/requirements?page_size=100&sort=updated_at&order=desc"), headers);
  check(requirements, { "requirements page ok": (r) => r.status === 200 });

  const testCases = http.get(apiUrl("/test-cases?page_size=100&sort=created_at&order=desc"), headers);
  check(testCases, { "test cases page ok": (r) => r.status === 200 });

  const bugs = http.get(apiUrl("/bugs?page_size=100&sort=updated_at&order=desc"), headers);
  check(bugs, { "bugs page ok": (r) => r.status === 200 });

  // Detail reads often expose missing indexes or inefficient joins.
  const projectDetail = http.get(apiUrl(`/projects/${data.projectId}`), headers);
  check(projectDetail, { "project detail ok": (r) => r.status === 200 });

  const requirementDetail = http.get(apiUrl(`/requirements/${data.requirementId}`), headers);
  check(requirementDetail, { "requirement detail ok": (r) => r.status === 200 });

  const testCaseDetail = http.get(apiUrl(`/test-cases/${data.testCaseId}`), headers);
  check(testCaseDetail, { "test case detail ok": (r) => r.status === 200 });

  const bugDetail = http.get(apiUrl(`/bugs/${data.bugId}`), headers);
  check(bugDetail, { "bug detail ok": (r) => r.status === 200 });

  sleep(1);
}
