import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  const scn = scenario("Spike")
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=20")).check(status().is(200))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=20")).check(status().is(200))));

  setUp(
    scn.injectOpen(
      constantUsersPerSec(2).during(60),
      constantUsersPerSec(30).during(60),
      constantUsersPerSec(2).during(60),
    ),
  ).protocols(httpProtocol);
});
