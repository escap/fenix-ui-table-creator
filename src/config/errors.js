if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function ( ) {

    'use strict';

    var prefix = "";

    return {

        MISSING_CONTAINER : prefix + "missing_container",
        INVALID_DATA : prefix + "invalid_data",
        READY_TIMEOUT: prefix + "ready_timeout"

    };
});
