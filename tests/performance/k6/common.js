import http from "k6/http";
import { check } from "k6";

export const baseUrl = __ENV.K6_BASE_URL || "http://localhost:8000/api";
export const serviceBaseUrl = __ENV.K6_SERVICE_BASE_URL || "http://localhost:8000";
export const reportDir = __ENV.K6_REPORT_DIR || "reports/k6/latest";
export const seedUserEmail = __ENV.K6_SEED_USER_EMAIL || "admin@projecttrace.dev";
export const seedUserPassword = __ENV.K6_SEED_USER_PASSWORD || "ProjectTrace123!";

export function apiUrl(path) {
  return `${baseUrl}${path}`;
}

export function serviceUrl(path) {
  return `${serviceBaseUrl}${path}`;
}

export function jsonHeaders(token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return { headers };
}

export function authHeaders(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export function getJson(path, token = null) {
  return http.get(apiUrl(path), token ? authHeaders(token) : undefined);
}

export function postJson(path, body, token = null) {
  return http.post(apiUrl(path), JSON.stringify(body), jsonHeaders(token));
}

export function putJson(path, body, token = null) {
  return http.put(apiUrl(path), JSON.stringify(body), jsonHeaders(token));
}

export function deleteJson(path, token = null) {
  return http.del(apiUrl(path), null, token ? authHeaders(token) : undefined);
}

export function login() {
  const response = http.post(
    apiUrl("/auth/login"),
    JSON.stringify({ email: seedUserEmail, password: seedUserPassword }),
    jsonHeaders(),
  );
  check(response, {
    "login succeeded": (r) => r.status === 200,
    "login fast": (r) => r.timings.duration < 1000,
  });
  return response.json("access_token");
}

export function firstItemId(response) {
  const body = response.json();
  return body?.items?.[0]?.id ?? null;
}

export function firstListItemId(response) {
  const body = response.json();
  return Array.isArray(body) ? body?.[0]?.id ?? null : null;
}
