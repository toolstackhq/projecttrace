import { atOnceUsers, responseTimeInMillis, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Smoke: one user, one pass through the core happy-path checks.
  const scn = scenario("Smoke")
    .exec(http("Health").get("/health").check(status().is(200)))
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200), responseTimeInMillis().lt(750))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=5")).check(status().is(200), responseTimeInMillis().lt(750))));

  // One virtual user is enough here because the goal is simple sanity coverage.
  setUp(scn.injectOpen(atOnceUsers(1))).protocols(httpProtocol);
});
