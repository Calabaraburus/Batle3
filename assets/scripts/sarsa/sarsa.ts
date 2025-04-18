////  sarsa.ts - ClbBlast
////
////  Calabaraburus (c) 2022
////
////  Author:Natalchishin Taras
//
//export class Sarsa{
//
//    private _config: SarsaConfig;
//    private _weights : {};
//
//cloneJSON( obj:object ):string {
//    return JSON.parse ( JSON.stringify ( obj ) );
//}
//
//private setRewardInternal(weights: any,state:any,action:number,reward:number) {
//    state = JSON.stringify(state)
//    weights[state] = weights[state] || {}
//    weights[state][action] = reward
//}
//
// getRewards(weights:any,state:any,action_list:[],defaultReward:number) {
//    var actions = weights[JSON.stringify(state)] || {}
//    var result = {}
//    action_list.forEach( a=> {
//        if (action in actions) {
//            result[action] = actions[action];
//        } else {
//            result[action] = defaultReward;
//        }
//    })
//    return result
//}
//
// sarsaEquation(state0,action0,reward1,state1,action1,alpha,gamma,weights,defaultReward,getRewards,setReward) {
//    // formula : ( 1 - a )Q(t) + (a)( r + yQ(t+1) )
//
//    var a = alpha
//    var Qt0 = getRewards(weights,state0,[action0],defaultReward)[action0]
//    var Qt1 = getRewards(weights,state1,[action1],defaultReward)[action1]
//    var r = reward1
//    var y = gamma
//
//    var result = (1-a)*Qt0 + a*(r+y*Qt1)
//    setReward(weights,state0,action0,result)
//    return result
//}
//
//randomPolicy(actions,epsilon) {
//    actions = Object.keys(actions)
//    return actions[ Math.trunc( Math.random()*(actions.length) ) ]
//}
//
//greedyPolicy(actions,epsilon) {
//    var best_score = Object.values(actions).reduce(function(a,b){return (a>b)?a:b })
//    return Object.keys(actions).filter( function( key ) { return actions[key] == best_score } )[0]
//}
//
//epsilonGreedyPolicy(actions,epsilon) {
//    if ( Math.random() <= epsilon ) {
//        return this.randomPolicy(actions,epsilon)
//    } else {
//        return this.greedyPolicy(actions,epsilon)
//    }
//}
//
//epsilonSoftPolicy(actions,epsilon) {
//    if ( Math.random() <= (1-epsilon+epsilon/Object.keys(actions).length) ) {
//        return this.greedyPolicy(actions,epsilon)
//    } else {
//        return this.randomPolicy(actions,epsilon)
//    }
//}
//
//softmaxPolicy(actions,epsilon) {
//    var keys = Object.keys(actions)
//    if (keys.length < 1) {
//        throw new Error("No actions");
//    }
//    var values = keys.map(function(key){ return Math.pow(Math.E,actions[key]) })
//    var denominator = values.reduce(function(a,b){return a+b})
//    var softmax = values.map(function(v){ return v/denominator })
//
//    var selection = Math.random()
//    var offset = 0
//    var index = 0
//    for( index in values ) {
//        offset += softmax[index]
//        if ( offset >= selection ) {
//            return keys[index]
//        }
//    }
//    return this.randomPolicy(actions,epsilon)
//}
//
//epsilonGreedySoftmaxPolicy(actions,epsilon) {
//    if ( Math.random() >= epsilon ) {
//        return this.greedyPolicy(actions,epsilon)
//    } else {
//        return this.softmaxPolicy(actions,epsilon)
//    }
//}
//
//policies = {
//    greedy : this.greedyPolicy,
//    epsilonGreedy : this.epsilonGreedyPolicy,
//    epsilonSoft : this.epsilonSoftPolicy,
//    softmax : this.softmaxPolicy,
//    epsilonGreedySoftmax : this.epsilonGreedySoftmaxPolicy,
//    random : this.randomPolicy,
//}
//
// configWithDefaults(config, defaults) {
//    var result = {}
//    config = config || {}
//    result.alpha = (('alpha' in config) ? config.alpha : defaults.alpha )
//    result.gamma = (('gamma' in config) ? config.gamma : defaults.gamma )
//    result.defaultReward = (('defaultReward' in config) ? config.defaultReward : defaults.defaultReward )
//    result.epsilon = (('epsilon' in config) ? config.epsilon : defaults.epsilon )
//    result = cloneJSON(result)
//    result.policy = (('policy' in config) ? config.policy : defaults.policy )
//    if ( typeof(result.policy) == 'string' ) {
//        if ( result.policy in policies ) {
//            result.policy = policies[result.policy]
//        } else {
//            console.error("A policy has to be a function or one of : " + Object.keys(policies) + ". Setting it to 'greedyPolicy'")
//            result.policy = greedyPolicy
//        }
//    }
//    return result
//}
//
//public setReward(state:any,action:any,reward:number) {
//    this.setRewardInternal(this._weights,state,action,reward)
//    return this
//}
//getRewards()state,action_list) {
//    return cloneJSON(getRewards(this._weights,state,action_list,this._config.defaultReward))
//},
//
//constructor(config:SarsaConfig) {
//
//        this._config = config;
//
//
//        update : function (state0,action0,reward1,state1,action1) {
//            return sarsaEquation(state0,action0,reward1,state1,action1,
//                this._config.alpha,this._config.gamma,
//                this._weights,this._config.defaultReward,getRewards,setReward)
//        },
//        chooseAction : function(state,action_list) {
//            var actions = getRewards(this._weights,state,action_list,this._config.defaultReward)
//            return this._config.policy(actions,this._config.epsilon)
//        },
//        clone : function() {
//            var clone = sarsaConstructor(this._config)
//            clone._weights = cloneJSON(this._weights)
//            return clone
//        }
//
//
//
//}}
//
//export class SarsaConfig
//{
//    alpha = 0.2;
//    gamma = 0.8;
//    defultReward= 0;
//    epsilon = 0.001;
//    policy = 'greedy';
//}
