/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/

$.widget("ibi.geoUIHeatmapSettings", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
            layer: null
        },
		selField:{name:"",type:"string"},
		featureMode: 'field',
        _widgetClass:"map-wdg-layer-heatmap",
       
        _create:function()
        {
            this._super();
			
			var markup = ibx.resourceMgr.getResource(".heatmap-box", false);
			this.element.append(markup);
			ibx.bindElements(this.element);
			this.maxDensity=this.element.find('.maxdens-slider');
			this.minDensity=this.element.find('.mindens-slider');
			this.radiusDensity=this.element.find('.raddens-slider');
			this.refScale=this.element.find(".refscale-slider");	
			this.setFromRenderer();
			this.setSchemes();
			this.maxDensity.on("ibx_change", function(e, data){
				if(this.options.layer.renderer.type=='heatmap')
					this.options.layer.renderer.maxDensity=Number(this.maxDensity.ibxHSlider("option", "value").toFixed(3));
			}.bind(this));
			
			this.minDensity.on("ibx_change", function(e, data){
				if(this.options.layer.renderer.type=='heatmap')
					this.options.layer.renderer.minDensity=Number(this.minDensity.ibxHSlider("option", "value").toFixed(3));
			}.bind(this));
			
			this.radiusDensity.on("ibx_change", function(e, data){
				if(this.options.layer.renderer.type=='heatmap')
					this.options.layer.renderer.radius=Number(this.radiusDensity.ibxHSlider("option", "value"));
			}.bind(this));			
			this.refScale.ibxHSlider("option","max", this.options.layer.minScale || this.options.ibgeo.getCurrentView().scale);			
			this.refScale.on("ibx_change", function(e, data){
                if(this.options.layer.renderer.type=='heatmap')
					this.options.layer.renderer.referenceScale=data.value;
			}.bind(this));
        },	
		setSchemes: function() {
			let schemes = this.options.ibgeo.getHeatmapSchemes(), selectElt=this.element.find(".sel-schemes");
			styleSelectBox(selectElt);
			if(Array.isArray(schemes)) {
				let settings=this.options.ibgeo.getLayerSettings(this.options.layer), component=settings ? settings.component : null;
				if(component && component.hasOwnProperty('heatmap') && component.heatmap.hasOwnProperty('scheme')) 
					this.options.layer.scheme=component.heatmap.scheme;
				var selSchName=this.options.layer.scheme || schemes[0].name,sortValues = function (first, second) {		           
		            var val1 = first.name, val2 = second.name;					
		            if (typeof(val1)==='string' && typeof(val2)==='string') {
						let parts1=val1.split(" "), parts2=val2.split(" ");
						if(parts1.length==2 && parts2.length==2 && parts1[0] == parts2[0] && 
									!isNaN(parts1[1]) && !isNaN(parts2[1])) {
							let n1= parseInt(parts1[1],10),n2= parseInt(parts2[1],10);
							if (n1 == n2)
                    			return 0;
                			return n1 > n2 ? 1 : -1;
						}						
						else
							return val1.localeCompare(val2);
					}					
		            return 0;
		        }.bind(this);
		        schemes.sort(sortValues);
				schemes.forEach(function (scheme) {
					this.addOption(scheme.name,scheme.name,selectElt,selSchName==scheme.name,scheme.colors);
	            }.bind(this));	
				selectElt.on("ibx_change", function(e, data){
					this.updateHeatmapRenderer();
				}.bind(this));	          
			}
			else {
				selectElt.hide();
				this.element.find(".schemesLabel").hide();
			}					
		},
		updateHeatmapRenderer: function() {
			let sch = this.element.find(".sel-schemes").ibxWidget("userValue");
			if(this.options.layer.renderer.type=="heatmap")
				this.options.ibgeo.createHeatmapRenderer(this.options.layer, null, null,
					 sch, this.refScale.ibxWidget("userValue"),this.setFromRenderer.bind(this));
			else
				this.options.ibgeo.createHeatmapRenderer(this.options.layer, null, null,
					 null, null,this.setFromRenderer.bind(this));
		},
		setFromRenderer: function() {
			if(this.options.layer.renderer.type=="heatmap") {				
				let pres=5, renderer=this.options.layer.renderer, maxD=Number(parseFloat(renderer.maxDensity).toFixed(pres));
				if(maxD==0)maxD=1;
				let minD=Number(parseFloat(renderer.minDensity).toFixed(pres)), stepMax=Number(parseFloat((maxD*2-minD)/100).toFixed(pres)),
				stepMin=Number(parseFloat(maxD/100).toFixed(pres));									
				this.maxDensity.ibxHSlider("option","max", maxD*2);
				this.maxDensity.ibxHSlider("option","value", maxD);
				this.maxDensity.ibxHSlider("option","step",stepMax);
			//	this.maxDensity.ibxHSlider("refresh");		
				this.minDensity.ibxHSlider("option","max", maxD);		
				this.minDensity.ibxHSlider("option","value", minD);
				this.minDensity.ibxHSlider("option","step",stepMin);
			//	this.minDensity.ibxHSlider("refresh");
				this.radiusDensity.ibxHSlider("option","value", Number(renderer.radius));
				this.radiusDensity.ibxHSlider("option","step",1);
				this.radiusDensity.ibxHSlider("refresh");
				
				this.refScale.ibxHSlider("option","max", this.options.layer.minScale || this.options.ibgeo.getCurrentView().scale);		
				this.refScale.ibxHSlider("option","value", renderer.referenceScale);
			//	this.refScale.ibxSwitch("checked", renderer.referenceScale ? true : false);
			}			
		},		
		addOption: function(uValue, name, addTo,select, colors) {
			var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":uValue});
            stdOpt.ibxSelectItem("option", "text", name);
			if(Array.isArray(colors)) {
				colors.forEach((color)=> {
					let insert = $("<div class='selectItemColor'></div>");
					insert.css("background-color", this.options.ibgeo.getColorObj2Css(color));
					insert.appendTo(stdOpt);
				});
			}			
            addTo.ibxSelect("addControlItem",stdOpt);
			if(select)
				addTo.ibxSelect("selected", stdOpt);
		},		
		reset: function() {
			
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

$.widget("ibi.geoUIMediaSettings", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
            layer: null
        },
		selField:{name:"",type:"string"},
        _widgetClass:"map-wdg-layer-media",
       
        _create:function()
        {
            this._super();
			
			var markup = ibx.resourceMgr.getResource(".media-box", false);
			this.element.append(markup);
			ibx.bindElements(this.element);
			this.updating=true;
			this.media_elements=this.element.find('.sel-elements');
			this.loadElements();
			this.xExtent=this.element.find('.horextent-slider');
			this.yExtent=this.element.find('.vertextent-slider');	
			//set x, y sliders
			let layerExtent=this.options.layer.fullExtent;
			this.xExtent.ibxRange("option", "min", layerExtent.xmin);
			this.xExtent.ibxRange("option", "max", layerExtent.xmax);
			this.yExtent.ibxRange("option", "min", layerExtent.ymin);
			this.yExtent.ibxRange("option", "max", layerExtent.ymax);
					
			this.altitute=this.element.find('.altitute-slider');			
			this.rotation=this.element.find(".rotation-slider");	
			this.opacity=this.element.find(".opacity-slider");
			if(!layerExtent.hasZ) {
				this.altitute.hide();
				this.element.find('.media_altitute').hide();
			}
			this.updateSliders();
			
			this.opacity.on("ibx_change", (e, data) =>{
				let element=this.getSelectedElement();
				if(!this.updating && element)element.opacity=data.value;
			});
			
			this.xExtent.on("ibx_change", (e, data) =>{
				let element=this.getSelectedElement();
				if(!this.updating && element) {
					if(element.georeference.extent.xmin!=data.value)
						element.georeference.extent.xmin=data.value;
					if(element.georeference.extent.xmax!=data.value2)
					element.georeference.extent.xmax=data.value2;
				}
			});
			
			this.yExtent.on("ibx_change", (e, data) =>{
				let element=this.getSelectedElement();
				if(!this.updating && element) {
					if(element.georeference.extent.ymin!=data.value)
					element.georeference.extent.ymin=data.value;
					if(element.georeference.extent.ymax!=data.value2)
					element.georeference.extent.ymax=data.value2;
				}
			});
			
			this.altitute.on("ibx_change", (e, data) =>{
				let element=this.getSelectedElement();
				if(!this.updating && element)element.georeference.extent.zmax=data.value;
			});
			this.rotation.on("ibx_change", (e, data) =>{
				let element=this.getSelectedElement();
				if(!this.updating && element)element.georeference.rotation=data.value;
			});
			this.updating=false;
        },
		loadElements: function() {
			if(this.options.layer.source && this.options.layer.source.elements && Array.isArray(this.options.layer.source.elements.items)) {
				let index=0;
				this.options.layer.source.elements.items.forEach((item)=>{
					this.addOption(index,item.title,this.media_elements,index==0);
					index++;
				});
			}		
			this.media_elements.on("ibx_change", (e, data) =>{
				let elt=this.getSelectedElement($(e.target).ibxWidget("userValue"));
				if(elt) {
					this.updateSliders(elt);
					this.options.ibgeo.gotoExtent(elt.georeference.extent);
				}				
			});
		},
		updateSliders: function(element) {
			if(!element) element=this.getSelectedElement();
			let extent=element.georeference.extent, rotation=element.georeference.rotation, opacity=element.opacity;
			this.updating=true;
			this.xExtent.ibxRange("option", "value", extent.xmin);
			this.xExtent.ibxRange("option", "value2", extent.xmax);
			this.yExtent.ibxRange("option", "value", extent.ymin);
			this.yExtent.ibxRange("option", "value2", extent.ymax);
			
			this.rotation.ibxHSlider("option", "value", rotation);
			this.opacity.ibxHSlider("option", "value", opacity);
			setTimeout(()=>{this.updating=false;}, 500);
		},
		getSelectedElement: function(index){
			if(!index)index=this.media_elements.ibxSelect("userValue");
			return this.options.layer.source.elements.items[index];
		},
		addOption: function(uValue, name, addTo,select) {
			var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":uValue});
            stdOpt.ibxSelectItem("option", "text", name);			
            addTo.ibxSelect("addControlItem",stdOpt);
			if(select)
				addTo.ibxSelect("selected", stdOpt);
		},		
		reset: function() {
			
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

$.widget("ibi.geoUILayerEffects", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
            layer: null
        },
		selField:{name:"",type:"string"},
        _widgetClass:"map-wdg-layer-effects",
       
        _create:function()
        {
            this._super();
			
			var markup = ibx.resourceMgr.getResource(".blend-effect-box", false);
			this.element.append(markup);
			ibx.bindElements(this.element);
			//blending
			let blendMenu= this.element.find(".sel-blend-mode"), effEdit=this.element.find(".effectEdit"), selFilters=this.element.find(".sel-filters"),
			includedEffectEdit=this.element.find(".includedEffect"),excludedEffectEdit=this.element.find(".excludedEffect"),			
			selComp=this.element.find(".comp-operator"),			
			blendModeTypes=["normal","average", "color-burn","color-dodge", "color", "darken","destination-atop", "destination-in","destination-out",
                "destination-over","difference","exclusion", "hard-light","hue", "invert","lighten","lighter","luminosity", "minus",  "multiply",
                "overlay", "plus","reflect", "saturation","screen", "soft-light", "source-atop","source-in","source-out","vivid-light","xor"];
			this.layerEffect=this.element.find(".layerEffect_sel");
			
			this.excludedEffectSel=this.element.find(".excludedEffect_sel");
			this.includedEffectSel=this.element.find(".includedEffect_sel");
			this.auotRefresh=this.element.find(".layer_auto_refresh");
			this.auotRefresh.ibxSwitch('option','switchPosition', 'right');
			this.updateFEBtn=this.element.find(".btn-RefreshLayer");
			this.distanceSlider=this.element.find(".distance_slider");
			this.auotRefresh.ibxSwitch("checked", true);
			this.updateFEBtn.hide();
			this.auotRefresh.on("ibx_change", function(e, data){
                this.auotRefresh.ibxSwitch("checked") ? this.updateFEBtn.hide() : this.updateFEBtn.show();
			}.bind(this));
			blendModeTypes.forEach(function (mode) {
				this.addOption(mode,mode,blendMenu);
            }.bind(this));
          
			$(blendMenu).on("ibx_change", function(e, data){
                this.options.layer.blendMode=$(e.target).ibxWidget("userValue");
			}.bind(this));
			styleSelectBox(blendMenu);  
			styleSelectBox(this.excludedEffectSel);
			styleSelectBox(this.includedEffectSel);
			styleSelectBox(this.layerEffect);
			effEdit.ibxTextField("value",this.options.layer.effect);
			effEdit.find("input").addClass("esri-input").css({height:"25px"});
			effEdit.on("change", function(e, data){
                let newEFF=effEdit.ibxTextField("value");
				this.options.layer.effect=newEFF;
			}.bind(this));
			let sfield=null, cond='=', valP=[]; this.savedvalues=[];
			if(this.options.layer.type=="feature" || this.options.layer.type=="scene" || this.options.layer.type=="stream") {
				this._featureModesRadio=this.element.find(".mlm-featureSelectionTypeRadio");
				this.featureMode= this._featureModesRadio.ibxWidget("userValue");
		        //parse where:"POP>6417269.68" where: "POP<>50" "POP=1051 OR POP=3656 OR POP=6152" 'POP>=4767760.22'				
				if(this.options.layer.featureEffect && this.options.layer.featureEffect.filter) {
					if(typeof(this.options.layer.featureEffect.filter.where) === 'string') {
						let orSt = " OR ", andSt = " AND ", q = "'", where = this.options.layer.featureEffect.filter.where, gt_eq = where.search('>='),
						lt_eq = where.search('<='), not_eq = where.search('<>'), eq = where.search('='), lt = where.search('<'), gt = where.search('>'),
						or=where.search(orSt), and=where.search(andSt);
						this.where=where;
						if(gt_eq != -1)cond ='>=';  else if(lt_eq != -1)cond ='<=';  else if(not_eq != -1)cond ='<>';
						else if(gt != -1)cond ='>';  else if(lt != -1)cond ='<'; 
						this.element.find(".comp-operator").ibxWidget("userValue", cond);					
						if(or!=-1) valP=where.split(orSt); else if(and!=-1) valP=where.split(andSt); else valP.push(where);
						if(Array.isArray(valP)) {
							valP.forEach((pair)=> {
								let pp = pair.split(cond);
								if(pp.length==2) {
									sfield=pp[0];
									let val=pp[1];
									if(val.charAt(0) == q && val.charAt(val.length - 1) == q)val=val.substring(1, val.length - 1);
									this.savedvalues.push(val);
								}
							});
						}	
					}
					else if(this.options.layer.featureEffect.filter.hasOwnProperty("geometry")) {
						this._featureModesRadio.ibxWidget("userValue","geometry");
						this.featureMode="geometry";
						this.selectedGeom=this.options.layer.featureEffect.filter.geometry;
					}				
				}
				
				let fields = this.options.layer.fields;
				if(Array.isArray(this.options.layer.fields)) {
					this.addOption("",getTransString('no_sel'),selFilters,true,true);	
					this.options.layer.fields.forEach(function (field) {
						if(field.name.toUpperCase()!="OBJECTID" && field.name!="ID" 
								&& field.name!="NAME" && field.name!="_FID"  && field.name!="data" && field.name.search("_formated")==-1 && field.alias != "pseudo") {
							let alias=field.alias;
							if('GEOLEVEL1'==alias)alias=getTransString("state_province");
							else if('GEOLEVEL2'==alias)alias=getTransString("county");
							this.addOption(field.name,alias,selFilters,true,field.name==sfield);
							if(field.name==sfield)this.selField=field;
						}						
		            }.bind(this));	          
				}		
				
				this._featureModesRadio.on("ibx_change", e => {
					let fuMode=this._featureModesRadio.ibxWidget("userValue"); 
					if(this.featureMode!=fuMode){
						this.featureMode=fuMode;
						this.updateFeatureEffControlsVisibility();
					}				
	            });		
			}
			else
				this.element.find(".featureEffect").hide();
			selFilters.on("ibx_change", function(e, data){
				if($(e.target).ibxWidget("userValue")) {
					this.updateSelectedField($(e.target).ibxWidget("userValue"));
					this.options.ibgeo.getUniqueValuesFromField(this.options.layer, $(e.target).ibxWidget("userValue"), this.updateValues.bind(this));
				}	             	
				else this.reset();
			}.bind(this));
			styleSelectBox(selFilters);  
			styleSelectBox(selComp); 
			this.filter_values=this.element.find(".filter_values");
			this.filter_values.find("input").addClass("esri-input").css({height:"25px"});
			this.filter_values.hide();
			//filter_values.ibxTextField("value",this.options.layer.effect);
			includedEffectEdit.find("input").addClass("esri-input").css({height:"25px"});
			//includedEffectEdit.ibxTextField("value",this.options.layer.effect);
			excludedEffectEdit.find("input").addClass("esri-input").css({height:"25px"});
			this.updateFEBtn.on("click", this.doUpdateFeatureEffect.bind(this,true));
			this.element.find(".gotolayer").on("click", this.goToSelectedFeatures.bind(this));
			this.filter_values_sel=this.element.find(".filter_values_sel");
			this.filter_values_sl=this.element.find(".filter_values_slider");
			this.selModeRadio=this.element.find(".mlm-selectionRadio");
			this.element.find(".ibx-slider-body-start").add(".ibx-slider-body-horizontal-start", this.element).add(".ibx-slider-body-horizontal-start", this.element).add(".ibx-slider-body-horizontal-start", this.element).addClass("mlm-slider");
		
			this.filter_values_sl.hide();
			this.filter_values_sel.on("ibx_change", function(e, data){
				this.doUpdateFeatureEffect();
			}.bind(this));
			this.filter_values_sl.on("ibx_change", function(e, data){
				this.doUpdateFeatureEffect();
			}.bind(this));
			this.distanceSlider.on("ibx_change", function(e, data){
				this.doUpdateFeatureEffect();
			}.bind(this));
			this.addEffects(this.layerEffect,true,true,this.options.layer.effect);
			this.addEffects(this.layerEffect,false,true,this.options.layer.effect);
			this.addEffects(this.includedEffectSel,true,false, this.options.layer.featureEffect ? this.options.layer.featureEffect.includedEffect : "");
			this.addEffects(this.excludedEffectSel,false,false, this.options.layer.featureEffect ? this.options.layer.featureEffect.excludedEffect : "");
			if(sfield) {
				this.selectValuesControl();
				this.options.ibgeo.getUniqueValuesFromField(this.options.layer, sfield, this.updateValues.bind(this));
			}
			this.layerEffect.on("ibx_change", (e, data) => {
				if(!data.action) {
					this.addOption(data.text,data.text,this.layerEffect,true,true);
				}
				let newEFF=this.layerEffect.ibxWidget("userValue");
				this.options.layer.effect=newEFF ? newEFF : "";
				
			});
			this.excludedEffectSel.on("ibx_change", (e, data) => {
				if(!data.action) {
					this.addOption(data.text,data.text,this.excludedEffectSel,true,true);
				}
				this.doUpdateFeatureEffect();
			});
			//
			this.includedEffectSel.on("ibx_change", (e, data) => {
				if(!data.action) {
					this.addOption(data.text,data.text,this.includedEffectSel,true,true);
				}
				this.doUpdateFeatureEffect();
			});
			this.selModeRadio.on("ibx_change", (e, data) => {
				let selMode=this.selModeRadio.ibxWidget("userValue"); 
				if(selMode!=this.selectionMode) {
					this.selectedGeom=null;
					this.selectionMode=this.selectionModeSaved=selMode;
					this.distanceSlider.ibxHSlider("option","value",1.0);
					this.distanceSlider.ibxHSlider("refresh");
					this.options.ibgeo.doResetFeatureEffect(this.options.layer);
					this.options.ibgeo.getGeometryForEffects(this.options.layer, this.selectionMode, this.updateByGeometry.bind(this));
				}				
            });	
			selComp.on("ibx_change", (e, data) =>{
				this.selectValuesControl();
				this.doUpdateFeatureEffect();
			});
			includedEffectEdit.on("ibx_change", (e, data) => {
				this.doUpdateFeatureEffect();
			});
			excludedEffectEdit.on("ibx_change", (e, data) => {
				this.doUpdateFeatureEffect();
			});
			this.updateFeatureEffControlsVisibility(true);
			styleSelectBox(this.filter_values_sel);  
			if(this.options.ibgeo.is3dView())this.element.find(".blend-effect-box").hide();
        },	
		updateFeatureEffControlsVisibility: function(bDontReset) {
			if(this.featureMode === "geometry") {				
				this.element.find(".where-box").hide();
				this.element.find(".geometry-box").show();
			}
			else {
				this.element.find(".where-box").show();
				this.element.find(".geometry-box").hide();
			}
			if(!bDontReset)
			this.options.ibgeo.doResetFeatureEffect(this.options.layer);
		},
		addEffects: function(select, emphasize, noselection, selEffect) {
			let arrEff = this.options.ibgeo.getEffects(emphasize);
		/*	if(!jQuery.isEmptyObject(arrEff)) {
				Object.keys(arrEff).forEach(function(key){
					this.addOption(arrEff[key].value,arrEff[key].name,select,true,false);
	            }.bind(this));
			}*/
			if(Array.isArray(arrEff)) {
				arrEff.forEach(function(eff){
				    this.addOption(eff.value,eff.name,select,true, noselection && !selEffect ? false : eff.selected || selEffect == eff.value);
				}.bind(this));
			}
		},
		goToSelectedFeatures: function(){
			let layer = this.options.layer;
			this.options.ibgeo.gotoFeatureExtent(layer, this.featureMode=="field" ? this.where : null, this.selectedGeom);
		},
		updateSelectedField: function(fieldName) {
			let selFields=this.options.layer.fields.filter(function (field) {
			    return field["name"] === fieldName;
			});
			if(Array.isArray(selFields) && selFields.length)
				this.selField=selFields[0];
			this.selectValuesControl();
		},
		selectValuesControl: function(fieldName, values) {			
			let comp=this.element.find(".comp-operator").ibxWidget("userValue"), 
				useSelect=this.selField.type=="string" || (comp=="=" || comp=="!=" || comp=="<>");
			if(useSelect && !this.filter_values_sel.is(":visible")) {
				this.filter_values_sel.show();			
				this.filter_values_sl.hide();
			}
			else if(!useSelect && !this.filter_values_sl.is(":visible")){
				let values=this.filter_values_sel.ibxWidget("userValue");
				this.filter_values_sel.hide();		
				if(Array.isArray(values) && values.length)
					this.filter_values_sl.ibxHSlider("option","value",values[0]); 	
				this.filter_values_sl.show();
				this.filter_values_sl.ibxHSlider("refresh");
			}	
			if(useSelect) {
				let singleSel=comp==">" || comp=="<" || comp==">=" || comp=="<=", curSel=this.filter_values_sel.ibxSelectPaged("option", "multiSelect");
				if(useSelect) {
					let singleSel=comp==">" || comp=="<" || comp==">=" || comp=="<=", curSel=this.filter_values_sel.ibxSelectPaged("option", "multiSelect");
					if(curSel === singleSel) {
						this.updating=true;
						let values=this.filter_values_sel.is(":visible") ? this.filter_values_sel.ibxWidget("userValue") : this.filter_values.ibxWidget("value");
						this.filter_values_sel.ibxSelectPaged("option", "multiSelect", singleSel ? false : true);
						if(this.filter_values_sel.is(":visible") && Array.isArray(values) && values.length>1)
							this.filter_values_sel.ibxWidget("option", "text", values[values.length-1]); 
						setTimeout(()=>{this.updating=false; this.doUpdateFeatureEffect();}, 500);
					}
				}
			}	     
		},
		updateByGeometry: function(geometry) {
			this.selectedGeom=geometry;
			this.doUpdateFeatureEffect();
			this.selectionMode="selPan";
			this.selModeRadio.ibxWidget("userValue",this.selectionMode);
		},
		isDateFieldSelected: function() {
			let ret=false, selFilters=this.element.find(".sel-filters"), selField=selFilters.ibxWidget("userValue");
			if(Array.isArray(this.options.layer.fields)) {
				this.options.layer.fields.forEach((field)=> {
					if(selField==field.name && field.type=="date")
						ret=true;
				});
			}
			return ret;
		},
		updateValues: function(infos) {
			if(Array.isArray(infos)) {
				this.filter_values.hide();
				var sortValues = function (first, second) {		           
		            var valueFirst = first.value, valueSecond = second.value;					
		            if (valueFirst && valueSecond) {
						if(this.selField.type == 'string') return valueFirst.localeCompare(valueSecond);
						else {
							if (valueSecond == valueFirst)
                    			return 0;
                			return valueFirst > valueSecond ? 1 : -1;
						}
					}		                
		            return 0;
		        }.bind(this);
		        infos.sort(sortValues);
				let values=[], dateField=this.isDateFieldSelected();
				infos.forEach(function(info){
					if(info.value===getTransString("multiple")) values.splice(0, 0, {value: info.value, display :info.value});
					else {
						let disp=info.value;
						if(dateField) {
							let dt = new Date(info.value);
							disp=dt.toLocaleString();
						}
						values.push({value: info.value, display :disp});		
					}		
				}.bind(this));
				if(values.length) {
					this.filter_values_sel.ibxSelectPaged("values", []);
					this.filter_values_sel.ibxSelectPaged("values", values);
					if(!isNaN(values[0].value)) {
						let step=parseFloat((values[values.length-1].value-values[0].value)/values.length).toFixed(2);
						this.filter_values_sl.ibxHSlider("option","min",values[0].value);
						this.filter_values_sl.ibxHSlider("option","max",values[values.length-1].value);	
						this.filter_values_sl.ibxHSlider("option","step",step);
					}
					this.updating=false;
					if(Array.isArray(this.savedvalues) && this.savedvalues.length) {
						this.updating=true;
						this.filter_values_sl.ibxHSlider("option","value",parseInt(this.savedvalues[0], 10));
						this.filter_values_sl.attr('title',this.savedvalues[0]);
						this.filter_values_sel.ibxSelectPaged("userValue", this.savedvalues);
						this.savedvalues=[];
						setTimeout(()=>{this.updating=false;}, 500);
					}					
				}
				
				this.doUpdateFeatureEffect();
			}
			else {
				this.filter_values_sel.hide();
				this.filter_values_sl.hide();
				this.filter_values.show();
			}  
		},
		reset: function() {
			this.options.layer.featureEffect="";
			this.filter_values_sel.ibxSelectPaged("values", []);
		//	this.addOption("","",this.filter_values_sel,true,true);	
		//	this.filter_values_sel.ibxWidget("removeControlItem", false, true);
		},		
		addOption: function(uValue, name, addTo, useName,select) {
			var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":uValue});
            stdOpt.ibxSelectItem("option", "text", useName ? name : getTransString(name));
            addTo.ibxSelect("addControlItem",stdOpt);
			if(uValue==this.options.stretchType || uValue==this.options.layer.blendMode || select)
				addTo.ibxSelect("selected", stdOpt);
		},
		doUpdateFeatureEffect: function(update) {
			if(!this.updating && (update || this.auotRefresh.ibxSwitch("checked"))) {
				let info={type:this.featureMode};	
				if(this.edits){
					info.includedEffect=this.element.find(".includedEffect").ibxWidget("value");
					info.excludedEffect=this.element.find(".excludedEffect").ibxWidget("value");
				}
				else {
					info.includedEffect=this.includedEffectSel.ibxWidget("userValue");
					info.excludedEffect=this.excludedEffectSel.ibxWidget("userValue");
				}
				if(this.featureMode=="field") {
					info.field=this.element.find(".sel-filters").ibxWidget("userValue");
					
					let comp=this.element.find(".comp-operator").ibxWidget("userValue"), 
						useSelect=this.selField.type=="string" || (comp=="=" || comp=="!=" || comp=="<>");
					if(useSelect)
						info.values=this.filter_values_sel.is(":visible") ? this.filter_values_sel.ibxWidget("userValue") : this.filter_values.ibxWidget("value");
					else {
						 let value=this.filter_values_sl.ibxHSlider("option", "value");
						this.filter_values_sl.attr('title',value);
						info.values=[];
						info.values.push(value);
					}
					info.selComp=this.element.find(".comp-operator").ibxWidget("userValue");
					if(info.field && info.values) {
						if(!Array.isArray(info.values) && info.values!="") {
							let value=info.values;
							info.values=[];
							info.values.push(value);
						}
						this.where=this.options.ibgeo.doUpdateFeatureEffect(this.options.layer, info);
					} 	
				}
				else if(this.selectedGeom){
				//	info.geometry=this.selectionModeSaved == "selPolygon" ? this.selectedGeom.extent : this.selectedGeom;
					info.distance=this.calculateDistance(this.selectedGeom);
					info.geometry=this.selectedGeom;
				//	info.spatialRel=(this.selectionModeSaved == "selPolygon" || this.selectionModeSaved == "selPolyline") ? "intersects" : "contains";
					info.spatialRel=this.selectionModeSaved == "selPolyline" ? "intersects" : "contains";
					
				//	if(this.selectionModeSaved == "selPolyline" && info.distance==0)info.distance=2;				
					this.options.ibgeo.doUpdateFeatureEffect(this.options.layer, info);	
				}
			}			
		},
		calculateDistance: function(geometry) {			
			let val=this.distanceSlider.ibxHSlider("option", "value");
			if(this.selectionModeSaved == "selPolyline")
				return val ? val*50000 : 1;
		//	else if(this.selectionModeSaved == "selExtent")
		//		geometry.extent.expand(val);
			let extentH=geometry.extent;
			if(extentH) {
				let calc = extentH.width > extentH.height ? extentH.height : extentH.width,
				diff = val > 1 ? calc*val-calc : -(calc-calc*val);
				return diff*50000;
			}
			return 0;
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

//# sourceURL=geo_ui_layer_effects.js