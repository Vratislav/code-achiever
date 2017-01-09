"use strict";
const _ = require("underscore");
const Metrics = require("./metrics");
class Achievment {
    constructor() {
        this.metricWatches = [];
    }
    resolveId(token) {
        if (token) {
            return token + "::" + this.id;
        }
        else {
            return this.id;
        }
    }
    award(achiever, token) {
        achiever.achievments[this.resolveId(token)] = "awarded";
    }
    awardIfNotAwarded(achiever, token) {
        if (!achiever.achievments[this.resolveId(token)]) {
            this.award(achiever, token);
            return true;
        }
        return false;
    }
    shouldAward(achiever, metrics, token) {
        return false;
    }
}
exports.Achievment = Achievment;
class GreaterThanAchievment extends Achievment {
    constructor() {
        super();
    }
    setup() {
        this.metricWatches.push(this.metricId);
    }
    shouldAward(achiever, metrics, token) {
        //console.log('Should I award this greate than metric?',metrics[this.metricId].getValue())
        var result = metrics[this.metricId].getValue() > this.greaterThan;
        //console.log(result);
        return result;
    }
}
class AchievmentManager {
    constructor() {
        this.achievments = {};
        this.metrics = {};
        this.watches = {};
    }
    registerAchievment(achievment) {
        this.achievments[achievment.resolveId()] = achievment;
        achievment.metricWatches.forEach((metricId) => {
            this.registerWatch(metricId, achievment);
        });
        console.log("Registered achievment:", achievment.id, "metrics watches:", achievment.metricWatches.join(','));
    }
    registerSimpleMetric(simpleMetric) {
        this.metrics[simpleMetric.id] = new Metrics.Metric();
        this.metrics[simpleMetric.id].id = simpleMetric.id;
        console.log("Registered metric:", simpleMetric.id);
    }
    getMetric(achiever, metricId, token) {
        console.log(`Getting metric ${metricId}`);
        return new Metrics.ResolvedMetric(achiever, this.metrics[metricId], token);
    }
    updateMetric(achiever, metricId, value, token) {
        console.log(achiever.name, 'updating metric:', metricId, 'value:', value, 'token:', token);
        var awardedAchievments = [];
        var metricObj = this.metrics[metricId];
        var resolvedMetricId = metricObj.resolveId(token);
        metricObj.update(achiever, resolvedMetricId, value);
        var affectedAchievments = this.watches[metricId] || [];
        console.log("Affected achievments", affectedAchievments);
        for (var index = 0; index < affectedAchievments.length; index++) {
            var achievment = affectedAchievments[index];
            var relevantMetrics = _.mapObject(_.pick(this.metrics, achievment.metricWatches), (val, key) => {
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
    }
    bumpMetric(achiever, metricId, token) {
        var metric = this.getMetric(achiever, metricId, token);
        var value = metric.getValue();
        if (!value) {
            value = 0;
        }
        value = value + 1;
        return this.updateMetric(achiever, metricId, value, token);
    }
    registerWatch(metricId, achievment) {
        if (!this.watches[metricId]) {
            this.watches[metricId] = [];
        }
        this.watches[metricId].push(achievment);
    }
}
exports.AchievmentManager = AchievmentManager;
class FirstCommitAchievment extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "first.commit";
        this.name = "Congrats! It's a commit!";
        this.description = "Push your first commit into the repository";
        this.metricId = Metrics.commitCountMetric.id;
        this.imageUrl = "https://a248.e.akamai.net/assets.github.com/images/modules/404/parallax_octocat.png?1293753715";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.FirstCommitAchievment = FirstCommitAchievment;
class Commit10Achievment extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.count.10";
        this.name = "Yes, I do commit!";
        this.description = "Push 10 commits into the repository";
        this.metricId = Metrics.commitCountMetric.id;
        this.imageUrl = "http://cameronmcefee.com/img/work/the-octocat/codercat.jpg";
        this.greaterThan = 10;
        this.setup();
    }
}
exports.Commit10Achievment = Commit10Achievment;
class Commit50Achievment extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.count.50";
        this.name = "But of course Yes! I do quite enjoy commiting!";
        this.description = "Push 50 commits into the repository";
        this.metricId = Metrics.commitCountMetric.id;
        this.imageUrl = "https://octodex.github.com/images/founding-father.jpg";
        this.greaterThan = 50;
        this.setup();
    }
}
exports.Commit50Achievment = Commit50Achievment;
class Commit100Achievment extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.count.100";
        this.name = "Do you even commit, bro?";
        this.description = "Whoa! Push 100 commits into the repository!";
        this.metricId = Metrics.commitCountMetric.id;
        this.imageUrl = "https://octodex.github.com/images/steroidtocat.png";
        this.greaterThan = 100;
        this.setup();
    }
}
exports.Commit100Achievment = Commit100Achievment;
class ForcePushAchievment extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "force.push";
        this.name = "Say hello to Mr. Force Push!";
        this.description = "You just force pushed into the repository!";
        this.metricId = Metrics.forcePushCountMetric.id;
        this.imageUrl = "http://www.mememaker.net/static/images/memes/3914636.jpg";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.ForcePushAchievment = ForcePushAchievment;
exports.allAchievements = [
    new FirstCommitAchievment(),
    new Commit10Achievment(),
    new Commit50Achievment(),
    new Commit100Achievment(),
    new ForcePushAchievment()
];
//# sourceMappingURL=achievments.js.map