import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Spinner } from "./components/ui";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SearchPage } from "./pages/SearchPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { EpicsPage } from "./pages/EpicsPage";
import { EpicDetailPage } from "./pages/EpicDetailPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { FeatureDetailPage } from "./pages/FeatureDetailPage";
import { RequirementsPage } from "./pages/RequirementsPage";
import { RequirementDetailPage } from "./pages/RequirementDetailPage";
import { TestCasesPage } from "./pages/TestCasesPage";
import { TestCaseDetailPage } from "./pages/TestCaseDetailPage";
import { TestRunsPage } from "./pages/TestRunsPage";
import { BugsPage } from "./pages/BugsPage";
import { BugDetailPage } from "./pages/BugDetailPage";
import { ActivityPage } from "./pages/ActivityPage";
import { UsersPage } from "./pages/UsersPage";
import { useSession } from "./session";

export default function App() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { currentUser, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <AppShell
      search={search}
      onSearchChange={setSearch}
      onSearchSubmit={() => navigate(`/search?q=${encodeURIComponent(search)}`)}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/epics" element={<EpicsPage />} />
        <Route path="/epics/:epicId" element={<EpicDetailPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/features/:featureId" element={<FeatureDetailPage />} />
        <Route path="/requirements" element={<RequirementsPage />} />
        <Route path="/requirements/:requirementId" element={<RequirementDetailPage />} />
        <Route path="/test-cases" element={<TestCasesPage />} />
        <Route path="/test-cases/:testCaseId" element={<TestCaseDetailPage />} />
        <Route path="/test-runs" element={<TestRunsPage />} />
        <Route path="/bugs" element={<BugsPage />} />
        <Route path="/bugs/:bugId" element={<BugDetailPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
