"use strict";
const Metrics = require("./metrics");
const _ = require("underscore");
const moment = require("moment");
const Rx = require("rxjs");
const utils_1 = require("./utils");
class GithubHandler {
    constructor(repository, achievementsManager, announcer) {
        this.repo = repository;
        this.achievementsManager = achievementsManager;
        this.announcer = announcer;
    }
    handle(req, eventType) {
        console.log(`Handling ${eventType}`);
        const event = req.body;
        const deliveryId = req.headers['X-GitHub-Delivery'] || "X-GitHub-Delivery-not-set";
        this.repo.storeGithubEvent(event).subscribe(() => {
            console.log('Event stored');
        });
        if (eventType == "push") {
            var pushEvent = event;
            const pushStream = ghUserFromPush(pushEvent).flatMap(user => {
                return playerFromGHUser(this.repo, user);
            }).map((player) => {
                return { player: player, metrics: exports.metricsFromPush(pushEvent) };
            });
            const commitsStream = distinctCommitsFromPush(pushEvent)
                .flatMap(commits => {
                //console.log(commits);
                return Rx.Observable.from(commits);
            });
            const commitPlayersStream = commitsStream.flatMap(commit => {
                console.log(commit);
                return playerFromGHUser(this.repo, ghUserFromCommit(commit));
            });
            const commitMetricsStram = commitsStream.map(exports.metricsFromCommit);
            const finalCommitMetricsStream = Rx.Observable.combineLatest(commitPlayersStream, commitMetricsStram)
                .map((playerAndMetric) => {
                return { player: playerAndMetric[0], metrics: playerAndMetric[1] };
            });
            pushStream.concat(finalCommitMetricsStream)
                .do(({ player, metrics }) => {
                console.log(`Got player from push:`);
                console.log(player.debugInfo);
                console.log(`Metrics to be bumped:`);
                console.log(metrics);
            })
                .map(({ player, metrics }) => {
                let achievements = _.flatten(metrics.map((metric) => {
                    return this.achievementsManager.bumpMetric(player, metric.id);
                }));
                return { player: player, achievements: achievements };
            }).flatMap((p) => {
                return Rx.Observable.fromPromise(p.player.save()).map(() => p);
            })
                .subscribe(({ player, achievements }) => {
                console.log(`Got player from push:`);
                console.log(player.debugInfo);
                console.log(`Achievements to be awarded:`);
                console.log(achievements);
                achievements.forEach((achievment) => {
                    this.announcer.announceAchievment(player, achievment);
                });
            }, (error) => {
                console.log(`Got error: ${error}`);
                if (error.stack) {
                    console.log('Stack:');
                    console.log(error.stack);
                }
            }, () => {
                console.log("Finished");
            });
        }
    }
}
exports.GithubHandler = GithubHandler;
const playerFromGHUser = (repo, ghUser) => {
    return repo.players.map(players => {
        return _.first(_.values(players).filter(player => player.data.githubName == ghUser.username));
    }).flatMap((player) => {
        if (!player) {
            player = repo.createPlayerIfDoesNotExtist({
                id: ghUser.username,
                githubName: ghUser.username,
                slackName: null,
                metrics: {},
                achievments: {}
            });
            return Rx.Observable.fromPromise(player);
        }
        else {
            return Rx.Observable.from([player]);
        }
    });
};
const distinctCommitsFromPush = (ghPush) => Rx.Observable.from([ghPush]).map((push) => push.commits.filter((c) => c.distinct));
exports.metricsFromPush = (ghPush) => {
    const metrics = [];
    metrics.push(Metrics.pushCountMetric);
    if (ghPush.forced) {
        metrics.push(Metrics.forcePushCountMetric);
    }
    return metrics;
};
exports.metricsFromCommit = (ghCommit) => {
    const metrics = [];
    metrics.push(Metrics.commitCountMetric);
    let commitTime = moment.parseZone(ghCommit.timestamp);
    let hours = commitTime.hours();
    if (hours >= 0 && hours <= 1) {
        metrics.push(Metrics.commitTimeMidnight);
    }
    if (hours >= 20 && hours <= 24) {
        metrics.push(Metrics.commitTimeNight);
    }
    if (hours >= 5 && hours < 9) {
        metrics.push(Metrics.commitTimeMorning);
    }
    if (/fix(ed| |$)/i.test(ghCommit.message)) {
        metrics.push(Metrics.bugfixCommitCountMetric);
    }
    if (/^merge branch/i.test(ghCommit.message)) {
        metrics.push(Metrics.branchMergeCountMetric);
    }
    if (ghCommit.modified.some((f) => /gemfile$/i.test(f))) {
        metrics.push(Metrics.filesModifiedGemfile);
    }
    if (ghCommit.modified.some((f) => /package.json$/i.test(f))) {
        metrics.push(Metrics.filesModifiedNPM);
    }
    return metrics;
};
const ghUserFromCommit = (ghCommit) => {
    return ghCommit.committer;
};
const ghUserFromPush = (ghPush) => {
    return utils_1.createObservable((observable) => {
        const user = {
            name: ghPush.pusher.name,
            email: ghPush.pusher.email,
            username: ghPush.sender.login
        };
        if (!user.name || !user.email || !user.username) {
            observable.error(`${user} is not complete`);
        }
        else {
            observable.next(user);
            observable.complete();
        }
    });
};
//# sourceMappingURL=github-handler.js.map