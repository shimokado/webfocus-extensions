/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/

$.widget("ibi.geoUISelectionTools", $.ibi.ibxHBox,{

	options:{
		ibgeo: null,
		layersSel: false
	},

	_widgetClass:"map-tools-container",
	
	_create:function(){
		var othis =  this;
	//	var _wrapper = $("<div class='tools-wrapper'>").ibxHBox();
		var _wrapper = $(".map-selTools-content");
	//	
		if(this.options.layersSel)
		{
	    	var targetLayerList =  $("<div tabindex='6'></div>").ibxSelect({userValue:"layers", tooltip: "Layers", class: "activeLayerSelect", readonly: true});
			targetLayerList.on("ibx_change", function(e, data){
				var selBox=$(this);
				if(selBox.parents(".map-selTools-main").ibxPopup('isOpen'))
				{
					var selOpt = selBox.ibxSelect("selected");
					if(selOpt.ibxWidget("option","disabled"))
					{
						var visLay = othis.options.ibgeo.updateLayersVisibility();
						if(visLay)
						{
							selOpt = selBox.find('#'+visLay.id);
							selBox.ibxSelect("selected",selOpt);
						}
					}
					if(selOpt && othis.options.ibgeo.getTargetLayerId() != selOpt.attr("id")) {
						othis.options.ibgeo.clearAllSelection();
						othis.options.ibgeo.setTargetLayer(selOpt.attr("id"));
					}
					if(selOpt.attr("id"))
						doAction(false);
				}
			});
			_wrapper.append(targetLayerList);
			function layersValidation(lyr){
				var visible = lyr.visible;
				var type = (lyr.type === "feature" || lyr.type === "map-image") ;
				return(visible && type);
	
			}
			function loadLayers()
			{
				targetLayerList.html();
				if(othis.options.ibgeo.layerList && othis.options.ibgeo.layerList.length){
					var selOpt = null;
					othis.options.ibgeo.layerList.forEach(function(lyr){
						if(layersValidation(lyr.layer)){
							var option = $("<div id='"+lyr.layer.id+"'></div>").ibxSelectItem({"align": "stretch"});
							var txt=lyr.layer.title ? lyr.layer.title : lyr.layer.id;
							option.ibxSelectItem("option", "text", txt);
							if(!selOpt)
								selOpt=option;
								var isthere = targetLayerList.children("#"+lyr.id);
							if(isthere.length === 0){
								targetLayerList.ibxSelect("addControlItem",option);
							}
						}
					});
					if(selOpt){
						targetLayerList.ibxSelect("selected", selOpt);
						othis.options.ibgeo.setTargetLayer(selOpt.attr("id"));
					}
				}
			}
			loadLayers();
		}		
		var toolSetBox = $("<div class='shapeTools'>").ibxHBox({aligh: "stretch"});

		othis.cmd = $("<div>").ibxCommand({id:"cmdToolType",  class: "cmd-sel-type"}).on("ibx_uservaluechanged", function(e){
			var userValue = $(e.target).ibxWidget("userValue");
			othis.options.userValue=userValue;
			doAction(true, true);
		});
		function doAction(bUpdateDB, setFoc)
		{
			var focus= ".pan-tool";  
			switch(othis.options.userValue)
			{
				case "selExtent":
					{
						if(bUpdateDB)
							showDistanceBox(false);
					//	showPanBtn(false);
						othis.options.ibgeo.selectByExtent();
						focus= ".sel-extent";
						break;	
					}
				case "selPolygon":
					{
						if(bUpdateDB)
							showDistanceBox(false);
						othis.options.ibgeo.selectWithinPolygon("click");
						focus= ".sel-polygon";
						break;	
					}
				case "selPolyLine":
					{
						if(bUpdateDB)
							showDistanceBox(true);
						othis.options.ibgeo.selectWithPolyLine();
						focus= ".sel-polyLine";
						break;	
					}
				case "selCircle":
					{
						if(bUpdateDB)
							showDistanceBox(true);
						othis.options.ibgeo.selectByDistanceFromPoint();
						focus= ".sel-circle";
						break;	
					}
				case "deSelectFeatures":
					{
						if(bUpdateDB)
							showDistanceBox(false);
						
						othis.options.ibgeo.deSelectByExtent();
						focus= ".remove-from-selection";
						break;	
					}
				case "panTool":
					{
						if(bUpdateDB)
							showDistanceBox(false);
						othis.options.ibgeo.activateMapPan();
						break;	
					}
			}
		/*	if(setFoc)
			{
				$(".cmdRadioGroup").find(".btn-sel-type").removeClass("ibx-sm-focused");				
				$(".cmdRadioGroup").find(focus).addClass("ibx-sm-focused");
			}*/
		}
		var cmdRadioGroup = $("<div tabindex='0' class='cmdRadioGroup'></div>").ibxHRadioGroup({command:"cmdToolType" });
		
		function addSelectionTools(){
			var panBtn = $("<div tabindex='-1'></div>").ibxRadioButton({
				userValue:"panTool", tooltip: getTransString('Pan'), checked: true,
				aria: {label:getTransString('PanAnon')},
				class: "btn-sel-type pan-tool", 
				glyphClasses:"ibx-icons ibx-glyph-selection-pan"
			});
			cmdRadioGroup.ibxWidget("add", panBtn);
			
			var drb = $("<div tabindex='-1' title='"+getTransString('RectSel')+"'></div>").ibxRadioButton({userValue:"selExtent", 
				aria: {label:getTransString('RectSelAnon')}, 
				class: "btn-sel-type sel-extent", glyphClasses:"ibx-icons ibx-glyph-selection-square"});
			cmdRadioGroup.ibxWidget("add", drb);
		
			drb = $("<div tabindex='-1' title='"+ getTransString('RadSel')+"'></div>").ibxRadioButton({userValue:"selCircle",
				 aria: {label:getTransString('RadSelAnon')}, 
				class: "btn-sel-type sel-circle", glyphClasses:"ibx-icons ibx-glyph-selection-circle"});
			cmdRadioGroup.ibxWidget("add", drb);
		
			drb = $("<div tabindex='-1' title='"+getTransString('FreehandSel')+"'></div>").ibxRadioButton({userValue:"selPolygon",
				aria: {label:getTransString('FreehandSelAnon')},	
				class: "btn-sel-type sel-polygon", glyphClasses:"ibx-icons ibx-glyph-selection-polygon"});
			cmdRadioGroup.ibxWidget("add", drb);
		
			drb = $("<div tabindex='-1' title='"+getTransString('LineSel')+"'></div>").ibxRadioButton({userValue:"selPolyLine", 
				aria: {label:getTransString('LineSelAnon')}, 
				class: "btn-sel-type sel-polyLine", glyphClasses:"ibx-icons ibx-glyph-selection-polyline"});
			cmdRadioGroup.ibxWidget("add", drb);
		
			/*drb = $("<div></div>").ibxRadioButton({userValue:"selFixDistance",  tabindex:"5", tooltip: "Fixed Distance Selection", 
				class: "btn-sel-type sel-fix-distance", glyphClasses:"ibx-icons ibx-glyph-drop-target"});
			cmdRadioGroup.ibxWidget("add", drb);
			
			drb = $("<div></div>").ibxRadioButton({userValue:"selLineBuffer",  tabindex:"6", tooltip: "Line Buffer Selection", 
				class: "btn-sel-type sel-line-buffer", glyphClasses:"ibx-icons ibx-glyph-fex-visualization"});
			cmdRadioGroup.ibxWidget("add", drb);
			*/

			drb = $("<div tabindex='-1' title='"+getTransString('RemFromSel')+"'></div>").ibxRadioButton({userValue:"deSelectFeatures", 
				aria: {label:getTransString('RemFromSelAnon')}, disabled: true,
				class: "btn-sel-type remove-from-selection", glyphClasses:"ibx-icons ibx-glyph-selection-deselect"});
			cmdRadioGroup.ibxWidget("add", drb);
		
			drb = $("<div tabindex='0' title='"+getTransString('ClearSel')+"'></div>").ibxButton({userValue:"clearSelection", 
				aria: {label:getTransString('ClearSelAnon')}, disabled: true,
				class: "btn-sel-type clear-selection", glyphClasses:"ibx-icons ibx-glyph-selection-clear"});
			drb.click(function(e){othis.options.ibgeo.clearAllSelection();doAction(false);});
			toolSetBox.ibxWidget("add", cmdRadioGroup);
			toolSetBox.ibxWidget("add", drb);				
		}
		
		function showPanBtn(bShow)
		{
			return;
			var box = othis.element.find($(".pan-tool"));
			if(box.length > 0) {
				if(bShow)
					box.show();
				else
					box.hide();
			} 
		}
		function showDistanceBox(bShow)
		{
			var box = toolSetBox.find($(".distance-box-wrapper"));
			if(box.length > 0)	{
				var vis = box.is(":visible");
				if(vis != bShow)
				{
					if(bShow)
						box.show();
					else
						box.hide();
				}
				if(bShow)
				{
					var input = $(".distanceEdit");
					if(input)
						input.ibxTextField("option", "text", getTransString('Distance'));
				}
			} 
			else if(bShow)
				addDistanceBox(toolSetBox, true);
		}
		function addDistanceBox(toolSetBox, bShow){
			
			var wrapper = $("<div class='distance-box-wrapper'>").ibxHBox({	aligh: "stretch"});
			var showU=othis.options.ibgeo.isShowUnits();
			var distance = $("<div tabindex='0'></div>").ibxTextField({class: "distanceEdit", 
				aria: {label:getTransString('DistanceAnon')},
				text: getTransString('Distance')});
			if(showU) {
				var unitsMenu = $("<div tabindex='0' title='"+getTransString('Units')+"'></div>").ibxSelect({userValue:"units", 
					aria: {label:getTransString('UnitsAnon')},
					class: "distanceUnits unitsMenu", readonly: true});
				$(unitsMenu).on("ibx_change", function(e, data){
					othis.options.ibgeo.setSelectedUnit(data.text);
				});
			}			
			$(distance).find("input").on("blur", function(e){
				var map= $(e.relatedTarget).hasClass("esri-view-surface");
				var obj=$(this);
				if(map)
				{
					var distObj=obj.parents(".distanceEdit");
					var orgDist = distObj.ibxTextField("option", "text");
					if(!isNaN(orgDist))
						othis.options.ibgeo.doResetSketch(othis.options.userValue);	
				}					
			});
			$(distance).on("ibx_textchanging", function(e){
				var obj=$(this);
				var orgDist = obj.ibxTextField("option", "text");
				if(e.which != $.ui.keyCode.TAB && orgDist==getTransString('Distance'))
					obj.ibxTextField("option", "text", "");				
				switch (e.which)
				{
					case $.ui.keyCode.ENTER:
					case $.ui.keyCode.BACKSPACE:
					case $.ui.keyCode.COMMA:
					case $.ui.keyCode.DELETE:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.END:
					case $.ui.keyCode.ESCAPE:
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.LEFT:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PERIOD:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.TAB:
						break;
					default:
					{
						if(isNaN(parseInt( e.key, 10 )))
						{
							e.preventDefault();	
							return false;
						}
					}
				}
			});
			$(distance).on("change", function(e){
				var obj=$(this);
				var input = $(e.target).val();
				if(!input)
					input=getTransString('Distance');
				obj.ibxTextField("option", "text", input);
				doAction(false);
			});
			if(showU){
				var selOpt=null;
				Object.keys(othis.options.ibgeo.units).forEach(function(U){
					
					var option = $("<div id='"+U+"'></div>").ibxSelectItem({"align": "stretch"});
					option.ibxSelectItem("option", "text", U);
					if(othis.options.ibgeo.isSelectedUnit(U))
						selOpt=option;
					unitsMenu.ibxSelect("addControlItem",option);
				});
				if(selOpt)
					unitsMenu.ibxSelect("selected", selOpt);
			}
			wrapper.ibxWidget("add", distance);
			wrapper.ibxWidget("add", $(unitsMenu));
			toolSetBox.ibxWidget("add", wrapper);
			if(!bShow)
				wrapper.hide();
		}
		/*othis.options.ibgeo._view.on("selection-completed", function(e){
			if(e.data.length){
				if(othis.element.find($('.clearSelectionTools')).length === 0){
					addClearSelectionTools();
				}

			}else{
				othis.element.find($(".clearSelectionTools")).remove();
			}
		});*/
	//	addPanBtn(toolSetBox, 2);
		
		addSelectionTools();
		addDistanceBox(toolSetBox);
		_wrapper.append($(toolSetBox));
		
	//	this.element.append($(_wrapper));
		
	},

	_init:function(){
		this._super();
	},

	_destroy:function(){
		this._super();
	},

	_refresh:function(){
		var options = this.options;
		this._super();
	},

	/////////////////////////////////////////////////////
	// Canvas widget interface functions:
	getPropertiesPage: function (){

	},
	initPropertiesPage: function (propPage){
		// Set controls to the correct values,
		// and hook up the listeners
	},

	_setOption: function (key, value){
		this._super(key, value);
	},

});

//# sourceURL=geo_ui_selection_tools.js