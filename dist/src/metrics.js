var ResolvedMetric = (function () {
    function ResolvedMetric(achiever, metric, token) {
        this.achiever = achiever;
        this.metric = metric;
        this.token = token;
    }
    ResolvedMetric.prototype.getValue = function () {
        return this.metric.getValue(this.achiever, this.metric.resolveId(this.token));
    };
    return ResolvedMetric;
})();
exports.ResolvedMetric = ResolvedMetric;
var Metric = (function () {
    function Metric() {
    }
    Metric.resolveId = function (id, token) {
        if (token) {
            return token + "::" + id;
        }
        else {
            return id;
        }
    };
    Metric.prototype.resolveId = function (token) {
        return Metric.resolveId(this.id, token);
    };
    Metric.prototype.update = function (achiever, resolvedMetricId, value) {
        achiever.metrics[resolvedMetricId] = value;
    };
    Metric.prototype.getValue = function (achiever, resolvedMetricId) {
        //console.log('Looking at',resolvedMetricId,'for value')
        var val = achiever.metrics[resolvedMetricId];
        //console.log('Value',val);
        if (val === undefined) {
            return null;
        }
        return val;
    };
    return Metric;
})();
exports.Metric = Metric;
exports.commitCountMetric = { id: "commit.count" };
//# sourceMappingURL=metrics.js.map