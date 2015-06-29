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
                index2Datatypes:{}
            }
        }, e = {
            DESTROY: 'fx.component.table.destroy',
            READY: 'fx.component.table.ready'
        };

        function D3S_JQWidgets_Adapter() {
            $.extend(true, this, defaultOptions);
        }

        D3S_JQWidgets_Adapter.prototype.render = function (config) {
            $.extend(true, this, config);

            if (this._validateInput() === true) {
                /*if(config.d3p){
                    this._prepareHiddenColumnsForD3P();
                }*/
                this._initVariable();
                this._prepareData();
                if (this._validateData() === true) {
                    this._onValidateDataSuccess(config);
                } else {
                    this._onValidateDataError();
                }
            } else {
                console.error(this.errors);
                throw new Error("FENIX Chart creator has not a valid configuration");
            }
        };


        D3S_JQWidgets_Adapter.prototype._prepareData = function () {

            console.log( this.$columns)
            debugger;

            this.$columns.forEach(_.bind(function (column, index) {

                if (column.hasOwnProperty('id')) {
                    this._setIDVariableAndcheckIfLabelColumn(column.id, index);


                    if (column.hasOwnProperty('subject')) {
                        this.aux.subject2id[column.subject] = column.id;
                        this.aux.id2subject[column.id] = column.subject;

                        this.aux.subjects.push(column.subject);

                        if (column.subject === "value") {
                            this.columnValueIndex = index;
                        }
                    }

                    if (column.hasOwnProperty('dataType')) {
                        this.aux.index2Datatypes[index] = column.dataType;
                        this.aux.id2Datatypes[column.id] = column.datatype;
                    }
                }

                if (column.hasOwnProperty('values')) {
                    this.aux.code2label[column.id] = this._createCode2LabelMap(column);
                }
                this.$titles.push(column.title[defaultOptions.lang]);

                this.aux.nameIndexes.push(index);

            }, this));

            if (this.columnValueIndex) {
                this._prepareDataForTableType();
            }
        };



        D3S_JQWidgets_Adapter.prototype._setIDVariableAndcheckIfLabelColumn  =function(idColumn, indexColumn) {

            this._checkAndSetIfLabelColumn(idColumn, indexColumn);
            this.aux.id2index[idColumn] = indexColumn;
            this.aux.index2id[indexColumn] = idColumn;
            this.aux.ids.push(idColumn);
        };
        
        
        D3S_JQWidgets_Adapter.prototype._checkAndSetIfLabelColumn = function(idLabel, indexLabel) {

            if( idLabel && idLabel!= null && idLabel.length >3) {
                
                var possibleIDCodeColumn =   idLabel.substring(0,idLabel.length-(1+3));
                
                if( this.aux.id2index[possibleIDCodeColumn] ===true) {
                    
                    if(!this.aux.indexCodeColumn2indexLabelColumn) {
                        this.aux.indexCodeColumn2indexLabelColumn = {};
                    }
                   
                    this.aux.indexCodeColumn2indexLabelColumn[this.aux.id2index[possibleIDCodeColumn]] = indexLabel;
                }
            }
        }

        D3S_JQWidgets_Adapter.prototype._prepareDataForTableType = function () {

            var titlesLength = this.$titles.length;

            for (var i = 0; i < this.$originalData.length; i++) {
                var row = {};
                for (var j = 0; j < titlesLength; j++) {
                    // if data is not a number is a label
                    if (this.aux.index2Datatypes[j] !== 'number' && this.aux.index2Datatypes[j] !== 'text' && this.aux.index2Datatypes[j] !== 'boolean' && this.aux.index2Datatypes[j] !== 'percentage' && this.aux.index2Datatypes[j] !== 'enumeration') {
                        row[this.aux.ids[j]] =
                            (this.$originalData[i][j]) ?
                                this.aux.code2label[this.aux.index2id[j]][this.$originalData[i][j]] : null;
                    } else {
                        row[this.aux.ids[j]] =
                            (this.$originalData[i][j]) ?
                                this.$originalData[i][j] : null;
                    }
                    if (i === 0) {
                        var column = {};
                        column.text = this.$titles[j];
                        column.datafield = this.aux.ids[j]



                        if(this.$hideColumns[column.datafield] !== true){
                            this.dataSource.columns.push(column);

                        }
/*
                        column.hidden = true;
*/
                    }
                }
                this.$visualizationData[i] = row;
            }

            this.dataSource.source = new $.jqx.dataAdapter({localdata: this.$visualizationData, datatype: "array"});
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
            this.$codelist = ($.isEmptyObject(this.codelist))? null: this.codelist;
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

        D3S_JQWidgets_Adapter.prototype._createCode2LabelMap = function (column) {

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

        D3S_JQWidgets_Adapter.prototype._prepareHiddenColumnsForD3P = function() {

           this.$hideColumns = {};
           var tempDSDColumns = this.model.metadata.dsd.columns;

            for(var i = 0, length = tempDSDColumns.length; i<length; i++) {
                if(tempDSDColumns[i].dataType == "code"){
                    this.$hideColumns[ tempDSDColumns[i].id] = true;
                }
            }
        };

        D3S_JQWidgets_Adapter.prototype._lookForD3PLabelColumnIndex = function(idToFind) {
            var tempDSDColumns = this.model.metadata.dsd.columns;
            for(var i = 0, length = tempDSDColumns.length; i<length; i++) {
                // -3 for _LN
                if(idToFind == tempDSDColumns[i].id.substr(0,tempDSDColumns[i].id.length -3))
                    return i;
            }
        }

        return D3S_JQWidgets_Adapter;
    });