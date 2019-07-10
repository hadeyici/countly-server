(function (countlyOurplugin, $) {

  var _data = [];
  var _topData = {};
  var _topDate = {};
  var _table = {};

  countlyOurplugin.myMetricCount = function (id) {
		return $.ajax({
        type:"GET",
        url:"/o/my-metric/time-series",
        data:{
        	"api_key":countlyGlobal.member.api_key,
          "app_id":countlyCommon.ACTIVE_APP_ID,
          "period": countlyCommon.getPeriodForAjax()
        },
        success:function (json) {
           _data = json;
        }
    });
 	};
  
 	countlyOurplugin.myMetricCountData = function () {
		return _data;
  };

  countlyOurplugin.getTop = function (id) {
		return $.ajax({
        type:"GET",
        url:"/o/my-metric/top-data",
        data:{
        	"api_key":countlyGlobal.member.api_key,
          "app_id":countlyCommon.ACTIVE_APP_ID,
          "period": countlyCommon.getPeriodForAjax()
        },
        success:function (json) {
           _topData = json;
        }
    });
 	};
  
 	countlyOurplugin.getTopData = function () {
		return _topData;
  };

  countlyOurplugin.getTopDate = function (id) {
		return $.ajax({
        type:"GET",
        url:"/o/my-metric/top-date",
        data:{
        	"api_key":countlyGlobal.member.api_key,
          "app_id":countlyCommon.ACTIVE_APP_ID,
          "period": countlyCommon.getPeriodForAjax()
        },
        success:function (json) {
           _topDate = json;
        }
    });
 	};
  
 	countlyOurplugin.getTopDateData = function () {
		return _topDate;
  };

  countlyOurplugin.getTable = function (id) {
		return $.ajax({
        type:"GET",
        url:"/o/my-metric/table",
        data:{
        	"api_key":countlyGlobal.member.api_key,
          "app_id":countlyCommon.ACTIVE_APP_ID,
          "period": countlyCommon.getPeriodForAjax()
        },
        success:function (json) {
           _table = json;
        }
    });
 	};
  
 	countlyOurplugin.getTableData = function () {
		return _table;
  };
	
}(window.countlyOurplugin = window.countlyOurplugin || {}, jQuery));