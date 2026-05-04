import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login } from "./common.js";

export const options = {
  // Stress: steady growth beyond the expected limit to find the breaking point.
  stages: [
    { duration: "2m", target: 20 },
    { duration: "6m", target: 20 },
    { duration: "2m", target: 60 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.08"],
    http_req_duration: ["p(95)<1200"],
  },
};

export function setup() {
  // The run should push the app, not spend time repeatedly authenticating.
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);
  const summary = http.get(apiUrl("/stats/summary"), headers);
  check(summary, { "summary ok": (r) => r.status === 200 });
  const activity = http.get(apiUrl("/activity?page_size=10"), headers);
  check(activity, { "activity ok": (r) => r.status === 200 });
  const bugs = http.get(apiUrl("/bugs?page_size=20&sort=updated_at&order=desc"), headers);
  check(bugs, { "bugs ok": (r) => r.status === 200 });
  const requirements = http.get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc"), headers);
  check(requirements, { "requirements ok": (r) => r.status === 200 });
  sleep(1);
}
