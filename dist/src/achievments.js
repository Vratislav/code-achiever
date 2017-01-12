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
class ForcePushAchievment2 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "force.push.10";
        this.name = "The force is strong with this one...";
        this.description = "May the FORCE Push be with you! (Force push over 10 times.)";
        this.metricId = Metrics.forcePushCountMetric.id;
        this.imageUrl = "https://cdn.meme.am/instances/500x/59119268.jpg";
        this.greaterThan = 9;
        this.setup();
    }
}
exports.ForcePushAchievment2 = ForcePushAchievment2;
class NightCoderAchievement extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.time.night";
        this.name = "Late night coder";
        this.description = "The best code is written during the night. (Commit during the night.)";
        this.metricId = Metrics.commitTimeNight.id;
        this.imageUrl = "https://d13yacurqjgara.cloudfront.net/users/416610/screenshots/2391640/tableillo_1x.png";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.NightCoderAchievement = NightCoderAchievement;
class MidnightCommitAchievement extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.time.midnight";
        this.name = "The Midnight commit";
        this.description = "Code commited right after the day died has a magical power of going through CI 5% faster!";
        this.metricId = Metrics.commitTimeMidnight.id;
        this.imageUrl = "http://maxpixel.freegreatpicture.com/static/photo/1x/Night-Midnight-Stars-Dark-Moon-Halloween-Sky-315204.jpg";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.MidnightCommitAchievement = MidnightCommitAchievement;
class EarlyBirdAchievement extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.time.morning";
        this.name = "The Early Bird";
        this.description = "Get up early and get shit done. That's just how you roll!";
        this.metricId = Metrics.commitTimeMorning.id;
        this.imageUrl = "https://cdn.pixabay.com/photo/2013/07/13/13/42/tux-161439_1280.png";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.EarlyBirdAchievement = EarlyBirdAchievement;
class BugSquisherAchievement extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.bugfix.1";
        this.name = "The Bug Squisher";
        this.description = "You do not like bugs. You fix bugs. Life is nice.";
        this.metricId = Metrics.bugfixCommitCountMetric.id;
        this.imageUrl = "http://www.thecomputeradvisor.net/gallery/how-to-fix-software-bugs/how_to_fix_software_bugs.jpg";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.BugSquisherAchievement = BugSquisherAchievement;
class BugSquisherAchievement2 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.bugfix.2";
        this.name = "Bug Hunter";
        this.description = "You find them and fix them. You are the hero our repository needs but does not deserve.";
        this.metricId = Metrics.bugfixCommitCountMetric.id;
        this.imageUrl = "https://www.browserling.com/images/features/bug-hunter-cross-browser-testing.png";
        this.greaterThan = 4;
        this.setup();
    }
}
exports.BugSquisherAchievement2 = BugSquisherAchievement2;
class BugSquisherAchievement3 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.bugfix.3";
        this.name = "Bug Exterminator";
        this.description = "You are a bug killing machine. Nothing can stop you.";
        this.metricId = Metrics.bugfixCommitCountMetric.id;
        this.imageUrl = "http://dustbusterslb.com/Home/wp-content/uploads/2015/11/big-guns-pest-control281301995.jpg";
        this.greaterThan = 19;
        this.setup();
    }
}
exports.BugSquisherAchievement3 = BugSquisherAchievement3;
class BugSquisherAchievement4 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "commit.bugfix.4";
        this.name = "Bug Killing Semi-god";
        this.description = "You are the sentinel that protects our production from bugs. You are the guru of Bug crushing. ";
        this.metricId = Metrics.bugfixCommitCountMetric.id;
        this.imageUrl = "http://powerlineinfo.com/wp-content/uploads/2013/08/pest-control-pest-exterminator.png";
        this.greaterThan = 99;
        this.setup();
    }
}
exports.BugSquisherAchievement4 = BugSquisherAchievement4;
class MergeBranchAchievement1 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "branch.merge.1";
        this.name = "The merger!";
        this.description = "You have just merged two branches of code together! Congratz!";
        this.metricId = Metrics.branchMergeCountMetric.id;
        this.imageUrl = "http://m.memegen.com/4ao283.jpg";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.MergeBranchAchievement1 = MergeBranchAchievement1;
class MergeBranchAchievement2 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "branch.merge.2";
        this.name = "eMerging beast!";
        this.description = "Merging is just your thing. You were born for it. (Merge over 10 branches.)";
        this.metricId = Metrics.branchMergeCountMetric.id;
        this.imageUrl = "http://weknowmemes.com/generator/uploads/generated/g1384940748876722625.jpg";
        this.greaterThan = 10;
        this.setup();
    }
}
exports.MergeBranchAchievement2 = MergeBranchAchievement2;
//
class GemMasterAchievement1 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "ruby.gemmaster.1";
        this.name = "Gem Apprentice";
        this.description = "You can appreciate a good gem and you know how to use them for the good of your team.";
        this.metricId = Metrics.filesModifiedGemfile.id;
        this.imageUrl = "http://data-creative.info/assets/img/posts/rubygems_logo_red.png";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.GemMasterAchievement1 = GemMasterAchievement1;
class GemMasterAchievement2 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "ruby.gemmaster.2";
        this.name = "Gem Master";
        this.description = "If there is gem for it, you will find it. And you will USE IT! (modify gemfile over 10 times)";
        this.metricId = Metrics.filesModifiedGemfile.id;
        this.imageUrl = "https://stormpath.com/wp-content/uploads/2016/04/preview_COLOURBOX4628597.jpg";
        this.greaterThan = 10;
        this.setup();
    }
}
exports.GemMasterAchievement2 = GemMasterAchievement2;
class NPMAchievement extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "js.npm.1";
        this.name = "The Package Manager";
        this.description = "You have packages for everything and NPM is your friend. (You have a wet dreams about Yarn though every now and then.)";
        this.metricId = Metrics.filesModifiedNPM.id;
        this.imageUrl = "http://68.media.tumblr.com/1e63026e4211a6e7711fe95d5ff6b13e/tumblr_inline_nn489p271Z1t68bpr_500.png";
        this.greaterThan = 0;
        this.setup();
    }
}
exports.NPMAchievement = NPMAchievement;
class NPMAchievement2 extends GreaterThanAchievment {
    constructor() {
        super();
        this.id = "js.npm.2";
        this.name = "The Node Package Crew";
        this.description = "You really know your way around packages. 9 out of 10 NPM wombats would vote for you in the upcomming presidential election.";
        this.metricId = Metrics.filesModifiedNPM.id;
        this.imageUrl = "https://pbs.twimg.com/media/CTFdOYHVAAA3DFU.png";
        this.greaterThan = 10;
        this.setup();
    }
}
exports.NPMAchievement2 = NPMAchievement2;
exports.allAchievements = [
    new FirstCommitAchievment(),
    new Commit10Achievment(),
    new Commit50Achievment(),
    new Commit100Achievment(),
    new ForcePushAchievment(),
    new ForcePushAchievment2(),
    new NightCoderAchievement(),
    new MidnightCommitAchievement(),
    new EarlyBirdAchievement(),
    new BugSquisherAchievement(),
    new BugSquisherAchievement2(),
    new BugSquisherAchievement3(),
    new BugSquisherAchievement4(),
    new MergeBranchAchievement1(),
    new MergeBranchAchievement2(),
    new GemMasterAchievement1(),
    new GemMasterAchievement2(),
    new NPMAchievement(),
    new NPMAchievement2()
];
//# sourceMappingURL=achievments.js.map