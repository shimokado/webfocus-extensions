/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
$.widget("ibi.layer_ampers", $.ibi.ibxWidget, {
    describeFinished: function () { return true; }
});
if(typeof(WFGlobals) === 'undefined') {
	const WFGlobals = {};
	WFGlobals.language = "";
	WFGlobals.getSesAuthParm = () => "ses_auth_parm";
	WFGlobals.getSesAuthVal = () => "ses_auth_val";
	WFGlobals.isFeatureEnabled = () => true;
}


SharedUtil.isLazyLoading = function () { return false; }

const mockIbfs = {};
mockIbfs.describeFex = (name) => {
    const exInfo = {};
    return exInfo;
};

const pageUtilMock = {
    _page: $("<div>").layer_ampers(),
    _amperManager: null,
    getPage: function () { return this._page },
    getAmperManager: function () { return di.resolve('amperManager'); },
    refreshFexes: [],
    noRefreshFexes: [],
    // eslint-disable-next-line no-unused-vars
    resolveStringRes: function (str, element, name) { return str; },
    sm: new PageSelectionModel($(".df-filter-grid-pane-wrapper"), $(".df-filter-grid-pane-wrapper")),
    rebuildStylesheet: function () { },
    getTool: function () { return { find: () => $() } },
    getUniqueStringId: function (name, element, scope /* not used */, bPrefix) { id = name + '_' + PageUtil.nextStringIndex++; return bPrefix ? '@STR_' + id : id },
    getUserPage: function () { return false; },
    loadCustom: function () { },
    getRunBeforeDescribe: function () { return [] },
    getDescribeList: function () { return [] },
    bindNotRun: function () { },
    isDesignerFrameWork: function () { return true; },
	getRunBeforeDescribeAmperDefault: function () { return "" },
	getPageDefaults: function (){
		 return {
	        getFilterDefaults: function (){
	            return { 
	                "labelPosition" : "top",
	                "labelAlignment": "center",
	                "labelSplit" : "auto",
	                "labelWidth" : "max"
	        	};
	        },
	    };
	}
};
PageUtil.getPageUtil = function () {
    return pageUtilMock;
};
const amperManager = new ibxAmperManager(null, 'tokenName', 'tokenValue', mockIbfs);
    pageUtilMock._amperManager = amperManager;
    di.register('amperManager').instance(amperManager);
//# sourceURL=layer_ampers.js