var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require('underscore');
var Metrics = require('./metrics');
var Achievment = (function () {
    function Achievment() {
        this.metricWatches = [];
    }
    Achievment.prototype.resolveId = function (token) {
        if (token) {
            return token + "::" + this.id;
        }
        else {
            return this.id;
        }
    };
    Achievment.prototype.award = function (achiever, token) {
        achiever.achievments[this.resolveId(token)] = "awarded";
    };
    Achievment.prototype.awardIfNotAwarded = function (achiever, token) {
        if (!achiever.achievments[this.resolveId(token)]) {
            this.award(achiever, token);
            return true;
        }
        return false;
    };
    Achievment.prototype.shouldAward = function (achiever, metrics, token) {
        return false;
    };
    return Achievment;
})();
exports.Achievment = Achievment;
var GreaterThanAchievment = (function (_super) {
    __extends(GreaterThanAchievment, _super);
    function GreaterThanAchievment() {
        _super.call(this);
        this.metricWatches.push(this.metricId);
    }
    GreaterThanAchievment.prototype.shouldAward = function (achiever, metrics, token) {
        //console.log('Should I award this greate than metric?',metrics[this.metricId].getValue())
        var result = metrics[this.metricId].getValue() > this.greaterThan;
        //console.log(result);
        return result;
    };
    return GreaterThanAchievment;
})(Achievment);
var AchievmentManager = (function () {
    function AchievmentManager() {
        this.achievments = {};
        this.metrics = {};
        this.watches = {};
    }
    AchievmentManager.prototype.registerAchievment = function (achievment) {
        var _this = this;
        this.achievments[achievment.resolveId()] = achievment;
        achievment.metricWatches.forEach(function (metricId) {
            _this.registerWatch(metricId, achievment);
        });
        console.log("Registered achievment:", achievment.id);
    };
    AchievmentManager.prototype.registerSimpleMetric = function (simpleMetric) {
        this.metrics[simpleMetric.id] = new Metrics.Metric();
        this.metrics[simpleMetric.id].id = simpleMetric.id;
        console.log("Registered metric:", simpleMetric.id);
    };
    AchievmentManager.prototype.getMetric = function (achiever, metricId, token) {
        return new Metrics.ResolvedMetric(achiever, this.metrics[metricId], token);
    };
    AchievmentManager.prototype.updateMetric = function (achiever, metricId, value, token) {
        console.log(achiever.name, 'updating metric:', metricId, 'value:', value, 'token:', token);
        var awardedAchievments = [];
        var metricObj = this.metrics[metricId];
        var resolvedMetricId = metricObj.resolveId(token);
        metricObj.update(achiever, resolvedMetricId, value);
        var affectedAchievments = this.watches[metricId];
        console.log("Affected achievments", affectedAchievments);
        for (var index = 0; index < affectedAchievments.length; index++) {
            var achievment = affectedAchievments[index];
            var relevantMetrics = _.mapObject(_.pick(this.metrics, achievment.metricWatches), function (val, key) {
                return new Metrics.ResolvedMetric(achiever, val, token);
            });
            console.log('Relevant metrics for', achievment.id, ':', relevantMetrics);
            if (achievment.shouldAward(achiever, relevantMetrics, token)) {
                if (achievment.awardIfNotAwarded(achiever, token)) {
                    console.log('Awarded achievment', achievment.id, 'to achiever', achiever.name);
                    awardedAchievments.push(achievment);
                }
            }
        }
        return awardedAchievments;
    };
    AchievmentManager.prototype.registerWatch = function (metricId, achievment) {
        if (!this.watches[metricId]) {
            this.watches[metricId] = [];
        }
        this.watches[metricId].push(achievment);
    };
    return AchievmentManager;
})();
exports.AchievmentManager = AchievmentManager;
var FirstCommitAchievment = (function (_super) {
    __extends(FirstCommitAchievment, _super);
    function FirstCommitAchievment() {
        this.id = "first.commit";
        this.name = "Congrats! It's a commit!";
        this.description = "Push your first commit into the repository";
        this.metricId = Metrics.commitCountMetric.id;
        this.imageUrl = "https://a248.e.akamai.net/assets.github.com/images/modules/404/parallax_octocat.png?1293753715";
        this.greaterThan = 0;
        _super.call(this);
    }
    return FirstCommitAchievment;
})(GreaterThanAchievment);
exports.FirstCommitAchievment = FirstCommitAchievment;
//# sourceMappingURL=achievments.js.map