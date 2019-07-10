var request = require('supertest');
var should = require('should');
var testUtils = require("../../test/testUtils");
request = request(testUtils.url);

var APP_KEY = "";
var API_KEY_ADMIN = "";
var APP_ID = "";
var DEVICE_ID = "1234567890";

describe('My Metric', function() {
    describe('My Metric plugin create job', function() {
        it('should have a metric', function(done) {
            API_KEY_ADMIN = testUtils.get("API_KEY_ADMIN");
            APP_ID = testUtils.get("APP_ID");
            APP_KEY = testUtils.get("APP_KEY");
            request
                .post('/i/my-metric??api_key=' + API_KEY_ADMIN + "&app_id=" + APP_ID + "&device_id=" + DEVICE_ID + "&app_key=" + APP_KEY + "&my_metric= value my_metric_count=10")
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.not.be.empty;
                    ob.should.be.an.instanceOf(Array);
                    ob.should.have.property('result', 'Success');
                    done();
                });
        });
    });
    describe('My Metric plugin graph data job', function() {
        it('should have a graph data', function(done) {
            request
                .get('/o/my-metric/time-series?api_key=' + API_KEY_ADMIN + "&app_id=" + APP_ID)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.not.be.empty;
                    ob.should.be.an.instanceOf(Object);
                    ob.should.have.property('result', 'Success');
                    done();
                });
        });
    });
    describe('My Metric plugin table job', function() {
        it('should have table data', function(done) {
            request
                .get('/o/my-metric/table?api_key=' + API_KEY_ADMIN + "&app_id=" + APP_ID)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.not.be.empty;
                    ob.should.be.an.instanceOf(Object);
                    ob.should.have.property('result', 'Success');
                    ob.should.have.property("my_metric_count");
                    ob.should.have.property("date");
                    done();
                });
        });
    });
    describe('My Metric plugin top data job', function() {
        it('should have top data', function(done) {
            request
                .get('/o/my-metric/top-data?api_key=' + API_KEY_ADMIN + "&app_id=" + APP_ID)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.not.be.empty;
                    ob.should.be.an.instanceOf(Object);
                    ob.should.have.property('result', 'Success');
                    done();
                });
        });
    });
    describe('My Metric plugin top date data job', function() {
        it('should have top date data', function(done) {
            request
                .get('/o/my-metric/top-date?api_key=' + API_KEY_ADMIN + "&app_id=" + APP_ID)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    var ob = JSON.parse(res.text);
                    ob.should.not.be.empty;
                    ob.should.be.an.instanceOf(Object);
                    ob.should.have.property('result', 'Success');
                    done();
                });
        });
    });
});