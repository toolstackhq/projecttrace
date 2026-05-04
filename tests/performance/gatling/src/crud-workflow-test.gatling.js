import { constantUsersPerSec, scenario, simulation, StringBody } from "@gatling.io/core";
import { http, jmesPath, status } from "@gatling.io/http";
import { apiUrl, firstIdStep, httpProtocol, withAuth } from "./common.js";

export default simulation((setUp) => {
  // CRUD workflow: a smaller but realistic read/write journey across linked entities.
  const scn = scenario("CRUD Workflow")
    .exec(firstIdStep("Project seed", "/projects?page_size=1", "projectId"))
    .exec(firstIdStep("Requirement seed", "/requirements?page_size=1", "requirementId"))
    .exec(firstIdStep("Test case seed", "/test-cases?page_size=1", "testCaseId"))
    .exec(
      withAuth(
        http("Create bug")
          .post(apiUrl("/bugs"))
          .asJson()
          .body(StringBody('{"title":"Gatling workflow bug","description":"Created during a Gatling CRUD workflow","severity":"HIGH","status":"OPEN","project_id":"#{projectId}"}'))
          .check(status().is(201), jmesPath("id").saveAs("bugId")),
      ),
    )
    .exec(
      withAuth(
        http("Update bug")
          .put((session) => apiUrl(`/bugs/${session.get("bugId")}`))
          .asJson()
          .body(StringBody('{"status":"IN_PROGRESS","severity":"HIGH"}'))
          .check(status().is(200)),
      ),
    )
    .exec(
      withAuth(
        http("Add bug comment")
          .post((session) => apiUrl(`/bugs/${session.get("bugId")}/comments`))
          .asJson()
          .body(StringBody('{"content":"Gatling workflow comment"}'))
          .check(status().is(201)),
      ),
    )
    .exec(
      withAuth(
        http("Link requirement to test case")
          .post((session) => apiUrl(`/requirements/${session.get("requirementId")}/test-cases/${session.get("testCaseId")}`))
          .check(status().is(204)),
      ),
    )
    .exec(
      withAuth(
        http("Link requirement to bug")
          .post((session) => apiUrl(`/requirements/${session.get("requirementId")}/bugs/${session.get("bugId")}`))
          .check(status().is(204)),
      ),
    )
    .exec(
      withAuth(
        http("Create test run")
          .post(apiUrl("/test-runs"))
          .asJson()
          .body(StringBody('{"project_id":"#{projectId}","test_case_id":"#{testCaseId}","status":"PASSED"}'))
          .check(status().is(201)),
      ),
    )
    .exec(
      withAuth(
        http("Unlink requirement from test case")
          .delete((session) => apiUrl(`/requirements/${session.get("requirementId")}/test-cases/${session.get("testCaseId")}`))
          .check(status().is(204)),
      ),
    )
    .exec(
      withAuth(
        http("Unlink requirement from bug")
          .delete((session) => apiUrl(`/requirements/${session.get("requirementId")}/bugs/${session.get("bugId")}`))
          .check(status().is(204)),
      ),
    )
    .exec(
      withAuth(
        http("Delete bug")
          .delete((session) => apiUrl(`/bugs/${session.get("bugId")}`))
          .check(status().is(204)),
      ),
    );

  // 2 users per second for 180 seconds keeps the write flow moving without turning it into a spike test.
  setUp(scn.injectOpen(constantUsersPerSec(2).during(180))).protocols(httpProtocol);
});
