/*global define, amplify, console*/
define([
        'jquery',
        'fx-t-c/config/adapters/d3s_jqwidgets',
        'underscore',
        'jqwidgets',
        'moment',
        'amplify',
        'jqxgrid.pager',
        'jqxgrid.filter',
        'jqxgrid.grouping',
        'jqxmenu'
    ],
    function ($, baseConfig, _) {

        'use strict';

        var defaultOptions = {

            lang: 'EN',

            s: {
                CONTENT: '[data-role="content"]'
            },

            dataSource: {
                source: {},
                columns: []
            },

            translation: {},

            codelist: {},

            aux: {
                ids: [],
                subjects: [],
                id2index: {},
                index2id: {},
                code2label: {},
                subject2id: {},
                id2subject: {},
                nameIndexes: [],
                id2Datatypes: {},
                index2Datatypes: {}
            }
        }, e = {
            DESTROY: 'fx.component.table.destroy',
            READY: 'fx.component.table.ready'
        };

        function D3S_JQWidgets_Adapter() {
            $.extend(true, this, defaultOptions);
        };


        D3S_JQWidgets_Adapter.prototype.render = function (config) {
            $.extend(true, this, config);

            if (this._validateInput() === true) {
                /*if(config.d3p){
                 this._prepareHiddenColumnsForD3P();
                 }*/
                this._initVariable();
                this._prepareDSDData();
                if (this._validateData() === true) {
                    this._onValidateDataSuccess(config);
                } else {
                    this._onValidateDataError();
                }
            } else {
                console.error(this.errors);
                throw new Error("FENIX Table creator has not a valid configuration");
            }
        };


        D3S_JQWidgets_Adapter.prototype._prepareDSDData = function () {

            console.log(this.$columns)

            this.$columns.forEach(_.bind(function (column, index) {

                if (column.hasOwnProperty('id')) {

                    if (this._isARightIDColumn(column.id, index)) {

                        if (column.hasOwnProperty('subject')) {
                            this.aux.subject2id[column.subject] = column.id;
                            this.aux.id2subject[column.id] = column.subject;

                            this.aux.subjects.push(column.subject);

                            if (column.subject === 'value') {
                                this.columnValueIndex = index;
                            }

                            if (column.hasOwnProperty('dataType')) {
                                this.aux.index2Datatypes[index] = column.dataType;
                                this.aux.id2Datatypes[column.id] = column.datatype;
                            } else {
                                throw new Error("DSD is not correct: it doesn't have datatype on column: " + index);
                            }

                            this.$titles.push(column.title[defaultOptions.lang]);
                        }
                    }
                }
                else {
                    throw new Error("DSD is not correct: it doesn't have id on column: " + index);
                }
            }, this));
            this._prepareVisualizationData();

        };


        D3S_JQWidgets_Adapter.prototype._isARightIDColumn = function (idColumn, indexColumn) {

            var isArightColumn;
            if (!(this._isAVirtualColumn(idColumn, indexColumn))) {
                isArightColumn = true;
                this.aux.id2index[idColumn] = indexColumn;
                this.aux.index2id[indexColumn] = idColumn;
                this.aux.ids.push(idColumn);
            } else {
                isArightColumn = false;
            }
            return isArightColumn;
        };


        D3S_JQWidgets_Adapter.prototype._isAVirtualColumn = function (idLabel, indexLabel) {

            var result;

            if (idLabel && idLabel != null && idLabel.length > 3) {

                var idOriginalColumn = idLabel.substring(0, idLabel.length - 3);

                if (this.aux.id2index[idOriginalColumn]) {
                    result = true;
                    this._setVariablesForVirtualColumn(idOriginalColumn, indexLabel);
                } else {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        };


        D3S_JQWidgets_Adapter.prototype._setVariablesForVirtualColumn = function (idOriginalColumn, indexVirtualColumn) {

            if (!this.aux.indexCodeColumn2indexVirtualColumn) {
                this.aux.indexCodeColumn2indexVirtualColumn = {};
            }
            this.aux.indexCodeColumn2indexVirtualColumn[this.aux.id2index[idOriginalColumn]] = indexVirtualColumn;
        };


        D3S_JQWidgets_Adapter.prototype._prepareVisualizationData = function () {

            var rowIndexes = Object.keys(this.aux.index2Datatypes);

            var datatypeTmp;
            for (var i = 0; i < this.$originalData.length; i++) {
                // fill each row
                var row = {};
                var trueIndex = null;
                for (var j = 0, length = rowIndexes.length; j < length; j++) {

                    trueIndex = rowIndexes[j]; //there could be different false virtual columns in different positions
                    datatypeTmp = this.aux.index2Datatypes[trueIndex];

                    if (this._isADatatypeWithoutConversion(datatypeTmp)) {
                        row[this.aux.ids[j]] =
                            (this.$originalData[i][trueIndex]) ? this.$originalData[i][trueIndex] : null;

                    } else if (this._isADatatypeCodeColumn(datatypeTmp)) {
                        this._createCode2LabelMap(this.$originalData[i], trueIndex);
                        row[this.aux.ids[j]] = this._getVisualizationLabel(this.$originalData[i][trueIndex], trueIndex);
                    } else {
                        //TODO: handle time and label
                        row[this.aux.ids[j]] =
                            (this.$originalData[i][trueIndex]) ? this.$originalData[i][trueIndex] : null;
                    }
                    this._handleColumnsForJQwidgets(i, j);
                }
                this.$visualizationData[i] = row;
            }
            this._setDataForJQXGrid();
        };


        D3S_JQWidgets_Adapter.prototype._getVisualizationLabel = function (code) {
            //TODO: create langauge expression to fill it
            return this.aux.code2label[code];
        };


        D3S_JQWidgets_Adapter.prototype._createCode2LabelMap = function (rowData, indexRow) {

            if (this._isLabelIntoVirtualColumn()) {
                this.aux.code2label[rowData[indexRow]] = rowData[this.aux.indexCodeColumn2indexVirtualColumn[indexRow]];
            }
            else if (this._isLabelIntoDistinct(indexRow)) {
                if (!this.aux.code2label[rowData[indexRow]]) {
                    this.aux.code2label[rowData[indexRow]] =
                        this._getLabelFromDistinct(this.$columns[indexRow].values.codes[0].codes, rowData[indexRow]);
                }

            } else if (this._isLabelIntoDomain(indexRow)) {

            } else {
                this.aux.code2label[rowData[indexRow]] = rowData[indexRow];
            }
        };


        D3S_JQWidgets_Adapter.prototype._getLabelFromDistinct = function (codesDistinct, codeToSearch) {
            for (var i = 0, length = codesDistinct.length; i < length; i++) {
                if (codesDistinct[i].code === codeToSearch) {
                    return codesDistinct[i].label[this.lang];
                }
            }
        };


        D3S_JQWidgets_Adapter.prototype._isLabelIntoDomain = function (indexCodeRow) {
            return false;
        };


        D3S_JQWidgets_Adapter.prototype._isLabelIntoVirtualColumn = function () {
            return this.aux.indexCodeColumn2indexVirtualColumn;
        };


        D3S_JQWidgets_Adapter.prototype._isLabelIntoDistinct = function (indexCodeRow) {
            return this.$columns[indexCodeRow].values.codes[0].codes[0].label;
        };


        D3S_JQWidgets_Adapter.prototype._isADatatypeCodeColumn = function (datatype) {
            return (datatype === 'code' || datatype === 'customCode')
        };


        D3S_JQWidgets_Adapter.prototype._setDataForJQXGrid = function () {
            this.dataSource.source = new $.jqx.dataAdapter({localdata: this.$visualizationData, datatype: "array"});
        };


        D3S_JQWidgets_Adapter.prototype._handleColumnsForJQwidgets = function (indexRow, indexColumn) {
            if (indexRow === 0) {
                var column = {};
                column.text = this.$titles[indexColumn];
                column.datafield = this.aux.ids[indexColumn]
                this.dataSource.columns.push(column);
            }
        };


        D3S_JQWidgets_Adapter.prototype._isADatatypeWithoutConversion = function (datatype) {

            return (datatype === 'number'
            || datatype === 'text' || datatype === 'boolean'
            || datatype === 'percentage' || datatype === 'enumeration')
        };


        D3S_JQWidgets_Adapter.prototype._validateData = function () {

            this.errors = {};

            return (Object.keys(this.errors).length === 0);
        };


        D3S_JQWidgets_Adapter.prototype._onValidateDataSuccess = function (config) {
            this.$gridRendered = true;
            this._createConfiguration(config);
            this._renderTable();
        };


        D3S_JQWidgets_Adapter.prototype._showConfigurationForm = function () {
            window.alert("FORM");
        };


        D3S_JQWidgets_Adapter.prototype._onValidateDataError = function () {
            this._showConfigurationForm();
        };


        D3S_JQWidgets_Adapter.prototype._createConfiguration = function (config) {

            this.config = (config.options) ? $.extend(true, config.options, this.dataSource) : $.extend(true, this.dataSource, baseConfig);

            this.config.ready = function () {
                amplify.publish(e.READY, this);
            };
        };


        D3S_JQWidgets_Adapter.prototype._renderTable = function () {

            var self = this;

            this.$container.jqxGrid(this.config);
        };


        D3S_JQWidgets_Adapter.prototype._initVariable = function () {

            this.$container = $(this.container).find(this.s.CONTENT);

            this.$metadata = this.model.metadata;
            this.$dsd = this.$metadata.dsd;
            this.$columns = this.$dsd.columns;
            this.$titles = [];
            this.$originalData = this.model.data || [];
            this.$visualizationData = [];
            this.$codelist = ($.isEmptyObject(this.codelist)) ? null : this.codelist;
        };


        D3S_JQWidgets_Adapter.prototype._validateInput = function () {

            this.errors = {};

            //Container
            if (!this.hasOwnProperty("container")) {
                this.errors.container = "'container' attribute not present.";
            }

            if ($(this.container).find(this.s.CONTENT) === 0) {
                this.errors.containe = "'container' is not a valid HTML element.";
            }

            //Model
            if (!this.hasOwnProperty("model")) {
                this.errors.model = "'model' attribute not present.";
            }

            if (typeof this.model !== 'object') {
                this.errors.model = "'model' is not an object.";
            }

            //Metadata
            if (!this.model.hasOwnProperty("metadata")) {
                this.errors.metadata = "Model does not container 'metadata' attribute.";
            }

            //DSD
            if (!this.model.metadata.hasOwnProperty("dsd")) {
                this.errors.dsd = "Metadata does not container 'dsd' attribute.";
            }

            //Columns
            if (!Array.isArray(this.model.metadata.dsd.columns)) {
                this.errors.columns = "DSD does not container a valid 'columns' attribute.";
            }

            //Option
            if (this.options && typeof this.options !== 'object') {
                this.error.options = "'options' is not an object.";
            }

            //Data
            /* if (!this.model.hasOwnProperty("data")) {
             this.errors.data = "Model does not container 'data' attribute.";
             }
             */
            return (Object.keys(this.errors).length === 0);
        };


        D3S_JQWidgets_Adapter.prototype._getLabel = function (obj, attribute) {

            var label,
                keys;

            if (obj.hasOwnProperty(attribute) && obj.title !== null) {

                if (obj[attribute].hasOwnProperty(this.lang)) {
                    label = obj[attribute][this.lang];
                } else {

                    keys = Object.keys(obj[attribute]);

                    if (keys.length > 0) {
                        label = obj[attribute][keys[0]];
                    }
                }
            }

            return label;
        };


        D3S_JQWidgets_Adapter.prototype._getLabelFromLabelDataType = function (obj) {

            var label, keys;

            if (obj.hasOwnProperty(this.lang)) {
                label = obj[this.lang];
            } else {

                keys = Object.keys(obj);

                if (keys.length > 0) {
                    label = obj[keys[0]];
                } else {
                    label = null;
                }

            }

            return label;
        };


        D3S_JQWidgets_Adapter.prototype._createCode2LabelMapOLD = function (column) {

            var map = {},
                values;

            switch (column.dataType) {
                case 'code' :
                    values = _.each(column.values.codes[0].codes, function (v) {
                        map[v.code] = this._getLabel(v, 'label');
                    }, this);
                    break;

                case 'customCode' :
                    values = _.each(column.values.codes[0].codes, function (v) {
                        map[v.code] = this._getLabel(v, 'label');
                    }, this);
                    break;

                case 'year' :
                case 'month':
                case 'date' :
                case 'time' :
                    values = _.each(column.values.timeList, function (v) {
                        map[v] = v;
                    }, this);
                    break;


                case 'label':
                    values = _.each(column.values.timeList, function (v) {
                        map[v] = this._getLabelFromLabelDataType(v);
                    }, this);

                    break;

            }


            return map;
        };


        D3S_JQWidgets_Adapter.prototype._getColumnBySubject = function (subject) {

            var id = this.aux.subject2id[subject],
                index;

            if (!id) {
                return;
            }

            index = this.aux.id2index[id];

            if (!index) {
                return;
            }

            return this.$columns.length > index ? this.$columns[index] : null;
        };


        D3S_JQWidgets_Adapter.prototype._getColumnIndexBySubject = function (subject) {

            _.each(this.$columns, function (column, i) {
                if (column.subject === subject) {
                    return i;
                }
            }, this);

            return -1;
        };


        D3S_JQWidgets_Adapter.prototype.destroy = function () {

            amplify.publish(e.DESTROY);
            this.$container.jqxGrid('destroy', this);
        };


        D3S_JQWidgets_Adapter.prototype.applyEvent = function (event) {

            if (typeof this.$container !== 'undefined' && this.$gridRendered) {
                this.$container.jqxGrid(event);
                return true;
            }
            console.error('it is not possible to apply the event: ' + event);
        };


        return D3S_JQWidgets_Adapter;
    });