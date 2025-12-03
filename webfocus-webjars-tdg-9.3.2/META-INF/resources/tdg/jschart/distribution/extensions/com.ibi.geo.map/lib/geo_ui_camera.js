/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/


$.widget("ibi.geoUICamera", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
			tilt: 0,
			fov: 55,
			heading: 0,
			elevation: 1000,
			longitude:0,
			latitude:0,
			maxElevation: 12000000000
        },

        _widgetClass:"map-wdg-camera",
       
        _create:function()
        {
            this._super();
			var othis=this;
			var markup = ibx.resourceMgr.getResource(".camera-box", false);
			othis.element.append(markup);
			ibx.bindElements(this.element);
			othis.suspendOutsideUpdates=false;
			othis.element.addClass("esri-widget esri-widget--panel-height-only");
			//othis.element.css({"width":"200px"});
			othis._fovSlider=othis.element.find(".fov-slider"); othis._headingSlider=othis.element.find(".heading-slider");
			othis._tiltSlider=othis.element.find(".tilt-slider");othis._zSlider=othis.element.find(".elevation-slider");
			othis._zSlider.ibxHSlider("option", "max", othis.options.maxElevation);
			$(othis._zSlider).hide();
			othis.element.find(".elevation-slider-lbl").hide();
			othis._latSlider=othis.element.find(".latitude-slider");othis._longSlider=othis.element.find(".longitude-slider"); 
			othis.element.find(".position-box").hide();
			othis.element.find(".ibx-slider-body-start").add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".layers-box", othis.element).addClass("mlm-slider");
			this.options.ibgeo.addWeatherWidget(this.element.find(".weather_widget"));
			this.options.ibgeo.addDaylightWidget(this.element.find(".daylight_widget"));
			let view=this.options.ibgeo.getCurrentView(), color={};
			//////////////
			this.color = othis.element.find(".mlm-color-colorpick");
			this.color.ibxColorPicker("option","color","#ffffff");
			this.color.ibxColorPicker("option","opacity",1);
			setTimeout(()=> {
				this.options.ibgeo.getEnvBackgroundColor(color);		
				if(color.hex)
					this.color.ibxColorPicker("option","color",color.hex);
				if(color.opacity)
					this.color.ibxColorPicker("option","opacity",color.opacity);
				this.color.on("ibx_colorchange", this.onBacgroundColorChange.bind(this));
			},1000);
			
			///////////////
			this.stars=othis.element.find(".mlm3d_env_stars");	
			this.stars.ibxSwitch("checked", view.environment.starsEnabled);
			this.atmosphereQ=this.element.find(".mlm3d_env_atmQ");
			this.lighting=this.element.find(".mlm3d_env_lighting");
			this.lighting.ibxSwitch("checked", view.environment.lighting && view.environment.lighting.type == 'virtual');
			this.lighting.on("ibx_change", (e) =>{
				if(!this.meSetting)
				this.options.ibgeo.toggleLightingType();
            });
			if(!view.environment.atmosphereEnabled)
			this.atmosphereQ.addClass("disabledwidget");
			this.stars.on("ibx_change", (e) =>{	
				if(!this.meSetting)
				this.options.ibgeo.toggleStars();
            });
//
			this.atmosphere=this.element.find(".mlm3d_env_atm");
			this.atmosphere.ibxSwitch("checked", view.environment.atmosphereEnabled);
			this.atmosphere.on("ibx_change", (e) =>{
				if(!this.meSetting) {
					let enabled = this.options.ibgeo.toggleAtmosphere();
					if(enabled)this.atmosphereQ.removeClass("disabledwidget");  
					else this.atmosphereQ.addClass("disabledwidget"); 
				}				
            });			
//
			this.atmosphereQ.ibxSwitch("checked", view.environment.atmosphere && view.environment.atmosphere.quality == 'high');
			this.atmosphereQ.on("ibx_change", (e) =>{
				if(!this.meSetting)
				this.options.ibgeo.toggleAtmosphereQuality();
            });
			othis._fovSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
	                var value=Number(othis._fovSlider.ibxHSlider("option", "value").toFixed(1));
					othis.options.ibgeo.updateCameraFov(value);
				}
             });
			othis._headingSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                var value=Number(othis._headingSlider.ibxHSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraHeading(value);
				}
             });
			othis._tiltSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                var value=Number(othis._tiltSlider.ibxHSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraTilt(value);
				}
             });
			othis._zSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                var value=Number(othis._zSlider.ibxHSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraHeight(value);
				}
             });
			othis._latSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                var value=Number(othis._latSlider.ibxHSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraLatitude(value);
				}
             });
			othis._longSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
					othis.suspendOutsideUpdates=true;
                var value=Number(othis._longSlider.ibxHSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraLongitude(value);
				}
             });
			othis.element.find(".showHidePosition").on('click', function(e){
              	let posBox=othis.element.find(".position-box"), bVis=posBox.is(":visible"), shBut=othis.element.find(".showHidePosition");
				if(bVis) {
					posBox.hide();
					shBut.removeClass("esri-icon-up");
					shBut.addClass("esri-icon-down");
				} 		
				else {
					othis.update();
					posBox.show();	
					shBut.removeClass("esri-icon-down");
					shBut.addClass("esri-icon-up");
										
				}	   
            });
			othis.element.find(".refresh").on('click', function(e){
              	othis.update();
            });
			othis.element.find(".showHideStars").on('click', function(e){
              	othis.options.ibgeo.toggleStars();
            });
			if(othis.options.elevation>othis.options.maxElevation)othis.options.elevation=othis.options.maxElevation;
			setTimeout(function(){
				othis.meSetting=true;
				othis.setSliders();
				setTimeout(function(){othis.meSetting=false;},100);
			},	100);			
        },		
		onBacgroundColorChange: function(e) {
			if(!this.meSetting) {
				let data = e.originalEvent.data;
				this.options.ibgeo.setViewBackground(data.rgba);
			}			
		},
		outsideUpdates: function(doit){
			this.suspendOutsideUpdates=doit ? true : false;
		},
		updateOtherSettings: function(willReset) {
			this.meSetting=true;
			let view=this.options.ibgeo.getCurrentView(), color={};
			this.options.ibgeo.getEnvBackgroundColor(color);	
			if(color.hex) this.color.ibxColorPicker("option","color",color.hex);
			else this.color.ibxColorPicker("option","color","#000000");
			if(color.opacity) this.color.ibxColorPicker("option","opacity",color.opacity);
			else this.color.ibxColorPicker("option","opacity",1);
			this.stars.ibxSwitch("checked", view.environment.starsEnabled);
			this.lighting.ibxSwitch("checked", view.environment.lighting && view.environment.lighting.type == 'virtual');
			this.atmosphere.ibxSwitch("checked", view.environment.atmosphereEnabled);
			this.atmosphereQ.ibxSwitch("checked", view.environment.atmosphere && view.environment.atmosphere.quality == 'high');	
			if(!willReset)
			setTimeout(()=>{this.meSetting=false;},100);		
		},
        update:function(){
			var othis=this;
			if(!othis.suspendOutsideUpdates){
				setTimeout(function(){
					othis.meSetting=true;
					othis.options.elevation=othis.options.ibgeo.getCameraHeight();
					othis.options.tilt=othis.options.ibgeo.getCameraTilt(), 
					othis.options.heading=othis.options.ibgeo.getCameraHeading(),
					othis.options.fov=othis.options.ibgeo.getCameraFov();
					othis.options.longitude=othis.options.ibgeo.getCameraLongitude();
					othis.options.latitude=othis.options.ibgeo.getCameraLatitude();
					if(othis.options.elevation>othis.options.maxElevation)othis.options.elevation=othis.options.maxElevation;
					othis.setSliders();		
					othis.updateOtherSettings(true);			
					setTimeout(function(){othis.meSetting=false;},100);
				},1000);	
			}			
		},
		
		setSliders: function() {
			var othis=this;
			
			othis._zSlider.ibxHSlider("option","value",parseInt(othis.options.elevation,10));
			othis._zSlider.ibxHSlider("refresh");
			othis._tiltSlider.ibxHSlider("option","value",parseInt(othis.options.tilt,10));
			othis._tiltSlider.ibxHSlider("refresh");
			othis._headingSlider.ibxHSlider("option","value",parseInt(othis.options.heading,10));
			othis._headingSlider.ibxHSlider("refresh");
			othis._fovSlider.ibxHSlider("option","value",parseInt(othis.options.fov,10));
			othis._fovSlider.ibxHSlider("refresh");
			
			othis._latSlider.ibxHSlider("option","value",parseInt(othis.options.latitude,10));
			othis._latSlider.ibxHSlider("refresh");
			othis._longSlider.ibxHSlider("option","value",parseInt(othis.options.longitude,10));
			othis._longSlider.ibxHSlider("refresh");
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

//# sourceURL=geo_ui_camera.js