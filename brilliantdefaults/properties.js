// JavaScript
define([], function() {
    'use strict';

    var dimensions = { 
		uses: "dimensions",
		min:0,
		items:{
			dimDefault: {
			  type: "string",
			  ref: "qDef.dimDefault",
			  label: "Default Value for Dimension",
			  expression: "optional"
			},
			/*MyDropdownProp: {
					type: "string",
					component: "dropdown",
					label: "Data source",
					ref: "qDef.dimDefault2",
					options: function() {
						return $.get("datasource.php").then(function(items){
							return items.map(function(item){
								return {
									value:item.toLowerCase(),
									label:item
								};
							});
						});
					}
			}*/
		}
	};
    
    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: dimensions,
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
});