import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Soak: hold a steady rate for a long time to catch drift and leaks.
  const scn = scenario("Soak")
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200))))
    .exec(withAuth(http("Activity").get(apiUrl("/activity?page_size=10")).check(status().is(200))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=20&sort=updated_at&order=desc")).check(status().is(200))));

  // 2 users per second for 10 minutes is long enough to spot gradual degradation.
  setUp(scn.injectOpen(constantUsersPerSec(2).during(600))).protocols(httpProtocol);
});
