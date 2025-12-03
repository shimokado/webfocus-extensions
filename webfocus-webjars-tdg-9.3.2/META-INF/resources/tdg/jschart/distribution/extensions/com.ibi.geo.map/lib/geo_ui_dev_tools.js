/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/


$.widget("ibi.geoUIDevTools", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
			saveAsPath:null,
			description: "",
			extOptions: {}
        },

        _widgetClass:"map-wdg-dev-tools",
       
        _create:function()
        {
            this._super();
			var othis=this;
			var markup = ibx.resourceMgr.getResource(".map-wdg-dev-tools", false).children();
			othis.element.append(markup);
			ibx.bindElements(this.element);
			
			othis.setLayersPage();
		//	if(othis.options.ibgeo.is3dView())
		//	othis.setCameraPage();
		//	else
		//		othis.element.find(".map-wdg-dev").ibxTabPane("remove",othis.element.find(".map-wdg-camera-wrapper"),false,true);
	//			this.element.find(".map-wdg-camera-wrapper").remove();
			
			othis.element.addClass("esri-widget esri-widget--panel-height-only");
			othis.element.css({"max-height":"500px", "width":"330px"});
			othis.element.find(".ibx-switch checked").add(".ibx-switch-slider", othis.element).add(".ibx-check-box-simple", othis.element).add(".ibx-check-box-simple-marker", othis.element).addClass("mlm-slider");
			othis.element.find("input").add(".layers-box", othis.element).addClass("mlm_colors");
			othis.element.find(".mlm-color-picker-swatch").removeClass("ibx-menu-item");
        },
		addDataLayer: function(arrFiles) {
			var othis=this;
			if (arguments && arguments.length) {
				var filesFex=[], filesHtm=[], filesCsv=[];
				for(var k = 0; k < arguments.length; k++){
					if(typeof(arguments[k]) === 'string'){
						if(arguments[k].toLowerCase().search(".fex")!=-1)
							filesFex.push(arguments[k]);
						else if(arguments[k].toLowerCase().search(".txt")!=-1 || arguments[k].toLowerCase().search(".csv")!=-1)
							filesCsv.push(arguments[k]);
						else
							filesHtm.push(arguments[k]);
					}						
				}
				othis.options.ibgeo.doAddDataLayers(filesFex);
				othis.options.ibgeo.doAddDataLayersCsv(filesCsv);
				setTimeout(function(){othis.doImportCanvasMaps(filesHtm);},10);
			}
		},
		addGroupLayer: function() {
			var othis=this;
			othis.options.ibgeo.doAddGroupLayer();
		},
		doImportCanvasMaps: function(filesHtm) {
			var othis=this;
			for(var k = 0; k < filesHtm.length; k++) {
				othis.options.ibgeo.getHtmlCanvasFile(filesHtm[k]);
			}
		},
			/*
		{
                    "type":"fex",
                    "load":true,
                    "step":2,
                    "geometryType":"point",
                    "parameters": [{"LISTVAL":"1-72,1"}],
                    "title":"Flight simulator",
                    "marker": {
                        "visible": true,
                        "size": "ICONSIZE",
                        "shape": "PLANEICON",
                        "rotation": "CHEADING"
                    },
                    "path":"/WFC/Repository/FlightSim/flight_step_layerjson.fex",
                    "tooltips": ["DEST","ORIGIN","AIRCRAFT_TYPE", "ALTITUDE"]
                }
*/
		isSuccessfulRequest: function(result) {
			alert("saved successfully");
		},
		doSaveFile: function(filePath, desc) {
			var othis=this;
			if(!othis.options.saveAsPath && filePath) {
				othis.options.saveAsPath=filePath;
				othis.options.description=desc;
			}
			if(filePath || othis.options.saveAsPath) {
				var content=othis.options.ibgeo.getContentToSave();
				
				var request = othis.options.ibgeo.getContext() + '/wfirs?IBFS_action=put&IBFS_service=ibfs&IBFS_path=' + encodeURI(filePath || othis.options.saveAsPath);
			    var ibfs_obj = '<rootObject _jt="IBFSMRObject" binary="false" description="<desc>"><content _jt="IBFSByteContent"><file_content>==</content><properties size="1">' +
			        '<entry key="tool" value="chart"/></properties></rootObject>';
			    ibfs_obj = ibfs_obj.replace('<desc>', desc || othis.options.description);
			    ibfs_obj = ibfs_obj.replace('<file_content>', window.btoa(content));
			    request += "&IBFS_object=" + ibfs_obj + othis.options.ibgeo.addToken(); 
				doXmlHttpRequest(request, { asJSON: false, async: true, GETLimit: 0, onLoad: othis.isSuccessfulRequest.bind(this)});
			}
		},
		getFileToUse: function(open){
			var othis=this;
		    var oConfig = {}, path=othis.options.ibgeo.getMyPath(false,false);
		    oConfig.bOpen = open;
		    oConfig.nFlags = open ? 0x000000002 | 0x000000100 | 0x000000001 : 0x000000002 | 0x000000100 ;
		    oConfig.strRootPath = "IBFS:" + "/WFC/Repository";           // the highest directory
		    if (typeof(path) === 'string' && path.search("IBFS:") == -1)
		        path = "IBFS:" + path;
		    oConfig.strContextPath = path;
		    oConfig.strDefaultExt = ".fex";
		    oConfig.arFilters = [["FEX", "*.fex"],["HTML","*.htm"],["CSV","*.csv"],["TXT","*.txt"]];
		    oConfig.arShortcuts = [];
			oConfig.strDefaultName = "";
		    oConfig.typeDefaultExplore = "TYPE_DETAILS";
		    oConfig.nFilterIndex = 0;
		
		    var strOptions = "dialogWidth:800px;dialogHeight:600px;center:yes;resizable:yes;status:no";
		
		    othis.popupDlg = window.showModalDialog(othis.options.ibgeo.getContext() + "/tools/ibfs_explore/resources/markup/ibfs_explore_app.htm",
		        {
		            "customScriptFilename": null,
		            "customClassName": othis,
		            "oConfig": oConfig,
		            "fnReturn": function () { }
		        }, strOptions);
		    var object = this;
		    if (othis.popupDlg) {
		     //   bringShieldUp(object);
		        othis.popupDlg.onunload = function () {
		            if (typeof (object.popupDlg.location.href) == 'string' &&
		                object.popupDlg.location.href.search('ibfs_explore_app') != -1) {
		            //    bringShieldDown(object);
		                object.popupDlg = null;
		            }
		        };
		    }
		},
		dispatchEvent: function (e) {
		    var ret = true, othis=this;
		    var eType = e.getType();
		    if (eType == "SET_CUSTOM_MODAL_DLG_RETURN") {
		        //If no dialog result the user hit "Cancel".
		        var oReturn = e.getUserData();
		        var dlgResult = oReturn.dlgResult;
		        if (dlgResult) {
		            var arrFiles = dlgResult.arFileNames;
		            oReturn.window.close(); //Here is where the dialog is dismissed.
		            if (dlgResult) {
		                if (othis.calBackFunc && typeof (this.calBackFunc) == 'function') {
							if(oReturn.dlgArgs.oConfig.bOpen)
		                    	othis.calBackFunc.apply(this, arrFiles);
							else
								othis.calBackFunc.call(this, dlgResult.strFullPathValid, dlgResult.strName);
						}
		            }
		        }
		    }
		    else if (eType == "CONTEXT_MENU")
		        e.preventDefault();
		    return ret;
		},
		setLayersPage: function(){
			var othis=this,
			btn=$(".addDataLayer");
			btn.removeClass("ibx-button"); btn.addClass("esri-widget--button esri-component"); btn.css({"width":"auto"});
			$(btn).on('click', function(e){
				othis.calBackFunc=othis.addDataLayer.bind(othis);
              	othis.getFileToUse(true); 				   
            });
            btn=$(".addGroupLayer");
			btn.removeClass("ibx-button"); btn.addClass("esri-widget--button esri-component"); btn.css({"width":"auto"});
            $(btn).on('click', function(e){
				othis.addGroupLayer();
            });
			btn=$(".save");
			btn.removeClass("ibx-button"); btn.css({"max-width": 72});
            
            $(btn).on('click', function(e){
				if(!othis.options.saveAsPath){
					othis.calBackFunc=othis.doSaveFile.bind(othis);
					othis.getFileToUse(false);
				} 		
				else
					othis.doSaveFile();		   
            });
			btn=$(".saveas");
			btn.removeClass("ibx-button"); btn.css({"max-width": 72});
            
            $(btn).on('click', function(e){
				othis.calBackFunc=othis.doSaveFile.bind(othis);
				othis.getFileToUse(false);
            });
			othis.demoLayerList = othis.element.find(".demog-layers-select"); 
			othis.refLayerList = othis.element.find(".ref-layers-select");
			othis.atlasLayerList = othis.element.find(".atlas-layers-select");
			othis.backColor = othis.element.find(".color-colorpick");
		
			othis.dataLayerTitle= othis.element.find(".titleEdit");
			othis.dataMapTitle= othis.element.find(".maptitleEdit");
			othis.dataMapTitle.find("input").addClass("myEdit");
			var mttl=othis.options.ibgeo.getWidgetProperties("mapTitle");
			if(typeof(mttl)==='string')
				othis.dataMapTitle.ibxTextField("value",mttl);
			othis.widgetsList = othis.element.find(".widgets-select");
			othis.themesList = othis.element.find(".themes-select");
			othis.themesList.ibxSelect("userValue",othis.options.ibgeo.getWidgetProperties("theme"));
			var color={};
			othis.options.ibgeo.getViewBackgroundColor(color);
			othis.backColor.ibxColorPicker("option","color",color.hex);
			othis.backColor.ibxColorPicker("option","opacity",color.opacity);			
			othis.element.find(".mlm-color-picker-swatch").css("background-color",othis.options.ibgeo.getViewBackgroundColor());
			othis.backColor.on("ibx_colorchange", othis.onBackColorChange.bind(this));
			 
			othis.themesList.ibxWidget("control").on("ibx_change", othis.doThemesListChanged.bind(this, othis.themesList));
			othis.setWidgetsList();
		//	othis.dataLayerList.ibxWidget("control").on("ibx_change", this.doUpdateDataLayer.bind(this, othis.dataLayerList));
			othis.dataLayerTitle.on("change", this.doDataLayerTitle.bind(this, othis.dataLayerTitle));
			othis.loadDemographicRefLayers();
			othis.trash=othis.element.find(".deleteLayer");
			$(othis.trash).on("ibx_dragover ibx_drop", function(e)
            {
                e = e.originalEvent;
                var target = $(e.currentTarget);
                
                var dt = e.dataTransfer, removeId=dt.getData("dragLayerId");
                
                if(e.type == "ibx_dragover" && removeId)
                {  
                    dt.dropEffect = "move";
                    e.preventDefault();                        
                }
                else if(e.type == "ibx_drop" && removeId) {
					target.ibxRemoveClass("drag-target");
                    othis.options.ibgeo.removeLayer(removeId);
				}
            });           
			othis.doWidgetsListChanged(othis.widgetsList);
		},
		onBackColorChange: function(e){
			var othis=this, data = e.originalEvent.data;
			othis.options.ibgeo.doUpdateViewBackgroundColor(data.color, data.opacity);
			othis.element.find(".mlm-color-picker-swatch").css("background-color",othis.options.ibgeo.getViewBackgroundColor());
		},
		getDemogOrRefLayer: function(name) {
			var othis=this, items = othis.demoLayerList.ibxSelect("controlItems"); 
			for(var j = 0; j <items.length; j++) {
				var item=items.eq(j), uValue=item.ibxWidget("userValue");
				if(uValue["NAME"] == name) {
					othis.demoLayerList.ibxSelect("selected",item);
					return uValue;
				}
			}
			items = othis.refLayerList.ibxSelect("controlItems");
			for(var j = 0; j <items.length; j++) {
				var item=items.eq(j), uValue=item.ibxWidget("userValue");
				if(uValue["NAME"] == name) {
					othis.refLayerList.ibxSelect("selected",item);
					return uValue;
				}
			}
			items = othis.atlasLayerList.ibxSelect("controlItems");
			for(var j = 0; j <items.length; j++) {
				var item=items.eq(j), uValue=item.ibxWidget("userValue");
				if(uValue["NAME"] == name) {
					othis.atlasLayerList.ibxSelect("selected",item);
					return uValue;
				}
			}
			return null;
		},
		setWidgetsList: function(){
			var othis=this;
			var items=othis.widgetsList.ibxSelect("controlItems"), len=items.length, remove=[], b3d=othis.options.ibgeo.is3dView();
			if(!b3d){
				for(var j = 0; j <len; j++) {
					var item=items.eq(j);
					if(item && othis.options.ibgeo.is3dOnlyWidget(item.ibxWidget("userValue"))) {
						othis.widgetsList.ibxSelect("removeControlItem",item);
					}					
				}
			}
			othis.widgetVis=othis.element.find(".widget_visibility");
			othis.widgetCreate=othis.element.find(".widget_create");
			othis.widgetVis.on("ibx_change", othis.doWidgetsVisChanged.bind(this, othis.widgetVis));
			othis.widgetCreate.on("ibx_change", othis.doWidgetsCreateChanged.bind(this, othis.widgetCreate));
			othis.widgetlocation=othis.element.find(".location-select");
			othis.widgetlocation.ibxWidget("control").on("ibx_change", othis.doWidgetsLocationChanged.bind(this, othis.widgetlocation));
			othis.widgetPosition=othis.element.find(".widgetPosition-spinner");
			othis.widgetPosition.on("ibx_change", othis.doWidgetsPositionChanged.bind(this, othis.widgetPosition));
		//	othis.widgetsList
			othis.widgetsList.ibxWidget("control").on("ibx_change", othis.doWidgetsListChanged.bind(this, othis.widgetsList));
		},
		doWidgetsVisChanged: function (ctrl) {
			var othis=this;
			if(!this.meSetting) {
				var state={};
				state.visible=ctrl.ibxSwitch("checked");
				state.create=othis.widgetCreate.ibxSwitch("checked");
				othis.updateWidget(state);
			}
		},
		doWidgetsCreateChanged: function (ctrl) {
			var othis=this;
			if(!this.meSetting) {
				var state={};
				state.create=ctrl.ibxSwitch("checked");
				if(!state.create) {
					state.visible=false;
				}
				othis.updateWidget(state);
			}
		},
		doWidgetsLocationChanged: function (ctrl) {
			if(!this.meSetting) {
				var state={};
				state.attachTo=ctrl.ibxSelect("userValue");
				this.updateWidget(state);
			}
		},
		doWidgetsPositionChanged: function (ctrl) {
			if(!this.meSetting) {
				var state={};
				state.index=ctrl.ibxSpinner("value");
				this.updateWidget(state);
			}
		},
		updateWidget: function(state) {
			var othis=this;
			if(othis.widgetsList) {
				var widget=othis.widgetsList.ibxWidget("userValue");
				if(widget)
					setTimeout(function(){othis.options.ibgeo.updateWidgetSetting(widget,state); othis.doWidgetsListChanged(othis.widgetsList);},10);
			}
		},
		doThemesListChanged: function(list) {
			var othis=this,	item=list.ibxSelect("selected");
			othis.options.ibgeo.setTheme(item.ibxWidget("userValue"));
		},
		updateInterWidget:function(wId){
			var othis=this,	widget=othis.widgetsList.ibxWidget("userValue");
			if(widget) {
				othis.widgetVis.ibxSwitch("checked", wId==widget);
			}
		},
		doWidgetsListChanged: function(list) {
			var othis=this,	item=list.ibxSelect("selected"),
			wdgId=item.ibxWidget("userValue"),
			widS=othis.options.ibgeo.getWidgetSetting(wdgId),
			setBoxes=othis.element.find(".widget_settings");
			othis.meSetting=true;
			var vis=othis.element.find(".widget_visibility").add($(".widget_visibility").prev()), 
			create=othis.element.find(".widget_create").add($(".widget_create").prev()),
			pos=othis.element.find(".widgetPosition-spinner").add($(".widgetPosition-spinner").prev()),
			loc=othis.element.find(".location-select").parent();
			if(wdgId=="search" || wdgId=="direction" || wdgId=="measurement" || wdgId=="location" || wdgId=="locate") {
			//	if(wdgId=="locate" || (widS && !widS.create))vis.hide(); else vis.show();
				vis.hide();pos.hide();loc.hide();create.show();
			}
			else if(wdgId=="interaction"){
				create.hide();vis.hide();pos.show();loc.show();
			}
			
			else {vis.show();pos.show();loc.show();create.show();} 
			if(widS) {
				if(wdgId=="mainToolBar"){
					othis.widgetlocation.ibxSelect("addControlItem",othis.topCenterItem);
					othis.widgetlocation.ibxSelect("addControlItem",othis.bottomCenterItem);	
				}
				if(typeof(widS) === 'object'){
					othis.widgetVis.ibxSwitch("checked", widS.visible);
					othis.widgetCreate.ibxSwitch("checked", widS.create);
					var items=othis.widgetlocation.ibxSelect("controlItems"), len=items.length;
					for(var j = 0; j <len; j++) {
						var item2=items.eq(j);
						if(item2 && item2.ibxWidget("userValue") == widS.attachTo) {
							othis.widgetlocation.ibxSelect("selected",item2);
							//break;
						}	
						if(wdgId!="mainToolBar" && (item2.ibxWidget("userValue") == "top-center" || item2.ibxWidget("userValue") == "bottom-center")) {								
							if(item2.ibxWidget("userValue") == "top-center")othis.topCenterItem = item2;
							else othis.bottomCenterItem = item2;	
							othis.widgetlocation.ibxSelect("removeControlItem",item2);
						}	
					}
					othis.widgetPosition.ibxSpinner("setValue", widS.hasOwnProperty("index") ? widS.index : -1);
				}
				else othis.widgetCreate.ibxSwitch(widS);
			}
			else {
				othis.widgetVis.ibxSwitch("checked", false);
				othis.widgetCreate.ibxSwitch("checked", false);
				othis.widgetlocation.ibxSelect("selected","top-left");
				othis.widgetPosition.ibxSpinner("setValue", -1);
			}
		//	else if(setBoxes.is(":visible"))
		//		setBoxes.hide();
			setTimeout(function(){othis.meSetting=false;},100);
		},
		mapTitle: function() {
			return this.dataMapTitle.ibxWidget("value");
		},	
		loadDemographicRefLayers : function() {
			var othis=this, waitForLoad=-1;
			var loaded = function() {
				othis.options.demogLayers=othis.options.ibgeo.getRefLayers(); 
				if (othis.options.demogLayers) {   
					waitForLoad=window.clearInterval(waitForLoad);
					var demoSel=false, refSel=false, atlasSel=false, firstSelItem = $("<div class='map-layer-sel-item chart-sel-item-none'>").ibxSelectItem({"selected":true,"text": ibx.resourceMgr.getString("mlmap.none"), "userValue": ""});
					
		            othis.options.demogLayers.forEach(function (r) {
						if(r["AUTHORIZATION"] != "retired") {
							var sel=othis.options.ibgeo.isLayerLoaded2(r["NAME"],r["TITLE"]);
			                var option = $("<div id='"+r["NAME"]+"'></div>").ibxSelectItem({"align": "stretch", "selected":sel, "userValue":r});
				            option.ibxSelectItem("option", "text", r["TITLE"]);
							if(r["GROUP_NAME"] === "Ref_layers"){
								if(sel)refSel=true;
								othis.refLayerList.ibxSelect("addControlItem",option);
							}
							else if(r["GROUP_NAME"] === "atlas"){
								if(sel)atlasSel=true;
								othis.atlasLayerList.ibxSelect("addControlItem",option);
							}					
							else {
								if(sel)demoSel=true;
								othis.demoLayerList.ibxSelect("addControlItem",option);
							}
			            }
		            });
					
					if(!demoSel)othis.demoLayerList.ibxWidget("addControlItem", firstSelItem);
					if(!refSel)	othis.refLayerList.ibxWidget("addControlItem", firstSelItem);
					if(!atlasSel)othis.atlasLayerList.ibxWidget("addControlItem", firstSelItem);
					othis.demoLayerList.find(".ibx-select-item-list").ibxAddClass("wfc-multisel-layer-list");
					othis.refLayerList.find(".ibx-select-item-list").ibxAddClass("wfc-multisel-layer-list");
					othis.atlasLayerList.find(".ibx-select-item-list").ibxAddClass("wfc-multisel-layer-list");
					
				//	this.demoLayerList.ibxWidget("control").on("ibx_change", this.doUpdateDemographicLayers.bind(this));
					othis.demoLayerList.ibxWidget("popup").on("ibx_beforeclose", othis.doUpdateNotLayers.bind(othis, othis.demoLayerList));	
					othis.atlasLayerList.ibxWidget("popup").on("ibx_beforeclose", othis.doUpdateNotLayers.bind(othis, othis.atlasLayerList));	
					othis.refLayerList.ibxWidget("popup").on("ibx_beforeclose", othis.doUpdateNotLayers.bind(othis, othis.refLayerList));
				}				
			};
			waitForLoad = window.setInterval(loaded,200);
		},
		doUpdateDataLayer: function(list) {
			var othis=this,
			selItems=list.ibxSelect("selected");
			if(selItems && selItems.length){
				othis.dataLayerTitle.ibxWidget("value",selItems.eq(0).text());
			}
		},
		removeDLayer: function(filePath) {
			var othis=this,items=othis.dataLayerList.ibxSelect("controlItems"), len=items.length;
			
			for(var j = 0; j <len; j++) {
				var item=items.eq(j);
				if(item && item.ibxWidget("userValue") == filePath) {
					othis.dataLayerList.ibxSelect("removeControlItem",item,true,true);
					if(len>1) 
						othis.dataLayerList.ibxSelect("selected",items.eq(j==0 ? 1 : 0));
					else {
						othis.dataLayerList.find('input').val("");
						othis.dataLayerTitle.ibxWidget("value","");
					}						
					break; 
				}					
			}
		},
		doDataLayerTitle: function(edit) {
			var othis=this,
			selItems=othis.dataLayerList.ibxSelect("selected");
			if(selItems && selItems.length){
				var newTtl=$(edit).ibxTextField("value");
				othis.options.ibgeo.updateLayerTitle(selItems.eq(0).ibxWidget("userValue"),newTtl);
				selItems.eq(0).ibxSelectItem("option", "text", newTtl);
		//		selItems.eq(0).text(newTtl);
				othis.dataLayerList.find('input').val(newTtl);
			}
		},
		doUpdateNotLayers: function(list) {
			var othis=this; 
			var selItems=list.ibxSelect("selected");
			if(selItems && selItems.length){
				setTimeout(function(){
				var arrItems=[];
				for(var j = 0; j <selItems.length; j++) {
					var item=selItems.eq(j).ibxWidget("userValue");
					if(item) 
						arrItems.push(transform(item,othis.options.ibgeo.getEdaRequestPrefix()));
									
				}
				othis.options.ibgeo.addDemographicLayer(arrItems);
				},10);
			}
		},
		addLayerItem: function(filePath, title) {
			var othis=this;
			var option = $("<div></div>").ibxSelectItem({"align": "stretch", "selected":true, "userValue":filePath});
            option.ibxSelectItem("option", "text", title);
            othis.dataLayerList.ibxSelect("addControlItem",option);
		},
		setCameraPage: function(){
			var othis=this;
			var amBox =this.element.find(".camera-box").ibxVBox({'justify': "center", 'align': 'center'});
					
			amBox.addClass("esri-widget");
	          
			var _fovLbl = $("<div class='esri-layer-list__item-title devLabel'></div>").ibxLabel({"text":getTransString('fov')});
            var _fovSlider =  othis.doAddSlider(1, 170, 1, othis.options.ibgeo.getCameraFov(), 'fov-slider', 1);			
			
			_fovSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
	                var value=Number(othis.element.find($(".fov-slider")).ibxSlider("option", "value").toFixed(1));
					othis.options.ibgeo.updateCameraFov(value);
				}
             });
			amBox.ibxWidget("add", $(_fovLbl));
              amBox.ibxWidget("add", $(_fovSlider));
			var _headingLbl = $("<div class='esri-layer-list__item-title devLabel'></div>").ibxLabel({"text":getTransString('heading')});
            var _headingSlider = othis.doAddSlider(0, 360, 1, othis.options.ibgeo.getCameraHeading(), 'heading-slider', 1);
			
			amBox.ibxWidget("add", $(_headingLbl));
              amBox.ibxWidget("add", $(_headingSlider));
			_headingSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
                var value=Number(othis.element.find($(".heading-slider")).ibxSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraHeading(value);
				}
             });
			var _tiltLbl = $("<div class='esri-layer-list__item-title devLabel'></div>").ibxLabel({"text":getTransString('tilt')});
			var _tiltSlider = othis.doAddSlider(0, 90, 1, othis.options.ibgeo.getCameraTilt(), 'tilt-slider', 1);
			
			amBox.ibxWidget("add", $(_tiltLbl));
              amBox.ibxWidget("add", $(_tiltSlider));
			_tiltSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
                var value=Number(othis.element.find($(".tilt-slider")).ibxSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraTilt(value);
				}
             });
			var _zLbl = $("<div class='esri-layer-list__item-title devLabel'></div>").ibxLabel({"text":getTransString('height')});
			
            var _zSlider = othis.doAddSlider(0, 20000, 100, othis.options.ibgeo.getCameraHeight()/1000, 'height-slider', 10);
			
			amBox.ibxWidget("add", $(_zLbl));
              amBox.ibxWidget("add", $(_zSlider));
			_zSlider.on("ibx_change", function(e){
				if(!othis.meSetting) {
                var value=Number(othis.element.find($(".height-slider")).ibxSlider("option", "value").toFixed(1));
				othis.options.ibgeo.updateCameraHeight(value*1000);
				}
             });
			
			var suBox=$("<div class='save-box'>").ibxHBox({'justify': "center", 'align': 'center'});
			amBox.ibxWidget("add", suBox);
		/*	var _save=$("<div title='"+getTransString('CopyC')+"' id=play_refresh class='esri-layer-list__item-title devLabel'></div>").
                            ibxButton({"glyphClasses":"fas fa-camera"});
            var btn=$(_save);
            suBox.ibxWidget("add", btn);
            btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); btn.css({"color": "inherit", "max-width": 72});*/
            var txtarea = $("<div class='camera_text'></div>").ibxTextArea({"align":"stretch"});
			if(!othis.options.extOptions.hasOwnProperty("showCameraJSON") || othis.options.extOptions.showCameraJSON==false)
				txtarea.css("display", "none");
			amBox.ibxWidget("add", suBox);
			amBox.ibxWidget("add", txtarea);
			txtarea.ibxTextArea("value",othis.options.ibgeo.doCopyCamera()); 
		/*	$(_save).on('click', function(e){
              //  othis.options.ibgeo.doCopyCamera(); 
				txtarea.ibxTextArea("value",othis.options.ibgeo.doCopyCamera());   
				txtarea.select(); document.execCommand('copy');             
            });*/
			var _sync=$("<div title='"+getTransString('SyncC')+"' id=play_refresh class='esri-layer-list__item-title devLabel'></div>").
                            ibxButton({"glyphClasses":"fas fa-sync"});
            btn=$(_sync);
			btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); //btn.css({"color": "inherit", "max-width": 72});
            suBox.ibxWidget("add", btn);
            $(_sync).on('click', function(e){
              	othis.update(); 				   
            });
			othis.update();
		},
		doAddSlider: function (min, max, step, value, cssClass, precision) {
			return  $("<div class='" +cssClass+ "' data-ibxp-popup-value='true'>").ibxSlider({
                "orientation":"horizontal", "align": "stretch",   "markerShape": "circle",
                "max": max,  "min": min, "step": step,
                "lock": false, /*"value": parseInt(value,10),*/  "popupValue": true, "maxTextPos":"start","minTextPos":"start",
                "precision": precision });
		},
        update:function(){
			var othis=this;
			//if(othis.options.ibgeo.is3dView()) {
			//	$(".camera-box").show();
				setTimeout(function(){
					othis.meSetting=true;
					var h=othis.options.ibgeo.getCameraHeight()/1000;
					var t=othis.options.ibgeo.getCameraTilt(), he=othis.options.ibgeo.getCameraHeading(),fov=othis.options.ibgeo.getCameraFov();
					if(h>20000)h=20000;
					$('.height-slider').ibxSlider("option","value",parseInt(h,10));
					$('.height-slider').ibxSlider("refresh");
					$('.tilt-slider').ibxSlider("option","value",parseInt(t,10));
					$('.tilt-slider').ibxSlider("refresh");
					$('.heading-slider').ibxSlider("option","value",parseInt(he,10));
					$('.heading-slider').ibxSlider("refresh");
					$('.fov-slider').ibxSlider("option","value",parseInt(fov,10));
					$('.fov-slider').ibxSlider("refresh");
					
					setTimeout(function(){othis.meSetting=false;},100);
				},1000);
	//		}
		//	else
		//		$(".camera-box").hide();
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
        getDragImage: function()
        {
            //clone the node and make sure the width/height are preserved so it lays out correctly.
            var el = $(this.element);
            var width = el.outerWidth();
            var height = el.outerHeight();
            var clone = el.clone().css({"width":width + "px", "height":height + "px"}).removeAttr("id");
            clone.addClass("dragImage");
            return clone[0];
        }
    });
var g_szStringDelimiter=";";

function getXmlDoc(htmlDoc) {
    var head = htmlDoc.getElementsByTagName("HEAD")[0];
    var bUseBody = false;
    var rc = false;
    if (head) {
        var text = head.innerHTML;
        var confId = "//confidential_id=focus_xmlelement";
        rc = typeof (text) == 'string' && text.search(confId) != -1;
        if (!rc) //try body
            bUseBody = rc = htmlDoc.body && typeof (document.body.innerHTML) == 'string' && htmlDoc.body.innerHTML.search(confId) != -1;
        
        var aComments = bUseBody ? htmlDoc.body.childNodes : head.childNodes;
        if (aComments) {
            for (var i = 0; i < aComments.length; i++) {
                var ctrl = aComments[i];
                var text = ctrl.nodeValue;
                if (typeof (text) == 'string' && text.search(confId) != -1) {
                    var proinst = getServerProcessingInstruction();
                    text = text.replace(confId, "");
                    var str1new = "END]]>", str2new = "<![CDATA", re1 = /END]]-->/g, re2 = /<!--\[CDATA/g;
                    text = text.replace(re1, str1new);
                    text = text.replace(re2, str2new);
					var temp = new DOMParser().parseFromString(proinst + text, 'text/xml'), serializer = new XMLSerializer(),
            		xmlAcDoc = temp.nodeType == 9 ? temp : temp.ownerDocument,
            		xmlString = serializer.serializeToString(xmlAcDoc.documentElement);
			        if (typeof (xmlString) == 'string' && xmlString.search("<parsererror") != -1)
			            return null;
                    return temp;
                }
            }
        }        
    }
    return rc;
}
function getCurrentEncoding() {
	return "utf-8";
}
function getServerProcessingInstruction() {
    return '<?xml version="1.0" encoding="' + getCurrentEncoding() + '" ?>';
}
function getVariablesList(request, skipCreatedInLayout) {
    var varsToReturn = [], arrVarsToSend = [];
    var varsToSend = request ? request.getAttribute('paramstosend') : null;
    if (typeof (varsToSend) == 'string' && varsToSend.length > 0)
        arrVarsToSend = varsToSend.split(g_szStringDelimiter);

    var rqId = request ? request.getAttribute('requestid') : null;
    var pattern = '//variables/variable';
    if (skipCreatedInLayout)
        pattern += "[((not (@parametercreatedinreslay)) or (@parametercreatedinreslay!='1'))]";
    else if (skipCreatedInLayout && skipDefult)
        pattern += "[((not (@parametercreatedinreslay)) or (@parametercreatedinreslay!='1')) and ((not (@default)) or (@default='') or (@default='FOC_NONE') or (@default='_FOC_NULL'))]";

    var allVars = request ? getNodesArray(request, pattern) : getNodesArrayAll(pattern, false);
    varsToReturn = allVars;
    if (allVars) {
        varsToReturn = [];
        for (var k = 0; k < allVars.length; k++) {
            var varNode = allVars[k];
            if (!rqId)
                varsToReturn.push(varNode);
            else {
                var nameTemp = varNode.getAttribute("name");
                var requests = varNode.getAttribute('requests_list');
                if (typeof (requests) == 'string') {
                    var arrRequestIds = requests.split(g_szStringDelimiter);
                    for (var j = 0; j < arrRequestIds.length; j++) {

                        if (arrRequestIds[j] == rqId) {
                            var send = arrVarsToSend.length == 0 ? true : false;
                            for (var kk = 0; kk < arrVarsToSend.length; kk++) {
                                if (nameTemp == arrVarsToSend[kk]) {
                                    send = true;
                                    break;
                                }
                            }
                            if (send)
                                varsToReturn.push(varNode);
                            break;
                        }
                        else if (arrVarsToSend.length) {
                            for (var kk = 0; kk < arrVarsToSend.length; kk++) {
                                if (nameTemp == arrVarsToSend[kk]) {
                                    varsToReturn.push(varNode);
                                    break;
                                }
                            }
                        }
                    }
                }
                else if (varNode.getAttribute('parametercreatedinreslay') && arrVarsToSend.length) {
                    for (var ki = 0; ki < arrVarsToSend.length; ki++) {
                        if (nameTemp == arrVarsToSend[ki]) {
                            varsToReturn.push(varNode);
                            break;
                        }
                    }
                }
            }
        }
    }
    return varsToReturn;
}
/// variable class //
function Ib_variableObject(xmlNode, requestId) {
    this.xmlNode = xmlNode;
    var dinfo = getSingleNode(this.xmlNode, 'data_info');
    this.dataInfo = null;
    if (dinfo)
        this.dataInfo = new Ib_dataInfoObject(dinfo, null);
    else
        this.links = createLinkObjects(this.xmlNode);
    this.requestId = requestId;
    this.incomingValues = [];
    return this;
}
Ib_variableObject.prototype.isMaintainVariable = function () {
    if (this.xmlNode.nodeName == 'stack')
        return true;
    var t = this.xmlNode.getAttribute('maintainvar');
    return t ? parseInt(t, 10) : false;
};
Ib_variableObject.prototype.getIbiFormat = function () {
    var defObj = this.getDefaultDataInfoObject();
    return defObj ? defObj.getIBFormat() : null;
};
Ib_variableObject.prototype.getName = function () {
    var name = this.xmlNode.getAttribute('name');
    if (this.requestId)
        name = this.requestId + "." + name;
    return name;
};
Ib_variableObject.prototype.getRequests = function (arrRequests) {
    var requests = this.xmlNode.getAttribute('requests_list');
    if (typeof (requests) == 'string') {
        var arrRequestIds = requests.split(g_szStringDelimiter);
        for (var j = 0; j < arrRequestIds.length; j++)
            arrRequests.push(arrRequestIds[j]);
    }
};
Ib_variableObject.prototype.getNameOnly = function () {
    return this.xmlNode.getAttribute('name');
};
Ib_variableObject.prototype.isTextVariable = function () {
    var name = this.getName();
    return name && typeof (name) == "string" && name.search("_TEXT") != -1;
};
Ib_variableObject.prototype.getDefault = function () {
    var defVal = this.xmlNode.getAttribute('default');
    return (defVal && typeof (defVal) == 'string' && defVal.length) ? defVal : null;
};
Ib_variableObject.prototype.textVariableName = function () {
    return this.isSendDisplayValue() ? this.getName() : this.xmlNode.getAttribute(g_szAttrib_TextVarName);
};
Ib_variableObject.prototype.isSendDisplayValue = function () {
    var retVal = false;
    var send = this.xmlNode.getAttribute("senddisplayvalue");
    if (send && parseInt(send, 10) == 1)
        retVal = true;
    return retVal;
};
Ib_variableObject.prototype.setTextVariableError = function () {
    this.xmlNode.setAttribute("textVarError", 1);
};
Ib_variableObject.prototype.isTextVariableError = function () {
    var error = this.xmlNode.getAttribute("textVarError");
    return error && parseInt(error, 10) == 1;
};
Ib_variableObject.prototype.getVariableValue = function () {
    var nameOnly = this.getNameOnly();
    var value = getInputParameterValue(nameOnly, false, true);
    if (!value && typeof (nameOnly) == 'string') {
        var parts = nameOnly.split(".");
        if (parts && parts.length > 1)
            nameOnly = parts[parts.length - 1];
        value = getInputParameterValue(nameOnly, false, true);
    }
    return value;
};
Ib_variableObject.prototype.getVariableValuesIn = function () {
    this.incomingValues = [];
    var valuesFromCookies = getInputParameterValue(this.getName(), false, true);
    if (valuesFromCookies && valuesFromCookies.length) {
        for (var k = 0; k < valuesFromCookies.length; k++) {
            //check if it's there already
            var bFound = false;
            for (var b = 0; b < this.incomingValues.length; b++) {
                var temp = this.incomingValues[b];
                if (temp.value == valuesFromCookies[k]) {
                    bFound = true;
                    break;
                }
            }
            if (!bFound)
                this.incomingValues.push(new Ib_ControlValue(valuesFromCookies[k], valuesFromCookies[k], false));
        }
    }
    return this.incomingValues;
};
Ib_variableObject.prototype.getOperation = function () {
    var defObj = this.getDefaultDataInfoObject();
    var operation = defObj ? defObj.getInfoOperationAtt() : "NONE";
    return operation;
};
Ib_variableObject.prototype.getFieldToResolveParameter = function () {
    var fieldName = null;
    var defObj = this.getDefaultDataInfoObject();
    if (defObj)
        fieldName = defObj.getFieldToResolveParameter();
    if (!fieldName)
        fieldName = this.getName();
    return fieldName;
};
Ib_variableObject.prototype.getFromControlObjectByColumnName = function (colName) {
    var controlObj = null;
    if (this.dataInfo || this.isMaintainVariable()) {
        var ctrls = [];
        var col = this.getName() + (colName ? ("." + colName) : "");
        var colLower = col.toLowerCase();
        if (this.isMaintainVariable()) {
            var pattern = "//html_elements/html_element[link/condition/data_info/selectionto_item[@type='variable']]";
            var selPat1 = "link/condition/data_info/selectionto_item", selPat2 = "link/condition/data_info/column_desc/col/selectionto_item";
            var allseltos = [];
            getNodesArray(this.xmlNode, pattern, allseltos);
            pattern = "//html_elements/html_element[link/condition/data_info/column_desc/col/selectionto_item[@type='variable']]";
            getNodesArray(this.xmlNode, pattern, allseltos);

            if (allseltos && allseltos.length) {
                for (var p = 0; p < allseltos.length; p++) {
                    var columnXmls = [];
                    getNodesArray(allseltos[p], selPat1, columnXmls);
                    getNodesArray(allseltos[p], selPat2, columnXmls);
                    if (columnXmls) {
                        for (var pp = 0; pp < columnXmls.length; pp++) {
                            var nodeId = columnXmls[pp].getAttribute("id");
                            if (typeof (nodeId) == 'string' && nodeId.toLowerCase() == colLower)
                                ctrls.push(allseltos[p]);
                        }
                    }
                }
            }
        }
        else {
            var pattern = "//html_elements/html_element[link/condition/data_info/selectionto_item[@type='variable' and @id='" + col + "']]";
            ctrls = getNodesArray(this.xmlNode, pattern);
            if (!ctrls || ctrls.length == 0) {
                pattern = "//html_elements/html_element[link/condition/data_info/column_desc/col/selectionto_item[@type='variable' and @id='" + col + "']]";
                ctrls = getNodesArray(this.xmlNode, pattern);
            }
        }
        if (ctrls) {
            var controlObjs = [];
            for (var k = 0; k < ctrls.length; k++) {
                var temp = getInputControlObject(ctrls[k].getAttribute("bindcontrolid"));
                if (temp)
                    controlObjs.push(temp);
            }
            controlObj = getLastModified(controlObjs, null);
        }
    }
    return controlObj;
};
function getInputControlObject(ctrlId){
	return null;
}
function getLastModified(controlObjs) {
    var controlObj = null;
    if (controlObjs) {
        var time = 0;
        for (var kk = 0; kk < controlObjs.length; kk++) {
            var timeTemp = controlObjs[kk].getSelectionTime();
            if (timeTemp && (kk == 0 || timeTemp.getTime() > time)) {
                var tempObj = controlObjs[kk];
                
                time = timeTemp;
                controlObj = tempObj;
            }
        }
    }
    return controlObj;
}
Ib_variableObject.prototype.getFromControlNode = function (arrVisibleForms, bCheckAll) {
    var ctrls = null;
    if (this.dataInfo) {
        var pattern = "//html_elements/html_element[link/condition/data_info/selectionto_item[@type='variable' and @id='" + this.getName() + "']]";
        ctrls = getNodesArray(this.xmlNode, pattern);
        if ((!ctrls || ctrls.length == 0) && bCheckAll) {  //check all
            for (var i = 0; i < arrHtmlCanvasContainers.length; ++i) {
                var xmlRoot = arrHtmlCanvasContainers[i].getXmlRoot();
                ctrls = getNodesArray(xmlRoot, pattern);
                if (ctrls && ctrls.length > 0)
                    break;
            }
        }
    }
    return ctrls;
};
Ib_variableObject.prototype.getSetSelectionControls = function (colName) {
    var ctrlsObj = [];
    if (this.dataInfo || this.isMaintainVariable()) {
        var name = this.getName() + (colName ? ("." + colName) : "");
        var pattern = "//html_elements/html_element[link/condition/data_info[@selectedvalue='&" + name + "']]";
        var ctrlNodes = getNodesArray(this.xmlNode, pattern);
        if (ctrlNodes && ctrlNodes.length > 0) {
            for (var i = 0; i < ctrlNodes.length; ++i) {
                var temp = getInputControlObject(ctrlNodes[i].getAttribute("bindcontrolid"));
                if (temp)
                    ctrlsObj.push(temp);
            }
        }
    }
    return ctrlsObj;
};
Ib_variableObject.prototype.getFromControlObject = function (arrVisibleForms, bCheckAll) {
    if (this.dataInfo) {
        var ctrls = this.getFromControlNode(arrVisibleForms, bCheckAll);
        if (ctrls) {
            var controlObjs = [];
            for (var k = 0; k < ctrls.length; k++) {
                var temp = getInputControlObject(ctrls[k].getAttribute("bindcontrolid"));
                if (temp)
                    controlObjs.push(temp);
            }
            var controlObj = getLastModified(controlObjs, arrVisibleForms);
            if (controlObj)
                return controlObj;
            //         return null;
        }
    }
    else {
        for (var i = 0; i < this.links.length; i++) {
            var controlObj = getInputControlObject(this.links[i].getFromObjectId());
            if (controlObj)
                return controlObj;
        }
    }
    return null;
};

Ib_variableObject.prototype.getDefaultLink = function () {
    for (var i = 0; i < this.links.length; i++) {
        if (this.links[i].isDefault())
            return this.links[i];
    }
    return null;
};
Ib_variableObject.prototype.getFromLayer = function () {
    var layer = null;
    var control = this.getFromControlObject();
    if (control)
        layer = this.dataInfo ? control.getLayerBySelectionTo(this.getName()) : this.getDefaultLink().getFromTreeLayer();

    return layer;
};
Ib_variableObject.prototype.getDefaultDataInfoObject = function () {
    if (this.dataInfo)
        return this.dataInfo;
    var defaultLink = this.getDefaultLink();
    if (defaultLink)
        return defaultLink.getDefaultDataObj();
    return null;
};

Ib_variableObject.prototype.isCreatedInComposer = function () {
    var value = this.xmlNode.getAttribute('parametercreatedinreslay');
    return value && parseInt(value, 10) == 1;
};
Ib_variableObject.prototype.getVariableType = function () {
    return this.xmlNode.getAttribute('type');
};
Ib_variableObject.prototype.isMFDVariable = function () {
    return this.getVariableType() == 'master';
};
//# sourceURL=geo_ui_dev_tools.js