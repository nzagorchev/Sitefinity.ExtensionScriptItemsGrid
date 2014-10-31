var masterGridView;
// called by the MasterGridView when it is loaded 
function OnModuleMasterViewLoaded(sender, args) {
    // the sender here is MasterGridView 
    masterGridView = sender;
    // initialize our extender
    dynamicModuleListViewExtender.init(sender);

    var binder = sender.get_binder();
    sender.get_itemsGrid()._binder._itemDataBoundHandler = customItemDataBound;
    binder.add_onDataBinding(handlerOnDataBinding);
};

function handlerOnDataBinding(sender, args) {
    var extender = dynamicModuleListViewExtender.get_extender();
    // get items taxa Ids
    extender.getItemsTagsIds(sender, args); // get tags
    extender.getItemsCitiesIds(sender, args);// get cities (custom classification)
}

function customItemDataBound(key, dataItem, itemIndex, itemElement) {
    var itemEventArgs = this._getItemEventArgs(key, dataItem, itemIndex, itemElement);
    var h = this.get_events().getHandler('onItemDataBound');

    // get taxa models and populate columns data for each item (row)
    var tags = dynamicModuleListViewExtender.get_extender()._tags;
    dynamicModuleListViewExtender.get_extender().setColumnData("tags", tags, itemIndex, itemElement);

    var cities = dynamicModuleListViewExtender.get_extender()._cities;
    dynamicModuleListViewExtender.get_extender().setColumnData("cities", cities, itemIndex, itemElement);

    // call base handlers
    if (h) h(this, itemEventArgs);
    return itemEventArgs;
}

// The extender object, which we will use to get the data
var dynamicModuleListViewExtender = (function () {
    this._extender = null;
    // initialize variables
    var extender = function (sender) {
        this._sender = sender,
        this._itemsTagsIds = [];
        this._tags = [];
        this._itemsCitiesIds = [];
        this._cities = [];
    }

    extender.prototype = {
        // get the items tags Ids - called on DataBinding
        getItemsTagsIds: function (sender, args) {
            this._itemsTagsIds = [];
            // all grid items, which will be bound
            var dataItems = args.get_dataItem().Items; 
            if (dataItems && dataItems.length > 0) {
                for (var i = 0; i < dataItems.length; i++) {
                    // get the tags Ids for each item from the property
                    var tags = dataItems[i].Tags;
                    // populate the associative array
                    this._itemsTagsIds.push(tags);
                }
            }

            if (this._itemsTagsIds) {
                // get the taxa items using the service
                this._tags = this.getTaxaData(this._itemsTagsIds);               
            }
        },
        // get the items cities (custom classification) Ids - called on DataBinding
        getItemsCitiesIds: function (sender, args) {
            this._itemsCitiesIds = [];
            var dataItems = args.get_dataItem().Items;
            if (dataItems && dataItems.length > 0) {
                for (var i = 0; i < dataItems.length; i++) {
                    var cities = dataItems[i].cities;
                    this._itemsCitiesIds.push(cities);
                }
            }

            if (this._itemsCitiesIds) {
                this._cities = this.getTaxaData(this._itemsCitiesIds);
            }
        },
        getTaxaData: function (ids) {
            var _self = this;
            // url to our service
            var taxaServiceUrl = "/Sitefinity/Services/TaxaService.svc/";
            // stringify the data to be sent
            var itemsData = JSON.stringify(ids);
            var items = null;
            // post request to get the data
            jQuery.ajax({
                type: "POST",
                async: false,
                url: taxaServiceUrl + "GetTaxaByIds",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: itemsData,
                success: function (data) {
                    items = data;
                },
                error: function (data) {
                    console.log(data);
                }
            });
            // return the taxa models
            return items;
        },
        // set the grid column content
        // selectorName: the selector to be used to find the column element (the id of the element in the column's client template
        // items: the taxa collection
        // itemIndex: the index of the items in the grid
        // itemElement: the item row element - the <tr> of the grid
        setColumnData: function (selectorName, items, itemIndex, itemElement) {
            var result = "";
            // check if there are any taxa for this item
            if (items[itemIndex]) {
                for (var i = 0; i < items[itemIndex].length; i++) {
                    // build the result string
                    result += items[itemIndex][i].Title + "; ";
                }
            }
            // find the grid row and column and set its content
            // example: tags column for first item in the grid -> #tags0
            jQuery(itemElement).find("#" + selectorName + itemIndex).html(result);
        }
    };

    return {
        get_extender: function () {
            if (this._extender) {
                return this._extender;
            }
            else {
                alert("extender not initialized");
            }
        },
        init: function (sender) {
            this._extender = new extender(sender);
            return this._extender;
        }
    }
}());