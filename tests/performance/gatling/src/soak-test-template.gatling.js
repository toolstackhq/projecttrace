import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  const scn = scenario("Soak")
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200))))
    .exec(withAuth(http("Activity").get(apiUrl("/activity?page_size=10")).check(status().is(200))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=20&sort=updated_at&order=desc")).check(status().is(200))));

  setUp(scn.injectOpen(constantUsersPerSec(2).during(600))).protocols(httpProtocol);
});
