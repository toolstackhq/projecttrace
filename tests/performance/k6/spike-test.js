import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login } from "./common.js";

export const options = {
  // Spike: small baseline, sudden jump, quick drop, then stop.
  stages: [
    { duration: "1m", target: 5 },
    { duration: "1m", target: 80 },
    { duration: "1m", target: 5 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<900"],
  },
};

export function setup() {
  // One shared token keeps the spike focused on app behavior, not auth churn.
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);
  const dashboard = http.get(apiUrl("/stats/summary"), headers);
  check(dashboard, { "dashboard ok": (r) => r.status === 200 });
  const bugs = http.get(apiUrl("/bugs?page_size=20"), headers);
  check(bugs, { "bugs ok": (r) => r.status === 200 });
  sleep(1);
}
