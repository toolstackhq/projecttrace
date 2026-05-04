import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login } from "./common.js";

export const options = {
  // Soak: long steady load to catch drift, leaks, and slow degradation.
  stages: [
    { duration: "10m", target: 10 },
    { duration: "20m", target: 10 },
    { duration: "10m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<900"],
  },
};

export function setup() {
  // The token stays stable so the long run measures app stability over time.
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);
  const summary = http.get(apiUrl("/stats/summary"), headers);
  check(summary, { "summary ok": (r) => r.status === 200 });
  const activity = http.get(apiUrl("/activity?page_size=10"), headers);
  check(activity, { "activity ok": (r) => r.status === 200 });
  const requirements = http.get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc"), headers);
  check(requirements, { "requirements ok": (r) => r.status === 200 });
  sleep(5);
}
