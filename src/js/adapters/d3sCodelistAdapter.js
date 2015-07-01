/*global define, amplify, console*/
define(['jquery'], function ($) {

    'use strict';

    var defaultConf = {
        "urlCodelist":"http://fenix.fao.org/d3s_fenix/msd/codes/filter"
    }

    function D3SCodelistAdapter() {
        this.$codelistURL = defaultConf.urlCodelist;
    };


    /***
     * @param rowIndex
     * @return map code-label
     */
    D3SCodelistAdapter.prototype.render = function (payloadCodelist) {
        var self = this;

        var result = null;
        var payload = {};
        payload['uid'] = payloadCodelist.uid;
        self.lang = payloadCodelist.lang;
        if( payloadCodelist.version) {
            payload['version'] = payloadCodelist.version;
        }
        $.ajax({
            url: self.$codelistURL,
            type: 'POST',
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify(payload)
        }).success(function (data) {
            if (data) {
               return self._createMap(data);

            } else {
                throw new Error('Fx_ui_table error:please, change uid and version of the codelist')
            }
        }).error(function () {
            throw new Error('Fx_ui_table error:please, change uid and version of the codelist')
        });
    };


    D3SCodelistAdapter.prototype._createMap = function (dataCodelist) {

        var self = this;
        var map = {}
        for(var i= 0,length = dataCodelist.length; i<length; i++) {
            map[dataCodelist[i].code] = dataCodelist[i].title[self.lang]
        }
        return map;

    }

    return D3SCodelistAdapter;
});