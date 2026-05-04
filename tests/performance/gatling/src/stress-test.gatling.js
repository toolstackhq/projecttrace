import { constantUsersPerSec, scenario, simulation } from "@gatling.io/core";
import { http, status } from "@gatling.io/http";
import { apiUrl, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // Stress: keep turning the dial until the app starts to bend or fail.
  const scn = scenario("Stress")
    .exec(withAuth(http("Summary").get(apiUrl("/stats/summary")).check(status().is(200))))
    .exec(withAuth(http("Activity").get(apiUrl("/activity?page_size=10")).check(status().is(200))))
    .exec(withAuth(http("Bugs list").get(apiUrl("/bugs?page_size=20&sort=updated_at&order=desc")).check(status().is(200))))
    .exec(withAuth(http("Requirements list").get(apiUrl("/requirements?page_size=20&sort=updated_at&order=desc")).check(status().is(200))));

  setUp(
    scn.injectOpen(
      // Normal pressure.
      constantUsersPerSec(10).during(120),
      // Then push beyond normal capacity.
      constantUsersPerSec(40).during(120),
    ),
  ).protocols(httpProtocol);
});
