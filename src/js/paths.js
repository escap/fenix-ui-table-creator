/*global define*/
define(function () {

    var config = {

        paths: {
            'fx-t-c/start': './start',
            'fx-t-c/html': '../html',
            'fx-t-c/config': '../../config',
            'fx-t-c/adapters': './adapters',
            'fx-t-c/templates': './templates',
            // third party libs
            text: '{FENIX_CDN}/js/requirejs/plugins/text/2.0.12/text',
            //jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
            jqwidgets: '{FENIX_CDN}/js/jqwidgets/3.1/jqx-light',//,
            'jqxmenu': '{FENIX_CDN}/js/jqwidgets/3.1/jqxmenu',
            'jqxgrid.pager': '{FENIX_CDN}/js/jqwidgets/3.1/jqxgrid.pager',
           'jqxgrid.filter': '{FENIX_CDN}/js/jqwidgets/3.1/jqxgrid.filter',
           'jqxgrid.grouping': '{FENIX_CDN}/js/jqwidgets/3.1/jqxgrid.grouping',

            underscore: "{FENIX_CDN}/js/underscore/1.7.0/underscore.min",
            moment: "{FENIX_CDN}/js/moment/2.9.0/moment.min",
            amplify: "{FENIX_CDN}/js/amplify/1.1.2/amplify.min"

        },

        shim: {
            "jqwidgets": {
                "deps": ["jquery"]
            },
            "jqxmenu": {
                "deps": ["jqwidgets"]
            },
            "jqxgrid.pager": {
                "deps": ["jqwidgets"]
            },
            "jqxgrid.filter": {
                "deps": ["jqwidgets"]
            },
            "jqxgrid.grouping": {
                "deps": ["jqwidgets"]
            },
            "amplify": {
                "deps": ["jquery"]
            }
        }
    };

    return config;
});
