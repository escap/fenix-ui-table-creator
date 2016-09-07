if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function () {

    'use strict';

    return {
        width: "100%",
        height: "370",
       //exportURL : 'http://ks3291533.kimsufi.com/fao/fao/gridExamples/demos/export_php/testMasterList.php?export=true',

        replaceContainer: false,
        pageSize: 15,
        pageSizeList: [15, 25, 50, 150],
        SigmaGridPath: 'grid/',
        toolbarContent: ' nav | goto | pagesize |  csv filter  '
		
    };
});