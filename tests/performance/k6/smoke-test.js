import { check, sleep } from "k6";
import http from "k6/http";
import { apiUrl, authHeaders, login, serviceUrl } from "./common.js";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export function setup() {
  return { token: login() };
}

export default function (data) {
  const headers = authHeaders(data.token);

  const health = http.get(serviceUrl("/health"));
  check(health, { "health ok": (r) => r.status === 200 });

  const summary = http.get(apiUrl("/stats/summary"), headers);
  check(summary, { "summary ok": (r) => r.status === 200 });

  const bugs = http.get(apiUrl("/bugs?page_size=5"), headers);
  check(bugs, { "bugs loaded": (r) => r.status === 200 });

  sleep(1);
}
