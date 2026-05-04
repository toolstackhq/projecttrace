import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, firstIdStep, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Volume: larger page sizes and detail reads over the seeded data set.
  const scn = scenario("Volume")
    .exec(firstIdStep("Project seed", "/projects?page_size=1", "projectId"))
    .exec(firstIdStep("Requirement seed", "/requirements?page_size=1", "requirementId"))
    .exec(firstIdStep("Test case seed", "/test-cases?page_size=1", "testCaseId"))
    .exec(firstIdStep("Bug seed", "/bugs?page_size=1", "bugId"))
    .exec(withAuth(http("Projects list").get(apiUrl("/projects?page_size=100&sort=updated_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=100&sort=updated_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Test cases list").get(apiUrl("/test-cases?page_size=100&sort=created_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=100&sort=updated_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Project detail").get((session) => apiUrl(`/projects/${session.get("projectId")}`)).check(status().is(200))))
    .exec(withAuth(http("Requirement detail").get((session) => apiUrl(`/requirements/${session.get("requirementId")}`)).check(status().is(200))))
    .exec(withAuth(http("Test case detail").get((session) => apiUrl(`/test-cases/${session.get("testCaseId")}`)).check(status().is(200))))
    .exec(withAuth(http("Bug detail").get((session) => apiUrl(`/bugs/${session.get("bugId")}`)).check(status().is(200))));

  // 3 users per second for 5 minutes keeps the pressure on list and detail endpoints.
  setUp(scn.injectOpen(constantUsersPerSec(3).during(300))).protocols(httpProtocol);
});
