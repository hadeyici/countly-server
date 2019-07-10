var async = require('async'),
    pluginManager = require('../pluginManager.js'),
    countlyDb = pluginManager.dbConnection();

console.log("Installing my metric plugin");
countlyDb.collection('apps').find({}).toArray(function(err, apps) {

    if (!apps || err) {
        countlyDb.close();
        return;
    }
    function upgrade(app, done) {
        console.log("Creating metric collection for " + app.name);
        function cb() {
            done();
        }
        countlyDb.command({"convertToCapped": 'metrics' + app._id, size: 10000000, max: 1000}, function(err) {
            if (err) {
                countlyDb.createCollection('metrics' + app._id, {capped: true, size: 10000000, max: 1000}, cb);
            }
            else {
                cb();
            }
        });
    }
    async.forEach(apps, upgrade, function() {
        console.log("My metric plugin installation finished");
        countlyDb.close();
    });
});