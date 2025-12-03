/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/

$.widget("ibi.geoUISymbolSettings", $.ibi.ibxVBox,
    {
	
        options:{
            ibgeo: null,
            symbol: null
        },
		selField:{name:"",type:"string"},
        _widgetClass:"map-wdg-symbol-settings",
       
        _create:function()
        {
            this._super();
			
			var markup = ibx.resourceMgr.getResource(".wfc-map-container-symbolEditor", false);
			this.element.append(markup);
			ibx.bindElements(this.element);
			this.updating=true;
			this.note_editor=this.element.find('.maps-notes-textarea');	
			
			this.text_color=this.element.find('.text-colorpick');
			this.text_color.on("ibx_colorchange", this.onTextColorChange.bind(this));
			this.background_color=this.element.find('.background-colorpick');
			this.background_color.on("ibx_colorchange", this.onBackgroundColorChange.bind(this));
			this.border_color=this.element.find('.border-colorpick');
			this.width_slider=this.element.find('.borderWidth-slider');
			this.textangle_slider=this.element.find('.textangle-slider');			
			//font	
			this.fontDecoration=this.element.find('.mlm-symbol-fontdecoration');	
			this.fontsizeunits=this.element.find('.font-formatter-size-unit');
			this.fontStyleBold=this.element.find('.font-formatter-style-bold');
			this.fontStyleItalic=this.element.find('.font-formatter-style-italics');
			this.fontStyleUnder=this.element.find('.font-formatter-style-underline');
			this.fontsize=this.element.find('.font-formatter-size-select');
			this.fontname=this.element.find('.mlm-symbol-fontnameSelect');
		//	this.fontname.ibxSelect("option", "autoHeight", false);
			this.fontname.ibxSelect("option", "autoHeightGap", 10);			
			this.linestyle=this.element.find('.mlm-line-settings');
			styleSelectBox(this.fontname);
			styleSelectBox(this.fontsize);
			styleSelectBox(this.note_editor);
			styleSelectBox(this.linestyle);
			this.loadFonts();
			this.loadFontSize();
			this.showTextSettings(false);
			//events
			this.fontname.on("ibx_change", (e, data) =>{
				this.updateSelectedGraphicsFont();
			});
			this.linestyle.on("ibx_change", (e, data) =>{
				if(!this.updating)
				this.options.ibgeo.updateSelectedGraphics("linestyle", "style", $(data.item).ibxWidget("userValue"));
			});
			this.fontsizeunits.on("ibx_change", (e, data) =>{
				this.updateSelectedGraphicsFont();
			});
			this.fontsize.on("ibx_change", (e, data) =>{
				this.updateSelectedGraphicsFont();
			});
			this.fontDecoration.on("ibx_change", (e, data) =>{
				this.updateSelectedGraphicsFont();
			});
			////
			this.border_color.on("ibx_colorchange", this.onBorderColorChange.bind(this));
			this.note_editor.on("ibx_change", (e, data) =>{
				if(!this.updating) {
					this.showTextSettings(true);
					if(this.options.ibgeo.updateSelectedGraphics("text", "text", data.text)===true)
						setTimeout(()=>{this.updateSettings();}, 5);
				}				
			});
			this.textangle_slider.on("ibx_change", (e, data) =>{
				if(!this.updating)
				this.options.ibgeo.updateSelectedGraphics("angle", "angle", data.value);
			});
			
			this.width_slider.on("ibx_change", (e, data) =>{
				if(!this.updating)
				this.options.ibgeo.updateSelectedGraphics("borderLineSize", "size", data.value);
			});
			this.element.find(".mlm-color-picker-swatch").removeClass("ibx-menu-item");			
        },
		showTextSettings: function(show) {
			let textSet=this.element.find('.mlm-text-settings');
			if(show) textSet.css("display", "block");
			else textSet.css("display", "none");			
		},
		showLineSettings: function(show) {
			let hideSet=this.element.find('.mlm-not-line-settings'), showSet=this.element.find('.mlm-line-settings');
			if(show) { hideSet.hide(); showSet.show();}
			else {hideSet.show(); showSet.hide(); }			
			this.element.find('.mlm-width-label').ibxLabel("option", "text", show ? getTransString('width') : getTransString('borderWidth'));
			this.element.find('.mlm-backgroundcolor-label').ibxWidget("option","text", show ? getTransString('color') : getTransString('backcolor'));			 
		},
		loadFonts: function() {
			let fontsArr=mapFontStatics.fonts;
			if(Array.isArray(fontsArr)) {
				fontsArr.forEach((item)=> {
					let name=item.name, fnt=item.font;
					this.addOption(fnt,name,this.fontname,fnt.family=="sans-serif");
				});
			}
		},
		loadFontSize: function() {
			let fontsArr=mapFontStatics.sizes;
			if(Array.isArray(fontsArr)) {
				fontsArr.forEach((item)=> {
					this.addOption(item,item+"pt",this.fontsize,item==9);
				});
			}
		},
		addOption: function(uValue, name, addTo,select) {
			var stdOpt = $("<div id=std-type></div>").ibxSelectItem({"align": "stretch", "userValue":uValue});
            stdOpt.ibxSelectItem("option", "text", name);			
            addTo.ibxSelect("addControlItem",stdOpt);
			if(select)
				addTo.ibxSelect("selected", stdOpt);
		},		
		updateSelectedGraphicsFont: function() {
			if(!this.updating) {
				let fontObj=this.fontname.ibxWidget("userValue"), fontSize=this.fontsize.ibxWidget("userValue"),
				fontDecor=this.fontDecoration.ibxWidget("userValue"),
				fontSizeUnits=this.fontsizeunits.ibxWidget("userValue");
				if(!fontObj)
					fontObj={family: "sans-serif", size: 9};
				
				fontObj.decoration = fontDecor;
				fontObj.size=(fontSize ? fontSize : 12)+"pt";
				this.options.ibgeo.updateSelectedGraphics("font", "font", fontObj);				
			}			
		},
		setColorPicker: function(colorP, color, buttonCls) {
			let colorJ=this.options.ibgeo.convertEsriColor(color);
			if(colorJ){
				if(colorJ.hex) {
					colorP.ibxColorPicker("option","color",colorJ.hex);
					this.element.find("."+buttonCls).css("background-color", colorJ.hex);
				}					
				if(colorJ.opacity)
					colorP.ibxColorPicker("option","opacity",colorJ.opacity);
			}
		},
		angleSlider: function(angle) {
			this.updating=true;
			this.textangle_slider.ibxHSlider("option","value", angle);
	//		this.textangle_slider.ibxHSlider("refresh");
			setTimeout(()=>{this.updating=false;}, 5);
		},
		selectFont: function(fontObj) {
			function isInt(n) {   
			   return typeof n == 'number' && Math.round(n) % 1 == 0;   
			}  
			let options=this.fontname.ibxSelect("controlItems");
			for(let i = 0; i<options.length; i++) {
				let item=options.eq(i), val=item.ibxSelectItem("userValue");
				if(val.family==fontObj.family && val.style==fontObj.style && val.weight==fontObj.weight) {
					this.fontname.ibxSelect("selected", item);
					break;
				}						
			}	
			this.fontDecoration.ibxWidget("userValue", fontObj.decoration);
			//How many PX is a PT? One point is the equivalent of 1.333(3) pixels
			let size=fontObj.size, pxs=this.fontsizeunits.ibxWidget("userValue") == "px", sizeToSet=pxs ? Math.round(size*1.333) : size;
			this.fontsize.ibxWidget("userValue", sizeToSet);
		},
		updateSettings: function(bHide){			
			if(bHide)
				this.showTextSettings(false);
			else {
				let note='', angle=0, width=0, backColor="", borderColor="", color="";
				var view=this.options.ibgeo.getCurrentView(),wdg=view.ui.find("sketch"), items=wdg.updateGraphics ? wdg.updateGraphics.items : [];
				this.updating=true;
				items.forEach((graphic)=> {		
					this.showTextSettings(graphic.symbol.type=='text');	
					this.showLineSettings(graphic.symbol.type=='simple-line');		
					if(graphic.symbol.type=='simple-line') {
						width=graphic.symbol.width;
						if(graphic.symbol.color)
						this.setColorPicker(this.background_color, graphic.symbol.color, "background-colorpick-button");		
						this.linestyle.ibxWidget("userValue", graphic.symbol.style);			
					}
					else if(graphic.symbol.type=='text') {
						note=graphic.symbol.text;	
						angle=graphic.symbol.angle ? graphic.symbol.angle : 0;
						width=graphic.symbol.borderLineSize ? graphic.symbol.borderLineSize : 0;
						this.setColorPicker(this.background_color, graphic.symbol.backgroundColor,"background-colorpick-button");
						this.setColorPicker(this.text_color, graphic.symbol.color,"text-colorpick-button");
						this.setColorPicker(this.border_color, graphic.symbol.borderLineColor,"border-colorpick-button");
						let font=graphic.symbol.font;
						this.selectFont(font);
					}				
					else {
						width=graphic.symbol.outline ? graphic.symbol.outline.width : width;
					//	this.setColorPicker(this.background_color, graphic.symbol.backgroundColor);
						if(graphic.symbol.color)
						this.setColorPicker(this.background_color, graphic.symbol.color,"background-colorpick-button");
						if(graphic.symbol.outline && graphic.symbol.outline.color)
						this.setColorPicker(this.border_color, graphic.symbol.outline.color,"border-colorpick-button");
					}
				});
				this.note_editor.ibxWidget('option', 'text', note);				
				this.textangle_slider.ibxHSlider("option","value", angle);
				this.textangle_slider.ibxHSlider("refresh");
				this.width_slider.ibxHSlider("option","value", width);
				this.width_slider.ibxHSlider("refresh");		
				setTimeout(()=>{this.updating=false;}, 50);
			}
		},
	/*	setSymbol: function (symbol){
			this.options.symbol=symbol;
			let note='', angle=0, width=0;	
		
			if(this.options.symbol.type=='text') {
				this.updating=true;		
				note=this.options.symbol.text;	
				angle=this.options.symbol.andle ? this.options.symbol.andle : 0;
				width=this.options.symbol.borderLineSize ? this.options.symbol.borderLineSize : 0;
			}	
			this.updating=true;
			this.note_editor.ibxWidget('option', 'text', note);				
			this.textangle_slider.ibxHSlider("option","value", angle);
			this.textangle_slider.ibxHSlider("refresh");
			this.width_slider.ibxHSlider("option","value", width);
			this.width_slider.ibxHSlider("refresh");		
			setTimeout(()=>{this.updating=false;}, 50);
		},
		symbolText: function(text) {
			if(text) this.note_editor.ibxWidget('option', 'text', text);
			else text=this.note_editor.ibxWidget('option', 'text');
			return text;
		},*/

		onTextColorChange: function(e) {
			if(!this.updating) {
				let data = e.originalEvent.data;
				this.element.find(".text-colorpick-button").css("background-color",
				this.options.ibgeo.updateSelectedGraphics("color", "color", data.rgba));
			}
		},
		onBackgroundColorChange: function(e) {
			if(!this.updating) {
				let data = e.originalEvent.data;
				this.element.find(".background-colorpick-button").css("background-color",
					this.options.ibgeo.updateSelectedGraphics("backgroundColor", "color", data.rgba));
			}
		},
		onBorderColorChange: function(e) {
			if(!this.updating) {
				let data = e.originalEvent.data;
				this.element.find(".border-colorpick-button").css("background-color",
					this.options.ibgeo.updateSelectedGraphics("borderLineColor", "color", data.rgba));
			}
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
//# sourceURL=geo_ui_SymbolSettings.js