from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from faker import Faker

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.core.config import get_settings
from app.models import *  # noqa: F401,F403
from app.models.entities import ActivityLog, Bug, Comment, Epic, Feature, Project, Requirement, TestCase, TestRun, User
from app.models.enums import BugSeverity, BugStatus, EpicStatus, FeatureStatus, Priority, RequirementStatus, TestCaseAutomationStatus, TestRunStatus, UserRole

fake = Faker()
Faker.seed(42)
random.seed(42)
settings = get_settings()


def pick(items):
    return random.choice(items)


def weighted_choice(values: list[str], weights: list[int]) -> str:
    return random.choices(values, weights=weights, k=1)[0]


def chunked(seq, size: int):
    for i in range(0, len(seq), size):
        yield seq[i : i + size]


def main() -> None:
    db = SessionLocal()
    try:
        users = [
            User(
                name="ProjectTrace Admin" if index == 0 else fake.name(),
                email=settings.seed_user_email if index == 0 else fake.unique.email(),
                role=UserRole.ADMIN.value if index == 0 else UserRole.EDITOR.value,
                password_hash=hash_password(settings.seed_user_password),
            )
            for index in range(25)
        ]
        db.add_all(users)
        db.flush()

        projects = [
            Project(
                name=f"{fake.company()} Platform",
                description=fake.paragraph(nb_sentences=3),
                owner_id=pick(users).id,
            )
            for _ in range(10)
        ]
        db.add_all(projects)
        db.flush()

        epics = []
        for project in projects:
            for _ in range(3):
                epics.append(
                    Epic(
                        title=fake.catch_phrase(),
                        description=fake.paragraph(nb_sentences=2),
                        project_id=project.id,
                        status=weighted_choice(
                            [EpicStatus.PLANNED.value, EpicStatus.ACTIVE.value, EpicStatus.DONE.value, EpicStatus.BLOCKED.value],
                            [3, 4, 2, 1],
                        ),
                        owner_id=project.owner_id,
                    )
                )
        db.add_all(epics)
        db.flush()

        features = []
        for epic in epics:
            for _ in range(3):
                features.append(
                    Feature(
                        title=fake.bs().title(),
                        description=fake.paragraph(nb_sentences=2),
                        epic_id=epic.id,
                        project_id=epic.project_id,
                        status=weighted_choice(
                            [
                                FeatureStatus.PLANNED.value,
                                FeatureStatus.IN_PROGRESS.value,
                                FeatureStatus.DONE.value,
                                FeatureStatus.BLOCKED.value,
                            ],
                            [3, 4, 2, 1],
                        ),
                        owner_id=epic.owner_id,
                    )
                )
        db.add_all(features)
        db.flush()

        requirements = []
        for feature in features:
            for _ in range(5):
                requirements.append(
                    Requirement(
                        title=fake.sentence(nb_words=6).rstrip("."),
                        description=fake.paragraph(nb_sentences=3),
                        feature_id=feature.id,
                        project_id=feature.project_id,
                        priority=weighted_choice(
                            [Priority.LOW.value, Priority.MEDIUM.value, Priority.HIGH.value, Priority.CRITICAL.value],
                            [2, 4, 3, 1],
                        ),
                        status=weighted_choice(
                            [
                                RequirementStatus.DRAFT.value,
                                RequirementStatus.READY.value,
                                RequirementStatus.IN_PROGRESS.value,
                                RequirementStatus.VERIFIED.value,
                                RequirementStatus.BLOCKED.value,
                            ],
                            [2, 3, 3, 2, 1],
                        ),
                        created_by=pick(users).id,
                    )
                )
        db.add_all(requirements)
        db.flush()

        test_cases = []
        for project in projects:
            for _ in range(200):
                automation_status = weighted_choice(
                    [
                        TestCaseAutomationStatus.NOT_AUTOMATED.value,
                        TestCaseAutomationStatus.PLANNED.value,
                        TestCaseAutomationStatus.AUTOMATED.value,
                        TestCaseAutomationStatus.BROKEN.value,
                    ],
                    [4, 2, 3, 1],
                )
                automated_test_name = None
                automation_linked_at = None
                if automation_status != TestCaseAutomationStatus.NOT_AUTOMATED.value:
                    automated_test_name = f"tests/{fake.word()}/{fake.word()}.spec.ts"
                    automation_linked_at = fake.date_time_between(start_date="-60d", end_date="now", tzinfo=timezone.utc)
                test_cases.append(
                    TestCase(
                        title=f"{fake.word().title()} {fake.word().title()} flow",
                        description=fake.paragraph(nb_sentences=2),
                        priority=weighted_choice(
                            [Priority.LOW.value, Priority.MEDIUM.value, Priority.HIGH.value, Priority.CRITICAL.value],
                            [2, 4, 3, 1],
                        ),
                        project_id=project.id,
                        automation_status=automation_status,
                        automated_test_name=automated_test_name,
                        automation_linked_at=automation_linked_at,
                    )
                )
        db.add_all(test_cases)
        db.flush()

        bugs = []
        for project in projects:
            for _ in range(500):
                bugs.append(
                    Bug(
                        title=f"{fake.catch_phrase()} bug",
                        description=fake.paragraph(nb_sentences=3),
                        severity=weighted_choice(
                            [BugSeverity.LOW.value, BugSeverity.MEDIUM.value, BugSeverity.HIGH.value, BugSeverity.CRITICAL.value],
                            [2, 4, 3, 1],
                        ),
                        status=weighted_choice(
                            [BugStatus.OPEN.value, BugStatus.IN_PROGRESS.value, BugStatus.RESOLVED.value, BugStatus.CLOSED.value],
                            [4, 3, 2, 1],
                        ),
                        project_id=project.id,
                        assignee_id=pick(users).id,
                        reporter_id=pick(users).id,
                    )
                )
        db.add_all(bugs)
        db.flush()

        for requirement in requirements:
            requirement.test_cases.extend(random.sample(test_cases, k=2))
            requirement.bugs.extend(random.sample(bugs, k=2))
        db.flush()

        test_runs = []
        run_statuses = [TestRunStatus.PASSED.value, TestRunStatus.FAILED.value, TestRunStatus.BLOCKED.value, TestRunStatus.SKIPPED.value]
        for test_case in test_cases:
            for _ in range(5):
                test_runs.append(
                    TestRun(
                        project_id=test_case.project_id,
                        test_case_id=test_case.id,
                        status=weighted_choice(run_statuses, [5, 2, 1, 2]),
                        executed_by=pick(users).id,
                        executed_at=fake.date_time_between(start_date="-30d", end_date="now", tzinfo=timezone.utc),
                    )
                )
        for batch in chunked(test_runs, 500):
            db.add_all(batch)
            db.flush()

        comments = []
        for bug in bugs:
            for _ in range(4):
                comments.append(
                    Comment(
                        bug_id=bug.id,
                        user_id=pick(users).id,
                        content=fake.paragraph(nb_sentences=2),
                    )
                )
        for batch in chunked(comments, 1000):
            db.add_all(batch)
            db.flush()

        all_entities = [
            ("Project", [project.id for project in projects], [project.owner_id for project in projects]),
            ("Epic", [epic.id for epic in epics], [epic.owner_id for epic in epics]),
            ("Feature", [feature.id for feature in features], [feature.owner_id for feature in features]),
            ("Requirement", [requirement.id for requirement in requirements], [requirement.created_by for requirement in requirements]),
            ("TestCase", [test_case.id for test_case in test_cases], [None for _ in test_cases]),
            ("Bug", [bug.id for bug in bugs], [bug.reporter_id for bug in bugs]),
            ("TestRun", [test_run.id for test_run in test_runs], [test_run.executed_by for test_run in test_runs]),
            ("Comment", [comment.id for comment in comments], [comment.user_id for comment in comments]),
        ]

        activity_logs = []
        now = datetime.now(timezone.utc)
        for _ in range(10000):
            entity_type, ids, user_ids = pick(all_entities)
            idx = random.randrange(len(ids))
            activity_logs.append(
                ActivityLog(
                    entity_type=entity_type,
                    entity_id=ids[idx],
                    action=weighted_choice(["created", "updated", "linked", "commented", "executed"], [5, 3, 2, 2, 2]),
                    user_id=user_ids[idx],
                    project_id=pick(projects).id,
                    timestamp=now - timedelta(minutes=random.randint(0, 10080)),
                )
            )
        for batch in chunked(activity_logs, 1000):
            db.add_all(batch)
            db.flush()

        db.commit()
        print(
            f"Seeded 25 users, 10 projects, 30 epics, 100 features, 500 requirements, 2000 test cases, 10000 test runs, 5000 bugs, 20000 comments, and activity logs. Seed user password: {settings.seed_user_password}"
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
