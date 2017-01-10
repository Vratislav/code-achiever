"use strict";
const _ = require("underscore");
const Metrics = require("../src/metrics");
const github_handler_1 = require("../src/github-handler");
describe('Metrics from commit', () => {
    let commit;
    beforeEach(() => {
        commit = {
            "id": "2f14b38db47d2a5580797805af6593ca0116de4a",
            "tree_id": "c9dbf29eb71b38db44675cea6a95f89e142cb6d5",
            "distinct": false,
            "message": "Fix admin info bug",
            "timestamp": "2017-01-09T18:30:01+01:00",
            "url": "https://github.com/ACME/AcmeApp/commit/2f14b38db47d2a5580797805af6593ca0116de4a",
            "author": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "username": "johndoe"
            },
            "committer": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "username": "johndoe"
            },
            "added": [],
            "removed": [],
            "modified": [
                "app/views/admin/offers/show.html.slim"
            ]
        };
    });
    it('Commit metric', function () {
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitCountMetric.id)).toBeTruthy();
    });
    it('Time::NightMetric - Should be awarded', function () {
        commit.timestamp = "2017-01-09T20:30:01+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeNight.id)).toBeTruthy();
    });
    it('Time::NightMetric - Should not awarded', function () {
        commit.timestamp = "2017-01-09T19:30:01+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeNight.id)).toBeFalsy();
    });
    it('Time::MorningMetric - Should be awarded', function () {
        commit.timestamp = "2017-01-09T05:30:01+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeMorning.id)).toBeTruthy();
    });
    it('Time::MorningMetric - Should not awarded', function () {
        commit.timestamp = "2017-01-09T10:30:01+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeMorning.id)).toBeFalsy();
    });
    it('Time::MidnightMetric - Should be awarded', function () {
        commit.timestamp = "2017-01-09T00:30:01+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeMidnight.id)).toBeTruthy();
    });
    it('Time::MidnighMetric - Should not be awarded - too early', function () {
        commit.timestamp = "2017-01-09T22:59:01+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeMidnight.id)).toBeFalsy();
    });
    it('Time::MidnighMetric - Should not be awarded - too late', function () {
        commit.timestamp = "2017-01-10T02:00:02+01:00";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.commitTimeMidnight.id)).toBeFalsy();
    });
    it('CommitMessage::BugfixMetric - Should be awarded', function () {
        commit.message = "Nasty bug fixed";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.bugfixCommitCountMetric.id)).toBeTruthy();
    });
    it('CommitMessage::BugfixMetric - Should not be awarded', function () {
        commit.message = "Some wierd stuff in commit message";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.bugfixCommitCountMetric.id)).toBeFalsy();
    });
    it('CommitMessage::MergeBranchMetric - Should be awarded', function () {
        commit.message = "Merge branch bla bla";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.branchMergeCountMetric.id)).toBeTruthy();
    });
    it('CommitMessage::MergeBranchMetric - Should not be awarded', function () {
        commit.message = "Some wierd stuff in commit message";
        let metricsInCommit = github_handler_1.metricsFromCommit(commit);
        expect(_.find(metricsInCommit, (m) => m.id == Metrics.branchMergeCountMetric.id)).toBeFalsy();
    });
});
//# sourceMappingURL=metricSpec.js.map