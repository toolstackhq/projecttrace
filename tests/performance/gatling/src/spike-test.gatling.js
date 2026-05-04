import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Spike: low traffic, sudden burst, then back to low traffic.
  const scn = scenario("Spike")
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=20")).check(status().is(200))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=20")).check(status().is(200))));

  setUp(
    scn.injectOpen(
      // Start from a quiet baseline.
      constantUsersPerSec(2).during(60),
      // Hit the app with a short, sharp burst.
      constantUsersPerSec(30).during(60),
      // Drop back down to see whether it recovers cleanly.
      constantUsersPerSec(2).during(60),
    ),
  ).protocols(httpProtocol);
});
