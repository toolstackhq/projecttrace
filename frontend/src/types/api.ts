export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface UserRead {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface ProjectRead {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: string;
  updated_at: string;
  owner?: UserRead | null;
}

export interface EpicRead {
  id: number;
  title: string;
  description: string | null;
  project_id: number;
  status: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  project?: ProjectRead | null;
  owner?: UserRead | null;
}

export interface EpicDetail extends EpicRead {
  features: FeatureRead[];
  activity: ActivityLogRead[];
}

export interface FeatureRead {
  id: number;
  title: string;
  description: string | null;
  epic_id: number;
  project_id: number;
  status: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
  project?: ProjectRead | null;
  epic?: EpicRead | null;
  owner?: UserRead | null;
}

export interface FeatureDetail extends FeatureRead {
  requirements: RequirementRead[];
  activity: ActivityLogRead[];
}

export interface RequirementRead {
  id: number;
  title: string;
  description: string | null;
  feature_id: number;
  project_id: number;
  priority: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  project?: ProjectRead | null;
  feature?: FeatureRead | null;
  creator?: UserRead | null;
}

export interface RequirementDetail extends RequirementRead {
  test_cases: TestCaseRead[];
  bugs: BugRead[];
  activity: ActivityLogRead[];
}

export interface TestCaseRead {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  project_id: number;
  automation_status: string;
  automated_test_name: string | null;
  automation_linked_at: string | null;
  created_at: string;
  project?: ProjectRead | null;
}

export interface TestCaseDetail extends TestCaseRead {
  requirements: RequirementRead[];
  test_runs: TestRunRead[];
}

export interface TestRunRead {
  id: number;
  project_id: number;
  test_case_id: number;
  status: string;
  executed_by: number;
  executed_at: string;
  project?: ProjectRead | null;
  test_case?: TestCaseRead | null;
  executed_by_user?: UserRead | null;
}

export interface TestRunDetail extends TestRunRead {}

export interface BugRead {
  id: number;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  project_id: number;
  assignee_id: number | null;
  reporter_id: number;
  created_at: string;
  updated_at: string;
  project?: ProjectRead | null;
  assignee?: UserRead | null;
  reporter?: UserRead | null;
}

export interface BugDetail extends BugRead {
  requirements: RequirementRead[];
  comments: CommentRead[];
  activity: ActivityLogRead[];
}

export interface CommentRead {
  id: number;
  bug_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user?: UserRead | null;
}

export interface ActivityLogRead {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  user_id: number | null;
  project_id: number | null;
  timestamp: string;
  user?: UserRead | null;
  project?: ProjectRead | null;
}

export interface SummaryResponse {
  totals: Record<string, number>;
  bug_status: Array<{ label: string; count: number }>;
  requirement_status: Array<{ label: string; count: number }>;
  test_run_status: Array<{ label: string; count: number }>;
}

export interface ProjectDetail extends ProjectRead {
  epics: EpicRead[];
  features: FeatureRead[];
  requirements: RequirementRead[];
  test_cases: TestCaseRead[];
  bugs: BugRead[];
  activity: ActivityLogRead[];
}
