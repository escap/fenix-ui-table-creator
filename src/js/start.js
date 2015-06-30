/*global define*/
define([
        'require',
        'jquery',
        'fx-t-c/templates/base_template',
        'fx-t-c/adapters/d3s_jqwidgets'
    ],
    function (RequireJS, $) {

        'use strict';

        var defaultOptions = {
            default: ''
        };

        function TableCreator() {
            $.extend(true, this, defaultOptions);
        }

        TableCreator.prototype.render = function (config) {

/*
            config.model = this.testData();
*/
            if (this._validateInput(config)) {
                this.preloadResources(config);
            }
        };



        TableCreator.prototype.preloadResources = function (config) {

            var baseTemplate = this.getTemplateUrl(),
                adapter = this.getAdapterUrl(),
                self = this;

            RequireJS([
                baseTemplate,
                adapter
            ], function (Template, Adapter) {

                self.template = new Template();
                self.adapter = new Adapter();

                //currently both of them are sync fns
                self.template.render(config);
                self.adapter.render(config);
            });
        };

        TableCreator.prototype.getAdapterUrl = function () {
            //TODO add here adapter discovery logic
            return this.adapterUrl ? this.adapterUrl : 'fx-t-c/adapters/d3s_jqwidgets';
        };

        TableCreator.prototype.getTemplateUrl = function () {
            //TODO add here template discovery logic
            return this.templateUrl ? this.templateUrl : 'fx-t-c/templates/base_template';
        };

        TableCreator.prototype._validateInput = function () {
            return true;
        };

        TableCreator.prototype.destroy = function () {

            if (this.template) {
                this.template.destroy();
            }

            if (this.adapter) {
                this.adapter.destroy();
            }

        };

        TableCreator.prototype.applyEvent = function (event) {
            return this.adapter.applyEvent(event);
        };

        TableCreator.prototype.setCodelist = function(callback) {
            // TODO
        }


    /*    TableCreator.prototype.testData = function() {
            return {
                "metadata" : {
                    "creationDate" : 1429119544591,
                    "title" : {
                        "EN" : "Example of Kenya area harvested geographic distribution in 2008"
                    },
                    "uid" : "CSTAT_Kenya_AreaHarvested_PrimaryCrops_GeoDistribution_2008",
                    "dsd" : {
                        "columns" : [ {
                            "title" : {
                                "EN" : "Year"
                            },
                            "values" : {
                                "timeList" : [ 2008 ]
                            },
                            "domain" : {
                                "period" : {
                                    "from" : 2008,
                                    "to" : 2008
                                }
                            },
                            "subject" : "time",
                            "dataType" : "year",
                            "key" : true,
                            "id" : "Year"
                        }, {
                            "title" : {
                                "EN" : "Region"
                            },
                            "values" : {
                                "codes" : [ {
                                    "version" : "2014",
                                    "codes" : [ {
                                        "code" : "51325",
                                        "label" : {
                                            "EN" : "Central"
                                        }
                                    }, {
                                        "code" : "51326",
                                        "label" : {
                                            "EN" : "Coast"
                                        }
                                    }, {
                                        "code" : "51327",
                                        "label" : {
                                            "EN" : "Eastern"
                                        }
                                    }, {
                                        "code" : "51328",
                                        "label" : {
                                            "EN" : "Nairobi"
                                        }
                                    }, {
                                        "code" : "51329",
                                        "label" : {
                                            "EN" : "North Eastern"
                                        }
                                    }, {
                                        "code" : "51330",
                                        "label" : {
                                            "EN" : "Nyanza"
                                        }
                                    }, {
                                        "code" : "51331",
                                        "label" : {
                                            "EN" : "Rift Valley"
                                        }
                                    }, {
                                        "code" : "51332",
                                        "label" : {
                                            "EN" : "Western"
                                        }
                                    } ],
                                    "idCodeList" : "GAUL",
                                    "extendedName" : {
                                        "EN" : "Global administrative unit layer"
                                    }
                                } ]
                            },
                            "domain" : {
                                "codes" : [ {
                                    "version" : "2014",
                                    "idCodeList" : "GAUL",
                                    "extendedName" : {
                                        "EN" : "Global administrative unit layer"
                                    }
                                } ]
                            },
                            "subject" : "geo",
                            "dataType" : "code",
                            "key" : true,
                            "id" : "Region"
                        }, {
                            "title" : {
                                "EN" : "Product"
                            },
                            "values" : {
                                "codes" : [ {
                                    "codes" : [ {
                                        "code" : "0056",
                                        "label" : {
                                            "EN" : "Maize"
                                        }
                                    } ],
                                    "idCodeList" : "FAOSTAT_CommodityList",
                                    "extendedName" : {
                                        "EN" : "UAE Commodity List"
                                    }
                                } ]
                            },
                            "domain" : {
                                "codes" : [ {
                                    "idCodeList" : "FAOSTAT_CommodityList",
                                    "extendedName" : {
                                        "EN" : "UAE Commodity List"
                                    }
                                } ]
                            },
                            "subject" : "item",
                            "dataType" : "code",
                            "key" : true,
                            "id" : "Item"
                        }, {
                            "title" : {
                                "EN" : "Value"
                            },
                            "subject" : "value",
                            "dataType" : "number",
                            "key" : false,
                            "id" : "Value"
                        }, {
                            "title" : {
                                "EN" : "Unit"
                            },
                            "values" : {
                                "codes" : [ {
                                    "codes" : [ {
                                        "code" : "49",
                                        "label" : {
                                            "EN" : "Ha"
                                        }
                                    } ],
                                    "idCodeList" : "FAOSTAT_UM",
                                    "extendedName" : {
                                        "EN" : "Unit of measure codelist"
                                    }
                                } ]
                            },
                            "domain" : {
                                "codes" : [ {
                                    "idCodeList" : "FAOSTAT_UM",
                                    "extendedName" : {
                                        "EN" : "Unit of measure codelist"
                                    }
                                } ]
                            },
                            "subject" : "um",
                            "dataType" : "code",
                            "key" : false,
                            "id" : "Unit"
                        } ],
                        "rid" : "66_2",
                        "datasources" : [ "D3S" ],
                        "contextSystem" : "demoFENIX"
                    },
                    "meMaintenance" : {
                        "seUpdate" : {
                            "updateDate" : 1429340535929
                        }
                    },
                    "rid" : "12_20",
                    "meContent" : {
                        "resourceRepresentationType" : "dataset",
                        "seReferencePopulation" : {
                            "referenceArea" : {
                                "version" : "1.0",
                                "codes" : [ {
                                    "code" : "ADM1",
                                    "label" : {
                                        "EN" : "First level administrative boundaries"
                                    }
                                } ],
                                "idCodeList" : "GAUL_ReferenceArea",
                                "extendedName" : {
                                    "EN" : "GAUL reference area"
                                }
                            }
                        },
                        "seCoverage" : {
                            "coverageSectors" : {
                                "codes" : [ {
                                    "code" : "P",
                                    "label" : {
                                        "EN" : "Production"
                                    }
                                } ],
                                "idCodeList" : "CSTAT_Core",
                                "extendedName" : {
                                    "EN" : "Classification of CountrySTAT indicator -National core"
                                }
                            },
                            "coverageGeographic" : {
                                "version" : "2014",
                                "codes" : [ {
                                    "code" : "133",
                                    "label" : {
                                        "PT" : "Quênia",
                                        "FR" : "Kenya",
                                        "AR" : "كينيا",
                                        "EN" : "Kenya",
                                        "RU" : "Кения",
                                        "ES" : "Kenya",
                                        "ZH" : "肯尼亚"
                                    }
                                } ],
                                "idCodeList" : "GAUL0",
                                "extendedName" : {
                                    "EN" : "Global administrative unit layer country level"
                                }
                            }
                        },
                        "resourceRepresentationTypeLabel" : {
                            "EN" : "Dataset"
                        }
                    }
                },
                "data" : [ [ 2008, "51326", "0056", 92139.0, "49" ], [ 2008, "51327", "0056", 508135.0, "49" ], [ 2008, "51325", "0056", 146383.0, "49" ], [ 2008, "51332", "0056", 238009.0, "49" ], [ 2008, "51329", "0056", 3606.0, "49" ], [ 2008, "51328", "0056", 1682.0, "49" ], [ 2008, "51331", "0056", 549448.0, "49" ], [ 2008, "51330", "0056", 254355.0, "49" ] ],
                "size" : 8
            }
        }*/

        return TableCreator;
    });