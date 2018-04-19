require.config({
    paths: {
        "datatables.net": "//cdn.datatables.net/1.10.13/js/jquery.dataTables"
    }
});

define([
        'jquery',
        'qlik',
        'qvangular',
        'angular',
        './properties',
        './initialproperties',
        'text!./template.ng.html',
        'datatables.net',
        './dataTables.responsive',
        './dataTables.fixed',
		'./jquery.ui.min',
		'text!./jquery.ui.min.css',
		
    ],
    function($, qlik, qvangular, angular, props, initProps, ngTemplate, datatables, dtr, dtfh, jqueryUI, jQueryUICssContent) {
        'use strict';
		$( '<style>' ).html( jQueryUICssContent ).appendTo( 'head' );
        return {
            initialProperties: initProps,
            definition: props,
            snapshot: { canTakeSnapshot: true },
            support: {
                export: true,
                exportData: function(layout) {
                    // The context menu will only be enabled if there is data to export.
                    return layout.qHyperCube.qDataPages[0].qMatrix.length;
                }
            },
            template: ngTemplate,
            resize: function($element, layout) {
                this.paint($element, layout);
            },
            paint: function($element, layout) {
                var restCount = 0;
                var restWidth = 0;

                // check if Content is Number or String
                function alignField(ind)
                {
                    var len = $element.find(".dataTables_wrapper table tr").length;
                    var flag = 0;
                    var qlyspCount = 0;

                    for(var i=1;i<len;i++)
                    {
                        var obj = $element.find(".dataTables_wrapper table tr:eq("+i+")");
                        var temp = obj.find("td:eq("+ind+")");

                        // check the Max length
                        /*if(qlyspCount > -1)
                        {
                            qlyspCount = Math.max(temp.html().length, qlyspCount);
                            if (qlyspCount>10) qlyspCount = -1;
                        }*/

                        if(temp == undefined)
                        {
                            console.log("Bugs Appear!", obj,":", ind);
                            continue;
                        }
                        // check Content
                        for (var j=0; j<temp.text().length; j++)
                        {
                            var str = temp.text()[j];
                            if (str < '0' || str > '9') // If it is not number
                            {
                                if ((str != '/' && str != '-' && str != '$')) {
                                    $element.find(".dataTables_wrapper table tr").find("th:eq("+ind+")").addClass("fleft");
                                    $element.find(".dataTables_wrapper table tr").find("td:eq("+ind+")").addClass("fleft");
                                    return 1;
                                }
                            }
                        }
                    }

                    // check the return status
                    if(flag == 0)
                    {
                        $element.find(".dataTables_wrapper table tr").find("th:eq("+ind+")").addClass("fright"); // String  
                        $element.find(".dataTables_wrapper table tr").find("td:eq("+ind+")").addClass("fright"); // String  
                        return 0;
                    }
                }

                function getMax(ind){
                    var len = $element.find(".dataTables_wrapper table tr").length;
                    var flag = 0;
                    var qlyspCount = 0;

                    for(var i=1;i<len;i++)
                    {
                        var obj = $element.find(".dataTables_wrapper table tr:eq("+i+")");
                        var temp = obj.find("td:eq("+ind+")");

                        // check the Max length
                        qlyspCount = Math.max(temp.text().length, qlyspCount);
                        if (qlyspCount>20)
                        {
                            qlyspCount = -1;
                            restCount ++;
                            return -1;
                        }
                    }

                    // compare the length with heaader text
                    var len = $element.find(".dataTables_wrapper table tr th:eq("+ind+")").text().length;
                    qlyspCount = Math.max(len, qlyspCount);
                    return qlyspCount;
                }

                window.rob = qlik;
                var self = this;
                if (typeof self.deployed == 'undefined') {
                    self.deployed = false;
                }
                if ((qlik.navigation && qlik.navigation.getMode() === 'edit')) {
                    $('.fixedHeader-floating, .fixedHeader-locked', $element).remove();
                    if ($.fn.DataTable.isDataTable(self.tableSelectorString)) {
                        self.table.destroy();
                        self.tableSelector.empty();
                        delete self.table;
                    }
                }
                if (typeof self.table == 'undefined') {
                    $element.addClass("brilliant-disabled-element");


                    $('.brilliant-datatable.brilliant-extension-container', $element).scrollTop(0);
                    $element.css('overflow', 'auto');
                    self.tableSelectorString = '#' + layout.qInfo.qId + '_BrilliantDataTable table.brilliant-datatable';
                    self.shadowTableSelectorString = '#' + layout.qInfo.qId + '_BrilliantDataTable table.shadow';
                    self.tableSelector = $(self.tableSelectorString);
                    self.shadowTableSelector = $(self.shadowTableSelectorString);
                    if ($.fn.DataTable.isDataTable(self.tableSelectorString)) {
                        $('.fixedHeader-floating, .fixedHeader-locked', $element).remove();
                        self.tableSelector.DataTable().destroy();
                        self.tableSelector.empty();
                    }
                    self.tableSelector.html(self.shadowTableSelector.clone().html());

                    // Check for column renderer
                    layout.brilliantprops.renderColIndexes = [];
                    layout.brilliantprops.colOrdersAssoc = [];
                    layout.brilliantprops.columnDefs = [];
                    //Map table column names to order
                    var colOrdersAssoc = [];
                    var colDataTypes = [];
                    layout.qHyperCube.qDimensionInfo.forEach(function(dimension, idx) {
                        colOrdersAssoc[dimension.qFallbackTitle + ""] = idx;
                        colDataTypes[idx] = dimension.qNumFormat.qType;
                    });
                    layout.qHyperCube.qMeasureInfo.forEach(function(measure, idx) {
                        var realIdx = idx + layout.qHyperCube.qDimensionInfo.length;
                        colOrdersAssoc[measure.qFallbackTitle + ""] = realIdx;
                        colDataTypes[realIdx] = measure.qNumFormat.qType;
                    });

                    // Parse linkrenderer
                    if (typeof layout.brilliantprops.rendererListItems != 'undefined' && layout.brilliantprops.rendererListItems.length > 0) {
                        layout.brilliantprops.rendererListItems.forEach(function(linkItem, linkIdx) {
                            var colIndex = colOrdersAssoc[linkItem.linkrenderer];
                            var colDef = {
                                targets: colIndex,
                                render: function(data, type, full, meta) {
                                    if (typeof data == "undefined" || data == "") {
                                        return "";
                                    }
                                    var linkRenderer = linkItem;
                                    if (linkRenderer.passthroughhtml) {
                                        return data;
                                    }
                                    var colText = linkRenderer.linkmask != "" ? linkRenderer.linkmask : data;
                                    var colHref = linkRenderer.linkprefix != "" ? linkRenderer.linkprefix + data : data;
                                    return '<a href="' + colHref + '" target="_blank">' + colText + '</a>';
                                },
                                className: 'link-renderer'
                            };

                            layout.brilliantprops.columnDefs.push(colDef);

                            // Set class on headers 
                            if ((parseInt(colIndex) + 1)) {
                                $('.total-row th:nth-child(' + (parseInt(colIndex) + 1) + ')', $element).addClass('link-renderer');
                            } else {
                                //console.log('NaN', linkItem);
                            }
                        });
                    }


                    self.emailHTMLs = [];
                    // Parse htmlrenderer
                    if (typeof layout.brilliantprops.htmlListItems != 'undefined' && layout.brilliantprops.htmlListItems.length > 0) {
                        layout.brilliantprops.htmlListItems.forEach(function(htmlItem, htmlIdx) {
                            var colIndex = colOrdersAssoc[htmlItem.htmlrenderer];
                            var colDef = {
                                targets: colIndex,
                                render: function(data, type, full, meta) {
                                    //console.log(data, type, full, meta);
                                    if (typeof data == "undefined" || data == "") {
                                        return "";
                                    }
                                    var htmlRenderer = htmlItem;
                                    self.emailHTMLs.push(data);
                                    var colText = "View Email Content";
                                    return '<a href="javascript:void(0);" class="htmlEmail">' + colText + '</a>';
                                },
                                className: 'html-renderer'
                            };

                            layout.brilliantprops.columnDefs.push(colDef);

                            // Set class on headers 
                            if ((parseInt(colIndex) + 1)) {
                                $('.total-row th:nth-child(' + (parseInt(colIndex) + 1) + ')', $element).addClass('html-renderer');
                            } else {
                                console.log('NaN', htmlItem);
                            }
                        });
                    }
                    // Parse ColAlignment
                    if (typeof layout.brilliantprops.alignmentListItems != 'undefined' && layout.brilliantprops.alignmentListItems.length > 0) {
                        layout.brilliantprops.alignmentListItems.forEach(function(alignmentItem, linkIdx) {
                            var colIndex = colOrdersAssoc[alignmentItem.alignmentcolumn];
                            var colClass = alignmentItem.alignmentstate;

                            // Set class on cells
                            $('tr th:nth-child(' + (parseInt(colIndex) + 1) + ')', $element).addClass(colClass);
                            $('tr td:nth-child(' + (parseInt(colIndex) + 1) + ')', $element).addClass(colClass);
                        });
                    }
                    layout.brilliantprops.colOrdersAssoc = colOrdersAssoc;
                    layout.brilliantprops.colDataTypes = colDataTypes;
                    // Check datatypes of columns and set columnDefs accordingly
                    for (var key in colDataTypes) {
                        if (colDataTypes[key] == "D") {
                            layout.brilliantprops.columnDefs.push({
                                type: "date",
                                targets: key
                            });
                        }
                    }


                    self.table = self.tableSelector.DataTable({
                        destroy: true,
                        columnDefs: layout.brilliantprops.columnDefs,
                        colReorder: { realtime: false },
                        responsive: true,
                        paging: false,
                        searching: false,
                        info: false,
                        orderCellsTop: layout.brilliantprops.totals,
                        fixedHeader: true
                    });
                    if (!self.deployed) {
                        $element.on('qv-activate', 'tbody tr', function(ev) {
                            if (
                                ev.target.tagName == "A" || (qlik.navigation && qlik.navigation.getMode() === 'edit') || (ev.target.tagName == "TD" && $(ev.target).index() == 0 && $(ev.target).parents('.dtr-inline.collapsed').length > 0)
                            ) {
                                var target = $(ev.target);
                                if (target.hasClass('htmlEmail')) {
                                    var emailHtml = self.emailHTMLs[target.parents('tr').eq(0).data('hcubeindex')];
                                    //console.log('launching email html', emailHtml, self.emailHTMLs, target.parents('tr').eq(0).data('hcubeindex'));
                                    //var dialog = $('.dialog-content', $element).show();
									var wWidth = $(window).width();
									var dWidth = wWidth * 0.8;
									var wHeight = $(window).height();
									var dHeight = wHeight * 0.8;
									$( "#dialog-" + layout.qInfo.qId + '_BrilliantDataTable').html(emailHtml);
									$( "#dialog-" + layout.qInfo.qId + '_BrilliantDataTable').dialog({
									  modal: true,
									  overlay: { opacity: 0.1, background: "black" },
									  width: dWidth,
									  height: dHeight,
									  title:'Email content',
									  draggable: false,
                            		  resizable: false,
									  buttons: {
										Ok: function() {
										  $( this ).dialog( "close" );
										}
									  }
									});
                                }
                                return;
                            }
                            $(this).toggleClass('brilliant-selected');
                            var dim = 0;
                            var value = $(this).data('qelemnumber');
                            self.selectValues(dim, [value], true);
                            self.table.draw();
                        });
                    }
                } else {
                    if ($('.shadow tbody tr', $element).length > 0) {
                        // Set totals from shadow
                        $('tr.total-row th', self.table.table().header()).each(function(idx, el) {
                                // get the equivalent from the shadow table
                                var shadowText = $('.shadow tr.total-row th', $element).eq(idx).text();
                                $(el).text(shadowText);
                            })
                            // Clear rows and bring in new
                        self.table.clear().rows.add($('.shadow tbody tr', $element).clone());
                    }
                    self.table.draw();
                }
                //new $.fn.dataTable.FixedHeader(table);
                self.table.columns.adjust().draw();
                self.table.fixedHeader.adjust();

                $element.find(".dataTables_wrapper th").each(function(i) {
                    alignField(i);
                    var width = getMax(i);

                    if(width == -1) $(this).addClass("pangea");
                    else{
                        restWidth+= (8*width + 20);
                        $(this).css("width", 8*width - 20);
                    }

                    // check last Element
                    if(i == $element.find(".dataTables_wrapper th").length-1)
                    {
                        if (restCount >0) width = ($element.find(".dataTables_wrapper").width() - restWidth)/restCount;
                        $element.find(".pangea").css("width", width);
                    }
                });
                // Add class onto columns which have renderer attached to allow hiding of totals.
                /*for (var key in layout.brilliantprops.renderColIndexes) {
                    if (layout.brilliantprops.renderColIndexes.hasOwnProperty(key)) {
                        $('.total-row th:nth-child(' + (parseInt(key) + 1) + ')', $element).addClass('link-renderer');
                    }
                }*/
                $element.removeClass("brilliant-disabled-element");
                self.deployed = true;
            },

            controller: ['$scope', function($scope) {
                $scope.id = $scope.layout.qInfo.qId + '_BrilliantDataTable';
                $scope.getCellText = function(colIdx, col) {
                    if (typeof $scope.layout.brilliantprops.renderColIndexes != 'undefined' && typeof $scope.layout.brilliantprops.renderColIndexes[colIdx] != "undefined") {
                        if (typeof col.qText == "undefined" || col.qText == "") {
                            return "";
                        }
                        var linkRenderer = $scope.layout.brilliantprops.renderColIndexes[colIdx];
                        var colText = linkRenderer.linkmask != "" ? linkRenderer.linkmask : col.qText;
                        var colHref = linkRenderer.linkprefix != "" ? linkRenderer.linkprefix + col.qText : col.qText;
                        return '<a href="' + colHref + '" target="_blank">' + colText + '</a>';
                    } else {
                        return col.qText;
                    }
                }
            }]
        };
    });
