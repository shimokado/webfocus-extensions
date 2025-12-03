/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/


$.widget("ibi.geoUILayer", $.ibi.ibxVBox,
    {

        options:{
            ibgeo: null,
            layer: null,
            layerType: "",
          //  draggable:true,
        },

        _widgetClass:"lyr-wdg-main",
       
        _create:function()
        {
            this._super();
	          var othis =  this;
              othis.layerInitialRenderer = othis.options.layer.renderer;
              othis.defaultRenderer = othis.options.defaultRenderer;
            var _wrapper = $("<div class='lyr-wrapper'>").ibxHBox({aligh: "stretch"});
            var _lyrHeaderLeft = $("<div class='lyr-header-left'>").ibxHBox({justify: "start"});
            var _lyrGeom,_lyrLegendToggle,_lyrOptionsToggle, _lyrGoTo, _lyrContentBox;
            var _lyrDaD = $("<div class='lyr lyr-menu' title='"+getTransString('Drag')+"'>").ibxLabel({"glyphClasses":"ibx-icons ibx-glyph-ellipsis-v-sm",draggable:true});
            $(_lyrDaD).on("ibx_drop", function(e){
				var i = 0;
            });
            var lblText = this.options.layer.title || this.options.layer.id;
            var _lyrToggle = $("<div class='lyr lyr-toggle' title='"+getTransString('ToggleVis')+"'>").ibxCheckBoxSimple({"id": this.options.layer.id+"_lyrToggle",
             "checked": this.options.layer.visible});

            $(_lyrToggle).on('click', function(e){
                var bVis=$(_lyrToggle).ibxCheckBoxSimple('checked');
                othis.options.layer.visible = bVis;
                othis.options.ibgeo.updateLayersVisibility(othis.options.layer);
                if(bVis){
	                $(_lyrToggle).css({"color": '#23b7e5'});
                }  
            /*    else if(_lyrContentBox.ibxCollapsible("isOpen"))
                    othis.element.find($(".lyr-legend-wrapper")).is(":visible") ?
                            _lyrLegendToggle.trigger("click") : _lyrOptionsToggle.trigger("click");
                     
                _lyrLegendToggle.ibxWidget("option", "disabled", !bVis);*/
                _lyrOptionsToggle.ibxWidget("option", "disabled", !bVis);
                _lyrGoTo.ibxWidget("option", "disabled", !bVis);
            });            
            
            if(this.options.layer.geometryType === "point"){
                _lyrGeom = $("<div class='lyr lyr-geom' title='"+getTransString('Point')+"'>").ibxLabel({"glyphClasses": 
                "ibx-icons ibx-glyph-map-point-marker"});
            }else if (this.options.layer.geometryType === "polyline"){
                _lyrGeom = $("<div class='lyr lyr-geom' title='"+getTransString('Line')+"'>").ibxLabel({"glyphClasses": 
                "ibx-icons ibx-glyph-map-line"});
            }else if(this.options.layer.geometryType === "polygon"){
                _lyrGeom = $("<div class='lyr lyr-geom' title='"+getTransString('Polygon')+"'>").ibxLabel({"glyphClasses":
                "ibx-icons ibx-glyph-map-polygon"});
            }
            else{
                _lyrGeom = $("<div class='lyr lyr-geom' title='"+getTransString('DemogLayer')+"'>").ibxLabel({"glyphClasses":"ibx-icons ibx-glyph-matrix-marker-chart"});
            }
            var _lyrLabel;
            
        //    if(this.options.layer.type === "map-image"){
            _lyrLabel = $("<div class='lyr lyr-label' title='"+lblText+"'>").ibxLabel({"text":lblText});
        /*    }else if (this.options.layer.type === "feature"){
                _lyrLabel = $("<div class='lyr lyr-label' title='"+lblText+"'>").ibxLabel({"text":lblText});
            }else{
                return;
            }*/
        
            _lyrGoTo=$("<div title='"+getTransString('ZoomToLayer')+"'></div>").ibxButton({
                     class: "lyr btn-layer-zoomto", glyphClasses:"fa fa-search-location"});
            _lyrHeaderLeft.append(_lyrDaD);
            _lyrHeaderLeft.append(_lyrToggle);
            _lyrHeaderLeft.append(_lyrGeom);
            _lyrHeaderLeft.append(_lyrLabel);
            _wrapper.append(_lyrHeaderLeft);
            $(_lyrLabel).on('dblclick', function(e){
                othis.options.ibgeo.setTargetLayer(othis.options.layer.id);
            });
            var _lyrHeaderRight = $("<div class='lyr-header-right'>").ibxHBox({'justify': "end"});
//            _lyrLegendToggle = $("<div class='lyr lyr-legend' title='"+getTransString('LayerInfo')+"'>").ibxButton({"glyphClasses":
  //              "ibx-icons ibx-glyph-list", aria:{label: getTransString('ShowLInfoAnon')}});
            _lyrOptionsToggle = $("<div class='lyr lyr-options' title='"+getTransString('LayerSet')+"'>").ibxButton({"glyphClasses":
                "ibx-icons ibx-glyph-sliders", aria:{label: getTransString('ShowLSetAnon')}});

  //          _lyrHeaderRight.append($(_lyrLegendToggle));
            _lyrHeaderRight.append($(_lyrOptionsToggle));
            _lyrHeaderRight.append($(_lyrGoTo));
            _wrapper.append($(_lyrHeaderRight));

            _lyrContentBox = $("<div class='lyr-content-box'"+"id="+othis.options.layer.id+"_LegendBox"+">").ibxVBox({'align':"stretch"});
            $(_lyrContentBox).ibxCollapsible({
                direction:"top",
                startCollapsed: true
            });

            this.element.append($(_wrapper));
            $(this.element).ibxWidget("add", $(_lyrContentBox));
            
            function createLegend(){
	            var _lyrLegendWrapper = $("<div class='lyr lyr-legend-wrapper'>").ibxVBox({'align':"stretch"});
	            var contentBox = othis.element.find($(".lyr-content-box"));
	            contentBox.empty();
	            contentBox.append($(_lyrLegendWrapper));
	            var lgd = othis.options.ibgeo.getLegend(othis.options.layer.id);
                lgd.container = othis.element.find($(".lyr-legend-wrapper"))[0];
                lgd.renderNow();   
                return lgd;          
            }
            function insertOptions(){
	            var _lyrOptionsWrapper = $("<div class='lyr lyr-options-wrapper'>").ibxHBox({'align':"stretch"});
	            var contentBox = othis.element.find($(".lyr-content-box"));
	            contentBox.empty();
	            contentBox.append($(_lyrOptionsWrapper));
	            contentBox.ibxWidget("add", $(_lyrOptionsWrapper).geoUILayerOptions({
		            "ibgeo": othis.options.ibgeo,
		            "layer": othis.options.layer,
                    "initialRenderer": othis.layerInitialRenderer,                    
                    "defaultRenderer" : othis.options.defaultRenderer,
                    "featureReduction": othis.options.featureReduction,
                    "sizeVisVar" : othis.options.sizeVisVar
	            }));
            }
            $(_lyrGoTo).on('click', function(e){
                othis.options.ibgeo.setTargetLayer(othis.options.layer.id);
            });
         
         /*   $(_lyrLegendToggle).on('click', function(e){
                othis.element.find($(".lyr-options")).removeClass("lyr-btn-active");
                var isOpen=othis.element.find($(".lyr-content-box")).ibxCollapsible("isOpen");
                
                if(isOpen){
                    if(othis.element.find($(".lyr-opacity-box")).length > 0 ){
                        othis.element.find($(".lyr-legend")).addClass("lyr-btn-active");
                        othis.element.find($(".lyr-content-box")).empty();
                        othis.legend=createLegend();
                    }else if(othis.element.find($(".esri-legend__service")).length > 0 || othis.element.find($(".esri-legend__message")).length > 0){
                        othis.element.find($(".lyr-legend")).removeClass("lyr-btn-active");
                        othis.element.find($(".lyr-content-box")).empty();
                        othis.element.find($(".lyr-content-box")).ibxCollapsible("close");
                    }else{
                        othis.element.find($(".lyr-legend")).addClass("lyr-btn-active");
                        othis.legend=createLegend();
                    }
                }else{
                    othis.element.find($(".lyr-legend")).addClass("lyr-btn-active");
                    othis.element.find($(".lyr-content-box")).ibxCollapsible("open");
                    othis.legend=createLegend();
                }
                $(e.currentTarget).ibxWidget("option","aria.label", (isOpen ? getTransString('ShowLInfoAnon')
				    : getTransString('HideLInfoAnon')));
            });*/
            
            $(_lyrOptionsToggle).on('click', function(e){

                othis.element.find($(".lyr-legend")).removeClass("lyr-btn-active");
                var isOpen=othis.element.find($(".lyr-content-box")).ibxCollapsible("isOpen");
                
                if(isOpen){

                    if( othis.element.find($(".lyr-opacity-box")).length > 0 ){
                        othis.element.find($(".lyr-options")).removeClass("lyr-btn-active");
                        othis.element.find($(".lyr-content-box")).empty();
                        othis.element.find($(".lyr-content-box")).ibxCollapsible("close");

                    }else if(othis.element.find($(".esri-legend__service")).length > 0 || othis.element.find($(".esri-legend__message")).length > 0){
                        othis.element.find($(".lyr-options")).addClass("lyr-btn-active");
                        othis.element.find($(".lyr-content-box")).empty();
                        if(othis.legend)
                            othis.legend.destroy();
                        insertOptions();
                    }else{
                        othis.element.find($(".lyr-options")).addClass("lyr-btn-active");
                        insertOptions();
                    }
                }else{
                    othis.element.find($(".lyr-options")).addClass("lyr-btn-active");
                    othis.element.find($(".lyr-content-box")).ibxCollapsible("open");
                    if(othis.legend)
                        othis.legend.destroy();
	                  insertOptions();
                }
                $(e.currentTarget).ibxWidget("option","aria.label", (isOpen ? getTransString('ShowLSetAnon')
				    : getTransString('HideLSetAnon')));
            });
            var bInsBefore=true;
            $(othis.element).on("ibx_dragstart ibx_dragover ibx_dragleave ibx_drop", function(e)
            {
                e = e.originalEvent;
                var target = $(e.currentTarget);
                if(!target.hasClass("lyr-wdg-main"))
                    target=target.parents(".lyr-wdg-main");
                var dt = e.dataTransfer;
                
                if(e.type == "ibx_dragstart")
                {
                    dt.setData("dragItem", target.prop("id"));
                    dt.setData("dragLayerId", othis.options.layer.id);
                    dt.setDragImage(othis.getDragImage(), -5, -othis.element.height()/2);
                    bInsBefore=true;
                }
                else
                if(e.type == "ibx_dragover")
                {
                    var dragItem = $("#" + dt.getData("dragItem"));
                    var tId = target.prop("id");
                    var prevId=target.prev().attr("id");
                    var nextId=target.next().attr("id");
                    var dId = dragItem.prop("id");
                    
                    bInsBefore = e.offsetY < othis.element.height()/2;
                    if(tId != dId && (dId != prevId || !bInsBefore) && (dId != nextId || bInsBefore))	
                    {
                        target.ibxAddClass("drag-target");
                        dt.dropEffect = "copy";
                        e.preventDefault();
                    }
                //    else
                //        target.children().css("cursor","not-allowed");
                }
                else
                if(e.type == "ibx_dragleave")
                {
                    target.ibxRemoveClass("drag-target");
                }
                else
                if(e.type == "ibx_drop")
                {
                    target.ibxRemoveClass("drag-target");
                    var dragItem = $("#" + dt.getData("dragItem"));
                    if(bInsBefore)
                        dragItem.insertBefore(target);
                    else
                        dragItem.insertAfter(target);
                 //   target.children().css("cursor","");
                    othis.options.ibgeo.setLayerBefore( othis.options.layer.id, dt.getData("dragLayerId"),bInsBefore);
                }
            });           
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

//# sourceURL=geo_ui_layer.js