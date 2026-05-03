import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login } from "./common.js";

export const options = {
  vus: 5,
  duration: "3m",
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<700"],
  },
};

export function setup() {
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);

  const bugs = http.get(apiUrl("/bugs?search=bug&page_size=20&severity=HIGH&status=OPEN"), headers);
  check(bugs, { "bug search ok": (r) => r.status === 200 });

  const requirements = http.get(apiUrl("/requirements?search=flow&page_size=20&priority=HIGH"), headers);
  check(requirements, { "requirement search ok": (r) => r.status === 200 });

  const testCases = http.get(apiUrl("/test-cases?search=flow&page_size=20&priority=MEDIUM"), headers);
  check(testCases, { "test case search ok": (r) => r.status === 200 });

  const projects = http.get(apiUrl("/projects?search=Platform&page_size=20"), headers);
  check(projects, { "project search ok": (r) => r.status === 200 });

  sleep(1);
}
