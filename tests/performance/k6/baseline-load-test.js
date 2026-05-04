import { check, group, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login } from "./common.js";

export const options = {
  // Baseline load: ramp to 10 users, hold for 4 minutes, then ramp down.
  stages: [
    { duration: "2m", target: 10 },
    { duration: "4m", target: 10 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1000"],
  },
};

export function setup() {
  // Login once per test run so each VU can reuse the same token.
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);

  // Dashboard read path under steady load.
  group("dashboard", () => {
    const summary = http.get(apiUrl("/stats/summary"), headers);
    check(summary, { "summary ok": (r) => r.status === 200 && r.timings.duration < 750 });
    const activity = http.get(apiUrl("/activity?page_size=10"), headers);
    check(activity, { "activity ok": (r) => r.status === 200 && r.timings.duration < 1000 });
  });

  // Main browse list that users hit repeatedly during a normal work session.
  group("bugs", () => {
    const bugs = http.get(apiUrl("/bugs?page_size=20&sort=updated_at&order=desc"), headers);
    check(bugs, { "bugs ok": (r) => r.status === 200 && r.timings.duration < 750 });
  });

  // Read-heavy requirement and test case lists.
  group("requirements", () => {
    const requirements = http.get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc"), headers);
    check(requirements, { "requirements ok": (r) => r.status === 200 && r.timings.duration < 750 });
  });

  group("test cases", () => {
    const testCases = http.get(apiUrl("/test-cases?page_size=20&sort=created_at&order=desc"), headers);
    check(testCases, { "test cases ok": (r) => r.status === 200 && r.timings.duration < 750 });
  });

  sleep(1);
}
