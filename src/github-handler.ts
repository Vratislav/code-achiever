import {Announcer} from './announcer'
import * as Metrics from './metrics'
import * as Achievments from './achievments'
import _ = require('underscore')
import moment = require('moment')
import {Repository} from './repository'
import {Player} from './player'
import Rx = require('rxjs')
import {createObservable} from './utils'
import express = require('express');


export class GithubHandler{
	repo : Repository;
	achievementsManager : Achievments.AchievmentManager
	announcer: Announcer


	constructor(repository:Repository,achievementsManager:Achievments.AchievmentManager,announcer: Announcer){
		this.repo = repository;
		this.achievementsManager = achievementsManager;
		this.announcer = announcer;
	}

	handle(req : express.Request,eventType:string){
		console.log(`Handling ${eventType}`);
		const event = req.body;
		const deliveryId = req.headers['X-GitHub-Delivery'] || "X-GitHub-Delivery-not-set"
		this.repo.storeGithubEvent(event).subscribe(() => {
			console.log('Event stored');
		});

		if(eventType == "push"){
			var pushEvent : GHPushEvent = event;
			const pushStream = ghUserFromPush(pushEvent).flatMap(user => {
				return playerFromGHUser(this.repo,user);
			}).map((player) : PlayerWithMetrics=>{
				return {player: player, metrics: metricsFromPush(pushEvent)}
			});

			const commitsStream = distinctCommitsFromPush(pushEvent)
			.flatMap(commits =>   {
				//console.log(commits);
				return Rx.Observable.from(commits)})
			const commitPlayersStream = commitsStream.flatMap(commit => {
				console.log(commit)
				return playerFromGHUser(this.repo,ghUserFromCommit(commit))
			})
			const commitMetricsStram = commitsStream.map(metricsFromCommit)
			const finalCommitMetricsStream =
				Rx.Observable.combineLatest(commitPlayersStream,commitMetricsStram)
				.map((playerAndMetric) => {
					return {player: playerAndMetric[0], metrics: playerAndMetric[1]}
				});

			pushStream.concat(finalCommitMetricsStream)
			.do(({player, metrics}) => {
				console.log(`Got player from push:`);
				console.log(player.debugInfo);
				console.log(`Metrics to be bumped:`);
				console.log(metrics);
			})
			.map(({player, metrics}) : PlayerWithAchievements => {
				let achievements : Achievments.Achievment[] = _.flatten(metrics.map((metric) => {
					return this.achievementsManager.bumpMetric(player,metric.id);
				}));
				return {player: player, achievements: achievements}
			}).flatMap((p) => {
				return Rx.Observable.fromPromise(p.player.save()).map( () => p)
			})
			.subscribe(({player, achievements}) => {
				console.log(`Got player from push:`);
				console.log(player.debugInfo);
				console.log(`Achievements to be awarded:`);
				console.log(achievements);
				achievements.forEach((achievment)=>{
					this.announcer.announceAchievment(player,achievment);
				});
			},(error) => {
				console.log(`Got error: ${error}`);
				if(error.stack){
					console.log('Stack:')
					console.log(error.stack)
				}
			},() => {
				console.log("Finished");
			})
		}
	}


}

interface PlayerWithAchievements {
	player : Player,
	achievements : Achievments.Achievment[]
}

interface PlayerWithMetrics {
	player : Player,
	metrics : Metrics.SimpleMetric[]
}

export interface GHPushEvent {
	sender : GHSender,
	created : boolean,
	deleted : boolean,
	forced : boolean,
	commits : GHCommit[],
	head_commit : GHCommit,
	pusher : MinimalGHUser
}

export interface GHSender{
	login : string
}

export interface GHCommit{
	id : string,
	message : string
	added : string[],
	removed : string[],
	modified : string[],
	timestamp : string,
	distinct : true,
	committer : GHUser
}

export interface MinimalGHUser{
	name : string;
	email : string;
}

export interface GHUser extends MinimalGHUser{
	name : string;
	email : string;
	username : string;
}


const playerFromGHUser = (repo : Repository, ghUser : GHUser) : Rx.Observable<Player> => {
	return repo.players.map(players => {
		return _.first(_.values(players).filter(player => player.data.githubName == ghUser.username))
	}).flatMap((player)=>{
		if(!player){
			player = repo.createPlayerIfDoesNotExtist({
				id : ghUser.username,
				githubName: ghUser.username,
				slackName : null,
				metrics : {},
				achievments : {}
			});
			return Rx.Observable.fromPromise(player as any);
		}else{
			return Rx.Observable.from([player]);
		}

	});
}


const distinctCommitsFromPush = (ghPush : GHPushEvent) : Rx.Observable<GHCommit[]> =>
Rx.Observable.from([ghPush]).map((push) => push.commits.filter((c) => c.distinct));

export const metricsFromPush = (ghPush : GHPushEvent) : Metrics.SimpleMetric[] => {
	const metrics : Metrics.SimpleMetric[] = [];
	metrics.push(Metrics.pushCountMetric);

	if(ghPush.forced){
		metrics.push(Metrics.forcePushCountMetric);
	}
	return metrics;
}

export const metricsFromCommit = (ghCommit : GHCommit) : Metrics.SimpleMetric[] => {
	const metrics : Metrics.SimpleMetric[] = [];
	metrics.push(Metrics.commitCountMetric);
	let commitTime = moment.parseZone(ghCommit.timestamp);
	let hours = commitTime.hours();
	if(hours >= 0 && hours <= 1){
		metrics.push(Metrics.commitTimeMidnight);
	}
	if(hours >= 20 && hours <= 24){
		metrics.push(Metrics.commitTimeNight);
	}
	if(hours >= 5 && hours < 9 ){
		metrics.push(Metrics.commitTimeMorning);
	}
	if (/fix(ed| |$)/i.test(ghCommit.message)){
		metrics.push(Metrics.bugfixCommitCountMetric);
	}
	if (/^(merge branch|merge pull request)/i.test(ghCommit.message)){
		metrics.push(Metrics.branchMergeCountMetric);
	}
	if (ghCommit.modified.some((f)=> /gemfile$/i.test(f))){
		metrics.push(Metrics.filesModifiedGemfile);
	}
	if (ghCommit.modified.some((f)=> /package\.json$/i.test(f))){
		metrics.push(Metrics.filesModifiedNPM);
	}
	if (ghCommit.modified.some((f)=> /\.rb$/i.test(f))){
		metrics.push(Metrics.filesModifiedRuby);
	}
	if (ghCommit.modified.some((f)=> /\.rb$/i.test(f))){
		metrics.push(Metrics.filesModifiedRuby);
	}
	if (ghCommit.modified.some((f)=> /\.js$/i.test(f))){
		metrics.push(Metrics.filesModifiedJavascript);
	}
	if (ghCommit.modified.some((f)=> /\.ts$/i.test(f))){
		metrics.push(Metrics.filesModifiedTypescript);
	}
	if (ghCommit.modified.some((f)=> /(dangerfile|fastfile|\.travis\.yml)$/i.test(f))){
		metrics.push(Metrics.filesModifiedDevOps);
	}

	return metrics;
}

const ghUserFromCommit = (ghCommit : GHCommit) : GHUser => {
	return ghCommit.committer;
}

const ghUserFromPush = (ghPush : GHPushEvent) : Rx.Observable<GHUser> => {
	return createObservable((observable) => {
		const user =  {
			name : ghPush.pusher.name,
			email : ghPush.pusher.email,
			username: ghPush.sender.login
		}
		if (!user.name || !user.email || !user.username){
			observable.error(`${user} is not complete`);
		}else{
			observable.next(user);
			observable.complete();
		}
	});
}


