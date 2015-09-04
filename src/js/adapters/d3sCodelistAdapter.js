/*global define, amplify, console*/
define(['jquery',
"fx-t-c/config/config",
"fx-t-c/config/config-default",
], function ($, C, DC) {

    'use strict';

    var defaultConf = {

        "urlCodelist": C.CODELIST_URL | DC.CODELIST_URL
    };

    function D3SCodelistAdapter() {
        this.$codelistURL = defaultConf.urlCodelist;
    };


    /***
     * @param rowIndex
     * @return map code-label
     */
    D3SCodelistAdapter.prototype.render = function (payloadCodelist) {

        console.log(C)
        var self = this;

        var result = null;
        var payload = {};
        payload['uid'] = payloadCodelist.uid;
        payload['codes'] = payloadCodelist.codes
        self.lang = payloadCodelist.lang;
        if (payloadCodelist.version) {
            payload['version'] = payloadCodelist.version;
        }
        return $.ajax({
            url: self.$codelistURL,
            type: 'POST',
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify(payload)
        }).success(function (data) {
            if (data) {
                return data;

            } else {
                throw new Error('Fx_ui_table error:please, change uid and version of the codelist')
            }
        }).error(function () {
            throw new Error('Fx_ui_table error:please, change uid and version of the codelist')
        });
    }
       /* var self = this;

        var callback = payloadCodelist.callback;



        var ulr =  self.$codelistURL+ payloadCodelist.uid;
        var result = null;
        var payload = {};
        payload['uid'] = payloadCodelist.uid;
        self.lang = payloadCodelist.lang;
        if( payloadCodelist.version) {
            payload['version'] = payloadCodelist.version;
        }
       return  $.ajax({
            url: ulr,
            type: 'GET',
            async: true,
            contentType: "application/json",
            dataType: 'json'
        }).success(function (data) {
            if (data) {


            } else {
                throw new Error('Fx_ui_table error:please, change uid and version of the codelist')
            }
        }).error(function () {
            throw new Error('Fx_ui_table error:please, change uid and version of the codelist')
        })
    };
*/



    return D3SCodelistAdapter;
});