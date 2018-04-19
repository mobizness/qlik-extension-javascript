define([
        'qlik',
        './properties',
        './initialProperties'], function (qlik, props, initProps) {
	'use strict'
	return {
            initialProperties: initProps,
            definition: props,
            resize: function($element, layout) {
                this.paint($element, layout);
            },
            paint: function($element, layout) {
				window.rob = {
					element: $element,
					layout: layout,
					qlik: qlik,
					props: props,
					initProps, initProps
				};
				console.log(window.rob);
				var self = this;
                if (typeof self.deployed == 'undefined') {
                    self.deployed = false;
                }
				
				if(!self.deployed){
					var dimNames = [];
					var app = qlik.currApp();
					// Loop through our dimensions and make an array of names
					layout.qHyperCube.qDimensionInfo.forEach(function(dim, idx){
						//use qGroupFieldDefs as that's the canonical field name in case of aliases
						dimNames.push(dim.qGroupFieldDefs[0]);
					});
					//window.brilliantDefaultsTest = {qlik:qlik, self:self, element:$element, layout:layout, dimNames:dimNames};

					// if the selection length is greater than 0, loop through them and compare to our dimensions, if they are not in our dimensions, clear the field
					if (app.selectionState().selections.length > 0){
						  app.selectionState().selections.forEach(function(selection, idx){
						  	var a = dimNames.indexOf(selection.fieldName);
							if( a != -1 ){
								// leave the selection and remove our default from being applied by removing it from dimNames
								delete dimNames[a];
							} else {
								// clear the selection
								app.field(selection.fieldName).clear();
							}
						  });
					}

					console.log(dimNames);
					dimNames.forEach(function(dimName, idx){
						var dimValue = layout.qHyperCube.qDimensionInfo[idx].dimDefault;
						// Check if dimValue is a number
						if(!isNaN(dimValue)){
							//check if it is an int
							if(dimValue % 1 === 0){
								dimValue = parseInt(dimValue);
							} else {
								dimValue = parseFloat(dimValue);
							}
						}
						app.field(dimName).selectMatch(dimValue, false);
					});
					self.deployed = true;
				} 
			}
	}
});