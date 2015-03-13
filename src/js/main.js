/*global requirejs*/
requirejs(['./paths'], function (paths) {

    requirejs.config(paths);

    requirejs(['fx-t-c/start', 'amplify'], function (TableCreator) {


        var tableCreator = new TableCreator();

        amplify.subscribe('fx.component.table.ready', function () {
            console.log('created!')
            console.log(tableCreator.applyEvent('refresh'))
        })

       // $.get("http://faostat3.fao.org/d3s2/v2/msd/resources/uid/AFO_ProductionCapacities?dsd=true&full=true&order=time", function (model) {
        $.get("http://faostat3.fao.org/d3s2/v2/msd/resources/uid/CountrySTAT_fertilizer_demo?dsd=true&full=true&order=time", function (model) {
            tableCreator.render({
                container: '.content',
                model: model
                /*
                if you want to override the default configuration,
                options: {
                    sortable: true
                }
                */

            });
        })

    });
});