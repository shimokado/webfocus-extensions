/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
$.widget("ibi.geoUIDiscover", $.ibi.ibxVBox,
    {	
        options:{
            ibgeo: null,
			serviceDesc: {},
			cutoffdelimeter: " "
        },
        _widgetClass:"map-wdg-discover",
       
        _create:function()
        {
            this._super();
			var othis=this;
			var markup = ibx.resourceMgr.getResource(".discover-box", false);
			this.element.append(markup);
			ibx.bindElements(this.element);
			this.selectedCutoff=60;
			this.element.addClass("esri-widget esri-widget--panel-height-only");
			this.element.css({"width":"375px", "max-height":"620px"});
			this._travelModes=this.element.find(".trevalmode-select"); this._units=this.element.find(".unitsMenu");
		//	this.timeDepartPicker=this.element.find(".mlm-date-depart");
			this._timepicker=this.element.find(".mlm-time-picker");
			this._directionpicker=this.element.find(".mlm-directionModeRadio");
			this._travelModesRadio=this.element.find(".mlm-travelTypeRadio"); this._travelByRadio=this.element.find(".mlm-travelTypeModeRadio");
			this._cutoffsEdit=this.element.find(".cutoffsEdit");this._discover=this.element.find(".btndiscover");
			this._clear=this.element.find(".btnclear");this._startSelect=this.element.find(".start-select");
			this._search=this.element.find(".searchEdit");  this._cuttoff_slider=this.element.find(".mlm-discover-cutoffs-slider"); 
			this._addCutoff=this.element.find(".addCuttoff");this._removeCutoff=this.element.find(".removeCuttoff");
			this._cuttoff_slider.find(".ibx-slider-body-start").add(".ibx-slider-body-horizontal-start", othis._cuttoff_slider).add(".ibx-slider-body-horizontal-start", othis._cuttoff_slider).add(".ibx-slider-body-horizontal-start", othis._cuttoff_slider).add(".layers-box", othis._cuttoff_slider).addClass("mlm-slider");
		//	this._cuttoff_slider.find(".ibx-slider-body-start").addClass("mlm-slider");
			this._timeMode=this.element.find(".mlm-timeModeRadio");
			this._travelByRadio.on("ibx_change", e => {
				this.updateUnitsMenu2();
            });
			this._cuttoff_slider.on("ibx_change", e => {				
	            let value=Number(othis._cuttoff_slider.ibxHSlider("option", "value").toFixed(0));
				othis.updateLastCutoff(value);
             });
			this._cuttoff_slider.on('blur', e => {
			    othis.selectedCutoff=null;
			});
			this.addRemoveCutoff(true);
		//	this.setTravelModeMenu();
			this._discover.on("click", this.doDiscover.bind(this));
			this._addCutoff.on("click", this.addRemoveCutoff.bind(this, true)); this._removeCutoff.on("click", this.addRemoveCutoff.bind(this, false));
			this._clear.on("click", this.doClear.bind(this));
			this.element.find(".btncDirections").on("click", this.doDirectionsFromSelected.bind(this));
			this.options.ibgeo.addSearchWidget(this._search);
		//	this.options.ibgeo.addTimepickerWidget(this._timepicker);
			this.element.find(".btnlocate").on("click", e => {	
              //  othis.options.ibgeo.doLocate();
				othis.options.ibgeo.startDriveDiscover("locate");
			});
			this._cutoffsEdit.on('keyup', e => {
				if(e.keyCode==27) othis.selectedCutoff=null;
				else othis.setCutoff(e.target.selectionStart);
			});
			this._cutoffsEdit.find("input").on('keyup keydown', e => {
				if(e.keyCode==9) othis.selectedCutoff=null;
			});
			this._cutoffsEdit.on('mouseup', e => {
			    othis.setCutoff(e.target.selectionStart);
			});
			this._cutoffsEdit.on('blur', e => {
			    othis.selectedCutoff=null;
			});
			
			this._cuttoff_slider.on('keyup', e => {
				if(e.keyCode==27) othis.selectedCutoff=null;
			});
			this.element.find(".mlm_discover_iframe").hide();	
			this._timepicker.ibxTimePicker("time", new Date());		
        },	
		setCutoff: function(caretPos) {
			let values=this._cutoffsEdit.ibxWidget("value");
			this.selectedCutoff=null;
			if(typeof(values)==='string' && caretPos<values.length) {
				var cutoffSel=null, indTemp = values.indexOf(this.options.cutoffdelimeter), ind1=-1;
				while(indTemp!=-1) {					
					if(indTemp>=caretPos) {
						if(ind1==-1) ind1=0;
						break;
					}					
					ind1=indTemp+1;
					indTemp = values.indexOf(this.options.cutoffdelimeter, ind1);
				}

				cutoffSel= ind1 != -1 ? values.substring(ind1, (indTemp != -1 ? indTemp : values.length)) : values;
					console.log(cutoffSel);
				if(typeof(cutoffSel) == 'string') {
					this.selectedCutoff=parseInt(cutoffSel,10);
					this._cuttoff_slider.ibxHSlider("option", "value", this.selectedCutoff);
				}
			}
		},
		updateLastCutoff: function(value) {
			if(!isNaN(this.selectedCutoff)) {
				let cutoffs=this.getCutoffs(), update=false;
				for(let i = 0; i < cutoffs.length; i++) {
					if(cutoffs[i] == this.selectedCutoff){
						this.selectedCutoff=cutoffs[i]=value; update=true;
						break;
					}
				}
				if(!update && cutoffs.length) {this.selectedCutoff=cutoffs[cutoffs.length-1]=value; update=true;}
				if(update) {
					var sel = this._cutoffsEdit.find("input").prop("selectionStart");
					this._cutoffsEdit.ibxWidget("value",cutoffs.join(this.options.cutoffdelimeter));
					this._cutoffsEdit.find("input").prop("selectionEnd", sel);
				}				
			}
		},
		getCutoffs: function(cutoffs) {
			if(!cutoffs)cutoffs=[];
			let values=this._cutoffsEdit.ibxWidget("value"),
			cutoffsVals = typeof(values) == 'string' && values.length ? values.split(this.options.cutoffdelimeter) : null;// [60];	
			if(Array.isArray(cutoffsVals)) {
				cutoffsVals.forEach(function(val){
					cutoffs.push(parseInt(trimLeftAndRight(val),10));
				});
			}	
			return cutoffs;
		},
		addRemoveCutoff: function(add) {
			let value=Number(this._cuttoff_slider.ibxHSlider("option", "value").toFixed(0));
			let values=this._cutoffsEdit.ibxWidget("value"), cutoffs=[],
			cutoffsVals = typeof(values) == 'string' && values.length ? values.split(this.options.cutoffdelimeter) : null;// [60];	
			if(Array.isArray(cutoffsVals)) {
				cutoffsVals.forEach(function(val){
					cutoffs.push(parseInt(trimLeftAndRight(val),10));
				});
			}	
			if(add) cutoffs.push(value);
			else {
				let remInd=cutoffs.length-1;
				if(!isNaN(this.selectedCutoff)) {
					for(let i = 0; i < cutoffs.length; i++) {
						if(cutoffs[i] == this.selectedCutoff){
							remInd=i;
							break;
						}
					}
				}
				cutoffs.splice(remInd,1);
			}
			this._cutoffsEdit.ibxWidget("value",cutoffs.join(this.options.cutoffdelimeter));
		},
		doDiscover: function() {
		//	this.options.ibgeo.startDriveDiscover(this._startSelect.ibxWidget("userValue"));
			this.options.ibgeo.startDriveDiscover("manual");
			//searchEdit
		},	
		doDirectionsFromSelected: function() {
			this.options.ibgeo.showDirectionsFromSelected(null, null, this._directionpicker.ibxWidget("userValue"));
		},
		doClear: function() {
			this.options.ibgeo.startDriveDiscover(null);
			this.options.ibgeo.removeGraphicByPrivateId("servicearea");	
			this.element.find(".mlm_discover_iframe").hide({ effect: "blind",  duration: 300});
		//	this.options.ibgeo.clearAllSelection();
		},
		setTravelModeMenu: function() {
			//serviceDesc: {},this._travelModes
			let temp=this.options.serviceDesc ? this.options.serviceDesc.supportedTravelModes : null;
			if(temp && Array.isArray(temp)) {
				temp.forEach(function (tmode) {
	                this.doAddMenuItem(tmode.id, tmode.name, this._travelModes, 
						tmode.id==this.options.serviceDesc.defaultTravelMode);
	            }.bind(this));
			}
			this._travelModes.on("ibx_change", this.updateUnitsMenu.bind(this));
			this.updateUnitsMenu(this.options.serviceDesc.defaultTravelMode);
			//: "Kilometers" == distanceAttributeName: "Kilometers" -> distance else time
		},
		updateUnitsMenu: function(event) {
			let travelModeId= typeof(event) === 'string' ? event : $(event.target).ibxWidget("userValue"),
			travelMode=this.getTravelMode(travelModeId), distance = false;
			if(travelMode)
				distance = travelMode.impedanceAttributeName == travelMode.distanceAttributeName;
			this._units.ibxWidget("controlItems").remove();
			if(distance) {
				this.doAddMenuItem("kilometers", "km", this._units);
				this.doAddMenuItem("miles", "mi", this._units);
				this._units.ibxWidget("userValue",travelMode.distanceAttributeName);
			}
			else {
				this.doAddMenuItem("min", "min", this._units,true);
			}
		},
		getTravelMode: function(modeId) {
			let temp=this.options.serviceDesc ? this.options.serviceDesc.supportedTravelModes : null;
			if(temp && Array.isArray(temp)) {
				for( let i = 0; i < temp.length; i++) {
					if(temp[i].id == modeId)
						return temp[i];
				}
			}
			return null;
		},
		updateUnitsMenu2: function() {
			let trTimeDist=this._travelByRadio.ibxWidget("userValue"); 
			if(trTimeDist == "time") {
				this.element.find(".timeUnits").removeClass("disabledwidget");
				this.element.find(".distanceUnits").addClass("disabledwidget");
			}
			else {
				this.element.find(".timeUnits").addClass("disabledwidget");
				this.element.find(".distanceUnits").removeClass("disabledwidget");
			}
		},
		getTravelMode2: function() {
			let trMode = this._travelModesRadio.ibxWidget("userValue"), trTimeDist=this._travelByRadio.ibxWidget("userValue");
			return this.options.ibgeo.getTravelingMode(trMode, trTimeDist);			
		},
		onShow: function() {
			this._cuttoff_slider.ibxHSlider("refresh");
		},
		doAddMenuItem: function(value, display,addTo,select) {
			let stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":value});
            stdOpt.ibxSelectItem("option", "text", display);
			if(select) stdOpt.ibxSelectItem("option", "selected", true);
            addTo.ibxSelect("addControlItem",stdOpt);
		},
		getParameters: function(srvAreaParams) {
			srvAreaParams["units"]= 
					this.element.find(this._travelByRadio.ibxWidget("userValue") == "TravelTime" ? ".timeUnits" : ".distanceUnits").ibxWidget("userValue");
		//	srvAreaParams["travelMode"]=this.getTravelMode(this._travelModes.ibxWidget("userValue"));timeStartDatePicker
			srvAreaParams["travelMode"]=this.getTravelMode2();
			srvAreaParams["travelDirection"]=this._directionpicker.ibxWidget("userValue");
			if(srvAreaParams.travelMode.impedanceAttributeName == srvAreaParams.travelMode.distanceAttributeName &&
					 srvAreaParams.travelMode.impedanceAttributeName!=srvAreaParams.units) {
				srvAreaParams.travelMode.impedanceAttributeName=srvAreaParams.units;
				srvAreaParams.travelMode.distanceAttributeName=srvAreaParams.units;
			}			
			let values=this._cutoffsEdit.ibxWidget("value"), cutoffs=[],
			cutoffsVals = typeof(values) == 'string' && values.length ? values.split(this.options.cutoffdelimeter) : null;// [60];	
			if(Array.isArray(cutoffsVals)) {
				cutoffsVals.forEach(function(val){
					cutoffs.push(parseInt(trimLeftAndRight(val),10));
				});
			}	
			let timeObj=this._timepicker.ibxTimePicker("time");
			if(timeObj) {
				let date=new Date(), trTimeDist=this._travelByRadio.ibxWidget("userValue"),
				arival=this._timeMode.ibxHRadioGroup("userValue") ? true : false, curHours=date.getHours();
				date.setHours(timeObj.hour24, timeObj.minute);
				if(curHours>timeObj.hour24)
					date.setDate(date.getDate()+1);
				if(arival && trTimeDist=="time" && cutoffs.length) {
					date.setMinutes(date.getMinutes()-cutoffs[0]);
				}
				srvAreaParams["timeOfDay"]=date;
				srvAreaParams["arival"]=arival;
			}
			
		//	
			srvAreaParams["defaultBreaks"]=cutoffs;
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

//# sourceURL=geo_ui_discover.js