import { atOnceUsers, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  const scn = scenario("Smoke")
    .exec(http("Health").get("/health").check(status().is(200)))
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=5")).check(status().is(200))));

  setUp(scn.injectOpen(atOnceUsers(1))).protocols(httpProtocol);
});
