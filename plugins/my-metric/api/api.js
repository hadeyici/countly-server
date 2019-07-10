var plugin = {},
common = require('../../../api/utils/common.js'),
countlyCommon = require('../../../api/lib/countly.common.js'),
plugins = require('../../pluginManager.js');

(function (plugin) {
    /**
     * @apiName: InsertMyMetric
     * @apiType: POST
     * @apiDescription: Insert metric from Countly web application
     * @apiParam: 'app_key',
     * @apiParam: 'device_id', 
     * @apiParam: 'my_metric',
     * @apiParam: 'my_metric_count',
     * @returns {boolean} Returns boolean
     */
    plugins.register("/i/my-metric", function(ob){
        var params = ob.params;
        var validate = ob.validateUserForWriteAPI;
        validate(params, function (params) {
            var argProps = {
                'app_key': { 'required': true, 'type': 'String' },
                'device_id': { 'required': true, 'type': 'String' },
                'my_metric': { 'required': true, 'type': 'String' },
                'my_metric_count': { 'required': true},
                },
                create = {};

            if (!(create = common.validateArgs(params.qstring, argProps))) {
                common.returnOutput(params, {error: 'Not enough args'});
                return false;
            }

            var dataMetric = {
                "app_key": params.qstring.app_key,
                "device_id" : params.qstring.device_id,
                "my_metric": params.qstring.my_metric,
                "my_metric_count": parseInt(params.qstring.my_metric_count),
                "date": new Date()
            }
            
            common.db.collection('my_metric').insert(dataMetric, function(err, app) {
                if(err) {
                    common.returnMessage(params, 400, err);
                }else {
                    common.returnMessage(params, 200, "Success");
                }
            });
        });
        return true;
    });

   /*
     * @apiName: GetMyMetricData
     * @apiType: GET
     * @apiDescription: Get metric graph data
     * @apiParam: api_key
     * app_id
     * @apiParam: 'app_id', app_id of related application
     */ 
    plugins.register('/o/my-metric/time-series', function(ob) {
        var params = ob.params;
        var validate = ob.validateUserForWriteAPI;
        validate(params, function() {
            var query = {};
            if (params.qstring.api_key) {
                query.api_key = params.qstring.api_key;
            }
            if (params.qstring.app_id) {
                query.app_id = params.qstring.app_id;
            }
            common.db.collection('my_metric').find({},{my_metric_count:1,my_metric:1}).toArray(function(err, docs) {
                if (!err) {
                    let _data = [];
                    for (let index = 0; index < docs.length; index++) {
                        const count = docs[index].my_metric_count;
                        const label = docs[index].my_metric;
                        _data.push([index,count]);
                        
                    }
                    common.returnOutput(params, _data);
                    return true;
                } else {
                    common.returnMessage(params, 500, err.message);
                    return false;
                }
            });
        });
        return true;
    });

    /**
     * @apiName: GetMyMetricTableData
     * @apiType: GET
     * @apiDescription:  Get metric table
     * @apiParam: api_key
     * app_id
     * @apiParam: 'app_id', app_id of related application
     */
    plugins.register('/o/my-metric/table', function(ob) {
        var params = ob.params;
        var validate = ob.validateUserForWriteAPI;
        validate(params, function() {
            var query = {};
            if (params.qstring.api_key) {
                query.api_key = params.qstring.api_key;
            }

            if (params.qstring.app_id) {
                query.app_id = params.qstring.app_id;
            }
            common.db.collection('my_metric').find({},{my_metric_count:1,date:1}).toArray(function(err, docs) {
                if (!err) {
                    common.returnOutput(params, docs);
                    return true;
                }
                else {
                    common.returnMessage(params, 500, err.message);
                    return false;
                }
            });
        });
        return true;
    });  

    /**
     * @apiName: GetMyMetricTopData
     * @apiType: GET
     * @apiDescription:  Get metric top data
     * @apiParam: api_key
     * app_id
     * @apiParam: 'app_id', app_id of related application
     */
    plugins.register('/o/my-metric/top-data', function(ob) {
        var params = ob.params;
        var validate = ob.validateUserForWriteAPI;
        validate(params, function() {
            var query = {};
            if (params.qstring.api_key) {
                query.api_key = params.qstring.api_key;
            }

            if (params.qstring.app_id) {
                query.app_id = params.qstring.app_id;
            }
            
            var periodObj = countlyCommon.getPeriodObj(params);
            var pipeline = [];
        
            var period = params.qstring.period || 'month';
            var matchStage = {};
            var selectMap = {};
            var curday = "";
            var curmonth = "";
            var first_month = "";
            var last_month = "";
            if (period === "day") {
                matchStage = {'_id': {$regex: params.qstring.app_id + "_" + periodObj.activePeriod + ""}};
            }
            else if (period === "month") {
                matchStage = {'_id': {$regex: params.qstring.app_id + "_" + periodObj.activePeriod + ""}};
            }
            else if (period === "hour" || period === "yesterday") {
                var this_date = periodObj.activePeriod.split(".");
                curmonth = this_date[0] + ":" + this_date[1];
                curday = this_date[2];
                matchStage = {'_id': {$regex: params.qstring.app_id + "_" + curmonth + ""}};
            }
            else {
                var last_pushed = "";
                var month_array = [];
                first_month = periodObj.currentPeriodArr[0].split(".");
                first_month = first_month[0] + ":" + first_month[1];
        
                last_month = periodObj.currentPeriodArr[periodObj.currentPeriodArr.length - 1].split(".");
                last_month = last_month[0] + ":" + last_month[1];
                for (let i = 0; i < periodObj.currentPeriodArr.length; i++) {
                    let kk = periodObj.currentPeriodArr[i].split(".");
                    if (!selectMap[kk[0] + ":" + kk[1]]) {
                        selectMap[kk[0] + ":" + kk[1]] = [];
                    }
                    selectMap[kk[0] + ":" + kk[1]].push(kk[2]);
                    if (last_pushed === "" || last_pushed !== kk[0] + ":" + kk[1]) {
                        last_pushed = kk[0] + ":" + kk[1];
                        month_array.push({"_id": {$regex: params.qstring.app_id + "_" + kk[0] + ":" + kk[1]}});
                    }
                }
                matchStage = {$or: month_array};
            }
            pipeline.push({$match: matchStage});
        
            if (period === "hour" || period === "yesterday") {
                pipeline.push({$project: {d: {$objectToArray: "$d." + curday}}});
                pipeline.push({$unwind: "$d"});
                pipeline.push({$group: {_id: "$d.k", "t": {$sum: "$d.v.t"}}});
            }
            else if (period === "month" || period === "day") {
                pipeline.push({$project: {d: {$objectToArray: "$d"}}});
                pipeline.push({$unwind: "$d"});
                pipeline.push({$project: {d: {$objectToArray: "$d.v"}}});
                pipeline.push({$unwind: "$d"});
                pipeline.push({$group: {_id: "$d.k", "t": {$sum: "$d.v.t"}}});
            }
            else {
                var branches = [];
                branches.push({ case: { $eq: [ "$m", first_month] }, then: { $in: [ "$$key.k", selectMap[first_month] ] } });
                if (first_month !== last_month) {
                    branches.push({ case: { $eq: [ "$m", last_month] }, then: { $in: [ "$$key.k", selectMap[last_month] ] } });
                }
        
                var rules = {$switch: {branches: branches, default: true}};
                pipeline.push({
                    $project: {
                        d: {
                            $filter: {
                                input: {$objectToArray: "$d"},
                                as: "key",
                                cond: rules
                            }
                        }
                    }
                });
                pipeline.push({$unwind: "$d"});
                pipeline.push({$project: {d: {$objectToArray: "$d.v"}}});
                pipeline.push({$unwind: "$d"});
                pipeline.push({$group: {_id: "$d.k", "t": {$sum: "$d.v.t"}}});
            }
            pipeline.push({$sort: {"date": -1}});   
            pipeline.push({$limit: 3});

            common.db.collection('my_metric').aggregate(pipeline, {allowDiskUse: true}, function(err, res) {
                var items = [];

                if (res) {
                    items = res;
                    var total = 0;
                    for (let k = 0; k < items.length; k++) {
                        items[k].percent = items[k].t;
                        items[k].value = items[k].t;
                        items[k].name = items[k]._id;   
                        total = total + items[k].value;
                    }
                    
                    var totalPercent = 0;
                    for (let k = 0; k < items.length; k++) {
                        if (k !== (items.length - 1)) {
                            items[k].percent = Math.floor(items[k].percent * 100 / total);
                            totalPercent += items[k].percent;
                        }
                        else {
                            items[k].percent = 100 - totalPercent;
                        }
                    } 
                }
                common.returnOutput(params, items);
            });
        });
        return true;
    });

    /**
     * @apiName: GetMyMetricTopDateData
     * @apiType: GET
     * @apiDescription:  Get metric top date data
     * @apiParam: api_key
     * app_id
     * @apiParam: 'app_id', app_id of related application
     */
    plugins.register('/o/my-metric/top-date', function(ob) {
        var params = ob.params;
        var validate = ob.validateUserForWriteAPI;
        validate(params, function() {
            var query = {};
            if (params.qstring.api_key) {
                query.api_key = params.qstring.api_key;
            }

            if (params.qstring.app_id) {
                query.app_id = params.qstring.app_id;
            }
            common.db.collection('my_metric').find(query).toArray(function(err, docs) {
                if (!err) {
                    common.returnOutput(params, docs);
                    return true;
                }
                else {
                    common.returnMessage(params, 500, err.message);
                    return false;
                }
            });
        });
        return true;
    });  
}(plugin));

module.exports = plugin;