/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
$.widget("ibi.geoUISatLayerOptions", $.ibi.ibxVBox,
    {
        options:{
            ibgeo: null,
            layer: null,
			settings: {},
			satRenderer: null
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
			if(obj) {
				this.options.layer=obj.layer;
				//this.options.settings=obj.settings;
				this.options.satRenderer=obj.satRenderer;
			}		
			this.updateRefreshButtonCaption();	
			this.updateGroupList();
		},
		styleSelectBox: function(typeMenu){
			typeMenu.find("input").css({"background-color":"transparent", "border-style":"none"});
            typeMenu.css({"background-color":"transparent"});
            var btn =  typeMenu.find(".ibx-button");
            btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); btn.css("height", "auto");  
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
        _create:function()
        {
            this._super();
            var othis =  this;
			this._super();
		//	var othis=this;
		/*	var markup = ibx.resourceMgr.getResource(".sat_Layer-options", false).children();
			othis.element.append(markup);
			ibx.bindElements(this.element);*/
			
            othis.element.id = othis.options.layer.id+"_opacityBox";
		//	othis.initialRenderer=othis.options.layer.renderer;
       //     var lyr = othis.options.ibgeo.getCurrentMap().findLayerById(othis.options.layer.id);
            var _lyrOpacityLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text":getTransString('Opacity')});
            var _lyrOpacitySlider = $("<div class='lyr-slider' data-ibxp-popup-value='true'>").ibxSlider({
                "orientation":"horizontal",
                "align": "stretch",
                "markerShape": "circle",
                "max": 1,
                "min": 0,
                "step": 0.1,
                "lock": false,
                "value": othis.options.layer.opacity,
                "popupValue": true,
                "precision": 1
            });
			  var _lyrOpacityBox = $("<div class='lyr-opacity-box'>").ibxVBox({'justify': "center", 'align': 'center'});
              _lyrOpacityBox.ibxWidget("add", $(_lyrOpacityLbl));
              _lyrOpacityBox.ibxWidget("add", $(_lyrOpacitySlider));
              othis.element.ibxWidget("add", ($(_lyrOpacityBox)));
						//	othis.addSearchControl(null);			
            othis.element.find(".ibx-slider-body-start").add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".ibx-slider-body-horizontal-start", othis.element).add(".layers-box", othis.element).addClass("mlm-slider");

           _lyrOpacitySlider.on("ibx_change", function(e){
                var value=Number(_lyrOpacitySlider.ibxSlider("option", "value").toFixed(1));
                othis.options.layer.opacity = value;
				othis.options.satRenderer.setOpacity();
            });
	//		othis.addGroupSwitch();
			othis.addSearchControl();
			othis.addRefresh();
			othis.updateRefreshButtonCaption();
			setTimeout(function(){othis.updateGroupList();},100); 
        },
		addRefresh: function(){
			var _refreshBox = $("<div class='lyr-opacity-box' style='margin-left:10px'>").ibxVBox({'justify': "center", 'align': 'center'});	
			this._play=$("<div /*title='"+getTransString('refresh_layer')+"'*/ id=play_refresh class='esri-layer-list__item-title sat-button'></div>").
                        ibxButton({/*"glyphClasses":"fas fa-play",*/"text":getTransString('refresh_layer'), "wrap":true, "textWrap":true}), btn=$(this._play);
            _refreshBox.ibxWidget("add", btn);
            btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); btn.css({"color": "inherit", "margin-right":"30px","margin-left":"12px", "width": "auto"});
//btn.removeClass("ibx-button"); btn.addClass("esri-widget--button esri-component"); btn.css({"width":"auto"});
            btn.on('click', function(e){
              //  var btn = $(this);
				this.options.ibgeo.doRefreshLayer(this.options.layer.id, -1, this);           
            }.bind(this));
			this.element.ibxWidget("add", _refreshBox);
	    },
		updateRefreshButtonCaption: function() {
			var dateObj=new Date(this.options.layer.telDate), isoStr=dateObj.toISOString(),
			str="Satellite Telemetry Synch: " + isoStr.substring(0,isoStr.indexOf('.'));
			this._play.ibxButton("option","text",str);
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
			
			return "&LATEST=YES";
		},
		refreshStopped: function(){
			
		},
		
		addGroupSwitch: function(){
			let content = this.element, 
			box=$("<div class='filter-box'>").ibxVBox({'alignItems': "spaceAround",'alignContent': "spaceAround",
						'justifyContent': "spaceAround", 'align': 'center', 'justifyItems':'center', 'justify':'spaceAround'}),
			lblCountry=$("<div class='esri-layer-list__item-title'></div>").ibxLabel({'justifyContent': "center", 'align':'center', "text": "Groups"}),
			lblGroup=$("<div class='esri-layer-list__item-title'></div>").ibxLabel({'justifyContent': "center", "text": "Constellation"});
			this.groupSwich=$("<div class=''></div>").ibxSwitch({});
			box.ibxWidget("add", $(lblCountry));
		//	box.ibxWidget("add", $(this.groupSwich));
		//	box.ibxWidget("add", $(lblGroup));
			content.ibxWidget("add",box);
			$(this.groupSwich).on("ibx_change", function (jevent) {		
				this.options.satRenderer.reloadGroups(this.groupSwich.ibxSwitch("checked"));
				this.updateSatellitesList();				
				this.options.ibgeo.hideTooltips();	
			}.bind(this));
		},
		addSearchControl: function() {	
			var othis=this;
			let content = this.element, 
			box=$("<div class='filter-box'>").ibxVBox({'alignItems': "center",'alignContent': "center",'justify': "center", 'align': 'center'});			
			let _grlLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text": "Groups"});
			othis.groups = $("<div class='esri-input sat-select'></div>").ibxSelectPaged({ pageSize:20,
	                    class: "cmd-look-type typeMenu", readonly: true, search: true, multiSelect:true});
			
			/*othis.groups.on("ibx_change", function (jevent) {
		        var userValues=othis.groups.ibxSelectPaged("userValue");
				if(Array.isArray(userValues) && userValues.length>1 && userValues.indexOf('_FOC_NULL') != -1) {
					userValues.splice(0,1);
					let ctrl=othis.groups.ibxSelectPaged("selected");
				//	othis.groups.ibxSelectPaged("userValue", userValues);
				}
		    });	*/
			othis.groups.ibxSelectPaged('popup').bind("ibx_close", function (jevent) {
		        let selItems = this.groups.ibxSelectPaged("userValue");
				//if(othis.options.ibgeo.is3dView())othis.options.satRenderer.updateLayersVisibility(othis.groups.ibxSelectPaged("userValue"));
				this.options.ibgeo.updateSatelliteSelection(selItems);
				this.options.ibgeo.executeSatelliteDDEx(this.options.satRenderer.code2name(selItems));
				this.updateSatellitesList();
			//	let selItems = othis.groups.ibxSelectPaged("selectItems");
			//	othis.options.ibgeo.refreshTopLevelControls(othis.options.amperInfo, selItems);
			//	othis.options.ibgeo.hideTooltips();
		    }.bind(this));	
			if(othis.options.settings.groups===null && othis.options.settings.component.hasOwnProperty("pageGroupsMenu") && 
				othis.options.settings.component.pageGroupsMenu === false) {
				_grlLbl.hide();	othis.groups.hide();	
			}

     		box.ibxWidget("add", $(_grlLbl));
			box.ibxWidget("add", $(othis.groups));
			
			let _ttlLbl = $("<div class='esri-layer-list__item-title'></div>").ibxLabel({"text": "Satellite Name"});
			othis.satSearch = $("<div class='esri-input sat-select'></div>").ibxSelectPaged({userValue:"satSearch", 
	                    class: "cmd-look-type typeMenu", readonly: true, search: true});
	
     		box.ibxWidget("add", $(_ttlLbl));
			box.ibxWidget("add", $(othis.satSearch));
          
			othis.styleSelectBox(othis.satSearch);
			othis.styleSelectBox(othis.groups);
			
	  	    $(othis.satSearch).on("ibx_change", function (jevent) {		
				othis.options.ibgeo.selectSatellite(othis.satSearch.ibxSelectPaged("value"), othis.satSearch.ibxSelectPaged("userValue"));	
			});
			content.ibxWidget("add",box);
		},
		updateGroupList: function() {
			this.groups.ibxSelectPaged("values", this.options.satRenderer.getGroups());				
			this.updateGroupsSelection();
		},
		updateGroupsSelection: function(selValues){
			//this.groups.ibxSelectPaged("userValue",[]);
		//	if(selValues)
		//		this.groups.ibxSelectPaged("userValue",this.options.satRenderer.name2code(selValues));
		//	else {
			var amperInfo=this.options.ibgeo.getAmperInfo();
			if(amperInfo && amperInfo.hasOwnProperty("curValue") && amperInfo.curValue != '_FOC_NULL') 
				this.groups.ibxSelectPaged("userValue",this.options.satRenderer.name2code(amperInfo.curValue));
			else this.groups.ibxSelectPaged("userValue",'_FOC_NULL');		
		//	}				
			this.updateSatellitesList();
		},
		updateSatellitesList: function() {
			this.satSearch.ibxSelectPaged("values", []);
			this.satSearch.ibxSelectPaged("values", this.options.satRenderer.getVisibleSatellites());
		},
		_onControlClose: function(amper){
			var othis=this, localAmper=amper;
			if(amper.dirty && othis.options.settings.component.satellite) {
				setTimeout(function(){othis.options.ibgeo.doRefreshSatelliteLayer(othis.options.layer.id, localAmper.info.name,localAmper.info.curValue, othis);},10); 
				amper.dirty=false;
			}
		},

		refreshStopped: function() {
			var othis=this, btn=othis.element.find($("#play_refresh"));
			if(btn.find(".ibx-label-glyph").hasClass("fa-pause")){
				btn.find(".ibx-label-glyph").removeClass("fa-pause");
                btn.find(".ibx-label-glyph").addClass("fa-play");
          //      othis.options.ibgeo.refreshStop();
            }
		},
		doAddMenuItem: function(value, display,addTo) {
			 var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":value});
            stdOpt.ibxSelectItem("option", "text", getTransString(display));
            addTo.ibxSelect("addControlItem",stdOpt);
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

//# sourceURL=geo_ui_sat_layer_options.js