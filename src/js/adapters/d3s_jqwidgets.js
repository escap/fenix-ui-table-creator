/*global define*/
define([
        'jquery',
        'fx-c-c/config/adapters/d3s_jqwidgets',
        'underscore',
        'jqwidgets',
        'moment'
    ],
    function ($, baseConfig, _) {

        var defaultOptions = {

            lang: 'EN',

            s: {
                CONTENT: '[data-role="content"]'
            },

            dataSource: {
                source: {},
                columns : []
            },

            translation: {

            },

            aux: {
                ids: [],
                subjects: [],
                id2index: {},
                index2id: {},
                code2label: {},
                subject2id: {},
                id2subject: {},
                nameIndexes: [],
                id2Datatypes : {}
            }
        };

        function D3S_JQWidgets_Adapter() {
            $.extend(true, this, defaultOptions);
        }

        D3S_JQWidgets_Adapter.prototype.render = function (config) {
            $.extend(true, this, config);

            if (this._validateInput() === true) {
                this._initVariable();
                this._prepareData();
                if (this._validateData() === true) {
                    this._onValidateDataSuccess();
                } else {
                    this._onValidateDataError();
                }
            } else {
                console.error(this.errors);
                throw new Error("FENIX Chart creator has not a valid configuration");
            }
        };

        D3S_JQWidgets_Adapter.prototype._prepareData = function () {

            this.$columns.forEach(_.bind(function (column, index) {

                if (column.hasOwnProperty('id')) {
                    this.aux.id2index[column['id']] = index;
                    this.aux.index2id[index] = column['id'];
                    this.aux.ids.push(column['id']);

                    if (!column.hasOwnProperty('subject')) {
                        column['subject'] = column['id'];
                    }

                    if (column.hasOwnProperty('subject')) {
                        this.aux.subject2id[column['subject']] = column['id'];
                        this.aux.id2subject[column['id']] = column['subject'];

                        this.aux.subjects.push(column['subject']);

                        if (column.subject === "value") {
                            this.columnValueIndex = index;
                        }
                    }

                    if (column.hasOwnProperty('dataType')) {
                        this.aux.id2Datatypes[index] = column['dataType']
                    }
                }

                if (column.hasOwnProperty('values')) {
                    this.aux.code2label[column['id']] = this._createCode2LabelMap(column);
                }
                this.$titles.push( column.title[defaultOptions.lang] );

                this.aux.nameIndexes.push(index);

            }, this));


            if (this.columnValueIndex) {
                this._prepareDataForTableType();
            }
        };

        D3S_JQWidgets_Adapter.prototype._prepareDataForTableType = function () {

            var titlesLength = this.$titles.length;

            for(var i=0; i<this.$data.length; i++){
                var row = {};

                for(var j=0 ; j< titlesLength; j++){
                    // if data is not a number is a label
                    if(this.aux.id2Datatypes[j] != 'number') {
                        row[this.$titles[j]] =
                            (this.$data[i][j]) ?
                                this.aux.code2label[this.aux.index2id[j]][this.$data[i][j]] : null;
                    }else{
                        row[this.$titles[j]] =
                            (this.$data[i][j]) ?
                                this.$data[i][j] : null;
                    }
                       if( i==0) {
                           var column = {};
                           column['text'] = this.$titles[j];
                           column['datafield'] = this.$titles[j];
                           this.dataSource.columns.push(column)
                       }
                   }
                this.$originalDatasource[i] = row;
            }


            this.dataSource.source = new $.jqx.dataAdapter({localdata: this.$originalDatasource, datatype:"array"});
        };


        D3S_JQWidgets_Adapter.prototype._validateData = function () {

            this.errors = {};

            return (Object.keys(this.errors).length === 0);
        };

        D3S_JQWidgets_Adapter.prototype._onValidateDataSuccess = function () {
            this._createConfiguration();
            this._renderTable();
        };

        D3S_JQWidgets_Adapter.prototype._showConfigurationForm = function () {
            alert("FORM");
        };

        D3S_JQWidgets_Adapter.prototype._onValidateDataError = function () {
            this._showConfigurationForm();

        };

        D3S_JQWidgets_Adapter.prototype._createConfiguration = function () {
           this.config = $.extend(true, baseConfig,this.dataSource );
        };

        D3S_JQWidgets_Adapter.prototype._renderTable = function () {

            this.$container.jqxGrid(this.config);
        };

        D3S_JQWidgets_Adapter.prototype._initVariable = function () {

            this.$container = $(this.container).find(this.s.CONTENT);

            this.$metadata = this.model.metadata;
            this.$dsd = this.$metadata.dsd;
            this.$columns = this.$dsd.columns;
            this.$titles = [];
            this.$data = this.model.data;
            this.$originalDatasource = [];
        };

        D3S_JQWidgets_Adapter.prototype._validateInput = function () {

            this.errors = {};

            //Container
            if (!this.hasOwnProperty("container")) {
                this.errors['container'] = "'container' attribute not present.";
            }

            if ($(this.container).find(this.s.CONTENT) === 0) {
                this.errors['container'] = "'container' is not a valid HTML element.";
            }

            //Model
            if (!this.hasOwnProperty("model")) {
                this.errors['model'] = "'model' attribute not present.";
            }

            if (typeof this.model !== 'object') {
                this.errors['model'] = "'model' is not an object.";
            }

            //Metadata
            if (!this.model.hasOwnProperty("metadata")) {
                this.errors['metadata'] = "Model does not container 'metadata' attribute.";
            }

            //DSD
            if (!this.model.metadata.hasOwnProperty("dsd")) {
                this.errors['dsd'] = "Metadata does not container 'dsd' attribute.";
            }

            //Columns
            if (!Array.isArray(this.model.metadata.dsd.columns)) {
                this.errors['columns'] = "DSD does not container a valid 'columns' attribute.";
            }

            //Option
            if (this.options && typeof this.options !== 'object') {
                this.errors['options'] = "'options' is not an object.";
            }

            //Data
            if (!this.model.hasOwnProperty("data")) {
                this.errors['data'] = "Model does not container 'data' attribute.";
            }

            return (Object.keys(this.errors).length === 0);
        };

        //Utils
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
                    values = _.each(column.values.timeList, function (v) {
                        debugger;
                        map[v] = v;
                    }, this);
                    break;


            }

            // TODO  customCode,  enumeration, date, month, year, time, text,label, number, percentage, bool

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

        return D3S_JQWidgets_Adapter;
    });