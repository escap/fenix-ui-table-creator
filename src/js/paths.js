/*global define*/
define(function () {

    var config = {

        paths: {
            'fx-c-c/start': './start',
            'fx-c-c/html': '../html',
            'fx-c-c/config': '../../config',
            'fx-c-c/adapters': './adapters',
            'fx-c-c/templates': './templates',
            // third party libs
            text: '//fenixapps.fao.org/repository/js/requirejs/plugins/text/2.0.12/text',
            jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
            jqwidgets: '//fenixapps.fao.org/repository/js/jqwidgets/3.1/jqx-all',
            underscore: "//fenixapps.fao.org/repository/js/underscore/1.7.0/underscore.min",
            moment: "//fenixapps.fao.org/repository/js/moment/2.9.0/moment.min",
            amplify: "//fenixapps.fao.org/repository/js/amplify/1.1.2/amplify.min"
        },

        shim: {
            "jqwidgets": {
                "deps": ["jquery"]
            }, "amplify": {
                "deps": ["jquery"]
            }
        }
    };

    return config;
});
