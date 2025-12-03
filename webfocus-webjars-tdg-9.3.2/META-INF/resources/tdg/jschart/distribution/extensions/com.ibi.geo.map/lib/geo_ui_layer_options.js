/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
$.widget("ibi.geoUILayerOptions", $.ibi.ibxVBox,
    {
        options:{
            ibgeo: null,
            layer: null,
			settings: {},
            labelCB: null,
            valueCB:null,
            labelField: null,
            valueField:null,
			stretchType: "standard-deviation",
			bSettingSlider: true,
			_ampers:[]
        },
		
        _widgetClass:"lyr-options-wrapper",
		doUpdateRenderer: function () {
			if(this.options.layer.type=="imagery-tile") {				
				var othis=this, strSlider=othis.element.find($(".stretch-slider")), 
							strSliderRange=othis.element.find($(".stretch-slider-range"));
				othis.options.ibgeo.doUpdateRenderer(othis.options.layer, othis.options.stretchType,
						othis.options.stretchType=="standard-deviation" ? strSlider : strSliderRange);
			}
		},
		//{"ibgeo": othis, "layer": layer, "settings" :set  }
		refreshWidget: function(obj) {
			var othis=this;
			othis.options.layer=obj.layer;
			othis.options.settings=obj.settings;
			if(othis.options.layer.geometryType === "point")
				othis.updateTypeMenu();
			othis.options.ibgeo.setRefreshLayerOptions(othis.options.layer.id, othis);
			othis.updateTypeVisibility();
		},
		updateTypeMenu: function(){
			var othis=this,typeMenu = othis.element.find(".typeMenu"),
			selOpt=othis.element.find("#std-type");
			if(othis.options.layer.renderer){
				othis.createHeatmapSettings(othis.options.layer.renderer.type === "heatmap");
                if(othis.options.layer.renderer.type === "heatmap") {					
                    othis.options.heatmapRenderer=othis.options.layer.renderer;
                    selOpt=othis.element.find("#htm-type");                    
                }  
                else if(othis.options.layer.featureReduction)
                    selOpt=othis.element.find(othis.options.layer.featureReduction.type == "cluster" ? "#cls-type" : "#bin-type"); 
                
                if(othis.options.layer.renderer.type != "heatmap") {					
                    if(othis.options.settings.defaultRenderer && othis.options.settings.defaultRenderer.type==="heatmap"){
                        othis.options.heatmapRenderer=othis.options.settings.defaultRenderer;
                    }
                    else if(othis.initialRenderer && othis.initialRenderer.type==="heatmap")
                        othis.options.heatmapRenderer=othis.initialRenderer;
                    othis.options.settings.defaultRenderer=othis.options.layer.renderer;   
                }  
                else if(othis.options.settings.defaultRenderer && othis.options.settings.defaultRenderer.type==="heatmap"){
                    othis.options.heatmapRenderer=othis.options.settings.defaultRenderer;
                    othis.options.settings.defaultRenderer=othis.initialRenderer;
                }        
            }  
            
            othis.init=true;
            typeMenu.ibxSelect("selected", selOpt); 
		},		
		styleTextBox: function(inputs) {
			var othis=this;
			inputs.addClass("esri-input titleEdit");
			inputs.find("input").css({"background-color":"transparent", "border-style":"none"});
			$(inputs.find("input")).on("keyup", function(e){
                if(e.which == 13){
	                othis.options.ibgeo.doRefreshLayer(othis.options.layer.id,-1, othis); 
                }
			});			
		},
		isTypeMenu: function(){
			return this.options.layer.geometryType === "point" && this.options.layer.renderer;
		},
		isHMEnabled: function(){
			return this.options.layer.type == 'feature' || this.options.layer.type == 'ogc-feature' || this.options.layer.type == 'csv' 
			|| this.options.layer.type == 'geojson' || this.options.layer.type == 'wfs'
		},
		doUpdateStrSlider: function(bFirst) { //
			var othis=this, strSlider=othis.element.find($(".stretch-slider")), 
						strSliderRange=othis.element.find($(".stretch-slider-range"));
			if(bFirst){
				strSlider.on("ibx_change", function(e){
			        if(!othis.options.bSettingSlider)
			        	othis.doUpdateRenderer();
			   });
				strSliderRange.on("ibx_change", function(e){
			        if(!othis.options.bSettingSlider)
			        	othis.doUpdateRenderer();
			   });
			}
			othis.options.bSettingSlider=true;
			switch (othis.options.stretchType) {
	            case "min-max":
					var bandStat = othis.options.layer.rasterInfo.statistics[0], vals=othis.options.layer.renderer.statistics[0];
					strSliderRange.ibxRange("option", "min", bandStat.min*2);
					strSliderRange.ibxRange("option", "max", bandStat.max*2);
					strSliderRange.ibxRange("option", "step", 1);
	                strSliderRange.ibxRange("option", "value", Array.isArray(vals) && vals.length ? vals[0] : bandStat.min);
					strSliderRange.ibxRange("option", "value2", Array.isArray(vals) && vals.length ? vals[1] : bandStat.max);
					strSlider.hide();
					strSliderRange.show();
					strSliderRange.ibxRange("refresh");
	              break;
	            case "standard-deviation":
					strSlider.ibxSlider("option", "min", 1);
					strSlider.ibxSlider("option", "max", 10);
					strSlider.ibxSlider("option", "step", 1);
					strSlider.ibxSlider("option", "value", othis.options.layer.renderer.numberOfStandardDeviations || 1);
					strSliderRange.hide();
					strSlider.show();
					strSlider.ibxSlider("refresh");
	              break;
	            case "percent-clip":
					strSliderRange.ibxRange("option", "min", 0);
					strSliderRange.ibxRange("option", "max", 30);
					strSliderRange.ibxRange("option", "step", 1);
	                strSliderRange.ibxRange("option", "value", othis.options.layer.renderer.minPercent);
					strSliderRange.ibxRange("option", "value2", othis.options.layer.renderer.maxPercent);
					strSlider.hide();
					strSliderRange.show();
					strSliderRange.ibxRange("refresh");
	              break;
	        }
			if(!bFirst)
               othis.doUpdateRenderer();	        
			othis.options.bSettingSlider=false;
		},
		updateTypeVisibility: function() {
						/*
			var clsOpt = $("<div id=cls-type></div>").ibxSelectItem({"align": "stretch", "userValue":"clsLook"});
                clsOpt.ibxSelectItem("option", "text", getTransString('Cluster'));

				var binOpt = $("<div id=bin-type></div>").ibxSelectItem({"align": "stretch", "userValue":"binLook"});
                binOpt.ibxSelectItem("option", "text", getTransString('binned'));

		
				{
					typeMenu.ibxSelect("addControlItem",clsOpt);
					typeMenu.ibxSelect("addControlItem",binOpt);
				}                */
			var typeMenu = this.element.find(".typeMenu"), view3d=this.options.ibgeo.is3dView(), 
			options=typeMenu.ibxSelect("controlItems");
			for(let i = 0; i<options.length; i++) {
				let item=options.eq(i), val=item.ibxSelectItem("userValue");
				if(val=="clsLook" || val=="binLook") {
					if(view3d) item.hide();
					else item.show();
				}
			}	
		},
		updateLabelVisibility: function()
		{
			var othis=this;
			switch(othis.options.userValue)
            {
                case "stdLook":
                    {
                		if(othis.options.labelCluster) othis.options.labelCluster.hide();
                		if(othis.options.valueCB) othis.options.valueCB.show();
                        if(othis.options.labelCB) othis.options.labelCB.show();
                        break;	
                    }
                case "htmLook":
                    {         
	                	if(othis.options.labelCluster) othis.options.labelCluster.hide();
	                	if(othis.options.valueCB)othis.options.valueCB.hide();
	                	if(othis.options.labelCB)othis.options.labelCB.hide();
                        break;	
                    }
                
                case "clsLook":
				case "binLook":
                    {						
	                	if(othis.options.labelCluster){
							var fr=othis.options.layer.featureReduction;
            				othis.options.labelCluster.ibxCheckBoxSimple('checked', fr ? fr.labelsVisible : false);
							othis.options.labelCluster.show();
						}
						
	                	if(othis.options.valueCB)othis.options.valueCB.hide();
	                	if(othis.options.labelCB)othis.options.labelCB.hide();
                        break;	
                    }
            }
			if(this.binBox) {
				if(this.options.userValue=="binLook") {
					this.binBox.show();
					this.fixedBinSlider.ibxHSlider("option","value",parseInt(this.options.settings.component.featureReductionBin.fixedBinLevel,10));
					this.fixedBinSlider.ibxHSlider("refresh");
				}					
				else this.binBox.hide();
			}			
		},
        doAction: function () {
            var othis=this; 
            //reset first
            othis.options.ibgeo.hideTooltips();
            if(othis.options.userValue=="clsLook" && othis.options.layer.featureReduction && othis.options.layer.featureReduction.type=="cluster") {
                othis.init=false; othis.updateLabelVisibility();
                return;
            }    
			if(othis.options.layer.renderer.type=="unique-value" && othis.options.layer.renderer.defaultSymbol)
				othis.options.layer.renderer.defaultSymbol=null;
            if(othis.options.layer.featureReduction && !othis.init) {
                othis.options.settings.component.featureReduction=othis.options.layer.featureReduction;
                othis.options.layer.featureReduction=null;                                     
                othis.options.layer.renderer = othis.options.settings.defaultRenderer=
                    othis.updateSizeVisualVar(!othis.options.settings.sizeVisVar ? othis.options.settings.defaultRenderer : othis.options.layer.renderer,false);   
                
                if(othis.options.userValue=="stdLook") {
                	othis.updateLabelVisibility();
                    return;  
                }                                                                                         
            }
            switch(othis.options.userValue)
            {
                case "stdLook":
                    {
						if(this.heatmapSettings)this.heatmapSettings.hide();
                        if(othis.options.settings.defaultRenderer && othis.options.settings.defaultRenderer.type != "heatmap")
                            othis.options.layer.renderer = othis.options.settings.defaultRenderer;                       
                        if(othis.options.layer.renderer.type == "heatmap"){
                           // if(!othis.options.heatmapRenderer)
                            othis.options.heatmapRenderer=othis.options.layer.renderer;
                            if(othis.options.settings.defaultRenderer)
                                othis.options.layer.renderer = othis.options.settings.defaultRenderer;                     
                        }	
                        break;	
                    }
                case "htmLook":
                    { 
						if(this.heatmapSettings)this.heatmapSettings.show();
                        if(othis.options.heatmapRenderer)
                            othis.options.layer.renderer = othis.options.heatmapRenderer;
                        else {
							this.heatmapSettings.geoUIHeatmapSettings("updateHeatmapRenderer");
	
                 //           othis.options.ibgeo.createHeatmapRenderer(othis.options.layer, null, othis.options.heatmapRenderer,null);
                        }   
                    //    setTimeout(function(){othis.options.layer.legendEnabled=true;},1500);  
                        break;	
                    }
                
                case "clsLook":
				case "binLook":
                    {
						if(this.heatmapSettings)this.heatmapSettings.hide();
                        var isHM= othis.options.layer.renderer.type == "heatmap";
                        if(isHM){
                            if(!othis.options.heatmapRenderer)
                                othis.options.heatmapRenderer=othis.options.layer.renderer;                 
                        }
                        if(!othis.init) {    
							if(!othis.options.settings.component || !othis.options.settings.component.featureReductionCluster)       
								othis.options.ibgeo.setClustering(othis.options.settings,  othis.options.layer)                
                            if(othis.options.settings.component && othis.options.settings.component.featureReductionCluster &&
								 othis.options.settings.component.featureReductionBin) {
                             //   othis.options.layer.legendEnabled=false;
                                var renToUse=isHM ? othis.options.settings.defaultRenderer : othis.options.layer.renderer;
                                if(renToUse.type=="heatmap")
                                    renToUse= othis.initialRenderer;
                                othis.options.layer.renderer = othis.updateSizeVisualVar(renToUse,othis.options.userValue == "clsLook");
								othis.options.layer.featureReduction=othis.options.userValue == "clsLook" ?
								 othis.options.settings.component.featureReductionCluster : othis.options.settings.component.featureReductionBin; 
								if(othis.options.userValue == "clsLook")
									othis.options.ibgeo.onUpdateFieldAlias(othis.options.layer);
							//	setTimeout(()=>{othis.doUpdateClusterLabel();},10)
                            }
                        }                       
                        break;	
                    }
                
            }      
            othis.updateLabelVisibility();
            othis.init=false;      
        },
		createHeatmapSettings: function(bshow) {
			this.heatmapSettings= $("<div class='lyr-opacity-box' >").ibxVBox({'justify': "center", 'align': 'center'});
			this.element.ibxWidget("add", this.heatmapSettings, this.element.find(".typeMenu").next());
			this.heatmapSettings.geoUIHeatmapSettings({"ibgeo": this.options.ibgeo, "layer": this.options.layer }); 
			if(!bshow)this.heatmapSettings.hide();
		},
		createAnimationSettings: function(bshow) {
			this.animationSettings= $("<div class='lyr-opacity-box' >").ibxVBox({'justify': "center", 'align': 'center'});
			this.element.ibxWidget("add", this.animationSettings, this.element.find(".typeMenu").next());
			this.animationSettings.geoUIAniRenderer({"ibgeo": this.options.ibgeo, "layer": this.options.layer }); 	
			if(!bshow)this.animationSettings.hide();		
		},
        updateSizeVisualVar : function (renderer, bRemove) {
            var bFound=false, othis =  this;
            var retRen=renderer.clone();
            var vvars=renderer.visualVariables, vvarsT=[];
            if(renderer.visualVariables) {                
                for(var i = 0; i < vvars.length; i++) {                    
                    if(vvars[i].type == "size") {
                        bFound=true;
                        if(!bRemove)
                            vvarsT.push(vvars[i]);
                        if(!othis.options.settings.sizeVisVar)
                            othis.options.settings.sizeVisVar=vvars[i]
                        break;
                    }
                    else 
                        vvarsT.push(vvars[i]);
                }
            }
            if(!bRemove && !bFound && othis.options.settings.sizeVisVar)
                vvarsT.push(othis.options.settings.sizeVisVar);
            retRen.visualVariables=vvarsT;
            return retRen;
        },
		doAnimationChanged: function (ctrl) {
			let state = ctrl.ibxSwitch("checked");
			var vis=this.options.layer.visible && state;
			if(vis)
				this.options.layer.visible=false;
			if(state) {
				this.options.layer.renderer=this.animationRenderer;
				this.animationSettings.geoUIAniRenderer("layer",this.options.layer);
				this.animationSettings.show();
			//	this.options.ibgeo.animationWidget(true,this.options.layer);
			}
			else {
				this.animationRenderer=this.options.layer.renderer.clone();
		//		this.options.ibgeo.animationWidget(this.options.layer, true);
				this.options.layer.renderer=this.options.settings.defaultRenderer.clone();
				this.animationSettings.hide();				
			}
			if(vis) {
				var othis=this;
				setTimeout(function(){othis.options.layer.visible=true;}, 50); 
			}
		},
        _create:function()
        {
            this._super();
            var othis =  this;

            othis.element.id = othis.options.layer.id+"_opacityBox";
			othis.initialRenderer=othis.options.layer.renderer;
            var lyr = othis.options.ibgeo.getCurrentMap().findLayerById(othis.options.layer.id);
            var _lyrOpacityLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('Opacity')});
            var _lyrOpacitySlider = $("<div class='lyr-slider multiLayerMapSlider' data-ibxp-popup-value='true'>").ibxSlider({
                "orientation":"horizontal",
                "align": "stretch",
                "markerShape": "circle",
                "max": 1,
                "min": 0,
                "step": 0.01,
                "lock": false,
                "value": lyr.opacity,
                "popupValue": true,
                "precision": 1
            });
			othis.element.find('.filters-box').hide(); 
			if((othis.options.ibgeo.isDevelopmentMode() && othis.options.settings && othis.options.settings.dataLayer)/* || 
					(othis.options.ibgeo.isBookmarksEnabled() && othis.options.layer.type != "stream")*/){
				var _editTTl = $("<div class='lyr-opacity-box titleEditBox'>").ibxHBox({'justify': "center", 'align': 'center'}),
				_ttlLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('title')});
				othis.dataLayerTitle = $("<div class='titleEdit esri-input'></div>").ibxTextField();
				othis.dataLayerTitle.find("input").addClass("myEdit");
	     		_editTTl.ibxWidget("add", $(_ttlLbl));
				_editTTl.ibxWidget("add", $(othis.dataLayerTitle));
	            othis.element.ibxWidget("add", ($(_editTTl)));
				othis.dataLayerTitle.ibxWidget("value",othis.options.layer.title);
				othis.dataLayerTitle.on("change", this.doDataLayerTitle.bind(this, othis.dataLayerTitle));
			}
			var _goto=null, _saveto=null;
		//	if(othis.options.layer.type != "stream") {
              var _goToBox = $("<div class='lyr-opacity-box'>").ibxHBox({'justify': "center", 'align': 'center'});
              _goto=$("<div id=full-extent class='esri-layer-list__item-title'></div>").ibxButton({"glyphClasses":"ds-icon-move-to-target","text":getTransString('ZoomToLayer')}),
			  _saveto=$("<div title='"+getTransString('saveas')+"'class='esri-layer-list__item-title btn-RefreshLayer'></div>").ibxButton({"glyphClasses":"ds-icon-save"/*,"text":getTransString('saveas')*/});
              _goToBox.ibxWidget("add", $(_goto));
			  if(typeof(othis.options.layer.saveAs)==='function' && (this.options.settings.component.save2portal || othis.options.layer.portalItem || othis.options.layer.url))
				_goToBox.ibxWidget("add", $(_saveto));
          
              othis.element.ibxWidget("add", ($(_goToBox)));
	//		}
	//		else {
				let _refreshBox = $("<div class='lyr-opacity-box'>").ibxHBox({'justify': "center", 'align': 'center'});			
				_refLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('update_interval')}),
				updInt=othis.options.layer.updateInterval/1000,
				_intSpin=$("<div tabIndex='0' class='widgetPosition-spinner esri-input'></div").ibxSpinner({'min':1,'max':60,'value':updInt});
				_refreshBox.ibxWidget("add", _refLbl);
				_refreshBox.ibxWidget("add", _intSpin);
				_intSpin.on("ibx_change", othis.doRefreshIntChanged.bind(this,_intSpin));
				var _spfilter=$("<div title='"+getTransString('spatial_filter_add')+"' id=play_refresh class='esri-layer-list__item-title btn-RefreshLayer'></div>").
                            ibxButton({"glyphClasses":"ds-icon-add-filter"/*,"text":getTransString('Refresh Layer')*/});
                _refreshBox.ibxWidget("add", _spfilter);
		//		_spfilter.removeClass("ibx-button"); _spfilter.addClass("esri-widget--button"); 
			//	_spfilter.css({"color": "inherit", "margin-left":5,"margin-right":10, "max-width": 5});
			if(othis.options.layer.type == "stream") {
                $(_spfilter).on('click', function(e){
                    let btn = $(this), view=othis.options.ibgeo.getCurrentView();
						view.whenLayerView(othis.options.layer).then((streamLayerView) => {
            				if(streamLayerView.featureEffect == null) {
								btn.find(".ibx-label-glyph").removeClass("ds-icon-add-filter");
                    			btn.find(".ibx-label-glyph").addClass("ds-icon-filter");
								btn.attr("title", getTransString('spatial_filter_clear'));
								othis.options.ibgeo.addSpatialFilter(othis.options.layer);
							}
							else {
								btn.find(".ibx-label-glyph").removeClass("ds-icon-filter");
								btn.find(".ibx-label-glyph").addClass("ds-icon-add-filter");
								btn.attr("title", getTransString('spatial_filter_add'));
								streamLayerView.featureEffect =othis.options.ibgeo.spatialFilterLayerID= null;
								othis.options.ibgeo.removeGraphicByPrivateId(othis.options.layer.id); 
								//view.graphics.remove(othis.options.layer.spatialGraphic);
							}
                  		});                        
                      //  othis.options.ibgeo.doRefreshLayer(othis.options.layer.id,othis.options.settings.component.refreshInt, othis); 
                }); 
				othis.element.ibxWidget("add", _refreshBox);
			}
              if(othis.options.ibgeo.isLayerAnimationReady(othis.options.layer)) {
					let aniSw = $("<div title='"+getTransString('animation')+"' class='animation'>").ibxSwitch({ "switchPosition": "right" });
					_goToBox.ibxWidget("add", $(aniSw));
					if(othis.options.layer.renderer.type!="flow")	{
						othis.options.settings.defaultRenderer=othis.options.layer.renderer.clone();						
						othis.animationRenderer=othis.options.ibgeo.getDefaultAnimationRenderer();
					}
					else
						othis.animationRenderer=othis.options.layer.renderer.clone();
					aniSw.ibxSwitch("checked", othis.options.layer.renderer.type=="flow");
					aniSw.on("ibx_change", othis.doAnimationChanged.bind(this, aniSw));		
				}
				if(othis.options.layer.geometryType=='polyline') {
					othis.routs=$("<div title='"+getTransString('direction')+"' style='margin-left:5px'></div>").ibxButton({class: "btn-routs btn-RefreshLayer", glyphClasses:"ds-icon-line-points"});
              		_goToBox.ibxWidget("add", othis.routs);
             // 		othis.routs.removeClass("ibx-button"); othis.routs.addClass("esri-widget--button");othis.routs.css({"color": "inherit"});
					othis.routs.on('click', function(e){
		                othis.options.ibgeo.generateRoutings(othis.options.layer);
					//	othis.routs.hide();
		            });
				}
				var _lyrOpacityBox = $("<div class='lyr-opacity-box'>").ibxVBox({'justify': "center", 'align': 'center'});
              _lyrOpacityBox.ibxWidget("add", $(_lyrOpacityLbl));
              _lyrOpacityBox.ibxWidget("add", $(_lyrOpacitySlider));
              othis.element.ibxWidget("add", ($(_lyrOpacityBox)));
				if(othis.options.ibgeo.isLayerAnimationReady(othis.options.layer))
					othis.createAnimationSettings(othis.options.layer.renderer.type=="flow");
		    var bSat=othis.options.ibgeo.isSatelliteLayer(this.options.layer);
			
            if(!bSat && othis.isTypeMenu()){  
               var _toggleBox = $("<div class='lyr-layer-look-box'>").ibxVBox({'justify': "center", 'align': 'center'});
               var _typeLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('Type')});

               var typeMenu = $("<div tabindex='0' title='"+getTransString('Type')+"'></div>").ibxSelect({userValue:"cmdLookType", 
                    class: "cmd-look-type typeMenu", readonly: true});
                
                var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":"stdLook"});
                stdOpt.ibxSelectItem("option", "text", getTransString('Marker'));
                typeMenu.ibxSelect("addControlItem",stdOpt);
				if(this.isHMEnabled()) {
					var hmOpt = $("<div id=htm-type></div>").ibxSelectItem({"align": "stretch", "userValue":"htmLook"});
                	hmOpt.ibxSelectItem("option", "text", getTransString('Density'));
                	typeMenu.ibxSelect("addControlItem",hmOpt);
				}  
				var clsOpt = $("<div id=cls-type></div>").ibxSelectItem({"align": "stretch", "userValue":"clsLook"});
                clsOpt.ibxSelectItem("option", "text", getTransString('Cluster'));

				var binOpt = $("<div id=bin-type></div>").ibxSelectItem({"align": "stretch", "userValue":"binLook"});
                binOpt.ibxSelectItem("option", "text", getTransString('binned'));

			//	if(/*othis.options.layer.renderer.type !="pie-chart" &&*/ !othis.options.ibgeo.is3dView()) 
				{
					typeMenu.ibxSelect("addControlItem",clsOpt);
					typeMenu.ibxSelect("addControlItem",binOpt);
				}                
                _toggleBox.ibxWidget("add", _typeLbl);
                _toggleBox.ibxWidget("add", typeMenu);
                othis.element.ibxWidget("add", _toggleBox);
                $(typeMenu).on("ibx_change", function(e, data){
					var userValue = $(e.target).ibxWidget("userValue");
                    othis.options.userValue=userValue;
                    othis.doAction(); 
				});
				othis.updateTypeMenu();
				styleSelectBox(typeMenu);           
            }
            var dataLabel=othis.options.ibgeo.getDataLabel(othis.options.layer.id);
              othis.options.labelOrgVisible=dataLabel.labelOrgVisible;
              if(dataLabel && dataLabel.hasOwnProperty("labelField") && dataLabel.labelField) {
                  othis.options.labelCB=othis.addCheckBox(getTransString('Show_Label'), othis.doUpdateDataLabel.bind(this));
                  othis.options.labelField=dataLabel.labelField;                
              }
              if(dataLabel && dataLabel.hasOwnProperty("valueField") && dataLabel.valueField) {
                  othis.options.valueCB=othis.addCheckBox(getTransString('Show_Value'), othis.doUpdateDataLabel.bind(this));
                  othis.options.valueField=dataLabel.valueField;                
              } 
              if(!bSat && othis.isTypeMenu() && othis.options.layer.geometryType === "point") {
            	othis.options.labelCluster=othis.addCheckBox(getTransString('Show_Features_Count'), othis.doUpdateClusterLabel.bind(this));
            	var fr=othis.options.layer.featureReduction || (othis.options.settings.component ? othis.options.settings.component.featureReductionCluster : null);
            	othis.options.labelCluster.ibxCheckBoxSimple('checked', fr ? fr.labelsVisible : false);
				this.binBox = $("<div class='lyr-opacity-box'>").ibxVBox({'justify': "center", 'align': 'center'});
				othis.element.ibxWidget("add", this.binBox);
				this.binBox.ibxWidget("add", $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('fixed_level')}));				
            	this.fixedBinSlider = $("<div class='multiLayerMapSlider' data-ibxp-popup-value='true'>").ibxHSlider({
	                "align": "stretch", "markerShape": "circle", "max": 10, "min": 1, "step": 1, "lock": false, 
					"value" : this.options.settings.component && this.options.settings.component.featureReductionBin ? this.options.settings.component.featureReductionBin.fixedBinLevel : 3,
	                "popupValue": true, "precision": 1
	            });				
				this.binBox.ibxWidget("add", this.fixedBinSlider);
				
				this.fixedBinSlider.on("ibx_change", (e, data)=> {
	                if(this.options.layer.featureReduction && this.options.layer.featureReduction.type=="binning")
	               		this.options.layer.featureReduction.fixedBinLevel=data.value;
	            });
            }
			
            if(othis.options.ibgeo.isRefreshLayers() && !bSat && (othis.options.settings.dynLObj || 
				(othis.options.ibgeo.isDataLayer(othis.options.layer.id) && !othis.options.ibgeo.isPreviewMode() && 
				(othis.options.settings.component.hasOwnProperty("path") || othis.options.settings.component.hasOwnProperty("fileOrName"))))) {
				var refreshStart=othis.options.settings.component.hasOwnProperty("refreshStart") && othis.options.settings.component.refreshStart,
				_refreshBox2 = $("<div class='lyr-opacity-box' style='margin-left:10px'>").ibxHBox({'justify': "center", 'align': 'center'}), 
				int = typeof(othis.options.settings.component.refreshInt)==='undefined' ? -1 : othis.options.settings.component.refreshInt
				_refLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('refresh_interval')}),
				_intSpin=$("<div tabIndex='0' class='widgetPosition-spinner esri-input'></div").ibxSpinner({'min':-1,'max':600,'value':int});
				_refreshBox2.ibxWidget("add", _refLbl);
				_refreshBox2.ibxWidget("add", _intSpin);
				_intSpin.on("ibx_change", othis.doRefreshIntChanged.bind(this,_intSpin));
				var _play=$("<div title='"+getTransString('refresh_layer')+"' id=play_refresh class='btn-RefreshLayer'></div>").
                            ibxButton({"glyphClasses":"fas fa-play"/*,"text":getTransString('Refresh Layer')*/}), btn=$(_play);
                _refreshBox2.ibxWidget("add", btn);
				if(refreshStart) {
					_play.find(".ibx-label-glyph").removeClass("fa-play");
                    _play.find(".ibx-label-glyph").addClass("fa-pause");
					othis.options.ibgeo.setRefreshLayerOptions(othis.options.layer.id, othis);
				}
				btn.css({"margin-left":5,"margin-right":10});
             //   btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); 
                $(_play).on('click', function(e){
                    var btn = $(this);
                    if(btn.find(".ibx-label-glyph").hasClass("fa-pause")){
						btn.find(".ibx-label-glyph").removeClass("fa-pause");
		                btn.find(".ibx-label-glyph").addClass("fa-play");
                        othis.options.ibgeo.refreshStop(true);
                    }
                    else {
						if(typeof(othis.options.settings.component.refreshInt)==='undefined')
							othis.options.settings.component.refreshInt=-1;
						if(othis.options.settings.component.refreshInt!=-1) {
							btn.find(".ibx-label-glyph").removeClass("fa-play");
                        	btn.find(".ibx-label-glyph").addClass("fa-pause");
						}
                        
                        othis.options.ibgeo.doRefreshLayer(othis.options.layer.id,othis.options.settings.component.refreshInt, othis); 
                    }               
                });
				othis.element.ibxWidget("add", _refreshBox2);
				///toggle satellite move
				/*if(1) {
					_play=$("<div title='"+getTransString('refresh_layer')+"' id=play_refresh class='esri-layer-list__item-title'></div>").
                            ibxButton({"glyphClasses":"fas fa-play"}), btn=$(_play);
	                _refreshBox.ibxWidget("add", btn);
	                btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); btn.css({"color": "inherit", "margin-left":5,"margin-right":5, "max-width": 42});
	                $(_play).on('click', function(e){
	                    var btn = $(this);
	                    if(btn.find(".ibx-label-glyph").hasClass("fa-pause")){
							btn.find(".ibx-label-glyph").removeClass("fa-pause");
			                btn.find(".ibx-label-glyph").addClass("fa-play");
	                        othis.options.ibgeo.refreshStop();
	                    }
	                    else {
							if(typeof(othis.options.settings.component.refreshInt)==='undefined')
								othis.options.settings.component.refreshInt=-1;
							if(othis.options.settings.component.refreshInt!=-1) {
								btn.find(".ibx-label-glyph").removeClass("fa-play");
	                        	btn.find(".ibx-label-glyph").addClass("fa-pause");
							}
	                        
	                        othis.options.ibgeo.doRefreshLayer(othis.options.layer.id,othis.options.settings.component.refreshInt, othis); 
	                    }               
	                });
				}*/
				///
				if(othis.options.ibgeo.doWFDescribe(othis.options.layer.id,othis.doAddFilters.bind(othis)))
					othis.element.ibxWidget("add", $("<div class='filters-box'>").ibxVBox({'justify': "center", 'align': 'center'}));
            }
            else if(othis.options.ibgeo.options.satSubs && bSat)
				othis.addSearchControl(null);		
			if(_goto)	
	            $(_goto).on('click', function(e){
	                othis.options.ibgeo.zoomToLayer(othis.options.layer.id);
					othis.doUpdateRenderer();
	            });
			if(_saveto)
			$(_saveto).on('click', function(e){
                othis.options.ibgeo.saveToPortal(othis.options.layer);
            });
            othis.element.find($(".lyr-slider")).on("ibx_change", function(e){
                var value=Number(othis.element.find($(".lyr-slider")).ibxSlider("option", "value").toFixed(1));
                othis.options.layer.opacity = value;
             });
			if(!bSat && othis.options.layer.type!='route' && (othis.options.layer.type=='vector-tile' || othis.options.layer.type=='group' || othis.options.layer.type=='stream'
						|| othis.options.layer.type=='tile' || othis.options.layer.type=='imagery-tile' || othis.options.layer.hasOwnProperty("blendMode"))){
						//	<div class="effect-box" data-ibx-type="ibxVBox" data-ibx-name="_effect-box" data-ibxp-align="stretch" data-ibx-options="{'justify': 'center', 'align': 'stretch'}">
			
				let _beox = $("<div class='lyr-opacity-box' >").ibxVBox({'justify': "center", 'align': 'center'});
				othis.element.ibxWidget("add", _beox);
				_beox.geoUILayerEffects({"ibgeo": othis.options.ibgeo, "layer": othis.options.layer });
								
				
				if(othis.options.layer.type=='media') {
					let _beox = $("<div class='lyr-opacity-box' >").ibxVBox({'justify': "center", 'align': 'center'});
					othis.element.ibxWidget("add", _beox);
					_beox.geoUIMediaSettings({"ibgeo": othis.options.ibgeo, "layer": othis.options.layer });
				}
			}
			if(othis.options.layer.renderer && othis.options.layer.renderer.type =="raster-stretch"){
				othis.options.stretchType=othis.options.layer.renderer.stretchType;
				var _toggleBox = $("<div class='lyr-layer-look-box'>").ibxVBox({'justify': "center", 'align': 'center'});
               var _typeLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('stretchType')});

               var stretchMenu = $("<div tabindex='0' title='"+getTransString('Type')+"'></div>").ibxSelect({userValue:"cmdStretchType", 
                    class: "cmd-stretch-type typeMenu", readonly: true});
                othis.addOption("standard-deviation","stdDev",stretchMenu);
			//	 othis.addOption("histogram-equalization","Histogram",stretchMenu);
				 othis.addOption("min-max","minmax",stretchMenu);
				 othis.addOption("percent-clip","minmaxp",stretchMenu);
			//	 othis.addOption("sigmoid","Sigmoid",stretchMenu);
                _toggleBox.ibxWidget("add", _typeLbl);
                _toggleBox.ibxWidget("add", stretchMenu);
                othis.element.ibxWidget("add", _toggleBox);
				$(stretchMenu).on("ibx_change", function(e, data){
                    othis.options.stretchType=$(e.target).ibxWidget("userValue");
                    othis.doUpdateStrSlider(); 
				});
				//slider
				var _strBox = $("<div class='lyr-opacity-box'>").ibxVBox({'justify': "center", 'align': 'center'});
              
				var _StretchLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('stretchVal')});
	            var _StretchSliderR = $("<div class='stretch-slider-range lyr-slider' data-ibxp-popup-value='true'>").ibxRange({
	                "orientation":"horizontal",
	                "align": "stretch",
	                "markerShape": "circle",
	                "lock": false,
	                "popupValue": true
	            });
				var _StretchSlider = $("<div class='stretch-slider lyr-slider' data-ibxp-popup-value='true'>").ibxSlider({
	                "orientation":"horizontal",
	                "align": "stretch",
	                "markerShape": "circle",
	                "lock": false,
	                "popupValue": true,
	                "precision": 1
	            });
				_strBox.ibxWidget("add", $(_StretchLbl));
                _strBox.ibxWidget("add", $(_StretchSlider));
				_strBox.ibxWidget("add", $(_StretchSliderR));
                othis.element.ibxWidget("add", ($(_strBox)));
				 othis.doUpdateStrSlider(true);
				
			}
			if(othis.options.layer.type=='route') {
				let _Box = $("<div class='lyr-layer-look-box' style='margin-left:10px'>").ibxVBox({'justify': "center", 'align': 'center'});
				othis.element.ibxWidget("add", _Box);
				_Box.geoUIRouteLayer({"ibgeo": othis.options.ibgeo, "layer": othis.options.layer });
			}
			othis.updateLabelVisibility();
			othis.updateTypeVisibility();
			othis.element.addClass("mlm_colors");othis.element.find("input").addClass("mlm_colors");
			othis.element.find(".ibx-slider-body-start").add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".layers-box", othis.element).addClass("mlm-slider");
			othis.element.find(".ibx-check-box-simple").add(".ibx-check-box-simple-marker", othis.element).addClass("mlm-check-box");
        },
		
		doGetFilters: function(){
			var othis=this, ret="";
			if (Array.isArray(othis.options.ampers) && othis.options.ampers.length) {		        
		        othis.options.ampers.forEach(function (amp) {					
					//let varName = amp.getAttribute("name"); menu=othis.element.find('#'+varName);
					ret+="&"+amp.info.name+"="+amp.info.focValue;
				});
				return ret;
			}
			return null;
		},
		doGetFilters2: function(){
			var othis=this, ret=[];
			if (Array.isArray(othis.options.ampers) && othis.options.ampers.length) {		        
		        othis.options.ampers.forEach(function (amp) {					
					//let varName = amp.getAttribute("name"); menu=othis.element.find('#'+varName);
					ret.push({"name":amp.info.name,
								"value":amp.info.curValue});
				});
			}
			return ret;
		},
		addAmpers: function({path, wfDescribe, replace, runtimeValues}){
			var chainMap = wfDescribe.getChainMap(), retCode=false;
		    for (var key in chainMap) {
		        var chainInfo = chainMap[key];
		        var fields = chainInfo.fields;
		        for (var i = 0; i < fields.length; i++) {
		            var amperInfo = fields[i];
		            this._addAmper({path, wfDescribe, amperInfo, replace, runtimeValues});
					retCode=true;
		        }
		    }
			return retCode;
		},
		findChainParentAmper: function (chainParent) {
		    for (var i = 0; i < this.options.ampers.length; i++) {
		        var amper = this.options.ampers[i];
		        if (amper.info === chainParent)
		            return amper;
		    }
		    return null;
		},
		fixChains: function(){
			this.options.ampers.map(amper => {
		        if (amper.info.chainParent) {
		            const chainParent = this.findChainParentAmper(amper.info.chainParent);
		            if (!chainParent) {
		                const parentAmper = this.options.ampers.find(innerAmper => this._isSameAmper(innerAmper.info, amper.info.chainParent));
		                if (parentAmper) {
		                    amper.info.chainParent = parentAmper.info;
		                    if (amper.bound && amper.widget)
		                        amper.widget.setChainParent(parentAmper.widget);
		                }
		                else {
		                    // De facto orphan
		                    amper.info.chainParent = null;
		                    amper.info.chainIdxIn = -1;
		                    if (amper.bound && amper.widget)
		                        amper.widget.setChainParent(null);
		                }
		            }
		        }
		    });
		},		
		addControls : function() {
			var othis=this;
			for (var i = 0; i < this.options.ampers.length; i++) {
		        var amper = this.options.ampers[i]; 
			//	if(amper.info.name == "OBJECT_NAME")
			//		othis.addSearchControl(amper);		
			//	else 		
					this.createAmperControl(amper.info.displayType == "prompt" ? "amper_text" : "amper_select", [amper], amper);				
		    }
			styleSelectBox(othis.element.find('.pd-amper-select'));
		//	othis.element.find('.pd-amper-select').not('.filter-box').ibxWidget('popup').on('ibx_beforeclose', othis._onControlClose.bind(othis,$(this)));
			othis.styleTextBox(othis.element.find('.pd-amper-text'));

            this.options.ampers.map(amper => {
                if (amper.info.chainParent) {
                    const parent = othis.options.ampers.find(a => a.info === amper.info.chainParent);
                    if (parent)
                        amper.widget.setChainParent(parent.widget);
                    else
                        amper.widget.setChainParent(null);
                }
				var input=othis.element.find('.pd-amper-select').find("input").first();
			//	amper.widget.element.find("input");
				if(input) {
					input.bind("change", function (jevent) {
				        othis.refreshLayerByControl(localInfo);
				    });	
				}
            });
		},
		_getAmper: function (amperInfo) {
		    for (var i = 0; i < this.options.ampers.length; i++) {
		        var amper = this.options.ampers[i];
		        if (this._isSameAmper(amperInfo, amper.info))
		            return amper;
		    }
		
		    return null;
		},
		_isSameAmper: function (amperInfo1, amperInfo2) {
		    // We assume an amper that has the same name, format, and multiselect it's the same
		    // even if it comes from different fexes
		    return (amperInfo1.name == amperInfo2.name &&
		        amperInfo1.format == amperInfo2.format &&
		        amperInfo1.multiselect == amperInfo2.multiselect);
		},
		addFexToAmper: function (amper, path) {
		    amper.fexes.set(path, true);
		},
		_addAmper: function({path, wfDescribe, amperInfo, replace, runtimeValues}) {
			var foundAmper = this._getAmper(amperInfo);
		    if (foundAmper) {
		        if (replace) {
		            if (foundAmper.bound && foundAmper.widget) {
		                if (foundAmper.info == foundAmper.widget.options.amper) {
		                    foundAmper.widget.options.amper = amperInfo;
		                    foundAmper.widget.options.wfDescribe = wfDescribe;
		                }
		                else if (foundAmper.info == foundAmper.widget.options.amper1) {
		                    foundAmper.widget.options.amper1 = amperInfo;
		                    foundAmper.widget.options.wfDescribe1 = wfDescribe;
		                }
		                else if (foundAmper.info == foundAmper.widget.options.amper2) {
		                    foundAmper.widget.options.amper2 = amperInfo;
		                    foundAmper.widget.options.wfDescribe2 = wfDescribe;
		                }
		                foundAmper.widget.chainChange();
		            }
		            foundAmper.wfDescribe = wfDescribe;
		            foundAmper.info = amperInfo;
		        }
		        this.addFexToAmper(foundAmper, path);
		    }
		    else {
		   
		        var amper = {};
		        amper.bound = null;
		        amper.info = amperInfo;
		        amper.wfDescribe = wfDescribe;
		        amper.fexes = new Map();
		        amper.fexes.set(path, true);
		        this.options.ampers.push(amper);
		    }
		},
		refreshLayerByControl: function(control) {
			var k = 0;
		},
		addSearchControl: function(amper) {	
			var othis=this;
			let content = this.element, 
			box=$("<div class='filter-box'>").ibxVBox({'alignItems': "center",'alignContent': "center",'justify': "center", 'align': 'center'}),
			_ttlLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text": "Satellite Name"});
			othis.satSearch = $("<div class='esri-input'></div>").ibxSelectPaged({userValue:"satSearch", 
	                    class: "cmd-look-type typeMenu", readonly: true, search: true});
			othis.satSearch.ibxSelectPaged("values", othis.options.layer.objectNames);
				
     		box.ibxWidget("add", $(_ttlLbl));
			box.ibxWidget("add", $(othis.satSearch));
          
			styleSelectBox(othis.satSearch);
			var input=othis.satSearch.find("input").first();
	  	    $(othis.satSearch).on("ibx_change", function (jevent) {			
					othis.options.ibgeo.doSelectSatellite(othis.options.layer.id, "OBJECT_NAME",othis.satSearch.ibxSelectPaged("value"), othis);			
			});
			content.ibxWidget("add",box);
		},
		_amperChanged: function(amper) {
			amper.dirty=true;
		},		
		_onControlClose: function(amper){
			var othis=this, localAmper=amper;
			if(amper.dirty && othis.options.settings.component.satellite) {
				setTimeout(function(){othis.options.ibgeo.doRefreshSatelliteLayer(othis.options.layer.id, localAmper.info.name,localAmper.info.curValue, othis);},10); 
				amper.dirty=false;
			}
		},
		getDefaultValues: function(amperInfo) {
			this.options.ibgeo.getAmperDefaultValues(amperInfo, this.options.settings.component);
			return;
			let comp = this.options.settings.component;
			if(comp && comp.hasOwnProperty("filters")) {
				for(let i =0; i<comp.filters.length; i++) {
					if(amperInfo.name==comp.filters[i].name) {
						amperInfo.defValue=comp.filters[i].value;
						break;
					}
				}
			}
			else {
				const pages=$(window.parent.document.body).find('.pd-page');
				if(pages && pages.length) {
					const filPanels=pages[0].ibaObject.filterPanels();
					if(Array.isArray(filPanels)) {
						for(let i = 0; i < filPanels.length; i++) {
							if(typeof(filPanels[i].ampers === 'function')){
								let tempAmpInfo=filPanels[i].ampers();
								if(tempAmpInfo.length==1 && tempAmpInfo[0].dynField === amperInfo.dynField && 
									tempAmpInfo[0].name === amperInfo.name){
									amperInfo.defValue=[];
									for(let k = 0; k < tempAmpInfo[0].curValue.length; k++)
										amperInfo.defValue.push(tempAmpInfo[0].curValue[k]);
									break;	
								}	
							}							
						}
					}
				}
			}
		},
		createAmperControl: function(type, ampers, props, alignParam) {
		    const amper = ampers[0];
		    const amper2 = ampers[1];
			var othis=this;
		    othis.getDefaultValues(amper.info);
		    const amperInfo = amper.info;
		    const amperInfo1 = amperInfo;
			if(amper2)othis.getDefaultValues(amper2.info);
		    const amperInfo2 = amper2 ? amper2.info : null;
		    var options = {"autoComplete": "on"}, defOptions={'alignItems': "center",'alignContent': "center",'justify': "center", 'align': 'center'}, localInfo=amperInfo;
			if(amperInfo.chainParent)
				amper.info.chainParent.element=this.element.find('.filters-box').find(".pd-amper-control").last();
            $.extend(options, { "fromRestore": false, "fromBookmark": false, 
			"wfDescribe": amper.wfDescribe, "chainParent": null,
			 "optional": !amperInfo.required }, defOptions);
			
		    let content = this.element.find('.filters-box'), 
			box=$("<div class='filter-box'>").ibxVBox({'alignItems': "center",'alignContent': "center",'justify': "center", 'align': 'center'});
			content.ibxWidget("add",box);
			
			switch (type) {
		        default:
		            return;
		        case "amper_text":
		            box.ibxAmperText($.extend({ "amper": [amperInfo] }, options));
					amper.widget = box.data('ibxAmperText');
					//if(amper.info.name == "OBJECT_NAME")
		            break;
		        case "amper_select":
		            box.ibxAmperSelect($.extend({ "amper": [amperInfo] }, options)); 
					box.find('.pd-amper-select').not('.filter-box').ibxWidget('popup').on('ibx_close', othis._onControlClose.bind(othis,amper));
					box.find('.pd-amper-select').not('.filter-box').on('ibx_change', othis._amperChanged.bind(othis,amper));
				
					amper.widget = box.data('ibiIbxAmperSelect');										
		            break;
		        case "amper_double_list":
		            box.ibxAmperDoubleList($.extend({ "amper": [amperInfo] }, options));
		            break;
		        case "amper_button_group":
		            box.ibxAmperButtonGroup($.extend({ "amper": [amperInfo] }, options));
		            break;
		        case "amper_radio":
		            box.ibxAmperRadioGroup($.extend({ "amper": [amperInfo] }, options));
		            break;
		        case "amper_checkbox":
		            box.ibxAmperRadioGroup($.extend({ "amper": [amperInfo], "type": "amper_checkbox" }, options));
		            break;
		        case "amper_date":
		            box.ibxAmperDate($.extend({ "amper": [amperInfo] }, options));
		            break;
		        case "amper_slider":
		            box.ibxAmperSlider($.extend({ "amper": [amperInfo] }, options));
		            break;
		        case "amper_range":
		            box.ibxAmperRange($.extend({ "amper1": [amperInfo1], "amper2": [amperInfo2] }, options));
		            break;
		        case "amper_numeric_range":
		            box.ibxAmperNumericRange($.extend({ "amper1": [amperInfo1], "amper2": [amperInfo2] }, options));
		            break;
		    }
			//box.ibxAmperSelect($.extend({ "amper": [amperInfo]  }, options));
			
			
		},
		doAddFilters: function(ajaxResult) {
			var othis=this, pattern = "//sysfex/amper[@type='unresolved']";
		            othis.options.ampers = getNodesArray(ajaxResult, pattern);
			let fBox=othis.element.find('.filters-box');
			if(1){
				const wfDescribe = new WFDescribe(othis.options.ibgeo.getContext(), typeof(WFGlobals) !== 'undefined' ? WFGlobals.language : "");
		        wfDescribe.load(ajaxResult, true);
				if(othis.addAmpers({path: othis.options.settings.component.path, wfDescribe, replace: true, runtimeValues: true})){
					othis.fixChains();
					othis.addControls();
					fBox.show(); 
				}
				else fBox.hide(); 
			}
			else if (Array.isArray(othis.options.ampers) && othis.options.ampers.length) {		        
		        othis.options.ampers.forEach(function (amp) {
		            let varName = amp.getAttribute("name"), text="", desc=getSingleNode(amp,"desc");
					if(desc) text=desc.textContent;
					else text=varName;
					let box=$("<div class='lyr-layer-look-box'>").ibxVBox({'justify': "center", 'align': 'center'});
					fBox.ibxWidget("add",box);
					box.ibxWidget("add", $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":text}));
					let menu = $("<div tabindex='0' id='"+varName+"'></div>").ibxSelect({class: "layer-filter", readonly: true}),
					vals=getSingleNode(amp, "./values"),
					values= getNodesArray(vals, "./value"), find=getSingleNode(vals, "./find");
					styleSelectBox(menu); 
					othis.addOption("_FOC_NULL","All",menu,true,true);
					if (Array.isArray(values)) {
						values.forEach(function (val) {
							othis.addOption(val.getAttribute("value"),val.getAttribute("display"),menu,true);						
						});
					}
					else if(find){
					}
					box.ibxWidget("add",menu);
		        });
		    }
			else fBox.hide();
		},
		refreshStopped: function() {
			var othis=this, btn=othis.element.find($("#play_refresh"));
			if(btn.find(".ibx-label-glyph").hasClass("fa-pause")){
				btn.find(".ibx-label-glyph").removeClass("fa-pause");
                btn.find(".ibx-label-glyph").addClass("fa-play");
          //      othis.options.ibgeo.refreshStop();
            }
		},
		doRefreshIntChanged: function(ctrl) {
			var othis=this, int=ctrl.ibxSpinner("value");
			if(othis.options.layer.type == "stream")
				othis.options.layer.updateInterval=int*1000;
			else othis.options.settings.component.refreshInt=int;
		},
		doProcessAmpers: function(xmlDoc) {
			
		},
		doDataLayerTitle: function(edit) {
			var othis=this,	newTtl=$(edit).ibxTextField("value");
			othis.options.ibgeo.updateLayerTitle(othis.options.layer.id,newTtl);
		},
		doAddMenuItem: function(value, display,addTo) {
			 var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":value});
            stdOpt.ibxSelectItem("option", "text", getTransString(display));
            addTo.ibxSelect("addControlItem",stdOpt);
		},
		setSymbolType: function(symType) {
			var othis=this;
			var clR = othis.options.layer.renderer.clone();
			othis.options.layer.renderer.symbol.symbolLayers.items[0].resource.primitive=symType;
			othis.options.layer.refresh();
		//	clR.symbol.symbolLayers.items[0].resource.primitive=symType;
		//	othis.options.layer.renderer=clR;
		//	othis.options.layer.refresh();
		},
		addOption: function(uValue, name, addTo, useName,select) {
			var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":uValue});
            stdOpt.ibxSelectItem("option", "text", useName ? name : getTransString(name));
            addTo.ibxSelect("addControlItem",stdOpt);
			if(uValue==this.options.stretchType || uValue==this.options.layer.blendMode || select)
				addTo.ibxSelect("selected", stdOpt);
		},
        addCheckBox : function(text, callBackFunc) {
            var othis=this;
            var _box = $("<div class='lyr-opacity-box'>").ibxHBox({'justify': "center", 'align': 'center'});
            var _labelToggle = $("<div class='label-toggle'>").ibxCheckBoxSimple({"id": othis.options.layer.id+"_lblToggle",
                "checked": othis.options.labelOrgVisible, "text":text});
            _box.ibxWidget("add", _labelToggle);
            othis.element.ibxWidget("add", _box);
            $(_labelToggle).on('click', function(e){
            	callBackFunc.call();
            });  
            var lbl= $(_labelToggle).find(".ibx-label-text");
            lbl.insertBefore($(_labelToggle).find("input")); lbl.css("margin-right", "5px");
            return $(_labelToggle);
        },
        doUpdateDataLabel: function(){
            var othis=this, layer=othis.options.layer, labelClass=layer.labelingInfo[0];
            var bShowLbl= othis.options.labelCB ? othis.options.labelCB.ibxCheckBoxSimple('checked') : null;
            var bShowVal= othis.options.valueCB ? othis.options.valueCB.ibxCheckBoxSimple('checked') : null;
            var labels="";
            if(othis.options.labelField && bShowLbl)
                labels = "$feature."+othis.options.labelField;
            if(othis.options.valueField && bShowVal) {
                if(labels)
                    labels += "+TextFormatting.NewLine+";
                labels += "$feature." + othis.options.valueField;
            }
            labelClass.labelExpressionInfo =  { expression: labels };
            layer.labelingInfo = [labelClass];

            if (this.options.ibgeo.is3dView()) {
                //GIS-1550 - for some reason ArcGIS 3d layer does not pick up labels that was changed above
                //(it does if the labels were turned on in 2d layer and view was changed to 3d afterwards
                //Appears the re-initializing the labelingInfo object (LabelClass) workarounds that

                var labelClassCopyJSON = labelClass.toJSON();
                if (labelClassCopyJSON.symbol && labelClassCopyJSON.symbol.type === "esriTS") {
                    labelClassCopyJSON.symbol.type = "text"; //need to reset type to "text", as only allowed values for initialization are "text" or "label-3d"
                    layer.labelingInfo = [othis.options.ibgeo.getLabelClass(labelClassCopyJSON)];
                }
            }
            //With above fix setting visiblity explicitly appears to be nececessary
            //otherwise ESRI defaults labelClass.labelExpression if labelClass.labelExpressionInfo.expression is "", so labels never disappear
            layer.labelsVisible = labels != "";

        },
        doUpdateClusterLabel: function(){
            var othis=this, layer=othis.options.layer;
			if(layer.featureReduction) {
				var featureReduction = layer.featureReduction.clone();
            	featureReduction.labelsVisible = othis.options.labelCluster.ibxCheckBoxSimple('checked');
            	layer.featureReduction = featureReduction;
				if(layer.featureReduction.type=="cluster")
					othis.options.settings.component.featureReductionCluster.labelsVisible=featureReduction.labelsVisible;
				else othis.options.settings.component.featureReductionBin.labelsVisible=featureReduction.labelsVisible; 
			}            
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

//# sourceURL=geo_ui_layer_options.js
