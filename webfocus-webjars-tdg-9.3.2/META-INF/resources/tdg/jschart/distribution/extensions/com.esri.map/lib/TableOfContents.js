/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */
define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/on",
    // load template    
    "dojo/text!extras/TableOfContents.html",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/event",
    "dojo/_base/array",
    "esri/dijit/Legend",
    "dojo/dom"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, _TemplatedMixin,
    on,
    dijitTemplate,
    domClass, domStyle, domConstruct,
    event,
    array,
    Legend,dom
) {
    var GisUtil;
    var Widget = declare("esri.dijit.TableOfContents", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: dijitTemplate,
        // defaults
        options: {
            theme: "TableOfContents",
            map: null,
            layers: null,
             opacitySliderLength: 80,
             opacitySliderHandleWidth: 20,
            visible: true
        },
        // lifecycle: 1
        constructor: function(options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            // properties
            this.set("map", defaults.map);
            this.set("layers", defaults.layers);
            this.set("opacitySliderLength", defaults.opacitySliderLength);
            this.set("opacitySliderHandleWidth", defaults.opacitySliderHandleWidth);
            this.set("theme", defaults.theme);
            this.set("visible", defaults.visible);
            // listeners
            this.watch("theme", this._updateThemeWatch);
            this.watch("visible", this._visible);
            this.watch("layers", this._refreshLayers);
            this.watch("map", this.refresh);
            // classes
            this.css = {
                container: "toc-container",
                layer: "toc-layer",
                firstLayer: "toc-first-layer",
                title: "toc-title",
                titleContainer: "toc-title-container",
                content: "toc-content",
                titleCheckbox: "toc-checkbox",
                checkboxCheck: "icon-check-1",
                titleText: "toc-text",
                accountText: "toc-account",
                visible: "toc-visible",
                settingsIcon: "icon-cog",
                settings: "toc-settings",
                actions: "toc-actions",
                account: "toc-account",
                clear: "clear"
            };
        },
        // start widget. called by user
        startup: function() {
            // map not defined
            if (!this.map) {
                this.destroy();
            }
            // when map is loaded
            if (this.map.loaded) {
                this._init();
            } else {
                on.once(this.map, "load", lang.hitch(this, function() {
                    this._init();
                }));
            }
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function() {
            this._removeEvents();
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        // toggle
        // expand
        // collapse
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        show: function() {
            this.set("visible", true);
        },
        hide: function() {
            this.set("visible", false);
        },
        refresh: function() {
            this._createList();
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _createList: function() {        
        
            var i, layers = this.get("layers");
            var tocNewLayers = this.get("tocNewLayers");
            GisUtil = this.get("gisUtil");
          
            this._nodes = [];
            // kill events
            this._removeEvents();
            // clear node
            this._layersNode.innerHTML = '';
            // if we got layers
            if (layers && layers.length) {
                for (i = 0; i < layers.length; i++) {
                    
                    var ibilayer = tocNewLayers[i].ibilayer;
                    var layerType = tocNewLayers[i].layerType;
                    var layer = layers[i];
                    
                    
                    
                    // ceckbox class
                    var titleCheckBoxClass = this.css.titleCheckbox;
                    // layer class
                    var layerClass = this.css.layer;
                    // first layer
                    if (i === (layers.length - 1)) {
                        layerClass += ' ';
                        layerClass += this.css.firstLayer;
                    }
                    
                    if (this._isGraphicsLayer(layer)) {
                        if (layer.visible) {
                            layerClass += ' ';
                            layerClass += this.css.visible;
                            titleCheckBoxClass += ' ';
                            titleCheckBoxClass += this.css.checkboxCheck;
                        }
                    } else {
                        if (layer.visibility) {
                            layerClass += ' ';
                            layerClass += this.css.visible;
                            titleCheckBoxClass += ' ';
                            titleCheckBoxClass += this.css.checkboxCheck;
                        }
                    }
                    // layer node
                    var layerDiv = domConstruct.create("div", {
                        className: layerClass
                    });
                    domConstruct.place(layerDiv, this._layersNode, "first");
                    // title of layer
                    var titleDiv = domConstruct.create("div", {
                        className: this.css.title
                    });
                    domConstruct.place(titleDiv, layerDiv, "last");
                    // title container
                    var titleContainerDiv = domConstruct.create("div", {
                        className: this.css.titleContainer
                    });
                    domConstruct.place(titleContainerDiv, titleDiv, "last");
                    // Title checkbox
                    var titleCheckbox = domConstruct.create("input", {
                        type: 'checkbox',
                        checked: layer.visible,
                        className: titleCheckBoxClass
                    });
                    domConstruct.place(titleCheckbox, titleContainerDiv, "last");
                    // Title text
                    var titleText = domConstruct.create("div", {
                        className: this.css.titleText,
                        title: layer.title,
                        innerHTML: layer.title
                    });
                    domConstruct.place(titleText, titleContainerDiv, "last");
                    
                    var opacityContainer = domConstruct.create("div", {
                        className: 'toc-opacity-container'
                    });
                    
                    var opacityLabel = domConstruct.create("div", {
                        className: this.css.titleText + ' toc-opacity-text',
                        innerHTML: 'Opacity'  // TODO: expose this string in either the API or the translation engine
                    });
                    
                    var sliderContainer = domConstruct.create("div", {
                        className: 'toc-slider-container'
                    });
                    
                    var sliderBar = domConstruct.create("div", {
                        className: 'toc-slider-bar'
                    });
                    
                    var sliderHandle = domConstruct.create("div", {
                        className: 'toc-slider-handle'
                    });
                    
                    var sliderHandleSize = this.get('opacitySliderHandleWidth');
                    var sliderLength = this.get('opacitySliderLength');
                    var userSelectedLayer = GisUtil._getSelectedLayerOpacity(i);

                    sliderHandle.style.left = (layer.opacity * (sliderLength - sliderHandleSize)) + 'px';
                    if(userSelectedLayer){
                        sliderHandle.style.left = (userSelectedLayer.node.mapLayer.opacity * (sliderLength - sliderHandleSize)) + 'px';
                    }
                    sliderHandle.style.width = sliderHandleSize + 'px';
                    sliderBar.style.width = sliderLength + 'px';
                    opacityLabel.style.left = (sliderLength + 10) + 'px';
                    
                    domConstruct.place(sliderBar, sliderContainer, "last");
                    domConstruct.place(sliderHandle, sliderContainer, "last");
                    
                    domConstruct.place(sliderContainer, opacityContainer, "last");
                    domConstruct.place(opacityLabel, opacityContainer, "last");
                    
                    domConstruct.place(opacityContainer, layerDiv, "last");
                    
                    var legenddiv = domConstruct.create("div", {
                        className: 'toc-legend',
                        id : layer.id + "legend"
                    });
                    
                     domConstruct.place(legenddiv, layerDiv, "last");
                    
                    // Account text
                    var accountText;
                    if (layer.account) {
                        accountText = domConstruct.create("a", {
                            className: this.css.accountText,
                            id: layer.account
                        });
                        domConstruct.place(accountText, titleText, "last");
                    }
                    // settings
                    var settingsDiv, settingsIcon;
                    if (layer.settings) {
                        settingsDiv = domConstruct.create("div", {
                            className: this.css.settings,
                            id: layer.settings
                        });
                        domConstruct.place(settingsDiv, titleContainerDiv, "last");
                        // settings icon
                        settingsIcon = domConstruct.create("div", {
                            className: this.css.settingsIcon
                        });
                        domConstruct.place(settingsIcon, settingsDiv, "last");
                    }
                    // clear css
                    var clearCSS = domConstruct.create("div", {
                        className: this.css.clear
                    });
                    domConstruct.place(clearCSS, titleContainerDiv, "last");
                    // lets save all the nodes for events
                    var nodesObj = {
                        checkbox: titleCheckbox,
                        title: titleDiv,
                        titleContainer: titleContainerDiv,
                        titleText: titleText,
                        accountText: accountText,
                        settingsIcon: settingsIcon,
                        settingsDiv: settingsDiv,
                        layer: layerDiv,
                        sliderHandle: sliderHandle,
                        sliderBar: sliderBar,
                        mapLayer: layer,
                        ibilayer :ibilayer,
                        layerType : layerType
                    };
                    this._nodes.push(nodesObj);
                    // create click event
                    this._checkboxEvent(i);
                    this._sliderEvent(i);
                }
                this._setLayerEvents();
                
                for (i = 0; i < layers.length; i++) {
                    this._addLegend(i,layers[i].visible);
                }
            }
        },
        _refreshLayers: function() {
            this.refresh();
        },
        _removeEvents: function() {
            var i;
            // checkbox click events
            if (this._checkEvents && this._checkEvents.length) {
                for (i = 0; i < this._checkEvents.length; i++) {
                    this._checkEvents[i].remove();
                }
            }
            // layer visibility events
            if (this._layerEvents && this._layerEvents.length) {
                for (i = 0; i < this._layerEvents.length; i++) {
                    this._layerEvents[i].remove();
                }
            }
            this._checkEvents = [];
            this._layerEvents = [];
        },
        _addLegend : function (index,visible)     {
            
            var layer = this._nodes[index].mapLayer;
            var layerType = this._nodes[index].layerType;
            
            if (layerType === "bubble" || layerType === "heat") {
                visible  = false;
            } else if (layerType === "choropleth") {
                visible  = false;
            } else if (layer.layerType === "featurelayer") {
            } else if (layer.layerType === "tile") {
            }
            
            if (visible) {

                if( dom.byId(layer.id + "legend"))
                    dom.byId(layer.id + "legend").style.display = "inline-block";

                if (!this._nodes[index].legend ) {
                    if(dijit.byId(layer.id + "legend") !== undefined){
                        dijit.byId(layer.id + "legend").destroy();
                    }
                    var legend = new Legend({
                             map: layer._map,
                             layerInfos: [{
                                 layer: layer,
								title: layer.title
                             }]
                         },
                         dom.byId(layer.id + "legend")
                     );
                     dom.byId(layer.id + "legend").style.display = "inline-block";
                     legend.startup();
                     this._nodes[index].legend = legend;
                    //legend.destroyRecursive(true);
                }
            }
            else {
                var layerLegend =dom.byId(layer.id + "legend");
                if (layerLegend && layerLegend.style) {
                    dom.byId(layer.id + "legend").style.display = "none";
                }
            }
        },
        
        _toggleVisible: function(index, visible) {
            // update checkbox and layer visibility classes
            domClass.toggle(this._nodes[index].layer, this.css.visible, visible);
            this._nodes[index].checkbox.checked = visible;
            this.emit("toggle", {
                index: index,
                visible: visible
            });
            
            this._addLegend(index,visible);
        },
        _layerEvent: function(layer, index) {
            // layer visibility changes
            var visChange = on(layer, 'visibility-change', lang.hitch(this, function(evt) {
                // update checkbox and layer visibility classes
                this._toggleVisible(index, evt.visible);
            }));
            this._layerEvents.push(visChange);
        },
        _featureCollectionVisible: function(layer, index, visible) {
            // all layers either visible or not
            var equal;
            // feature collection layers turned on by default
            var visibleLayers = layer.visibleLayers;
            // feature collection layers
            var layers = layer.featureCollection.layers;
            // if we have layers set
            if (visibleLayers && visibleLayers.length) {
                // check if all layers have same visibility
                equal = array.every(visibleLayers, function(item) {
                    // check if current layer has same as first layer
                    return layers[item].layerObject.visible === visible;
                });
            } else {
                // check if all layers have same visibility
                equal = array.every(layers, function(item) {
                    // check if current layer has same as first layer
                    return item.layerObject.visible === visible;
                });
            }
            // all are the same
            if (equal) {
                this._toggleVisible(index, visible);
            }
        },
        _createFeatureLayerEvent: function(layer, index, i) {
            var layers = layer.featureCollection.layers;
            // layer visibility changes
            var visChange = on(layers[i].layerObject, 'visibility-change', lang.hitch(this, function(evt) {
                var visible = evt.visible;
                this._featureCollectionVisible(layer, index, visible);
            }));
            this._layerEvents.push(visChange);
        },
        _featureLayerEvent: function(layer, index) {
            // feature collection layers
            var layers = layer.featureCollection.layers;
            if (layers && layers.length) {
                // make event for each layer
                for (var i = 0; i < layers.length; i++) {
                    this._createFeatureLayerEvent(layer, index, i);
                }
            }
        },
        _setLayerEvents: function() {
            // this function sets up all the events for layers
            var layers = this.get("layers");
            var layerObject;
            if (layers && layers.length) {
                // get all layers
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    // if it is a feature collection with layers
                    if (layer.featureCollection && layer.featureCollection.layers && layer.featureCollection.layers.length) {
                        this._featureLayerEvent(layer, i);
                    } else if (this._isGraphicsLayer(layer)) {
                        this._layerEvent(layer, i);
                    } else {
                        // 1 layer object
                        layerObject = layer.layerObject;
                        this._layerEvent(layerObject, i);
                    }
                }
            }
        },
        _toggleLayer: function(layerIndex) {
            // all layers
            if (this.layers && this.layers.length) {
                var newVis;
                var layer = this.layers[layerIndex];
                var layerObject = layer.layerObject;
                var featureCollection = layer.featureCollection;
                var visibleLayers;
                var i;
                if (featureCollection) {
                    // visible feature layers
                    visibleLayers = layer.visibleLayers;
                    // new visibility
                    newVis = !layer.visibility;
                    // set visibility for layer reference
                    layer.visibility = newVis;
                    // toggle all feature collection layers
                    if (visibleLayers && visibleLayers.length) {
                        // toggle visible sub layers
                        for (i = 0; i < visibleLayers.length; i++) {
                            layerObject = featureCollection.layers[visibleLayers[i]].layerObject;
                            // toggle to new visibility
                            layerObject.setVisibility(newVis);
                        }
                    }
                    else{
                        // toggle all sub layers
                        for (i = 0; i < featureCollection.layers.length; i++) {
                            layerObject = featureCollection.layers[i].layerObject;
                            // toggle to new visibility
                            layerObject.setVisibility(newVis);
                        } 
                    }
                } else if (layerObject) {
                    newVis = !layer.layerObject.visible;
                    layer.visibility = newVis;
                    layerObject.setVisibility(newVis);
                } else if (this._isGraphicsLayer(layer)) {
					if(typeof(jQuery) != 'undefined') {
						var domL=$("#"+layer.id+"_layer").next(), id=domL.attr("id");
						if(typeof(id) == 'string' && id.search("_layerId_")!=-1) {
							domL.prev().html(domL.html());
							domL.remove();
						}
					}
					
                    newVis = !layer.visible;
                    layer.setVisibility(newVis);
                }
                GisUtil._saveSelectedLayerToggle(layerIndex, newVis);
            }
        },
        _sliderEvent: function(index) { 
            function updateOpacity(node, left, saveSelected) {
                node.sliderHandle.style.left = left + 'px';
                node.mapLayer.setOpacity(left / sliderLength);
                if (node.mapLayer.visible && node.mapLayer._div && node.mapLayer._div.rawNode) {
                    node.mapLayer._div.rawNode.style.display = "";  // Voodoo magic to force IE to redraw layer
                }
                if(saveSelected !='false')
                    GisUtil._saveSelectedLayerOpacity (node, left , index);

            }
            var node = this._nodes[index];
            var sliderHandleSize = this.get('opacitySliderHandleWidth');
            var sliderLength = this.get('opacitySliderLength') - sliderHandleSize;
            node.sliderLeft = parseInt(node.sliderHandle.style.left, 10);
            updateOpacity(node, node.sliderLeft , false);
            
            function mouseDown(evt) {
                this.sliderMouseDownX = evt.clientX;
            }
            
            this._checkEvents.push(on(node.sliderHandle, 'mousedown', lang.hitch(node, mouseDown)));
            this._checkEvents.push(on(node.sliderHandle, 'touchstart', lang.hitch(node, mouseDown)));
            
            function mouseMove(evt) {
                if (this.sliderMouseDownX == null) {
                    return;
                }
                var dx = evt.clientX - this.sliderMouseDownX;
                if (dx !== 0) {
                    var left = Math.min(Math.max(this.sliderLeft + dx, 0), sliderLength);
                    updateOpacity(this, left);
                }
            }
            
            this._checkEvents.push(on(document, 'mousemove', lang.hitch(node, mouseMove)));
            this._checkEvents.push(on(document, 'touchmove', lang.hitch(node, mouseMove)));
            
            function mouseUp(evt) {
                this.sliderMouseDownX = null;
                this.sliderLeft = parseInt(this.sliderHandle.style.left, 10);
            }
            
            this._checkEvents.push(on(document, 'mouseup', lang.hitch(node, mouseUp)));
            this._checkEvents.push(on(document, 'touchend', lang.hitch(node, mouseUp)));
            
            function click(evt) {
                this.sliderLeft = evt.clientX - this.sliderBar.getBoundingClientRect().left - (sliderHandleSize / 2);
                updateOpacity(this, this.sliderLeft);
            }
            
            this._checkEvents.push(on(node.sliderBar, 'click', lang.hitch(node, click)));
            this._checkEvents.push(on(node.sliderBar, 'touchend', lang.hitch(node, click)));
        },
        _checkboxEvent: function(index) {
            var selectedLayerToggle = GisUtil._getSelectedLayerVisibility(index);
            if(selectedLayerToggle && selectedLayerToggle.visibility === false){
                this._toggleLayer(index);
                this._toggleVisible(index, false);
            }
            function checkClick(evt) {
                this._toggleLayer(index);
                evt.stopPropagation();
            }
            
            this._checkEvents.push(on(this._nodes[index].checkbox, 'click', lang.hitch(this, checkClick)));
            this._checkEvents.push(on(this._nodes[index].checkbox, 'touchend', lang.hitch(this, checkClick)));
            
            function titleClick(evt) {
                this._toggleLayer(index);
                event.stop(evt);
            }
            this._checkEvents.push(on(this._nodes[index].titleText, 'click', lang.hitch(this, titleClick)));
            this._checkEvents.push(on(this._nodes[index].titleText, 'touchend', lang.hitch(this, titleClick)));
        },
        _isGraphicsLayer: function(layer) {
            if (layer && typeof layer.setVisibility === 'function') {
                return true;
            }
            return false;
        },
        _init: function() {
            this._visible();
            this._createList();
            this.set("loaded", true);
            this.emit("load", {});
        },
        _updateThemeWatch: function() {
            var oldVal = arguments[1];
            var newVal = arguments[2];
            domClass.remove(this.domNode, oldVal);
            domClass.add(this.domNode, newVal);
        },
        _visible: function() {
            if (this.get("visible")) {
                domStyle.set(this.domNode, 'display', 'block');
            } else {
                domStyle.set(this.domNode, 'display', 'none');
            }
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.TableOfContents", Widget, esriNS);
    }
    return Widget;
});