/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/


$.widget("ibi.geoUIRouteLayer", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
            layer: null
        },

        _widgetClass:"map-wdg-route",
       
        _create:function()
        {
            this._super();
			var othis=this;
			var markup = ibx.resourceMgr.getResource(".route-box", false);
			othis.element.append(markup);
			ibx.bindElements(this.element);
			this.element.parent().css({"margin-left":0})
			/*
			<div class="btn-travel-type esri-widget--button gotolayer" tabindex="0" data-ibx-type="ibxButtonSimple" data-ibxp-align="center" data-ibxp-glyph-classes="ibx-icons ds-icon-move-to-target" title="@ibxString('mlmap.ZoomToLayer')"></div>
					<div class="btn-travel-type esri-widget--button updatedirectios" tabindex="0" data-ibx-type="ibxButtonSimple" data-ibxp-align="center" data-ibxp-glyph-classes="ibx-icons ds-icon-refresh" title="@ibxString('mlmap.refresh_layer')"></div>
					<div class="btn-travel-type esri-widget--button esri-icon-directions showdirections" tabindex="0" data-ibx-type="ibxButtonSimple" data-ibxp-align="center" title="@ib
					*/
			this._travelModesRadio=this.element.find(".mlm-travelTypeRadio");
			this.travelMode= this._travelModesRadio.ibxWidget("userValue");
			this._travelModesRadio.on("ibx_change", e => {
			//	this.updateUnitsMenu2();
				let trMode=this._travelModesRadio.ibxWidget("userValue"); 
				if(this.travelMode!=trMode){
					this.travelMode=trMode;
					this.options.ibgeo.updateDirections(this.options.layer, this.travelMode);
				}				
            });
			this._directions = this.element.find(".showdirections");
			this._directions.on("click", this.options.ibgeo.showDirections.bind(this.options.ibgeo,this.options.layer));
			this._goto = this.element.find(".gotolayer");
			this._goto.on("click", this.options.ibgeo.zoomToLayer.bind(this.options.ibgeo,this.options.layer.id));
			this._update = this.element.find(".updatedirectios");
			this._update.on("click", e => { this.options.ibgeo.updateDirections(this.options.layer, this.travelMode);});
        },		
		outsideUpdates: function(){
			this.suspendOutsideUpdates=false;
		},       
         _init:function()
        {
            this._super();
        },

        _destroy:function()
        {
            this._super();
        },

        _refresh:function()
        {
            var options = this.options;
            this._super();
        },

        /////////////////////////////////////////////////////
        // Canvas widget interface functions:
        getPropertiesPage: function ()
        {
            //return ibx.resourceMgr.getResource(".lyr-wdg-main");
        },
        initPropertiesPage: function (propPage)
        {
            // Set controls to the correct values,
            // and hook up the listeners
        },

        _setOption: function (key, value){
            this._super(key, value);
        },
    });

//# sourceURL=geo_ui_route_layer.js