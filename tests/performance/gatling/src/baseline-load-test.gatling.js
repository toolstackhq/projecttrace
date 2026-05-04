import { constantUsersPerSec, responseTimeInMillis, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Baseline load: a fixed steady arrival rate for five minutes of sustained traffic.
  const scn = scenario("Baseline Load")
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200), responseTimeInMillis().lt(750))))
    .exec(withAuth(http("Activity").get(apiUrl("/activity?page_size=10")).check(status().is(200), responseTimeInMillis().lt(1000))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=20&sort=updated_at&order=desc")).check(status().is(200), responseTimeInMillis().lt(750))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc")).check(status().is(200), responseTimeInMillis().lt(750))))
    .exec(withAuth(http("Test cases list").get(apiUrl("/test-cases?page_size=20&sort=created_at&order=desc")).check(status().is(200), responseTimeInMillis().lt(750))));

  // 5 users per second for 300 seconds keeps the load simple and repeatable.
  setUp(scn.injectOpen(constantUsersPerSec(5).during(300))).protocols(httpProtocol);
});
