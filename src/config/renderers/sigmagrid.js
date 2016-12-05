if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function () {

    'use strict';

    return {
        width: "100%",
        height: "440",
       //exportURL : 'http://ks3291533.kimsufi.com/fao/fao/gridExamples/demos/export_php/testMasterList.php?export=true',
        replaceContainer: true,
        pageSize: 10,
        pageSizeList: [10, 20, 50, 100,150],
        SigmaGridPath: 'grid/',
        toolbarContent: ' nav | goto | pagesize |  csv filter  ',
        toolbarPosition: 'bottom'

    };
});
