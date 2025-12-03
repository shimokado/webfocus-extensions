/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
// $Revision: 1.0 $:

$.widget("ibi.geoUITimeSliderOptions", $.ibi.ibxVBox,
{
	options:
	{
		ibigeo : null,
		timeSlider : null,
		position: null
	},	
	_widgetClass: "ibx-geoUITimeSliderOptions",		

	_create: function ()
	{
		this._super();
		this.timesliderOptionDialog = ibx.resourceMgr.getResource('.mlm-timeslider-options', true);	
	//	this.timesliderOptionDialog.ibxDialog('option', 'autoClose', true);
		this.element.append(this.timesliderOptionDialog);
		ibx.bindElements(this.element);
		this.element.find(".ibx-dialog-custom-button").ibxButton("option","text",getTransString("reset")).css("padding-left","5px");
	//	this.element.find(".ibx-dialog-no-button").ibxButton("option","text",getTransString("clear")).css("border-color", "transparent").attr("title",getTransString("cleartimeextent");
	//	this.element.find(".ibx-dialog-button").css({"margin-left": 0, "margin-right": 5});
		this.stopsTypeRadio = this.element.find(".mlm-stopsTypeRadio");
		this.layersSelect = this.element.find(".mlm-tsLayers");
		this.fullTimeExtentStart=this.element.find(".mlm-date-start");
		this.fullTimeExtentEnd=this.element.find(".mlm-date-end"); 
		this.stopsType=null;
		this.element.find(".mlm-tscount-spinner").find(".ibx-button").addClass("mlm-ts-spinner");
		this.element.find(".mlm-ts-intValue-spinner").find(".ibx-button").addClass("mlm-ts-spinner");
		this.element.find(".mlm-playRate-spinner").find(".ibx-button").addClass("mlm-ts-spinner");
		this.suspendEvents=false;
	//	this.element.find(".mlm-ts-loop").find(".ibx-switch-ctrl").insertAfter(this.element.find(".mlm-ts-loop").find(".ibx-switch-spacer"));
	//	this.element.find(".mlm-ts-loop").find(".ibx-label-text").insertBefore(this.element.find(".mlm-ts-loop").find(".ibx-switch-spacer"));
	//	this.element.find(".mlm-ts-timeVisible").find(".ibx-switch-ctrl").insertAfter(this.element.find(".mlm-ts-timeVisible").find(".ibx-switch-spacer"));
	//	this.element.find(".mlm-ts-timeVisible").find(".ibx-label-text").insertBefore(this.element.find(".mlm-ts-timeVisible").find(".ibx-switch-spacer"));
		this.stopsTypeRadio.on("ibx_change", (e, data) =>{
			if(!this.suspendEvents)
			this.updateStopsType();
		});
		this.layersSelect.on("ibx_change", (e, data) =>{
			if(!this.suspendEvents)
			this.updateDates();
		});
		this.initDialog = true;
		$(this.timesliderOptionDialog).on("ibx_beforeclose", function(e, closeData)
		{	
			this.options.position=this.timesliderOptionDialog.position();
			if(typeof(closeData) === 'string' && closeData == 'ok')
				this.updateTimeslider();
			else if(typeof(closeData) === 'string' && closeData == 'no')
				this.options.ibigeo.resetTimeslider();

		}.bind(this));
		$(this.timesliderOptionDialog).on("ibx_apply", function(e, closeData)
		{	
			this.updateTimeslider();
			this.timesliderOptionDialog.ibxDialog('close');
		}.bind(this));
		$(this.timesliderOptionDialog).on("ibx_custom", function(e, closeData)
		{	
			var tmslider={};
			this.options.ibigeo.getTimesliderDefaults(tmslider, true);
			this.updateFromTimeslider(tmslider);

		}.bind(this));
		$( window ).resize(function() 
		{
			this.timesliderOptionDialog.ibxWidget("close");
			this.options.ibigeo.setTimesliderActions();
		}.bind(this));
		//this.loadLayers();
		this.updateStopsType();
	},
	updateDates: function() {
		let fullTimeExtent={}, selLayers=this.layersSelect.ibxSelect("userValue"), 
		map=this.options.ibigeo.getCurrentMap();
		selLayers.forEach((layerId)=>{ 
			let layer = map.findLayerById(layerId);
			if(layer && layer.timeInfo && layer.timeInfo.fullTimeExtent) {
				let stD=new Date(layer.timeInfo.fullTimeExtent.start), endD=new Date(layer.timeInfo.fullTimeExtent.end);					
				if(!fullTimeExtent.start || new Date(fullTimeExtent.start).getTime()>stD.getTime())
					fullTimeExtent.start=layer.timeInfo.fullTimeExtent.start;
				if(!fullTimeExtent.end || new Date(fullTimeExtent.end).getTime()<endD.getTime())
					fullTimeExtent.end=layer.timeInfo.fullTimeExtent.end;					
			}				
		});	
		this.fullTimeExtentStart.ibxDatePicker('option','dateTime', new Date(fullTimeExtent.start));
		this.fullTimeExtentEnd.ibxDatePicker('option','dateTime', new Date(fullTimeExtent.end));
		this.fullTimeExtentStart.ibxDatePicker('option','date', new Date(fullTimeExtent.start));
		this.fullTimeExtentEnd.ibxDatePicker('option','date', new Date(fullTimeExtent.end));
		this.fullTimeExtentStart.ibxDatePicker('time', new Date(fullTimeExtent.start));
		this.fullTimeExtentEnd.ibxDatePicker('time', new Date(fullTimeExtent.end));
	},
	loadLayers: function(parent){
		var view=this.options.timeSlider.view, map=parent ? parent : this.options.ibigeo.getCurrentMap();
		this.layersSelect.ibxSelect('controlItems').remove();
		map.layers.forEach((layer)=>{ 
			if(layer && layer.type=="group")
				this.loadLayers(layer);
			else if(layer.timeInfo && layer.timeInfo.fullTimeExtent && layer.type!='stream'){
		//		var stdOpt = $("<div></div>").ibxSelectCheckItem({"align": "stretch", "userValue":layer.id, "text": layer.title});
	        //    stdOpt.ibxSelectCheckItem("option", "text", layer.title);			
	            this.layersSelect.ibxSelect("addControlItem",$("<div></div>").ibxSelectCheckItem({"align": "stretch", "userValue":layer.id, "text": layer.title}));
			}
			else if(layer.timeInfo && this.options.ibigeo.getDateFields(layer)) {
				this.options.ibigeo.getUniqueValuesFromField(layer, layer.timeInfo.endField, this.updateTimeExtent.bind(this));
				this.layersSelect.ibxSelect("addControlItem",$("<div></div>").ibxSelectCheckItem({"align": "stretch", "userValue":layer.id, "text": layer.title}));
			}
		});	//
	},
	updateTimeExtent: function(infos,layer) {
		if(Array.isArray(infos)) {
			let dates=[];
			infos.forEach((info)=>{
				if(info.value && (layer.type!='stream' || info.value>0))
					dates.push(info.value);
			});			
			let tInfo=this.options.ibigeo.getLayerTimeInfo(dates);
			if(tInfo && tInfo.fullTimeExtent)
			layer.timeInfo.fullTimeExtent= tInfo.fullTimeExtent;
		}
	},
	
	/*
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
*/
	updateFromTimeslider: function(tmslider) {
		if(!tmslider)
			tmslider=this.options.timeSlider;
		if(tmslider) {
			this.suspendEvents=true;
			this.loadLayers();
			let stops=tmslider.stops;
			if(stops.count) {
				this.stopsTypeRadio.ibxWidget("userValue","count");
				this.timesliderOptionDialog.find(".mlm-tscount-spinner").ibxSpinner('value', stops.count);
			}
			else if(stops.interval) {
				this.stopsTypeRadio.ibxWidget("userValue","interval");
				this.timesliderOptionDialog.find(".mlm-ts-intValue-spinner").ibxSpinner('value', stops.interval.value);
				this.timesliderOptionDialog.find(".mlm-tsInterval-unitsMenu").ibxWidget("userValue",stops.interval.unit);
			}
			this.timesliderOptionDialog.find(".mlm-ts-loop").ibxSwitch("checked", tmslider.loop);
			this.timesliderOptionDialog.find(".mlm-tsMode").ibxWidget("userValue", tmslider.mode);
			this.timesliderOptionDialog.find(".mlm-tsLayout").ibxWidget("userValue", tmslider.layout);
			this.timesliderOptionDialog.find(".mlm-playRate-spinner").ibxSpinner('value', tmslider.playRate);
			this.timesliderOptionDialog.find(".mlm-ts-timeVisible").ibxSwitch("checked", tmslider.timeVisible);
			this.layersSelect.ibxSelect("userValue","");this.layersSelect.ibxWidget("option", "text","");
			//dates
			this.fullTimeExtentStart.ibxDatePicker('option','date', new Date(tmslider.fullTimeExtent ? tmslider.fullTimeExtent.start : ""));
			this.fullTimeExtentEnd.ibxDatePicker('option','date', new Date(tmslider.fullTimeExtent ? tmslider.fullTimeExtent.end : ""));
			this.fullTimeExtentStart.ibxDatePicker('time', new Date(tmslider.fullTimeExtent ? tmslider.fullTimeExtent.start : ""));
			this.fullTimeExtentEnd.ibxDatePicker('time', new Date(tmslider.fullTimeExtent ? tmslider.fullTimeExtent.end : ""));
			//select layer
			if(tmslider.fullTimeExtent && tmslider.fullTimeExtent.start && tmslider.fullTimeExtent.end) {
				let options=this.layersSelect.ibxSelect("controlItems"), timeSt=new Date(tmslider.fullTimeExtent.start).getTime(), 
				timeEnd=new Date(tmslider.fullTimeExtent.end).getTime(), map=this.options.ibigeo.getCurrentMap();
				for(let i = 0; i<options.length; i++) {
					let item=options.eq(i), layerId=item.ibxSelectCheckItem("userValue"), layer = map.findLayerById(layerId);
					if(layer && layer.timeInfo && layer.timeInfo.fullTimeExtent) {
						let layerTimeSt=new Date(layer.timeInfo.fullTimeExtent.start).getTime(), 
						layerTimeEnd=new Date(layer.timeInfo.fullTimeExtent.end).getTime();		
						if(timeSt<=layerTimeSt && timeEnd>=layerTimeEnd)
							this.layersSelect.ibxSelect("selected", item);
					}			
				}	
			}
			setTimeout(()=>{this.suspendEvents=false;},100);
		}
	},
	/*
	;
		selLayers.forEach((layerId)=>{ 
			let layer = map.findLayerById(layerId);
							
				if(!fullTimeExtent.start || new Date(fullTimeExtent.start).getTime()>stD.getTime())
					fullTimeExtent.start=layer.timeInfo.fullTimeExtent.start;
				if(!fullTimeExtent.end || new Date(fullTimeExtent.end).getTime()<endD.getTime())
					fullTimeExtent.end=layer.timeInfo.fullTimeExtent.end;					
			}				
			*/
	updateTimeslider: function() {
		if(this.options.timeSlider) {			
			let stops={}, modeBefore=this.options.timeSlider.mode, layoutB4=this.options.timeSlider.layout;
			if(this.stopsType=='count') {
				stops.count=this.timesliderOptionDialog.find(".mlm-tscount-spinner").ibxSpinner('value');
			}
			else if(this.stopsType=='interval') {
				stops.interval={
					unit:this.timesliderOptionDialog.find(".mlm-tsInterval-unitsMenu").ibxWidget("userValue"),
					value:this.timesliderOptionDialog.find(".mlm-ts-intValue-spinner").ibxSpinner('value')
				};
			}
			else if(this.stopsType=='dates') {
				
			}
			this.options.timeSlider.stops=stops;
			this.options.timeSlider.loop=this.timesliderOptionDialog.find(".mlm-ts-loop").ibxSwitch("checked");
			this.options.timeSlider.mode=this.timesliderOptionDialog.find(".mlm-tsMode").ibxWidget("userValue");
			this.options.timeSlider.playRate=this.timesliderOptionDialog.find(".mlm-playRate-spinner").ibxSpinner('value');
			this.options.timeSlider.timeVisible=this.timesliderOptionDialog.find(".mlm-ts-timeVisible").ibxSwitch("checked");
			this.options.timeSlider.layout=this.timesliderOptionDialog.find(".mlm-tsLayout").ibxWidget("userValue");
			let fullTimeExtent={
				start:new Date(this.fullTimeExtentStart.ibxDatePicker('option','dateTime')),
				end:new Date(this.fullTimeExtentEnd.ibxDatePicker('option','dateTime'))
			}; /*selLayers=this.layersSelect.ibxSelect("userValue"), 
			map=this.options.ibigeo.getCurrentMap();
			selLayers.forEach((layerId)=>{ 
				let layer = map.findLayerById(layerId);
				if(layer && layer.timeInfo && layer.timeInfo.fullTimeExtent) {
					let stD=new Date(layer.timeInfo.fullTimeExtent.start), endD=new Date(layer.timeInfo.fullTimeExtent.end);					
					if(!fullTimeExtent.start || new Date(fullTimeExtent.start).getTime()>stD.getTime())
						fullTimeExtent.start=layer.timeInfo.fullTimeExtent.start;
					if(!fullTimeExtent.end || new Date(fullTimeExtent.end).getTime()<endD.getTime())
						fullTimeExtent.end=layer.timeInfo.fullTimeExtent.end;					
				}				
			});	*/
			if(fullTimeExtent.start.getTime()==fullTimeExtent.end.getTime())
				this.options.ibigeo.resetTimeslider();
			else {				
				this.options.timeSlider.fullTimeExtent=fullTimeExtent;
				if(this.options.timeSlider.mode=='time-window') {
					let timeExtent=this.options.timeSlider.timeExtent;
					if(fullTimeExtent) {
						let startD=new Date(this.options.timeSlider.fullTimeExtent.start),
						endD=new Date(this.options.timeSlider.fullTimeExtent.end);
	
						if(this.stopsType=='count') {
							let startTime=new Date(fullTimeExtent.start).getTime(), endTime=new Date(fullTimeExtent.end).getTime();
							endD=new Date(startTime+((endTime-startTime)/(stops.count-1)));
						}
						else if(this.stopsType=='interval')						
							endD=getTimeExtentEnd(new Date(startD), stops.interval.unit, stops.interval.value);
						this.options.timeSlider.timeExtent={ start: startD, end: endD};		
					}
				}
				else {				
					if(this.options.timeSlider.mode=="instant")	
						fullTimeExtent.end=	fullTimeExtent.start;
					else if(this.options.timeSlider.mode=="cumulative-from-start") {
						fullTimeExtent.end=	fullTimeExtent.start;
						fullTimeExtent.start=null;
					}	
					else if(this.options.timeSlider.mode=="cumulative-from-end") {
						fullTimeExtent.start=fullTimeExtent.end;
						fullTimeExtent.end=null;
					}						
					this.options.timeSlider.timeExtent=fullTimeExtent;
				}	
				if(this.options.timeSlider.fullTimeExtent.start || this.options.timeSlider.fullTimeExtent.end)		
				setTimeout(()=>{this.options.ibigeo.setTimesliderActions();
					$(this.options.timeSlider.container).find(".esri-time-slider__slider").addClass("esri-time-slider");//.show();
				//	$(this.options.timeSlider.container).find(".esri-time-slider__slider").show();
				},100);
				else this.options.ibigeo.resetTimeslider();
			}
		}		
	},
	updateStopsType: function() {
		let temp=this.stopsTypeRadio.ibxWidget("userValue"), count=this.timesliderOptionDialog.find(".stops-count"),
		interval=this.timesliderOptionDialog.find(".stops-interval"),dates=this.timesliderOptionDialog.find(".stops-dates");
		if(this.stopsType!=temp) {
			this.stopsType=temp;
		
			if(this.stopsType=='count') {
				count.show({duration:'fast'});
				interval.hide({duration:'fast'});
				dates.hide({duration:'fast'});
			}
			else if(this.stopsType=='interval') {
				count.hide({duration:'fast'});
				interval.show({duration:'fast'});
				dates.hide({duration:'fast'});
			}
			else if(this.stopsType=='dates') {
				count.hide({duration:'fast'});
				interval.hide({duration:'fast'});
				dates.show({duration:'fast'});
			}
		}
	},
	show: function() {
		this._showDialog();
	},
	_showDialog: function()
	{
		if(!this.timesliderOptionDialog.ibxWidget("isOpen")) {
			this.options.timeSlider.stop();
			this.updateFromTimeslider();
			var positionAt = $(this.options.timeSlider.container).height() + 2;
			var pos = 	
			{
				my: "right-1 top",
				at: "right top+" + positionAt,
				of: $(this.options.timeSlider.container)
			};
			this.timesliderOptionDialog.ibxWidget("open").position(pos);
			if(this.options.position)
				this.timesliderOptionDialog.css({left:this.options.position.left, top: this.options.position.top});
		}		
	},
	
	_resetDialog: function()
	{
		this.isReset = true;

	},

	_destroy: function ()
	{
		this._super();
	},
});
	
//# sourceURL=geo_ui_timeSlider_options.js