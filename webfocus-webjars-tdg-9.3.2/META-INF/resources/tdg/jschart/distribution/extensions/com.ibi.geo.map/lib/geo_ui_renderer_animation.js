/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/


$.widget("ibi.geoUIAniRenderer", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
			layer: null,
			options: {
				density: 0.5,
				maxPathLength: 100,
				color : [0, 0, 255],
				trailLength: 200,
				flowSpeed: 10,
				trailWidth: 1.5,
				type: "flow"
			}	
        },
        _widgetClass:"map-wdg-animation-renderer",
       
        _create:function()
        {
            this._super();
			var othis=this;
			var markup = ibx.resourceMgr.getResource(".animation-renderer-box", false);
			othis.element.append(markup);
			ibx.bindElements(this.element);
			
		//	othis.element.addClass("esri-widget esri-widget--panel-height-only");
		//	othis.element.css({"width":"300px"});
			othis.element.find(".ibx-slider-body-start").add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".layers-box", othis.element).addClass("mlm-slider");
			
			othis._lwSlider=othis.element.find(".trailWidth-slider"); othis._densitySlider=othis.element.find(".density-slider");
			othis._llSlider=othis.element.find(".trailLength-slider");othis._lsSlider=othis.element.find(".flowSpeed-slider");		
			othis._maxPathLengthSlider=othis.element.find(".maxPathLength-slider");
			othis.color = othis.element.find(".mlm-color-colorpick"); othis.flowRepr=othis.element.find(".fromTo");
			othis.color.on("ibx_colorchange", othis.onLineColorChange.bind(this));
			othis.setControls();	
			othis.flowRepr.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
	                let checked=othis.flowRepr.ibxSwitch("checked");
					othis.updateRenderer($(e.target).ibxWidget("userValue"),checked ? "flow-from" : "flow-to");
				}
            });
			othis._lwSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
	                let value=Number(othis._lwSlider.ibxHSlider("option", "value").toFixed(1));
					othis.updateRenderer($(e.target).ibxWidget("userValue"),value);
				}
             });
			othis._densitySlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                 	let value=Number(othis._densitySlider.ibxHSlider("option", "value").toFixed(2));
					othis.updateRenderer($(e.target).ibxWidget("userValue"),value);
				}
             });
			othis._llSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                	let value=Number(othis._llSlider.ibxHSlider("option", "value").toFixed(2));
					othis.updateRenderer($(e.target).ibxWidget("userValue"),value);
				}
             });
			othis._lsSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
	                let value=Number(othis._lsSlider.ibxHSlider("option", "value").toFixed(2));
					othis.updateRenderer($(e.target).ibxWidget("userValue"),value);
				}
             });
			othis._maxPathLengthSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                	let value=Number(othis._maxPathLengthSlider.ibxHSlider("option", "value").toFixed(2));
					othis.updateRenderer($(e.target).ibxWidget("userValue"),value);
				}
             });
			
			
        },		
		onLineColorChange: function(e) {
			let data = e.originalEvent.data,
			tempRenderer = this.options.layer.renderer.clone();	
	        //tempRenderer[propName] = propValue;	          	
			
			this.element.find(".color-picker-swatch").css("background-color",
				this.options.ibgeo.setRendererColor(tempRenderer, "color", data.rgba));
			this.options.layer.renderer = tempRenderer;			
		},
		updateRenderer: function(propName, propValue) {
			if (propName && propValue != null) {
	          	var tempRenderer = this.options.layer.renderer.clone();	
	          	tempRenderer[propName] = propValue;
				var layer = this.options.layer;
				setTimeout(function(){ layer.renderer = tempRenderer; }, 10); 	          	
       		}
		},
		outsideUpdates: function(){
			this.suspendOutsideUpdates=false;
		},
		layer: function(layer) {
			if(layer) {
				this.options.layer=layer;
				this.setControls();
			}
			return this.options.layer;
		},
		setControls: function() {
			var othis=this;
					
			this._lwSlider.ibxHSlider("option","value",parseFloat(this.options.layer.renderer.trailWidth));
	
			this._densitySlider.ibxHSlider("option","value",parseFloat(this.options.layer.renderer.density));
			this._densitySlider.ibxHSlider("refresh");
			this._llSlider.ibxHSlider("option","value",parseInt(this.options.layer.renderer.trailLength,10));
			this._llSlider.ibxHSlider("refresh");
			this._lsSlider.ibxHSlider("option","value",parseInt(this.options.layer.renderer.flowSpeed,10));
			this._lsSlider.ibxHSlider("refresh");
			
			this._maxPathLengthSlider.ibxHSlider("option","value",parseFloat(this.options.layer.renderer.maxPathLength));
			this._maxPathLengthSlider.ibxHSlider("refresh");
		//	othis.flowRepr.find(".ibx-label-text").insertBefore(othis.flowRepr.find(".ibx-switch-ctrl"));
			this.flowRepr.ibxSwitch("checked", this.options.layer.renderer.flowRepresentation=="flow-from");
			var color={};
			this.options.ibgeo.getFromRendererColor(this.options.layer.renderer,"color",color);
			this.color.ibxColorPicker("option","color",color.hex);
			this.color.ibxColorPicker("option","opacity",color.opacity);
			
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

//# sourceURL=geo_ui_renderer_animation.js
