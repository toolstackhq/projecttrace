import { getEnvironmentVariable } from "@gatling.io/core";
import { http, jmesPath, status } from "@gatling.io/http";

export const serviceBaseUrl = getEnvironmentVariable("GATLING_SERVICE_BASE_URL", "http://localhost:8000");
export const apiPrefix = getEnvironmentVariable("GATLING_API_PREFIX", "/api");
export const accessToken = getEnvironmentVariable("GATLING_ACCESS_TOKEN", "");
export const seedUserEmail = getEnvironmentVariable("GATLING_SEED_USER_EMAIL", "admin@projecttrace.dev");
export const seedUserPassword = getEnvironmentVariable("GATLING_SEED_USER_PASSWORD", "ProjectTrace123!");

export const httpProtocol = http.baseUrl(serviceBaseUrl).acceptHeader("application/json");

export function apiUrl(path) {
  return `${apiPrefix}${path}`;
}

export function withAuth(request) {
  return request.header("Authorization", `Bearer ${accessToken}`);
}

export function firstIdStep(requestName, path, targetKey) {
  return withAuth(
    http(requestName)
      .get(apiUrl(path))
      .check(status().is(200), jmesPath("items[0].id").saveAs(targetKey)),
  );
}
