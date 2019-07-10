window.myMetric = countlyView.extend({
  
    initialize:function (){
        $.when(countlyOurplugin.myMetricCount().then(function(){
            metricData = countlyOurplugin.myMetricCountData();
        }));
        $.when(countlyOurplugin.getTable().then(function(){
            getTableData = countlyOurplugin.getTableData();
        }));
    },
    beforeRender: function () {
        var self = this;
        return $.when($.get(countlyGlobal["path"] + '/my-metric/templates/my-metric.html', function (src) {
            self.template = Handlebars.compile(src);
        }));
    },
    renderCommon: function(isRefresh) {
        if(!isRefresh) {
            $(this.el).html(this.template());
           countlyCommon.drawTimeGraph([{"label":"metric","data":metricData}], "#graph");
        }

        this.dtable = $('#tbl').dataTable($.extend({}, $.fn.dataTable.defaults, {  
            "aaData":countlyOurplugin.getTableData(), 
            "aoColumns": [
                { "mData": "date", 
                "sType": "customDate", 
                "sTitle": "Date" 
                },
                {
                    "mData": "my_metric_count",
                    sType: "formatted-num",
                    "mRender": function(d) {
                        return countlyCommon.formatNumber(d);
                    },
                    "sTitle": 'My Metric Count'
                }
            ]
        }));

        $("#tbl").stickyTableHeaders();  
    },
    refresh: function(){
        var self = this;
        self.renderCommon(true);
        countlyCommon.drawTimeGraph([{"label":"metric","data":metricData}], "#graph");
        CountlyHelpers.refreshTable(self.dtable, getTableData);
    }
});

app.mymetric = new window.myMetric();

if (countlyGlobal.member.global_admin || countlyGlobal.member.admin_of.length) {
    app.route('/manage/my-metric', 'my-metric', function () {
        this.renderWhenReady(this.mymetric);
    });
}

$(document).ready(function () {
    var menu = '<a href="#/manage/my-metric" class="item"><div class="logo dashboard ion-speedometer"></div><div class="text" data-localize="sidebar.myMetric"></div></a>';
    $('div#management-submenu.sidebar-submenu').after(menu);
});