// JavaScript
define([], function() {
    'use strict';

    var dimensions = { uses: "dimensions" };
    var measures = { uses: "measures", min:0 };
    var sorting = { uses: "sorting" };
    var addons = { uses: "addons", 
				   items: { dataHandling: { uses: "dataHandling" } }  
				};
    var borderSection = {
        component: "items",
        label: "Border Settings",
        items: {
            bordercolor: {
                "type": "string",
                "expression": "optional",
                "defaultValue": "#b2b2b2",
                "ref": "brilliantprops.bordercolor",
                "label": "Border Color"
            },
            borderradius: {
                "type": "string",
                "expression": "optional",
                "defaultValue": "1",
                "ref": "brilliantprops.borderradius",
                "label": "Border Radius (px)"
            },
            borderwidth: {
                "type": "string",
                "expression": "optional",
                "defaultValue": "1",
                "ref": "brilliantprops.borderwidth",
                "label": "Border Width(px)"
            }
        }
    }
    var appearancePanel = {
        uses: "settings",
        items: {
            stripingOption: {
                type: "boolean",
                component: "switch",
                label: "Row Striping",
                ref: "brilliantprops.striped",
                options: [{
                    value: true,
                    label: "On"
                }, {
                    value: false,
                    label: "Off"
                }],
                defaultValue: false
            },
            totalsOption: {
                type: "boolean",
                component: "switch",
                label: "Show Totals Row",
                ref: "brilliantprops.totals",
                options: [{
                    value: true,
                    label: "On"
                }, {
                    value: false,
                    label: "Off"
                }],
                defaultValue: true
            },
            totalColor: {
                "type": "string",
                "expression": "optional",
                "defaultValue": "#e32538",
                "ref": "brilliantprops.totalcolor",
                "label": "Total Row Color"
            },
            rendererListArray: {
                type: "array",
                ref: "brilliantprops.rendererListItems",
                label: "Link Renderer Columns",
                itemTitleRef: "linkrenderer",
                allowAdd: true,
                allowRemove: true,
                addTranslation: "Add Renderer Column",
                items: {
                    linkRenderer: {
                        type: "string",
                        ref: "linkrenderer",
                        label: "Column Title to render",
                        expression: "optional"
                    },
                    linkMask: {
                        type: "string",
                        ref: "linkmask",
                        label: "Mask for link (e.g. 'Click Here')",
                        expression: "optional"
                    },
                    linkPrefix: {
                        type: "string",
                        ref: "linkprefix",
                        label: "Prefix link (e.g. 'https://www.bloomberg.com/quote/')",
                        expression: "optional"
                    },
					passThroughHTML: {
						type: "boolean",
						component: "switch",
						label: "Pass Through HTML from Expression",
						ref: "passthroughhtml",
						options: [{
							value: true,
							label: "On"
						}, {
							value: false,
							label: "Off"
						}],
						defaultValue: false
					}
                }
            },
            htmlListArray: {
                type: "array",
                ref: "brilliantprops.htmlListItems",
                label: "HTML Popout Content Columns",
                itemTitleRef: "htmlrenderer",
                allowAdd: true,
                allowRemove: true,
                addTranslation: "Add HTML Column",
                items: {
                    htmlRenderer: {
                        type: "string",
                        ref: "htmlrenderer",
                        label: "Column Title to make HTML",
                        expression: "optional"
                    }
                }
            },
            alignmentListArray: {
                type: "array",
                ref: "brilliantprops.alignmentListItems",
                label: "Column Alignment",
                itemTitleRef: "alignmentcolumn",
                allowAdd: true,
                allowRemove: true,
                addTranslation: "Add Custom Alignment",
                items: {
                    alignmentColumn: {
                        type: "string",
                        ref: "alignmentcolumn",
                        label: "Column Title to align",
                        expression: "optional"
                    },
                    alignmentState: {
                        type: "string",
                        ref: "alignmentstate",
                        label: "Alignment state ('left', 'right' or 'center' without quotes)",
                        expression: "optional"
                    }
                }
            },
            borderSection,
			aboutButton: {
				label:"About",
				component: "button",
				action: function(data){
					//add your button action here
					alert("My visualization extension name is '"+data.visualization+"' and have id '"+data.qInfo.qId+"'.");
				}
			}
        }
    };
    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: dimensions,
            measures: measures,
            sorting: sorting,
            appearance: appearancePanel,
            addons: addons
        }
    };
});