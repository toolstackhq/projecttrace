import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login, serviceUrl } from "./common.js";

export const options = {
  // Smoke: 1 VU, 1 iteration, enough to prove the app is alive and the auth flow works.
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export function setup() {
  // Pull one JWT up front so the request phase stays focused on app traffic.
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);

  // Service-root health check: this is the fastest "is the backend up?" signal.
  const health = http.get(serviceUrl("/health"));
  check(health, { "health ok": (r) => r.status === 200 });

  // Baseline dashboard read: should stay comfortably under the 750ms target.
  const summary = http.get(apiUrl("/stats/summary"), headers);
  check(summary, { "summary ok": (r) => r.status === 200 && r.timings.duration < 750 });

  // Small list read: proves the main browse path still works.
  const bugs = http.get(apiUrl("/bugs?page_size=5"), headers);
  check(bugs, { "bugs loaded": (r) => r.status === 200 && r.timings.duration < 750 });

  sleep(1);
}
