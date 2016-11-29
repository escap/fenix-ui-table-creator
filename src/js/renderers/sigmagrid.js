define([
    'jquery',
    'underscore',
    'loglevel',
    '../../config/errors',
    '../../config/events',
    '../../config/config',
    'fenix-ui-pivotator',
    '../../html/renderers/sigmagrid.hbs',
    '../../config/renderers/sigmagrid',
    '../lib/sigmagrid'
], function ($, _, log, ERR, EVT, C, Pivotator, Template, sigmagridConfig, Sigma) {

    'use strict';
    var mygrid;
    var idj = 0;


    function Sigmagrid(o) {
        log.info("FENIX Sigmagrid");
        log.info(o);

        $.extend(true, this, C, o);

        var valid = this._validateInput();

        if (valid === true) {

            this._initVariables();

            this._bindEventListeners();

            this._renderSigmagrid(this.pivotatorConfig);

            return this;

        } else {
            log.error("Impossible to create Sigmagrid");
            log.error(valid)
        }
    }

    // API

    /**
     * pub/sub
     * @return {Object} Sigmagrid instance
     */
    Sigmagrid.prototype.on = function (channel, fn) {
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }
        this.channels[channel].push({context: this, callback: fn});
        return this;
    };

    Sigmagrid.prototype.update = function (config) {

        this._renderSigmagrid(config);

    };

    Sigmagrid.prototype._trigger = function (channel) {

        if (!this.channels[channel]) {
            return false;
        }
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = this.channels[channel].length; i < l; i++) {
            var subscription = this.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }

        return this;
    };

    // end API

    Sigmagrid.prototype._validateInput = function () {

        var valid = true,
            errors = [];

        return errors.length > 0 ? errors : valid;

    };

    Sigmagrid.prototype._initVariables = function () {

        //pub/sub
        this.channels = {};

        this.pivotator = new Pivotator();

        //set Chart id
        if (!this.id) {

            window.fx_olap_id >= 0 ? window.fx_olap_id++ : window.fx_olap_id = 0;
            this.id = String(window.fx_olap_id);
            log.info("Set signagrid id to: " + this.id);
        }

        this.lang = this.lang.toUpperCase();

        this.$el = $(this.el);

    };

    Sigmagrid.prototype._bindEventListeners = function () {

        //amplify.subscribe(this._getEventName(EVT.SELECTOR_READY), this, this._onSelectorReady);

    };

    Sigmagrid.prototype._renderSigmagrid = function (obj) {

        var model = this.model,
            dsOption = {fields: [], recordType: 'array', data: model.data},
            colsOption = [],
            colstemp = this.pivotator.toTree(model.cols2, 'colspan'),
            colstempL = this.pivotator.toTree(model.cols2label, 'colspan');

        var hidden2 = {};
        for (var i in obj.hidden) {
            hidden2[obj.hidden[i]] = true
        }


        for (var i in model.rowname) {

            if (model.rowname.hasOwnProperty(i)) {
                colsOption.push({
                    id: model.rowname[i].id,
                    header: model.rowname[i].title[this.lang]|| model.rowname[i].title[C.lang],
                    frozen: true,
                    hidden: hidden2.hasOwnProperty(model.rowname[i].id),
                    grouped: obj.groupedRow
                });
                dsOption.fields.push({name: model.rowname[i].id});
            }
        }

        for (var i in colstemp) {

            if (obj.values.length > 1 || obj.columns.length == 0) {

                if (i == colstemp.length - 1) {
                    for (var j in colstemp[i]) {
                        //console.log("test",optGr.VALS)
                        for (var v in obj.values) {
                            var titleV;
                            if (v == 0) {
                                titleV = "value"
                            } else {
                                titleV = obj.values[v].replace(/.*\|\*/g, "")
                                /*.replace("\W", "_")*/
                            }
                            colsOption.push({
                                id: colstemp[i][j].id.replace(/\W/g, "_") + "_" + obj.values[v].replace(/\|\*/g, "_").replace(/\W/g, "_")
                                ,
                                header: colstempL[i][j].id.replace(/_/g, "\n") + "\n" + titleV

                            });
                            //dsOption.fields.push({name: colstemp[i][j].id + "_" + obj.values[v]});
                            dsOption.fields.push({name: colstemp[i][j].id.replace(/\W/g, "_") + "_" + obj.values[v].replace(/\|\*/g, "_").replace(/\W/g, "_")});

                        }
                    }
                }
                //}
            }
            else {
                if (i == colstemp.length - 1) {
                    for (var j in colstemp[i]) {
                        colsOption.push({
                            id: colstemp[i][j].id.replace(/\W/g, "_"),
                            header: colstempL[i][j].id.replace(/_/g, "\n")/*.replace(/\W/g, "_")*/,

                        });
                        dsOption.fields.push({name: colstemp[i][j].id.replace(/\W/g, "_")});

                    }
                }
            }

        }


        idj++;
        var gridOption = $.extend(true, {}, sigmagridConfig, {
            id: this.id + "_" + this.id + idj,
            dataset: dsOption,
            //   customHead : 'myHead1',
            columns: colsOption,
            container: this.id + "_" + this.id + idj
        });

        this.$el.find(".datagrid").remove();

        this.$el.append("<div id='" + this.id + "_" + this.id + idj + "' class='datagrid' />");

        mygrid = new Sigma.Grid(gridOption);

        Sigma.Grid.render(mygrid)();

        this._trigger("ready");

        return model;

    };

    Sigmagrid.prototype._createOlapHeader = function (model, obj, colstemp) {

        var headerModel = {};
        headerModel.rowname = model.rowname.slice(0);
        headerModel.rowSpan = obj.columns.length;
        headerModel.columnHead = {};
        headerModel.columnTail = [];
        headerModel.columnHead = colstemp.slice(0)[0];
        headerModel.columnTail = colstemp.slice(1);

        return Template(headerModel);
    };

    Sigmagrid.prototype._populateData = function (type, model, config) {

        return config;
    };

    Sigmagrid.prototype._getEventName = function (evt) {

        return this.id.concat(evt);

    };

    //disposition
    Sigmagrid.prototype._unbindEventListeners = function () {

        //amplify.unsubscribe(this._getEventName(EVT.SELECTOR_READY), this._onSelectorReady);

    };

    Sigmagrid.prototype.dispose = function () {

        //unbind event listeners
        this._unbindEventListeners();

    };

    // utils

    return Sigmagrid;
});