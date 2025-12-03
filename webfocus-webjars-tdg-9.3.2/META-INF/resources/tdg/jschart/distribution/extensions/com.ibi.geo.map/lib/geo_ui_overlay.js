/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
// $Revision: 1.0 $:


$.ibi.CONTAINER_MESSAGE_TYPE_BLANK = "blank";
$.ibi.CONTAINER_MESSAGE_TYPE_ADD_LAYER = "add_layer";
$.ibi.CONTAINER_MESSAGE_TYPE_LOADING = "loading";

$.widget("ibi.geoUIOverlayMessage", $.ibi.ibxVBox,
{
	options:
	{
		'nameRoot':true,
		'align': "stretch",
		'type': $.ibi.CONTAINER_MESSAGE_TYPE_BLANK,
		'errorDetails': ''
	},
	iconClassPrefix: "messageIcon ",
	iconClasses: {
		"blank" : " ",
		"add_layer" : "add_layer",
		"loading" : " ibx-busy-img svg-gray-rings",
	},
	messageTypeClassPrefix: "messageTypeWrapper canvas-messaging-",
	messagePrefix: "mlmap",
	waitWidget: undefined,
	_widgetClass: "map-container-message",
	_create: function ()
	{
		this._super();
		var markup = ibx.resourceMgr.getResource(".map-container-message", false);
		this.element.append(markup);
		ibx.bindElements(this.element);
		this.messageLabel.ibxWidget("option", "textAlign", "center");
	},
	
	refresh: function() {
		this._super();
		
		//Add correct styling based on widget type
		this.messageTypeWrapper[0].className = this.messageTypeClassPrefix + this.options.type;
		this.messageIcon[0].className = this.iconClassPrefix + this.iconClasses[this.options.type];
		
		//if the widget type includes a message, add that in
		if(this.options.type === $.ibi.CONTAINER_MESSAGE_TYPE_EMPTY) {
			var message = ibx.resourceMgr.getString(this.messagePrefix + this.options.type);
			this.messageLabel.ibxWidget("option", "text", message);
			this.messageLabel.show();
		} else if(this.options.type === $.ibi.CONTAINER_MESSAGE_TYPE_ADD_LAYER) {
			var message = ibx.resourceMgr.getString(this.messagePrefix + "." + this.options.type);
			this.messageLabel.ibxWidget("option", "text", message);
			this.messageLabel.show();
		} else {
			this.messageLabel.hide();
		}
	},
	
	hideMessage: function () {
		this.element.addClass('container-message-hidden');
	},
	
	showMessage: function () {
		this.element.removeClass('container-message-hidden');
	}
});
//# sourceURL=geo_ui_overlay.js