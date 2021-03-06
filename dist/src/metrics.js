"use strict";
class ResolvedMetric {
    constructor(achiever, metric, token) {
        this.achiever = achiever;
        this.metric = metric;
        this.token = token;
    }
    getValue() {
        return this.metric.getValue(this.achiever, this.metric.resolveId(this.token));
    }
}
exports.ResolvedMetric = ResolvedMetric;
class Metric {
    static resolveId(id, token) {
        if (token) {
            return token + "::" + id;
        }
        else {
            return id;
        }
    }
    resolveId(token) {
        return Metric.resolveId(this.id, token);
    }
    update(achiever, resolvedMetricId, value) {
        achiever.metrics[resolvedMetricId] = value;
    }
    getValue(achiever, resolvedMetricId) {
        //console.log('Looking at',resolvedMetricId,'for value')
        var val = achiever.metrics[resolvedMetricId];
        //console.log('Value',val);
        if (val === undefined) {
            return null;
        }
        return val;
    }
}
exports.Metric = Metric;
exports.commitCountMetric = { id: "commit.count" };
exports.pushCountMetric = { id: "push.count" };
exports.forcePushCountMetric = { id: "force.push.count" };
exports.commitTimeMidnight = { id: "commit.time.midnight" };
exports.commitTimeNight = { id: "commit.time.night" };
exports.commitTimeMorning = { id: "commit.time.morning" };
exports.bugfixCommitCountMetric = { id: "commit.bugfix.count" };
exports.branchMergeCountMetric = { id: "branch.merge.count" };
exports.filesModifiedGemfile = { id: "files.modified.gemfile" };
exports.filesModifiedNPM = { id: "files.modified.npm" };
exports.filesModifiedDevOps = { id: "files.modified.devops" };
exports.filesModifiedRuby = { id: "files.modified.ruby" };
exports.filesModifiedJavascript = { id: "files.modified.javascript" };
exports.filesModifiedTypescript = { id: "files.modified.typescript" };
exports.allMetrics = [
    exports.commitCountMetric,
    exports.pushCountMetric,
    exports.forcePushCountMetric,
    exports.commitTimeMidnight,
    exports.commitTimeNight,
    exports.commitTimeMorning,
    exports.bugfixCommitCountMetric,
    exports.branchMergeCountMetric,
    exports.filesModifiedGemfile,
    exports.filesModifiedNPM,
    exports.filesModifiedDevOps,
    exports.filesModifiedRuby,
    exports.filesModifiedJavascript,
    exports.filesModifiedTypescript
];
//# sourceMappingURL=metrics.js.map