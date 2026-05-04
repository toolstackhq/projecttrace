import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Search and filter: steady traffic against indexed query paths.
  const scn = scenario("Search and Filter")
    .exec(withAuth(http("Bug search").get(apiUrl("/bugs?search=bug&page_size=20&severity=HIGH&status=OPEN")).check(status().is(200))))
    .exec(withAuth(http("Requirement search").get(apiUrl("/requirements?search=flow&page_size=20&priority=HIGH")).check(status().is(200))))
    .exec(withAuth(http("Test case search").get(apiUrl("/test-cases?search=flow&page_size=20&priority=MEDIUM")).check(status().is(200))))
    .exec(withAuth(http("Project search").get(apiUrl("/projects?search=Platform&page_size=20")).check(status().is(200))));

  // 5 users per second for 3 minutes is enough to see whether search stays responsive.
  setUp(scn.injectOpen(constantUsersPerSec(5).during(180))).protocols(httpProtocol);
});
