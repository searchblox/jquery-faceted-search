/*
 * jquery.facetview.js
 *
 * displays faceted browse results by querying a specified index
 * can read config locally or can be passed in as variable when executed
 * or a config variable can point to a remote config
 */

// first define the bind with delay function from (saves loading it separately)
// https://github.com/bgrins/bindWithDelay/blob/master/bindWithDelay.js
var jsonData = {};
var resulted = [];
//var rootUrl = "http://185.73.37.206:8080";
var rootUrl = "http://localhost:8080";

(function ($) {
    $('a').on('click', function () {
        setModel($(this));
    })


    setModel = function (index) {
      console.log("setModel is called"); // I: To check when this function is triggered

        var id = $(index).parents('td');
        var data;
        for (var i = 0; i < resulted.length; i++) {
            if (resulted[i]['@id'] == id[0].id) {
                data = resulted[i];
                break;
            }
        }
        var fileName, discription, title, obj;
        txt = '<table class="table table-striped table-bordered">';

        if (data.contenttype == 'csv' || data.contenttype == 'mongodb' || data.contenttype == 'db') {
            $(index).on('click', function (event) {
                event.preventDefault();
            });

            if (data.contenttype == 'csv') {
                var array = [{title: data.title}, {keywords: data.keywords}, {content_Type: data.contenttype}, {lastmodified: data.lastmodified}];
                if (data.source) {
                    $.each(data.source, function (key, value) {
                        if (value == '' || value == undefined || value == null) {
                            return;
                        }
                        var obj = {};
                        obj[key] = value;
                        array.push(obj);
                    });
                }
                obj = popupFunc(array);
            } else if (data.contenttype == 'db') {
                var array = [{title: data.title}, {keywords: data.keywords}, {lastmodified: data.lastmodified}, {content_Type: data.contenttype}];
                if (data.source) {
                    $.each(data.source, function (key, value) {
                        if (value == undefined || value == null || value == '') {
                            return;
                        }
                        var obj = {};
                        obj[key] = value;
                        array.push(obj);
                    });
                }
                obj = popupFunc(array);
            }
            if (data.contenttype == 'mongodb') {
                var array = [];
                $.each(data, function (key, value) {
                    if (key == '@id' || key == '@no' || key == 'score' || key == 'uid' || key == 'col' || key == 'indexdate' || key == 'url' || key == 'size' || key == '_autocomplete' || key == 'description' || key == 'created_at' || key == 'sb_boost') {
                        return;
                    } else {
                        var obj = {};
                        obj[key] = value;
                        array.push(obj);
                    }
                });
                obj = popupFunc(array);
            } else if (data.contenttype == 'TEXT') {

                var array = [{title: data.title}, {fileName: data.filename}, {discription: data.description}];
                obj = popupFunc(array);
            }

            var popup = "<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>" +
                "<div class='modal-dialog'>" +
                "<div class='modal-content width110'>" +
                "<div class='modal-header'>" +
                "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
                "<h4 class='modal-title' id='myModalLabel'>" + data.title + "</h4>" +
                "</div>" +
                "<div class='modal-body'>" + obj +
                "</div>" +
                "<div class='modal-footer'>" +
                "<button type='button' class='btn btn-default' id='closeModel' data-dismiss='modal'>Close</button>" +
                "</div>" +
                "</div>" +
                "</div>" +
                "</div>";

            $("#myModal").replaceWith(popup);
            $("#myModal").modal('show')
        } else {
            var href = $(index).attr('href');
            var colno = $(index).attr('collectionno');
            if (!href.match("^http") || !href.match("^https")) {
                if (!href.match("^../servlet/")) {
                    win = window.open(rootUrl + '/searchblox/servlet/FileServlet?url=' + encodeURIComponent(href) + "&col=" + colno, '_blank'); // I: Added rootUrl
                    return false;
                }
            }
            return true;
        }
    };
    popupFunc = function (array) {
      console.log("popupFunc is called"); // I: To check when this function is triggered
        for (var i = 0; i < array.length; i++) {
            $.each(array[i], function (key, value) {
                if (value == undefined || value == null || value == '') {
                    value = '';
                }
                txt += '<tr><th>' + key + '</th>' + '<td>' + value + '</td></tr>';
            });
        }
        txt += "</table>";
        return txt;
    };

  /*  $.ajax({
      type: "get",                        // I: changed getJSON to ajax & dataType jsonp for CORS
      url: "webData.json",
      dataType: "jsonp",
      success: function (data) {
          console.log(data);
          jsonData = data;
      }
    });*/


    $.getJSON("webData.json", function (data) {
        jsonData = data;
    });

    //console.log(jsonData);
    $.fn.bindWithDelay = function (type, data, fn, timeout, throttle) {
      console.log("bindWidthDelay is called"); // I: To check when this function is triggered
        var wait = null;
        var that = this;

        if ($.isFunction(data)) {
            throttle = timeout;
            timeout = fn;
            fn = data;
            data = undefined;
        }

        function cb() {
            var e = $.extend(true, {}, arguments[0]);
            var throttler = function () {
                wait = null;
                fn.apply(that, [e]);
            };

            if (!throttle) {
                clearTimeout(wait);
            }
            if (!throttle || !wait) {
                wait = setTimeout(throttler, timeout);
            }
        }

        return this.bind(type, data, cb);
    }
})(jQuery);

// add extension to jQuery with a function to get URL parameters
jQuery.extend({
    getUrlVars: function () {
      console.log("getUrlVars is called"); // I: To check when this function is triggered
        var params = new Object;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            if (hash.length > 1) {
                hash[1] = decodeURI(hash[1]);
                if (hash[1].replace(/%22/gi, "")[0] == "[" || hash[1].replace(/%22/gi, "")[0] == "{") {
                    hash[1] = hash[1].replace(/^%22/, "").replace(/%22$/, "");
                    var newval = JSON.parse(unescape(hash[1].replace(/%22/gi, '"')));
                } else {
                    var newval = unescape(hash[1].replace(/%22/gi, ""));
                }
                params[hash[0]] = newval
            }
        }
        return params
    },
    getUrlVar: function (name) {
      console.log("getUrlVar is called"); // I: To check when this function is triggered
        return jQuery.getUrlVars()[name];
    }
});


// now the facetview function
jQuery(function ($) {
    $.fn.facetview = function (options) {
      console.log("facetview is called"); // I: To check when this function is triggered
        //the query variable
        var filterq = new Array();
        var filterqn = -1;
        var sortq = "";
        var direction = "&sortdir=desc";
        var sizeq = new Array();
        var startdate = "";
        var enddate = "";
        var sizefilter = "";
        var dummy = false;
        var autosuggestflag = true;
        var mltFlag = false; // I: MLT - DEFAULT VALUE FOR MORE LIKE THIS SET TO FALSE
        var mlturl = ""; // I: MLT - DEFAULT VALUE FOR MORE LIKE THIS - url
        var datacol = ""; // I: MLT - DEFAULT VALUE FOR MORE LIKE THIS  data-col

        var sizeOfResult = ""; // I: To display the size of the result

        // a big default value (pulled into options below)
        var resdisplay = [
            [
                {
                    'pre': '<div class="span10 col-xs-12 col-sm-9 col-md-10"><div class="row"><div class="searched-title"><a target="_blank" href="',
                    'field': 'url',
                    'post': '" onClick="return setModel(this); setgo()"'
                },
                {
                    'pre': 'id="searchresult" collectionno="',
                    'field': 'col',
                    'post': '" '

                },
                {
                    'pre': ' uid="',
                    'field': 'uid',
                    'post': '"'

                },
                {
                    'pre': ' old_uid="',
                    'field': 'old_uid',
                    'post': '"'

                },
                {
                    "pre": "><b>",
                    "field": "title",
                    "post": "</b></a> "
                },
                {
                    "pre": ' &nbsp;&nbsp;<a class="mlt" style="cursor:pointer" data-col="1" rel="', // I: Added class as mlt
                    "field": "uid",
                    "post": '"> <span>More Like This</span></a></br></div> </div>'
                }
            ],
            [
                {
                    "pre": '<div class="row"><div class="row-fluid searched-img" style="height:20px;">',
                    "field": "image",
                    "post": '</div></div>'
                }
            ],
            [
                {
                    "pre": '<div class="row"> <div class="row-fluid searched-context">...',
                    "field": "context.text",
                    "post": '...</div> </div>'
                },
                {
                    "pre": '<div class="row"><div class="row-fluid searched-description">',
                    "field": "description",
                    "post": '</div> </div>'
                }
            ],
            [
                {
                    'pre': '<div class="row"><div class="row-fluid searched-url"><i class="_searchresult_url">',
                    "field": "url",
                    'post': '</i></div> </div></div>'
                }
            ],
      			[
                {
                    'pre': '<div class="span8 col-xs-12 col-sm-3 col-md-2"><div class="progress-wrapper" style="float:right; width:100px;"><div class="progress" style="height:20px">\
      				            <div class="progress-bar" style="width:',
                    'field': 'score',
                    'post': '%;"'
                },
                {
                    'pre': '>',
                    'field': 'score',
                    'post': '%</div></div>'
                },
                {
                    'pre': '<span class="last-modified">',
                    'field': 'lastmodified',
                    'post': '</span>' // I: Modified to add size for each record
                },
                {
                    'pre': '<span class="last-modified">',
                    'field': 'size',
                    'post': '</span> </div></div></div></div>'
                }
      			]
        ];
        /*var resdisplay = [
            [
                {
                    'pre': '<div class="row-fluid col-sm-12"><div class="span10"><div class="searched-title" style="float:left"><a target="_blank" href="',
                    'field': 'url',
                    'post': '" onClick="return setModel(this); setgo()"'
                },
                {
                    'pre': 'id="searchresult" collectionno="',
                    'field': 'col',
                    'post': '" '

                },
                {
                    'pre': ' uid="',
                    'field': 'uid',
                    'post': '"'

                },
                {
                    'pre': ' old_uid="',
                    'field': 'old_uid',
                    'post': '"'

                },
                {
                    "pre": "><b>",
                    "field": "title",
                    "post": "</b></a> "
                },
                {
                    "pre": ' &nbsp;&nbsp;<a class="" style="cursor:pointer" data-col="1" rel="',
                    "field": "url",
                    "post": '"> More Like This</a></br></div>'
                },
                {
                    'pre': '<div class="span8"><div class="progress-wrapper" style="float:right; width:100px; height:5px;"><div class="progress" style="height:20px">\
				                <div class="progress-bar" style="width:',
                    'field': 'score',
                    'post': '%;"'
                },
                {
                    'pre': '>',
                    'field': 'score',
                    'post': '%</div></div>'
                },
                {
                    'pre': '<span class="last-modified">',
                    'field': 'lastmodified',
                    'post': '</span>' // I: Modified to add size for each record
                },
                {
                    'pre': '<span class="last-modified">',
                    'field': 'size',
                    'post': '</span> </div></div><div class="row-fluid" style="height:20px;"></div>'
                }
            ],
            [
                {
                    "pre": '<div class="row-fluid searched-img" style="height:20px;">',
                    "field": "image",
                    "post": '</div>'
                }
            ],
            [
                {
                    "pre": '<div class="row-fluid searched-context" style="width:600px;text-align:justify;clear:left;">...',
                    "field": "context.text",
                    "post": '...</div>'
                },
                {
                    "pre": '</div><div class="row-fluid searched-description" style="width:600px;">',
                    "field": "description",
                    "post": '</div>'
                }
            ],
            [
                {
                    'pre': '<div class="row-fluid searched-url"><i class="_searchresult_url" style="display: block;width: 600px;word-wrap: break-word;">',
                    "field": "url",
                    'post': '</i></div></div>'
                }
            ],
        ];*/
        // specify the defaults
        var defaults = {
            "config_file": false,           // a remote config file URL
            "facets": [],                    // facet objects: {"field":"blah", "display":"arg",...}
            "result_display": resdisplay,   // display template for search results
            "display_images": true,         // whether or not to display images found in links in search results
            "description": "",               // a description of the current search to embed in the display
            "search_url": "",                // the URL against which to submit searches
            'default_url_params': {
                'facet': 'on',
                'xsl': 'json'
            },
// any params that the search URL needs by default
            "freetext_submit_delay": "500",  // delay for auto-update of search results
            "query_parameter": "query",          // the query parameter if required for setting to the search URL
            "query": "",                         // default query value
            "predefined_filters": {},        // predefined filters to apply to all searches
            "paging": {
                "from": 0,                   // where to start the results from
                "size": 10                   // how many results to get
            },
            "filter": [],
            "nofsuggest": 10
        };

        // and add in any overrides from the call
        // these options are also overridable by URL parameters
        // facetview options are declared as a function so they are available externally
        // (see bottom of this file)
        var provided_options = $.extend(defaults, options);
        var url_options = $.getUrlVars();
        $.fn.facetview.options = $.extend(provided_options, url_options);
        var options = $.fn.facetview.options;
        var first = true;
        // ===============================================
        // functions to do with filters
        // ===============================================

        // show the filter values
        var showfiltervals = function (event) {
          console.log("showfiltervals is called"); // I: To check when this function is triggered
            event.preventDefault();
            if ($(this).hasClass('facetview_open')) {
                $(this).children('i').replaceWith('<i class="icon-plus"></i>');
                $(this).removeClass('facetview_open');
                $(document.getElementById('facetview_' + $(this).attr('rel'))).children().hide();
            } else {
                $(this).children('i').replaceWith('<i class="icon-minus"></i>');
                $(this).addClass('facetview_open');
                $(document.getElementById('facetview_' + $(this).attr('rel'))).children().show();
            }
        };

        // show the filter values initially
        var showfiltervalsinit = function () {
          console.log("showfiltervalsinit is called"); // I: To check when this function is triggered
            $('.facetview_filtershow').each(function () {
                if ($(this).hasClass('facetview_open')) {
                    // do nothing
                } else {
                    $(this).children('i').replaceWith('<i class="icon-minus"></i>');
                    $(this).addClass('facetview_open');
                    $(document.getElementById('facetview_' + $(this).attr('rel'))).children().show();
                }
            });
            $('.facetview_advfiltershow1').each(function () {
                if ($(this).hasClass('facetview_open')) {
                    // do nothing
                } else {
                    $(this).children('i').replaceWith('<i class="icon-minus"></i>');
                    $(this).addClass('facetview_open');
                    $(document.getElementById('facetview_' + $(this).attr('rel'))).children().show();
                }
            });
            $('.facetview_advfiltershow2').each(function () {
                if ($(this).hasClass('facetview_open')) {
                    // do nothing
                } else {
                    $(this).children('i').replaceWith('<i class="icon-minus"></i>');
                    $(this).addClass('facetview_open');
                    $(document.getElementById('facetview_' + $(this).attr('rel'))).children().show();
                }
            });
        };


        // adjust how many results are shown
        var morefacetvals = function (event) {
          console.log("morefacetvals is called"); // I: To check when this function is triggered
            event.preventDefault();
            var morewhat = options.facets[$(this).attr('rel')];
            if ('size' in morewhat) {
                var currentval = morewhat['size']
            } else {
                var currentval = 10
            }
            var newmore = prompt('Currently showing ' + currentval +
                '. How many would you like instead?');
            if (newmore) {
                options.facets[$(this).attr('rel')]['size'] = parseInt(newmore);
                $(this).html('show up to (' + newmore + ')');
                dosearch();
                if (!$(this).parent().parent().siblings('.facetview_filtershow').hasClass('facetview_open')) {
                    $(this).parent().parent().siblings('.facetview_filtershow').trigger('click')
                }
            }
        };

        // pass a list of filters to be displayed
        var buildfilters = function () {
          console.log("buildfilters is called"); // I: To check when this function is triggered
            var filters = options.facets;
            var thefilters = '<h3>Filter by <div id="nofresults" style="margin-bottom:-34px;"></div></h3>';
            thefilters += '<div style="clear:both;" id="facetview_selectedfilters"></div>';
            thefilters += '<div class="" id="facetview_leftcol_percolator" style="display:none;"> \
                                    <a class="btn btn-warning" id="clear_filter_all" href="#">Clear FIlter</a> \
                                    <a class="btn btn-warning" id="create_alert" href="#">Create Alert</a> \
                                </div>';
            for (var idx in filters) {
                var _filterTmpl = ' \
                    <div id="facetview_filterbuttons" class="btn-group col-sm-12"> \
                    <a style="text-align:left; min-width:70%;" class="facetview_filtershow btn btn-default" \
                      rel="{{FILTER_NAME}}" href=""> \
                      <i class="icon-plus"></i> \
                      {{FILTER_DISPLAY}}</a> \
                      <a class="btn dropdown-toggle btn-default" data-toggle="dropdown" \
                      href="#"><i class="fa fa-angle-down"></i></span></a> \
                      <ul class="dropdown-menu"> \
                      <li><a class="facetview_morefacetvals" rel="{{FACET_IDX}}" href="{{FILTER_EXACT}}">show up to ({{FILTER_HOWMANY}})</a></li>\
                      </ul>\
                      </div> \
                  <ul id="facetview_{{FILTER_NAME}}" \
                    class="facetview_filters"></ul> \
                    ';
                if (options.visualise_filters) {
                    var vis = '<li><a class="facetview_visualise" rel="{{FACET_IDX}}" href="{{FILTER_DISPLAY}}">visualise this filter</a></li>';
                    thefilters += _filterTmpl.replace(/{{FACET_VIS}}/g, vis);
                } else {
                    thefilters += _filterTmpl.replace(/{{FACET_VIS}}/g, '');
                }
                thefilters = thefilters.replace(/{{FILTER_NAME}}/g, filters[idx]['field'].replace(/\./gi, '_')).replace(/{{FILTER_EXACT}}/g, filters[idx]['field']);
                if ('size' in filters[idx]) {
                    thefilters = thefilters.replace(/{{FILTER_HOWMANY}}/gi, filters[idx]['size'])
                } else {
                    thefilters = thefilters.replace(/{{FILTER_HOWMANY}}/gi, 10)
                }
                thefilters = thefilters.replace(/{{FACET_IDX}}/gi, idx)
                if ('display' in filters[idx]) {
                    thefilters = thefilters.replace(/{{FILTER_DISPLAY}}/g, filters[idx]['display'])
                } else {
                    thefilters = thefilters.replace(/{{FILTER_DISPLAY}}/g, filters[idx]['field'])
                }
            }
            $('#facetview_filters').html("").append(thefilters);
            $('.facetview_morefacetvals').bind('click', morefacetvals);
            $('.facetview_filtershow').bind('click', showfiltervals);
            $('#clear_filter_all').bind('click', removefilterquery_all); // I: TO REMOVE ALL THE FILTERS APPLIED

        }

        var fixadvfilters = function () {
          console.log("fixadvfilters is called"); // I: To check when this function is triggered
            var advfilterhtml = '<div id="facetview_filterbuttons" class="btn-group col-sm-12">\
                  <a style="text-align:left; min-width:70%;" class="facetview_advfiltershow1 btn btn-default" rel="advfilterdate" href="">\
                  <i class="icon-plus"></i>\
                  Date</a></div>\
        	  <div id="facetview_advfilterdate">\
        		<span>\
        			<ul>\
        			<a href="javascript:void(0)" class="facetview_filterchoice1"><li sn="3" id="optiondatefrom_Last24">Last 24 hours (0)</li></a>\
        			<a href="javascript:void(0)" class="facetview_filterchoice1"><li sn="2" id="optiondatefrom_pweek">Past Week (0)</li></a>\
        			<a href="javascript:void(0)" class="facetview_filterchoice1"><li sn="1" id="optiondatefrom_pmonth">Past Month (0)</li></a>\
        			<a href="javascript:void(0)" class="facetview_filterchoice1"><li sn="0" id="optiondatefrom_pyear">Past Year (0)</li></a>\
        			<a href="javascript:void(0)" class="facetview_filterchoice1"><li id="optiondatefrom_custom">Custom</li></a>\
        			</ul>\
        			<div class="daterange_facet" >\
        			  <div class="control-group">\
        			    <label class="control-label">From:</label>\
        			    <div class="controls">\
                			<div class="input-group">\
        				    <span class="input-group-addon"><i class="icon-calendar"></i></span><input class="span2 form-control" readonly id="start_date" size="16" type="text" value="' + moment().subtract('days', 1).format("MM/DD/YYYY") + '">\
                			</div>\
        			    </div>\
        			  </div>\
				      <div class="control-group">\
				        <label class="control-label">To:</label>\
				        <div class="controls">\
					      <div class="input-group">\
        				  <span class="input-group-addon"><i class="icon-calendar"></i></span><input class="span2 form-control" readonly id="end_date" size="16" type="text" value="' + moment().format("MM/DD/YYYY") + '">\
					      </div>\
				        </div>\
        			    <div class="btn btn-primary" id="date_go" style="margin-bottom:10px; margin-top:10px; -webkit-border-radius:5px; border-radius:5px;">Go!</div>\
        			  </div>\
				    </div>\
        		</span>\
        	  </div>';
            $('#adv_filters').html("").append(advfilterhtml);
            $('.facetview_advfiltershow1').bind('click', showfiltervals);
            $('.facetview_advfiltershow2').bind('click', showfiltervals);
            $('#facetview_advfilterdate').children().hide();
            $('#facetview_advfiltersize').children().hide();
            $('.daterange_facet').children().hide();
            $('[id^="optiondatefrom_"]').each(
                function () {
                    $(this).bind(
                        'click',
                        function () {
                            daterangeclick($(this).html().replace(
                                /.?[(]+\d+[)]/g, ""));
                        });
                });
            $('[id^="optionsizefrom_"]').each(function () {
                $(this).bind('click', function () {
                    sizerangeclick($(this).attr('id').split('_')[1]);
                });
            });
            $('#start_date').focus(function () {
                $(this).attr('old', $('#start_date').val());
            });
            $('#end_date').focus(function () {
                $(this).attr('old', $('#end_date').val());
            });
            $('#start_date').change(function () {
                var a = moment($('#start_date').val());
                var b = moment($('#end_date').val());
                if (a.diff(b) > 0) {
                    $(this).val($(this).attr('old'));
                    alert("Ooops...\nStart date cannot be after the end date");
                }
                ;
            });
            $('#end_date')
                .change(
                    function () {
                        var a = moment($('#start_date').val());
                        var b = moment($('#end_date').val());
                        if (a.diff(b) > 0) {
                            $(this).val($(this).attr('old'));
                            alert("Ooops...\nEnd date cannot be before the start date");
                        }
                        ;
                    });
            $('#date_go').click(function () {
                var datefrom = moment($('#start_date').val()).format(jsonData.dateTime);
                var dateto = moment($('#end_date').val()).format(jsonData.dateTime);
                var datefrom1 = moment($('#start_date').val()).format("YYYY-MM-DD");
                var dateto1 = moment($('#end_date').val()).format("YYYY-MM-DD");
                startdate = "&f.lastmodified.filter=[" + datefrom + "TO" + dateto + "]";
                clickdatefilterchoice("From " + datefrom1 + " to " + dateto1);
            });
        };

        var clicksizefilterchoice = function (a) {
          console.log("clicksizefilterchoice is called"); // I: To check when this function is triggered
            var view = "";
            if (a == '0')view = "&lt100kB";
            else if (a == '1')view = "100kB to 500kB";
            else if (a == '2')view = "100kB to 500kB";
            else if (a == '3')view = "1MB to 10MB";
            else if (a == '4')view = "10MB&gt";
            view1 = view.replace(/ /g, '_');
            view1 = view1.replace(/&/g, '_');
            var newobj = '<a class="facetview_filterselected facetview_clear ' +
                'btn btn-info"' +
                '" alt="remove" title="remove"' +
                ' href="javascript:void(0)" rel="sizefilter"' + ' filtername=' + view1 + ' >' +
                view.replace(/\(.*\)/, '') + ' <i class="icon-remove"></i></a>';

            if ($('#facetview_selectedfilters').find('a[filtername="' + view1 + '"]').attr('filtername') == undefined) {
                var temp = sizefilter;
                $('a[rel=sizefilter]').each(function () {
                    dummy = true;
                    $(this).click();
                });
                sizefilter = temp;
                $('#facetview_selectedfilters').append(newobj);
                $('.facetview_filterselected').unbind('click', clearsizefilter);
                $('.facetview_filterselected').bind('click', clearsizefilter);
                options.paging.from = 1; //I: Changed values from 0 to 1
                dosearch();
            }
            else {
                alert("Filter:" + $('#facetview_selectedfilters').find('a[filtername="' + view + '"]').attr('filtername') + " already exist!!");
            }
        };

        var clearsizefilter = function (event) {
          console.log("clearsizefilter is called"); // I: To check when this function is triggered
            event.preventDefault();
            $(this).remove();
            sizefilter = "";
            if (!dummy)
                dosearch();
            else
                dummy = false;
        }

        var clickdatefilterchoice = function (a) {
          console.log("clickdatefilterchoice is called"); // I: To check when this function is triggered
            var view = a;
            view = view.replace(/ /g, '_');
            var cleanname = view.replace(/\(.*\)/, '').replace(/_/g, ' ');

            var newobj = '<a class="facetview_filterselected facetview_clear ' +
                'btn btn-info"' +
                '" alt="remove" title="remove"' +
                ' href="javascript:void(0)" rel="datefilter"' + ' filtername=' + view + ' >' +
                cleanname + ' <i class="icon-remove"></i></a>';

            if ($('#facetview_selectedfilters').find('a[filtername="' + view + '"]').attr('filtername') == undefined) {
                var temp = startdate;
                $('a[rel=datefilter]').each(function () {
                    dummy = true;
                    $(this).click();
                });
                startdate = temp;
                $('#facetview_selectedfilters').append(newobj);
                $('.facetview_filterselected').unbind('click', cleardatefilter);
                $('.facetview_filterselected').bind('click', cleardatefilter);
                options.paging.from = 1;
                dosearch();
            }
            else {
                alert("Filter:" + $('#facetview_selectedfilters').find('a[filtername="' + view + '"]').attr('filtername') + " already exist!!");
            }
        };

        var cleardatefilter = function (event) {
          console.log("cleardatefilter is called"); // I: To check when this function is triggered
            event.preventDefault();
            $(this).remove();
            startdate = "";
            if (!dummy)
                dosearch();
            else
                dummy = false;
        };


        var sizerangeclick = function (a) {
          console.log("sizerangeclick is called"); // I: To check when this function is triggered
            switch (a) {
                case '0':
                    sizefilter = "&f.size.filter=[*TO102400]";
                    break;

                case '1':
                    sizefilter = "&f.size.filter=[102400TO512000]";
                    break;

                case '2':
                    sizefilter = "&f.size.filter=[512000TO1048576]";
                    break;

                case '3':
                    sizefilter = "&f.size.filter=[1048576TO10485760]";
                    break;

                case '4':
                    sizefilter = "&f.size.filter=[10485760TO*]";
                    break;

                default:
                    sizefilter = "";
            }
            clicksizefilterchoice(a);
        };

        var activedate = -1;
        var daterangeclick = function (b) {
          console.log("daterangeclick is called"); // I: To check when this function is triggered
            $('.daterange_facet').children().hide();
            switch (b) {
                case 'Last 24 hours':
                    startdate = "&f.lastmodified.filter=[" + moment().subtract('days', 1).format(jsonData.dateTime) + "TO*]";
                    activedate = 0;
                    break;

                case 'Past Week':
                    startdate = "&f.lastmodified.filter=[" + moment().subtract('days', 7).format(jsonData.dateTime) + "TO*]";
                    activedate = 1;
                    break;

                case 'Past Month':
                    startdate = "&f.lastmodified.filter=[" + moment().subtract('months', 1).format(jsonData.dateTime) + "TO*]";
                    activedate = 2;
                    break;

                case 'Past Year':
                    startdate = "&f.lastmodified.filter=[" + moment().subtract('years', 1).format(jsonData.dateTime) + "TO*]";
                    activedate = 3;
                    break;

                case 'Custom':
                    $('.daterange_facet').children().show();
                    $('#start_date').datepicker();
                    $('#end_date').datepicker();

                    break;

                default:
                    startdate = "";
                    enddate = "";
            }
            if (b != 'Custom')clickdatefilterchoice("From " + b);
        };

        // match options filter and data filter
        var findfilterindata = function (filter) {
          console.log("findfilterindata is called"); // I: To check when this function is triggered
            var found = "false";
            for (var i in options.data["facets"])
                for (var n in options.data["facets"][i]) {
                    if (n == filter) {
                        found = "true";
                        return i;
                    }
                }
            if (found != true)
                return -1;
        };

        var filterquery = new Array();
        var nf = -1;

        // TO REMOVE ALL THE FILTERS APPLIED BY THE USER
        var removefilterquery_all = function () {
          console.log("removefilterquery_all is called"); // I: To check when this function is triggered
          filterquery.length = 0;
          nf = -1;
          $("#facetview_selectedfilters").html("");
          dosearch();
        };

        var removefilterquery = function (facet, filtername) {
          console.log("removefilterquery is called"); // I: To check when this function is triggered
            var s = validatefilteradd(facet, filtername);
            if (s == -1);
            else {
                filterquery.splice(s, 1);
                nf--;
            }
        };

        var removeallcontenttypefilterquery = function () {
          console.log("removeallcontenttypefilterquery is called"); // I: To check when this function is triggered
            var s = validatefilteradd('contenttype', '*');
            while (s != -1) {
                filterquery.splice(s, 1);
                nf--;
                s = validatefilteradd('contenttype', '*');
            }
        };

        var validatefilteradd = function (facet, filtername) {
          console.log("validatefilteradd is called"); // I: To check when this function is triggered
            if (filtername == '*') {
                for (var i in filterquery) {
                    if (filterquery[i]['0'] == facet)
                        return i;
                }
            }
            else {
                for (var i in filterquery) {
                    if (filterquery[i]['0'] == facet && filterquery[i]['1'] == filtername)
                        return i;
                }
            }
            return -1;
        };

        var viewfilter = function () {
          console.log("viewfilter is called"); // I: To check when this function is triggered
            for (i in filterquery) {
                alert(JSON.stringify(filterquery[i]));
            }
        };

        var addfilterquery = function (facet, filtername) {
          console.log("addfilterquery is called"); // I: To check when this function is triggered
            var s = validatefilteradd(facet, filtername);
            if (s == -1) {
                nf++;
                filterquery[nf] = {'0': facet, '1': filtername};
            }
        };

        var filterclick = function (rel, html) {
          console.log("filterclick is called"); // I: To check when this function is triggered
            addfilterquery(rel, escape(html.replace(/%%%/g, ' ')));
        };

        var appendfilterstoquery = function (a) {
          console.log("appendfilterstoquery is called"); // I: To check when this function is triggered
            var b = "";
            for (var i in filterquery) {
                b = b + "&f." + filterquery[i]['0'] + ".filter=" + filterquery[i]['1'];
            }
            return (a + b);
        };

        // set the available filter values based on results
        var putvalsinfilters = function (data) {
          console.log("putvalsinfilters is called"); // I: To check when this function is triggered
            // for each filter setup, find the results for it and append them to the relevant filter
            for (var each in options.facets) {
                $(document.getElementById('facetview_' + options.facets[each]['field'].replace(/\./gi, '_'))).children().remove();
                var n = findfilterindata(options.facets[each]['field']);
                if (n == -1)continue;
                var records = data["facets"][n][options.facets[each]['field']];
                var totcount = records[0];
                var a = "@name";
                if (options.facets[each]['field'] == 'lastmodified') {
                    for (var item in records[1]) {
                        var append = '<li class="fltchoice"><p id="fltchoice_' + records[1][item][a] +
                            '" rel="' + options.facets[each]['field'] + '"   class="facetview_filterchoice"' + ' href="#">' + moment((isNumber(records[1][item][a]) ? parseInt(records[1][item][a]) : records[1][item][a])).format("dddd, MMMM Do YYYY, h:mm:ss a") +
                            ' (' + records[1][item]['#text'] + ')</p></li>';
                        $('#facetview_' + options.facets[each]['field'].replace(/\./gi, '_')).append(append);
                    }
                }
                else if (options.facets[each]['field'] == 'indexdate') {
                    for (var item in records[1]) {
                        var append = '<li class="fltchoice"><p id="fltchoice_' + records[1][item][a] +
                            '" rel="' + options.facets[each]['field'] + '"   class="facetview_filterchoice"' + ' href="#">' + moment((isNumber(records[1][item][a]) ? parseInt(records[1][item][a]) : records[1][item][a])).format("dddd, MMMM Do YYYY, h:mm:ss a") +
                            ' (' + records[1][item]['#text'] + ')</p></li>';
                        $('#facetview_' + options.facets[each]['field'].replace(/\./gi, '_')).append(append);
                    }
                }
                else if (options.facets[each]['field'] == 'size') {
                    for (var item in records[1]) {
                        var sz = parseInt(records[1][item][a]);
                        var type = "bytes";
                        if (sz > 1024) {
                            sz = sz / 1024;
                            type = "KB"
                        }
                        if (sz > 1024) {
                            sz = sz / 1024;
                            type = "MB"
                        }
                        var append = '<li class="fltchoice"><a id="fltchoice_' + records[1][item][a] +
                            '" rel="' + options.facets[each]['field'] + '"   class="facetview_filterchoice"' + ' href="#">' + Math.floor(sz) + " " + type +
                            ' (' + records[1][item]['#text'] + ')</a></li>';
                        $('#facetview_' + options.facets[each]['field'].replace(/\./gi, '_')).append(append);
                    }
                }
                else {
                    for (var item in records[1]) {
                        var append = '<li class="fltchoice"><a id="fltchoice_' + records[1][item][a].replace(/ /g, '%%%') +
                            '" rel="' + options.facets[each]['field'] + '" class="facetview_filterchoice"' + ' href="#" forcloudrel="' + records[1][item]['#text'] + '" forcloudtag="' + records[1][item][a] + '">' + records[1][item][a] +
                            ' (' + records[1][item]['#text'] + ')</a></li>';
                        $(document.getElementById('facetview_' + options.facets[each]['field'].replace(/\./gi, '_'))).append(append);
                    }
                }

                if (!$('.facetview_filtershow[rel="' + options.facets[each]['field'].replace(/\./gi, '_') + '"]').hasClass('facetview_open')) {
                    $(document.getElementById('facetview_' + options.facets[each]['field'].replace(/\./gi, '_'))).children().hide();
                }
            }

            $('.facetview_filterchoice').bind('click', clickfilterchoice);
        };


        //function to check if string only contains numbers
        var isNumber = function (string) {
          console.log("isNumber is called"); // I: To check when this function is triggered
            var isnum = /^\d+$/.test(string);
            return isnum;
        };

        // ===============================================
        // functions to do with building results
        // ===============================================

        // read the result object and return useful vals depending on if ES or SOLR
        // returns an object that contains things like ["data"] and ["facets"]
        var parseresults = function (dataobj) {
          console.log("parseresults is called"); // I: To check when this function is triggered
            //console.log(dataobj.results.result);
            var resultobj = new Object();
            resultobj["records"] = new Array();
            resultobj["start"] = "";
            resultobj["found"] = "";

            for (var item in dataobj.results.result) {
                if (item == "@no") {
                    resultobj["records"].push(dataobj.results.result);
                    resultobj["found"] = dataobj.results['@hits'];
                    break;
                }
                resultobj["records"].push(dataobj.results.result[item]);
                resultobj["found"] = dataobj.results['@hits'];
            }
            ;
            if (dataobj.facets) {
                resultobj["facets"] = new Object();
                if (dataobj.facets.facet) {
                    var fname = "";
                    var count = "";
                    var facetsobj = new Object();
                    for (var item in dataobj.facets.facet) {
                        var values = new Object();
                        if (item == "@name")
                            fname = dataobj.facets.facet[item];
                        else if (item == "@count")
                            count = dataobj.facets.facet[item];
                        else if (item == "int") {
                            for (var thing in dataobj.facets.facet[item]) {
                                values[thing] = dataobj.facets.facet[item][thing];
                            }
                            facetsobj[fname] = new Object();
                            facetsobj['name'] = fname;
                            facetsobj[fname] = [count, values];
                        }
                    }
                    resultobj["facets"][0] = facetsobj;
                    options.noffilters = 1;
                }
                else {
                    var n = 0;
                    for (n in dataobj.facets) {
                        var fname = "";
                        var count = "";
                        var facetsobj = new Object();
                        for (var item in dataobj.facets[n]) {
                            var values = new Object();
                            if (item == "@name") {
                                fname = dataobj.facets[n][item];
                                if (fname == "lastmodified" || fname == "size") {
                                    facetsobj[fname] = new Object();
                                    for (var t1 in dataobj.facets[n]['int']) {
                                        var data = new Array();
                                        data[0] = dataobj.facets[n]['int'][t1]['@from'];
                                        data[1] = dataobj.facets[n]['int'][t1]['@to'];
                                        data[2] = dataobj.facets[n]['int'][t1]['#text'];
                                        facetsobj[fname][t1] = data;
                                    }
                                }
                            }
                            else if (item == "@count")
                                count = dataobj.facets[n][item];
                            else if (item == "int") {
                                for (var thing in dataobj.facets[n][item]) {
                                    if (thing == '@name') {
                                        values['0'] = dataobj.facets[n]['int'];
                                        break;
                                    }
                                    values[thing] = dataobj.facets[n][item][thing];
                                }
                                facetsobj[fname] = new Object();
                                facetsobj['name'] = fname;
                                facetsobj[fname] = [count, values];
                            }
                        }
                        resultobj["facets"][n] = facetsobj;
                    }
                    options.noffilters = n;
                }
            }
            return resultobj;
        };

        var facetview_page_increment = function (event, mltPage) {
          console.log("facetview_page_increment is called"); // I: To check when this function is triggered
            event.preventDefault();
            if ($(this).html() != '..') {
                options.paging.from = parseInt($(this).attr('href'));
                mltFlag == true ? domltsearch(mlturl, datacol, options.paging.from) : dosearch();
            }
        };

        // write the metadata to the page
        var putmetadata = function (data) {
          console.log("putmetadata is called"); // I: To check when this function is triggered
            if (typeof(options.paging.from) != 'number') {
                options.paging.from = parseInt(options.paging.from);
            }
            if (typeof(options.paging.size) != 'number') {
                options.paging.size = parseInt(options.paging.size);
            }
            var noOfPages = Math.ceil(data.found / options.paging.size); // I: Total number pages results will get
            var currentPage = Math.ceil(options.paging.from/options.paging.size);
            console.log(data["found"] + "Total results size" + noOfPages); // I: Size of total results for pagination

            var pageMultiple = Math.ceil(currentPage/5); // I: To decide which page numbers to be displayed

            // I: carried out from if(data.found) condition to modify pagination
            var from = options.paging.from;
            var size = options.paging.size;
            !size ? size = 10 : "";
            // I: TO DECIDE HOW PAGINATION SHOULD DISPLAY PAGE NUMBERS
            var pageNo = ((pageMultiple - 1)*5 + 1);

            // metaTmpl staores the pagination elements
            var metaTmpl = ' \
              <div class="pagination_wrapper"> \
                <ul class="pagination" style="float:left;padding:5px;"> \
                  <li class="prev"><a class="facetview_page" href="'+(pageNo == 1 ? 1 : (size*5*(pageMultiple-2)+1))+'">«</a></li> \
              ';
              // I: LOOP TO HAVE NUMBER OF PAGES IN PAGINATION
              for(var i = 0; i < 5 && pageNo <= noOfPages; i++, pageNo++){
                  var targetLink = ((pageNo - 1)*size)+1;
                  targetLink < 0 ? targetLink = 1 : false;
                  metaTmpl = metaTmpl + '<li><a class="facetview_page activeLink" href="'+ targetLink +'">'+ pageNo +'</a></li>'; //I: ADDED CLASS ACTIVELINK TO HIGHLIGHT ACTIVE PAGE
              }
              metaTmpl = metaTmpl + '<li class="next"><a class="facetview_page" href="'+ (pageNo > noOfPages ? (((pageNo - 2)*size)+1) : (size*5*pageMultiple+1)) +'">»</a></li> \
                        </ul> \
                      </div> \
                    ';
            //I: TO SHOW NO RESULTS ARE FOUND FOR THE SEARCH QUERY
            $('#facetview_metadata').html("Your search for<b> " + options.query + " </b>did not match any documents..." +
                "<br/><br/>" +
                "* Suggestions: Make sure all words are spelled correctly.</br>" +
                "* Use similar words or synonyms.</br>" +
                "* Try more general keywords.");

            if (data.found) {
                var meta = metaTmpl;
                $('#facetview_metadata').html("").append(meta);
                $('#pagination-on-top').html("").append(meta);
                $('.facetview_page').bind('click', facetview_page_increment);
            }

        };

        var canplay = function (ext) {
          console.log("canplay is called"); // I: To check when this function is triggered
            var canPlay = false;
            var v = document.createElement('video');
            if (v.canPlayType && v.canPlayType('video/' + ext).replace(/no/, '')) {
                canPlay = true;
            }
            return canPlay;
        };

        var _uid = "";
        // given a result record, build how it should look on the page
        var buildrecord = function (index) {
          console.log("buildrecord is called"); // I: To check when this function is triggered
            resulted.push(options.data['records'][index]);
            var record = options.data['records'][index];
            result = '<tr><td id="' + record['@id'] + '"> <div class="row-fluid col-sm-12"> <div class="row">'; //I: Added div tag for proper alignment
            var context_flag = false;
            // add first image where available
            if (options.display_images) {
                var recstr = JSON.stringify(record['url']);
                var colid = record['col'];
                var colid = record['col'];
                recstr = recstr.substring(1, recstr.length - 1);
                recstrf = recstr.substring(1, recstr.length);
                var t = recstr.substring(recstr.lastIndexOf('.') + 1).toLowerCase();
                if (recstr.startsWith('http') || recstr.startsWith('https')) {
                    if (t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
                        var img = new Array();
                        img[0] = recstr;
                        var isFile = false;
                    }
                    if (t == "mpeg" || t == "mp4" || t == "flv" || t == "mpg") {
                        var play = canplay(t);
                        var img = new Array();
                        img[1] = recstr;
                        var isFile = false;
                    }
                } else if (recstr.startsWith('/') || recstrf.startsWith(':')) {
                    if (t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
                        var img = new Array();
                        img[0] = recstr;
                        var isFile = true;
                    }
                    if (t == "mpeg" || t == "mp4" || t == "flv" || t == "mpg") {
                        var play = canplay(t);
                        var img = new Array();
                        img[1] = recstr;
                        var isFile = true;
                    }
                }

                var recstri = JSON.stringify(record['_autocomplete']);
                var regexi = /(http:\/\/\S+?\.(jpg|png|gif|jpeg))/;
                var imgi = regexi.exec(recstri);

            }

            // add the record based on display template if available
            var display = options.result_display;
            var lines = '';
            for (var lineitem in display) {
                line = "";
                for (object in display[lineitem]) {
                    var thekey = display[lineitem][object]['field'];
                    if (thekey == 'description' && context_flag == true)continue;
                    //-------------------------------------------------------------
                    if (thekey == 'image') {
                        if (!isFile) {

                            if (img) {
                                if (img[0] != null)
                                    lines += '<a href="' + img[0] + '" rel="prettyPhoto"> <img class="thumbnail" style="float:left; width:100px; margin:0 5px 10px 0; max-height:150px;" src="' + img[0] + '" /> </a>';
                                else {
                                    if (play)
                                        lines += '<video thumbid="_video" width="100" height="100" poster ="images/play.jpg" src="' + img[1] + '"/>';
                                    else
                                        lines += '<a href="' + img[1] + '"><img src="images/play.jpg"/></a>';
                                }

                            }
                        }
                        else {
                            if (img) {
                                if (img[0] != null)
                                    lines += '<a href="'+ rootUrl +'/searchblox/servlet/FileServlet?url=' + encodeURIComponent(img[0]) + '&col=' + colid + '" rel="prettyPhoto"> <img class="thumbnail" style="float:left; width:100px; margin:0 5px 10px 0; max-height:150px;" src="'+ rootUrl +'/searchblox/servlet/FileServlet?url=' + encodeURIComponent(img[0]) + '&col=' + colid + '" /> </a>';  // I: Added rootUrl
                                else {
                                    if (play)
                                        lines += '<video thumbid="_video" width="100" height="100" poster ="images/play.jpg" src="'+ rootUrl +'/searchblox/servlet/FileServlet?url=' + encodeURIComponent(img[1]) + '&col=' + colid + '"/>'   // I: Added rootUrl
                                    else
                                        lines += '<a href="'+ rootUrl +'/searchblox/servlet/FileServlet?url=' + encodeURIComponent(img[1]) + '&col=' + colid + '"> <img src="images/play.jpg"/></a>'  // I: Added rootUrl
                                }
                            }
                        }

                        if (imgi && !img) {
                            var width = "width:100px;";
                            if (record['contenttype'] == 'tweet') width = "";
                            var imgistack = new Array();
                            for (var tempi in imgi)
                                if (imgi[tempi].toString().startsWith('http'))
                                    if (imgi[tempi].match(/jpeg$/) != null || imgi[tempi].match(/gif$/) != null || imgi[tempi].match(/png$/) != null || imgi[tempi].match(/jpg$/) != null) {
                                        if (imgistack.indexOf(imgi[tempi].toString()) == -1) {
                                            imgistack.push(imgi[tempi].toString());
                                            lines += '<a href="' + imgi[tempi] + '" rel="prettyPhoto"> <img class="thumbnail" style="float:left; ' + width + ' margin:0 5px 10px 0; max-height:150px;" src="' + imgi[tempi] + '" /></a>'
                                        }
                                    }
                        }
                        continue;
                    }
                    //--------------------------------------------
                    parts = thekey.split('.');
                    // TODO: this should perhaps recurse..
                    if (parts.length == 1) {
                        var res = record;
                    } else if (parts.length == 2) {
                        var res = record[parts[0]];
                    } else if (parts.length == 3) {
                        var res = record[parts[0]][parts[1]];
                    }
                    var counter = parts.length - 1;
                    if (res && res.constructor.toString().indexOf("Array") == -1) {
                        var thevalue = res[parts[counter]];
                        if (parts == 'uid')_uid = thevalue;
                        if (parts == 'title' && JSON.stringify(thevalue).trim() == '[]')thevalue = _uid;
                        if (parts == 'lastmodified') {
                            thevalue = thevalue.substring(0, thevalue.length-7);
                            thevalue = moment(thevalue).format("MMM DD, YYYY");
                        }
                        if(parts == "size"){
                          var kb = 1024;
                          var mb = 1024*1024;
                          var gb = 1024*1024*1024;
                          if(thevalue < mb){
                            thevalue = parseFloat(thevalue/kb).toFixed(2) + "Kb";
                          }
                          else if(thevalue > mb && thevalue < gb){
                            thevalue = parseFloat(thevalue/mb).toFixed(2) + "Mb";
                          }
                          else if(thevalue > gb){
                            thevalue = parseFloat(thevalue/gb).toFixed(2) + "Gb";
                          }
                        }
                        if (parts == 'context,text') {
                            context_flag = true;
                            var thevalue1 = " ";
                            var b = JSON.stringify(record['context']['highlight']);
                            if (typeof b != 'undefined' && b.split(',').length == 1) {
                                if (thevalue != undefined)
                                    thevalue1 = thevalue1 + (thevalue[0] == undefined ? "" : thevalue[0]) + "<B>" + record['context']['highlight'] + "</B>" + (thevalue == undefined ? "" : thevalue);
                                else
                                    thevalue1 = thevalue1 + "<B>" + record['context']['highlight'] + "</B>";
                            }
                            else
                                for (var a = 0, b = 0; a < thevalue.length; a++) {
                                    if (thevalue[a + 1] != undefined && thevalue[a + 1] == "...") thevalue1 = thevalue1 + thevalue[a];
                                    else if (thevalue[a] == "...") thevalue1 = thevalue1 + thevalue[a];
                                    else if (record['context']['highlight'][b]) {
                                        thevalue1 = thevalue1 + thevalue[a] + "<B>" + record['context']['highlight'][b] + "</B>";
                                        b++;
                                    }
                                }
                            thevalue = thevalue1;
                        }
                    } else {
                        var thevalue = [];
                        for (var row in res) {
                            thevalue.push(res[row][parts[counter]])
                        }
                    }

                    if (thevalue && thevalue.length) {
                        display[lineitem][object]['pre']
                            ? line += display[lineitem][object]['pre'] : false;
                        if (typeof(thevalue) == 'object') {
                            for (var val in thevalue) {
                                val != 0 ? line += ', ' : false;
                                line += thevalue[val];
                            }
                        } else {
                            line += thevalue;
                        }
                        display[lineitem][object]['post']
                            ? line += display[lineitem][object]['post'] : line += '';
                    }
                }

                if (line) {
                    lines += line.replace(/^\s/, '').replace(/\s$/, '').replace(/\,$/, '');
                }
            }

            lines ? result += lines : result += JSON.stringify(record, "", "    ");
            // result +='<div><a class="" style="cursor:pointer" data-col="'+record['col']+'" rel="'+record['@id']+'">More Like This</a></div>';
            result += '</td></tr>';
            return result;
        };

        close_ads = function() {
          console.log("close_ads is called"); // I: To check when this function is triggered
            jQuery("#ads").remove();
        }

        // put the results on the page
        showresults = function (sdata) {
          console.log("showresults is called"); // I: To check when this function is triggered

          $('#facetview_rightcol > h3').html("Search Results for " + options.query); // I: ADDED TO DISPLAY QUERY SEARCHED

            addMultipleCollectionCheckboxes(sdata);

            var data = parseresults(sdata);
            options.data = data;
            //show suggestion if available
            var suggest = sdata["results"]['@suggest'];
            var suggestexist = false;
            var temp = "";
            console.log(suggest);
            if (typeof suggest != "undefined") {
                if(suggest.trim() != '') {
                    suggestexist = true;
                    temp += "<table class='table table-condensed'><tbody>";
                    // temp += "<tr><td><i><small><b>Did you mean : <a href='/searchblox/plugin/index.html?query=" + suggest.trim() + "'>" + suggest.trim() + "</a> ?</b></small></i></td></tr>";      I: MAKING CHANGES AS BELOW
                    temp += "<tr><td><i><small><b>Did you mean : <a href='"+window.location.href+"?query=" + suggest.trim() + "'>" + suggest.trim() + "</a> ?</b></small></i></td></tr>";
                    temp += "</tbody></table>";
                }
                else {
                    suggestexist = false;
                }
            }
            if (suggestexist) {
                $('#suggest').html(temp);
            }
            else {
                $('#suggest').html('');
            }


            //show ads if available
            var adsexist = false;
            if (sdata["ads"]) {
                var temp = "<br/ >";
                for (temp1 in sdata["ads"]) {
                    temp += "<div class='message alert'>";
                    temp += "<a class='close-message' onclick='close_ads()' href='javascript:void(0)''>×</a>"
                    temp += "<i><small>Results from Ads</small></i><hr/>";
                    adsexist = true;
                    var ads_graphic_url = sdata["ads"][temp1]['@graphic_url'];
                    temp += "<a href=\"" + sdata["ads"][temp1]['@url'] + "\"  target='_blank'><b>" + sdata["ads"][temp1]['@title'] + "</b></a><br>";
                    if (ads_graphic_url != '') {
                        temp += '<a href="' + sdata["ads"][temp1]['@graphic_url'] + '" rel="prettyPhoto"> <img class="thumbnail" style="width:100px; margin:0 5px 10px 0; max-height:150px;" src="' + sdata["ads"][temp1]['@graphic_url'] + '" /> </a>';
                    } else {
                        temp += sdata["ads"][temp1]['@description'];
                        temp += "<br />";
                    }
                    var tempurl = sdata["ads"][temp1]['@url'];
                    var t = tempurl.substring(tempurl.lastIndexOf('.') + 1).toLowerCase();
                    if (t == "jpg" || t == "jpeg" || t == "png" || t == "gif" || t == "bmp") {
                        temp += '<a href="' + sdata["ads"][temp1]['@url'] + '" rel="prettyPhoto"> <img class="thumbnail" style="width:100px; margin:0 5px 10px 0; max-height:150px;" src="' + sdata["ads"][temp1]['@url'] + '" /> </a>';
                    }
                    temp += '<i class="_searchresult_url">' + sdata["ads"][temp1]['@url'] + '</i>';
                    temp += '</div>';
                }
                if (adsexist)
                    $('#ads').html(temp);
                else
                    $('#ads').html('');
            }

            if (data["facets"])
                putvalsinfilters(data);
            // put result metadata on the page
            putmetadata(data);
            // put the filtered results on the page
            $('#facetview_results').html("");
            var infofiltervals = new Array();
            $.each(data.records, function (index, value) {
                // write them out to the results div
                $('#facetview_results').append(buildrecord(index));
                $('#facetview_results tr:last-child').linkify()
            });

            fixadvfiltercount();
            if (options.data['found'] && first == true) {
                $('#sort_btn_aligner').show('slow');
                $('#facetview_leftcol').show('slow');
                $('#facetview_rightcol > h3').show('slow');
                $('#facetview-searchbar').attr('style', 'margin-bottom:10px;');
                $('.header').attr('style', 'padding:5px;margin-top:15px;');
                first = false;
                showfiltervalsinit();
            }

            $('[id=searchresult]').each(function () {
                if ($(this).attr('href').startsWith('db')) {
                    var temp = options.search_url.split('servlet')[0] + 'servlet/DBServlet?col=' + $(this).attr('collectionno') + '&id=' + $(this).attr('uid');
                    $(this).attr('href', temp);
                }
                else if (typeof $(this).attr('old_uid') != 'undefined' && $(this).attr('old_uid').split(':')[0] == 'file') {
                    var temp = options.search_url.split('servlet')[0] + 'servlet/FileServlet?url=' + encodeURIComponent($(this).attr('href')) + '&col=' + $(this).attr('collectionno');
                    if ($(this).attr('href').startsWith('http')) {
                        $(this).parent().parent().parent().parent().children().find('._searchresult_url').html($(this).attr('href'));
                    }
                    if (!$(this).attr('href').startsWith('http')) {
                        $(this).attr('href', temp);
                    }

                }
                else if ($(this).attr('href').split(':')[0] == 'eml') {
                    var temp = options.search_url.split('servlet')[0] + 'servlet/EmailViewer?url=' + $(this).attr('uid') + '&col=' + $(this).attr('collectionno');
                    $(this).attr('href', temp);
                }
            });

            //update total number of results
            if (options.data['found']) {
                $('#nofresults').html(options.data['found'] + " results found");
                $('#sort_btn_aligner').show();
                $('#facetview_leftcol_percolator').show();
                $('#facetview_rightcol > h3').show('slow');
            }
            else {
                $('#nofresults').html("0 results found");
                $('#sort_btn_aligner').hide();
            }

            $('[thumbid=_video]').each(function () {
                $(this).bind('click', function () {
                    $(this).attr('controls', '');
                    $(this).attr('height', '240');
                    $(this).attr('width', '320');
                    $(this).attr('poster', '');
                })
            });

            $('a[rel^="prettyPhoto"]').prettyPhoto();
            $('[id=searchresult]').each(function () {
                $(this).bind('click', function () {
                    var clickedcol = $(this).attr('collectionno');
                    var clickeduid = $(this).attr('uid');
                    var clickedtitle = $(this).children().html();
                    var clickedurl = escape($(this).attr('href'));
                    $.ajax({
                        type: "get",
                        url: rootUrl + "/searchblox/servlet/ReportServlet", // I: Added rootUrl
                        dataType: "jsonp",  //I: Added jsonp for CORS
                        data: "addclick=yes&col=" + clickedcol + "&uid=" + clickeduid + "&title=" + clickedtitle + "&url=" + clickedurl + "&query=" + escape(options.query)
                    });
                });
            });

            $('[id=topclickedresult]').each(function () {
                $(this).bind('click', function () {
                    var clickedcol = $(this).attr('collectionno');
                    var clickeduid = $(this).attr('uid');
                    var clickedtitle = $(this).children().html();
                    var clickedurl = $(this).attr('href');
                    $.ajax({
                        type: "get",
                        url: rootUrl + "/searchblox/servlet/ReportServlet", // I: Added rootUrl
                        dataType: "jsonp",  //I: Added jsonp fpr CORS
                        data: "addclick=yes&col=" + clickedcol + "&uid=" + clickeduid + "&title=" + clickedtitle + "&url=" + clickedurl + "&query=" + escape(options.query)
                    });
                });
            });
            //test percolator
            {
                $('#facetview_leftcol_percolator > a[id=create_alert]').bind('click', function () {
                    bootalert("Register Alert", "", "btn-primary");
                })
            }

            $('.mlt').click(function () {   //I: DONE MODIFICATIONS TO FIX THE ISSUE WITH OLD MLT SEARCH
                mlturl = $(this).attr('rel');
                datacol = $(this).attr('data-col');
                mltFlag = true;
                //dosearch();
                console.log("mlt"+datacol);
                domltsearch(mlturl,datacol, 1);
            });

        };

        // ===============================================
        // functions to do with searching
        // ===============================================

        //add default params to query
        var adddefaultparams = function (a) {
          console.log("adddefaultparams is called"); // I: To check when this function is triggered
            var b = "";
            for (each in options.default_url_params) {
                b = b + "&" + each + "=" + options.default_url_params[each];
            }
            for (each in options.facets) {
                b = b + "&facet.field=" + options.facets[each]['field'];
                if (options.facets[each]['interval'] != undefined && options.facets[each]['interval'].trim() != "") {
                    b += "&f." + options.facets[each]['field'] + ".interval=" + options.facets[each]['interval']
                }
            }
            return (a + b);
        };

        // add extra filters to query
        var appendextrafilterstoquery = function (a) {
          console.log("appendextrafilterstoquery is called"); // I: To check when this function is triggered
            var b = "";
            for (each in options.filter) {
                if (options.filter[each].split(',').length > 1) {
                    var c = options.filter[each].split(':')[1].split(',');
                    for (var d = 0; d < c.length; d++) {
                        b = b + "&filter=" + options.filter[each].split(':')[0] + ":" + c[d];
                    }
                }
                else {
                    b = b + "&filter=" + options.filter[each];
                }
            }
            return (a + b);
        };

        var addfiltervalues = function (a) {
          console.log("addfiltervalues is called"); // I: To check when this function is triggered
            var b = "";
            for (var i = 0; i < filterq.length; i++) {
                b = b + filterq[i];
            }
            return (a + b);
        };

        var addsizevalues = function (a) {
          console.log("addsizevalues is called"); // I: To check when this function is triggered
            var b = "";
            for (var i in sizeq) {
                for (j in options['facets'])
                    if (options['facets'][j]['field'] == i)
                        b = b + '&f.' + i + '.size=' + options['facets'][j]['size'];
            }
            return (a + b);
        };

        var adddefaultdatefacet = function (q) {
          console.log("adddefaultdatefacet is called"); // I: To check when this function is triggered
            var b = '&facet.field=lastmodified&f.lastmodified.range=[' + moment().subtract("days", 1).format("YYYY-MM-DD") + 'TO*]&f.lastmodified.range=[' + moment().subtract('days', 7).format("YYYY-MM-DD") + 'TO*]&f.lastmodified.range=[' + moment().subtract('months', 1).format("YYYY-MM-DD") + 'TO*]&f.lastmodified.range=[' + moment().subtract('years', 1).format("YYYY-MM-DD") + 'TO*]';
            return (q + b);
        };

        var adddefaultsizefacet = function (q) {
          console.log("adddefaultsizefacet is called"); // I: To check when this function is triggered
            var b = '&facet.field=size&f.size.range=[*TO102400]&f.size.range=[102400TO512000]&f.size.range=[512000TO1048576]&f.size.range=[1048576TO10485760]&f.size.range=[10485760TO*]';
            return (q + b);
        };


        var trim = function (s) {
          console.log("trim is called"); // I: To check when this function is triggered
            var a = s.replace(" ", "");
            return (a);
        };

        var contains = function (a, e) {
          console.log("contains is called"); // I: To check when this function is triggered
            for (var i = 0; i < a.length; i++) {
                if (a[i] == e) {
                    return true;
                }
            }
            return false;
        };

        var z = new Array();
        // execute a search
        var oldquery = "";
        var oldsearchquery = "";

        var percolate = function (name, email, frequency, nodocs) {
          console.log("percolate is called"); // I: To check when this function is triggered
            $.ajax({
                type: "get",
                url: options.search_url,
                dataType: "jsonp",    // I: Added json p for CORS
                data: q + "&percolatoremail=" + email + "&percolatorqueryname=" + name + "&percolatorqueryfreq=" + frequency + "&percolatorquerynodocs=" + nodocs,
                success: function (data) {
                }
            });
        };

        var bootalert = function (heading, msg, btnClass) {
          console.log("bootalert is called"); // I: To check when this function is triggered

            var fadeClass = "fade";
            {
                var isIE = window.ActiveXObject || "ActiveXObject" in window;
                if (isIE) {
                    fadeClass = "";
                }
            }

            $("#dataAlertModal .modal-footer button").removeClass().addClass("btn").addClass(btnClass);
            if (!$('#dataAlertModal').length) {
                $('body').append('\
                  <div id="dataAlertModal" class="modal ' + fadeClass + '" role="dialog" aria-labelledby="dataAlertLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content">\
                  	<div class="modal-header">\
                  		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
                  		<h3 id="dataAlertLabel">\
                  			Notification\
                  		</h3>\
                  	</div>\
                  	<div class="modal-body">\
                  		<div class="form-horizontal">\
                  			<div class="form-group">\
                  				<label class="control-label col-sm-2">Query:</label>\
                  				<div class="controls col-sm-10">\
                  					<input type="text" id="_percolator-queryorg" value="' + options.query + '" disabled class="form-control">\
                  				</div>\
                  			</div>\
                  			<div class="form-group">\
                  				<label class="control-label col-sm-2">Name:</label>\
                  				<div class="controls col-sm-10">\
                  					<input type="text" id="_percolator-name" class="form-control">\
                  				</div>\
                  			</div>\
                  			<div class="form-group">\
                  				<label class="control-label col-sm-2">Email:</label>\
                  				<div class="controls col-sm-10">\
                  					<input type="text" id="_percolator-email" class="form-control">\
                  				</div>\
                  			</div>\
                  			<div class="form-group">\
                  				<label class="control-label col-sm-2">Frequency:</label>\
                  				<div class="controls col-sm-10">\
                  					<select id="_percolator-frequency" class="form-control">\
                  						<option>EACH</option>\
                  						<option>DAILY</option>\
                  						<option>WEEKLY</option>\
                  						<option>MONTHLY</option>\
                  					</select>\
                  				</div>\
                  			</div>\
                  			<div class="form-group" style="display:none">\
                  				<label class="control-label col-sm-2">Docs per mail:</label>\
                  				<div class="controls col-sm-10">\
                  					<select id="_percolator-docspermail" class="form-control">\
                  						<option>10</option>\
                  						<option>25</option>\
                  						<option>50</option>\
                  						<option>100</option>\
                  					</select>\
                  				</div>\
                  			</div>\
                  		</div>\
                  	</div>\
                  	<div class="modal-footer">\
                  		<button class="btn ' + btnClass + '" data-dismiss="modal" aria-hidden="true" id="dataAlertTempOK" style="display:none;">Ok</button>\
                  		<button class="btn ' + btnClass + '" id="dataAlertOK">Ok</button>\
                  	</div>\
                  </div></div></div>');
            }
            $('#_percolator-queryorg').val(options.query);
            $('#dataAlertModal #dataAlertLabel').text(heading);
            $('#dataAlertModal').modal({
                show: true
            });
            $('#dataAlertOK').click(function () {
                percolate($('#_percolator-name').val(), $('#_percolator-email').val(), $('#_percolator-frequency').children("option").filter(":selected").val(), $('#_percolator-docspermail').children("option").filter(":selected").val());
                $('#dataAlertTempOK').trigger('click');
            });
        };

        var dosearch = function () {
          console.log("dosearch is called"); // I: To check when this function is triggered
            // update the options with the latest query value from query box
            options.query = $('#facetview_freetext').val().trim();
            mltFlag = false;
            if (autosuggestflag) {
              console.log("dosearch");
                var autocompletion = "/searchblox/servlet/AutoSuggest";
                var pathname = window.location.pathname;
                if (pathname.indexOf("/secure/") > -1) {
                    autocompletion = "../../servlet/AutoSuggest";
                }
                $.ajax({
                    type: "post",
                    url: rootUrl + autocompletion, // I: Added rootUrl
                    crossDomain: true,
                    dataType: "json", // I: Added jsonp for cross origin requests
                    data: "q=" + options.query + "&limit=" + options.nofsuggest,
                    success: function (data) {
                        var temp = new Array();
                        for (var i in data[0]) {
                            temp.push(data[0][i]);
                        }
                        console.log("Autosuggest is called and printed"); // I: Tocheck if autosuggest is wroking
                        if (temp.length >= 1) {
                            z = temp;
                            $('#facetview_freetext').autocomplete({
                                source: z
                            });
                        }
                    }

                });

                // I: AUTOMCOMPLETE TO WORK FROM DIFFERENT DIRECTORIES - NEEDS JSON OBKECT IN RESPONSE
                /*$.getJSON(rootUrl + autocompletion, "callback=?&q=" + options.query + "&limit=" + options.nofsuggest, function (data) {
                  console.log("Autosuggest is called and printed xxxxxxxxxxxxxxxxxxx");
                    var temp = new Array();
                    for (var i in data[0]) {
                        temp.push(data[0][i]);
                    }
                    console.log("Autosuggest is called and printed"); // I: Tocheck if autosuggest is wroking
                    if (temp.length >= 1) {
                        z = temp;
                        $('#facetview_freetext').autocomplete({
                            source: z
                        });
                    }
                });*/
            }
            else {
                $('#facetview_freetext').autocomplete("destroy");
            }


            //refresh query
            q = " ";
            // make the search query
            q = "query=" + escape(encodeURIComponent(options.query));
            // add default params
            q = adddefaultparams(q);
            // add facet filter values to query
            q = appendfilterstoquery(q);
            // add extra filters to query
            q = appendextrafilterstoquery(q);
            // add size values of filter
            q = addsizevalues(q);
            //update sort and direction variables
            q += sortq;
            q += direction;
            // update start page variable on new query
            if (oldsearchquery != encodeURIComponent(options.query).trim())
                options.paging.from = 1; //I: Changed values from 0 to 1
            // update the page variable
            var d = parseInt(options.paging.from) == 0 ? d = 1 : d = (parseInt(options.paging.from) / parseInt(options.paging.size)) + 1;
            q = q + "&page=" + parseInt(d);
            // update the pagesize in query
            q = q + "&pagesize=" + options.paging.size;
            //update with the daterange variables
            q += startdate;
            //addsizefacetsilent
            q += sizefilter;

            /*if(mltFlag == true){
              q += "&mlt_col=" + datacol + "&mlt_id=" + mlturl;
            }*/

            q = addMultipleCollectionsQuery(q); // I: ADDING MULTIPLE COLLECTIONS TO QUERY
            if (q.trim() == oldquery.trim()) {
                return;
            }
            oldquery = q.trim();
            oldsearchquery = encodeURIComponent(options.query).trim();

            //addlastmodifiedfacetsilent
            q = adddefaultdatefacet(q);

            if ($('#facetview_freetext').val().trim() != "") {
                displayloader();
                $.getJSON(options.search_url, "callback=?&" + q,
                    function (data) {
                      console.log("getJSON in dosearch is called"); // I: To check when this function is triggered
                        createCookie("searchblox_plugin_query", q, 0);
                        if (data["error"] != undefined) {
                          console.log("if condition in dosearch is called"); // I: To check when this function is triggered
                            $('#ads').html('<div class="alert alert-danger">' +
                                '<div class="content" style="color:red;font-weight:bold;text-align:center;letter-spacing:1px;">' +
                                data["error"] +
                                '</div></div>');
                            $('#ads').parent().parent().css("margin-left", "-100px");
                            $('#ads').parent().parent().css("float", "left");
                            hideloader();
                            return;
                        }

                        $('#ads').html('');
                        $('#ads').parent().parent().css("margin-left", "");
                        $('#ads').parent().parent().css("float", "");
                        showresults(data);
                        options.paging.from != 1 ? $(".activeLink[href="+(options.paging.from)+"] ").css({"background-color": "#609ed4", "color" : "white"}) : $(".activeLink[href="+(options.paging.from)+"] ").css({"background-color":"#609ed4","color":"white"}); //I: MAKING THE ACTIVE PAGE HIGHLIGHTED
                        hideloader();
                    });
            }
        };

        // I: FUNCTION TO ADD MULTIPLE COLLECTIONS TO QUERY
        var addMultipleCollectionsQuery = function(q){
          console.log("addMultipleCollectionsQuery is called"); //I: To check if addMultipleCollections is called
          $("[name=colChecks]").each(function(){
            console.log($(this).attr("data-colname"));
            ($(this).attr("data-checked") == "true") ? (q += "&cname=" + $(this).attr("data-colname")) : "";
          });
          return q;
        }

        // I: FUNCTION TO ADD CHECK BOXES FOR SELECTING MULTIPLE COLLECTIONS
        var addMultipleCollectionCheckboxes = function(data){
          var collections = data["searchform"]["collections"];
          var checkboxes = "";
          var checked = "";
          for(colname in collections){
            (collections[colname]["@checked"] == "true") ? (checked = "checked='checked'") : (checked = "");
            checkboxes += '<label class=""><input type="checkbox" class="mgc mgc-primary mgc-sm colChecks" data-checked="'+collections[colname]["@checked"]+'" '+checked+' name="colChecks" data-colname="'+collections[colname]["@name"]+'">'+ collections[colname]["@name"] +'</label>';
          }
          document.getElementById("searchMultiple").innerHTML = checkboxes;
          $(".colChecks").bind("click", function(){
            ($(this).attr("data-checked") == "true") ? $(this).attr("data-checked", "false") : $(this).attr("data-checked", "true");
            dosearch();
          });

        }

        var domltsearch = function (url,col, pagehref) {
          console.log("domltsearch is called"); // I: To check when this function is triggered
            // update the options with the latest query value from query box
            options.query = $('#facetview_freetext').val().trim();
            var size = parseInt(options.paging.size);

            //refresh query
            q = " ";
            // make the search query
            q = "mlt_col=" + col;
            q += "&mlt_id=" + url;
            q += "&XPC=" + parseInt((pagehref-1)/size + 1);

            // add default params
            //  q = adddefaultparams(q);
            // // add facet filter values to query
            // q = appendfilterstoquery(q);
            // // add extra filters to query
            // q = appendextrafilterstoquery(q);
            // // add size values of filter
            //    q = addsizevalues(q);
            // //update sort and direction variables
            // q += sortq;
            // q += direction;
            // update start page variable on new query
            // if (oldsearchquery != encodeURIComponent(options.query).trim())
            //     options.paging.from = 0;
            // // update the page variable
            // var d = parseInt(options.paging.from) == 0 ? d = 1 : d = (parseInt(options.paging.from) / parseInt(options.paging.size)) + 1;
            // q = q + "&page=" + parseInt(d);
            // // update the pagesize in query
            // q = q + "&pagesize=" + options.paging.size;
            // //update with the daterange variables
            // q += startdate;
            // //addsizefacetsilent
            // q += sizefilter;

            // if (q.trim() == oldquery.trim()) {
            //     return;
            // }
            // oldquery = q.trim();
            // oldsearchquery = encodeURIComponent(options.query).trim();

            // //addlastmodifiedfacetsilent
            // q = adddefaultdatefacet(q);
            if ($('#facetview_freetext').val().trim() != "") {
                displayloader();
                $.getJSON(options.search_url,"callback=?&xsl=json&" + q,
                    function (data) {
                      console.log("data loaded for mlt");
                        createCookie("searchblox_plugin_query", q, 0);
                        if (data["error"] != undefined) {
                            $('#ads').html('<div class="alert alert-danger">' +
                                '<div class="content" style="color:red;font-weight:bold;text-align:center;letter-spacing:1px;">' +
                                data["error"] +
                                '</div></div>');
                            $('#ads').parent().parent().css("margin-left", "-100px");
                            $('#ads').parent().parent().css("float", "left");
                            hideloader();
                            return;
                        }

                        $('#ads').html('');
                        $('#ads').parent().parent().css("margin-left", "");
                        $('#ads').parent().parent().css("float", "");
                        showresults(data);
                        options.paging.from != 1 ? $(".activeLink[href="+(options.paging.from)+"] ").css({"background-color": "#609ed4", "color" : "white"}) : $(".activeLink[href="+(options.paging.from)+"] ").css({"background-color":"#609ed4","color":"white"}); //I: MAKING THE ACTIVE PAGE HIGHLIGHTED
                        hideloader();
                    });
            }
        };


        // trigger a search when a filter choice is clicked
        var clickfilterchoice = function (event) {
          console.log("clickfilterchoice is called"); // I: To check when this function is triggered
            event.preventDefault();
            //alert($(this).attr('id'));
            var filtername = splitStringfromFirst($(this).attr('id'), '_')[1];
            filtername = filtername.replace(/%%%/g, '____');
            var newobj = '<div class="facetview_filterselected facetview_clear ' +
                '"rel="' + $(this).attr("rel") +
                '" alt="remove" title="remove"' +
                ' href="' + $(this).attr("href") + '" filtername=' + filtername + ' >' +
                $(this).html().replace(/\([\d]+\)$/, '') + ' <span class="remove">×</span></div>'; // I: changed regular expression to remove only (digits)
            if ($('#facetview_selectedfilters').find('div[rel="' + $(this).attr("rel") + '"][filtername="' + filtername + '"]').attr('filtername') == undefined) {
                filterclick($(this).attr("rel"), filtername.replace(/____/g, ' '));
                $('#facetview_selectedfilters').append(newobj);
                $('.facetview_filterselected').unbind('click', clearfilter);
                $('.facetview_filterselected').bind('click', clearfilter);
                options.paging.from = 1; //I: Changed values from 0 to 1
                dosearch();
            }
            else {
                alert("Filter:" + $('#facetview_selectedfilters').find('div[rel="' + $(this).attr("rel") + '"][filtername="' + filtername + '"]').attr('filtername').replace(/____/g, ' ') + " already exist!!");
            }
        };

        var splitStringfromFirst = function (str, splitter) {
          console.log("splitStringfromFirst is called"); // I: To check when this function is triggered
            var d = str.indexOf(splitter);
            if (0 > d)return str;
            else {
                return [str.substr(0, d), str.substr(d + splitter.length)];
            }
        };

        // clear a filter when clear button is pressed, and re-do the search
        var clearfilter = function (event) {
          console.log("clearfilter is called"); // I: To check when this function is triggered
            event.preventDefault();
            removefilterquery($(this).attr('rel'), escape($(this).attr('filtername').replace(/____/g, ' ')));
            $(this).remove();
            dosearch();
        };

        // do search options
        var fixmatch = function (event) {
          console.log("fixmatch is called"); // I: To check when this function is triggered
            event.preventDefault();
            if ($(this).attr('id') == "facetview_partial_match") {
                var newvals = [];
                newvals = $('#facetview_freetext').val().replace(/"/gi, '').replace(/\*/gi, '').replace(/\~/gi, '').split(' ');
                var newstring = "";
                for(i=0; i<newvals.length; i++) {
                    var newvalsTemp2 = newvals[i];
                    if (newvalsTemp2.length > 0 && newvals[i] != ' ') {
                        if (newvals[i] == 'OR' || newvals[i] == 'AND') {
                            newstring += newvals[i] + ' ';
                        } else {
                            newstring += '*' + newvals[i] + '* ';
                        }
                    }
                }
                $('#facetview_freetext').val(newstring);
            } else if ($(this).attr('id') == "facetview_fuzzy_match") {
                var newvals = [];
                newvals =$('#facetview_freetext').val().replace(/"/gi, '').replace(/\*/gi, '').replace(/\~/gi, '').split(' ');
                var newstring = "";
                for(i=0; i<newvals.length; i++) {
                    var newvalsTemp = newvals[i];
                    if (newvalsTemp.length > 0 && newvals[i] != ' ') {
                        if (newvals[i] == 'OR' || newvals[i] == 'AND') {
                            newstring += newvals[i] + ' ';
                        } else {
                            newstring += newvals[i] + '~ ';
                        }
                    }
                }
                $('#facetview_freetext').val(newstring);
            } else if ($(this).attr('id') == "facetview_exact_match") {
                var newvals = [];
                newvals = $('#facetview_freetext').val().replace(/"/gi, '').replace(/\*/gi, '').replace(/\~/gi, '').split(' ');
                var newstring = "";
                for(i=0; i<newvals.length; i++) {
                    var newvalsTemp1 = newvals[i];
                    if (newvalsTemp1.length > 0 && newvals[i] != ' ') {
                        if (newvals[i] == 'OR' || newvals[i] == 'AND') {
                            newstring += newvals[i] + ' ';
                        } else {
                            newstring += '' + newvals[i] + ' ';
                        }
                    }
                }
                $.trim(newstring, ' ');
                $('#facetview_freetext').val("\"" + newstring + "\"");
            } else if ($(this).attr('id') == "facetview_match_all") {
                $('#facetview_freetext').val($.trim($('#facetview_freetext').val().replace(/ OR /gi, ' ')));
                $('#facetview_freetext').val($('#facetview_freetext').val().replace(/ /gi, ' AND '));
            } else if ($(this).attr('id') == "facetview_match_any") {
                $('#facetview_freetext').val($.trim($('#facetview_freetext').val().replace(/ AND /gi, ' ')));
                $('#facetview_freetext').val($('#facetview_freetext').val().replace(/ /gi, ' OR '));
            }
            $('#facetview_freetext').focus().trigger('keyup');
        };


        // adjust how many results are shown
        var howmany = function (event) {
          console.log("howmany is called"); // I: To check when this function is triggered
            event.preventDefault()
            var newhowmany = prompt('Currently displaying ' + options.paging.size +
                ' results per page. How many would you like instead?');
            if (newhowmany) {
                options.paging.size = parseInt(newhowmany);
                options.paging.from = 1; //I: Changed values from 0 to 1
                $('#facetview_howmany').html('results per page (' + options.paging.size + ')');
                dosearch();
            }
        };

        // adjust how many suggestions are shown
        var howmanynofsuggest = function (event) {
          console.log("howmanynofsuggest is called"); // I: To check when this function is triggered
            event.preventDefault();
            var newhowmany = prompt('Currently displaying ' + options.nofsuggest +
                ' suggestions per page. How many would you like instead?');
            if (newhowmany) {
                options.nofsuggest = parseInt(newhowmany);
                options.paging.from = 1; //I: Changed values from 0 to 1
                $('#facetview_nofsuggest').html('suggestions per page (' + options.nofsuggest + ')');
                dosearch();
            }
        };

        var displayloader = function () {
          console.log("displayloader is called"); // I: To check when this function is triggered
            var height1 = $('#facetview_results').height();
            var width1 = $('#facetview_results').width();
            $('.loadingbg').height(height1);
            $('.loadingbg').width(width1);
            $('#loading').show();

        };

        var hideloader = function () {
          console.log("hideloader is called"); // I: To check when this function is triggered
            $('#loading').hide();
        };
        // the facet view object to be appended to the page
        var thefacetview = ' \
        	<section class="search-bar col-sm-12 col-md-8 col-md-offset-2"> \
        	    <div id="facetview-searchbar" class="input-group"> \
                    <div class="search"> \
                        <div class="search-db" id="searchMultiple"> \
                        </div> \
                        <div class="input-group col-sm-12"> \
                          <input id="facetview_freetext" name="query" type="text" autofocus placeholder="search term"  autocomplete="off" > \
                          <div class="input-group-addon"> \
                            <div class="btn-group"> \
                                <img src="new_Styles/img/settings.png" class="dropdown-toggle" data-toggle="dropdown">\
                                <ul class="dropdown-menu"> \
                                    <li><a id="facetview_partial_match" href="">partial match</a></li> \
                                    <li><a id="facetview_exact_match" href="">exact match</a></li> \
                                    <li><a id="facetview_fuzzy_match" href="">fuzzy match</a></li> \
                                    <li><a id="facetview_match_all" href="">match all</a></li> \
                                    <li class="divider"></li> \
                                    <li><a id="facetview_autosuggest" href=""><i id="facetview_autosuggest_flag" class="icon-ok"></i>&nbsp;Autosuggest</a></li> \
                                    <li class="divider"></li> \
                                    <li><a target="_blank" href="http://www.searchblox.com/">Learn more</a></li> \
                                    <li class="divider"></li> \
                                    <li><a id="facetview_howmany" href="#">results per page ({{HOW_MANY}})</a></li> \
                                    <li><a id="facetview_nofsuggest" href="#">suggestions per page ({{HOW_MANY_nofsuggest}})</a></li> \
                                </ul> \
                            </div> \
                          </div>\
                          <button><i class="fa fa-search" style="font-size:20px"></i></button>\
                        </div> \
                    </div> \
                </div> \
        	</section> \
        	<section class="section search-results"> \
                <div id="facetview"> \
                    <div class="row-fluid"> \
                        <div class="col-sm-3 sidebar"> \
                            <div class="" id="facetview_leftcol" style="display:none;width:100%;float:left"> \
                                <div id="facetview_filters"></div>\
                                <div id="adv_filters"></div>\
                            </div> \
                            <div class="" id="facetview_leftcol_topclicks" style="display:none;width:100%;float:left"></div> \
                            <div class="" id="facetview_leftcol_tagcloud"  style="display:none;width:100%;float:left"></div> \
                        </div> \
                        <div class="col-sm-9 results" id="facetview_rightcol" align="left" style=""> \
                        <h3 style="display:none;">Search Results for '+ options.query +'</h3> \
                            <div>\
                                <div class="row-fluid" style="height:40px;" id="facetview_sortbtns">\
                                    <div id="sort_btn_aligner" style="display:none;text-align:center;">\
                                        <div class="btn-group sort-by-wrapper" data-toggle="buttons">\
                                            <div class="btn btn-primary" id="sort_date">Sort by Date</div>\
                                            <div class="btn btn-primary" id="sort_alpha">Sort Alphabetically</div>\
                                        </div>\
                                        <div id="pagination-on-top"></div>\
                                    </div>\
                                </div>\
                            </div>\
                        <div><div id="suggest"></div>\
                        <div><div id="ads"></div>\
                        <table class="table" id="facetview_results" style="word-break: break-all;"></table>\
                        <div class="row-fluid" id="facetview_metadata"></div>\
                    </div> \
                </div> \
            </section>\
            ';

        var attrsetter = function (attrname) {
          console.log("attrsetter is called"); // I: To check when this function is triggered
            var attrs = ['sort_date', 'sort_alpha', 'sort_relevance'];
            for (var a in attrs) {
                if (attrs[a] == attrname) {
                    $('#' + attrs[a]).attr('disabled', 'true');
                    continue;
                }
                $('#' + attrs[a]).removeAttr('disabled');
            }
        };

        var sorter = function () {
          console.log("sorter is called"); // I: To check when this function is triggered
            attrsetter($(this).attr('id'));
            if ($(this).attr('id') == 'sort_date') {
                sortq = "&sort=date";
            }
            else if ($(this).attr('id') == 'sort_alpha') {
                sortq = "&sort=alpha";
            }
            else if ($(this).attr('id') == 'sort_relevance') {
                sortq = "&sort=relevance";
            }
            dosearch();
        };

        var director = function () {
          console.log("director is called"); // I: To check when this function is triggered
            if ($(this).attr('dir') == "desc") {
                $(this).attr('dir', 'asc');
                $('span', this).attr('class', 'glyphicon glyphicon-arrow-up');
                direction = "&sortdir=asc";
            }
            else if ($(this).attr('dir') == "asc") {
                $(this).attr('dir', 'desc');
                $('span', this).attr('class', 'glyphicon glyphicon-arrow-down');
                direction = "&sortdir=desc";
            }
            dosearch();
        };

        var autosuggest = function (event) {
          console.log("autosuggest is called"); // I: To check when this function is triggered
            event.preventDefault();
            if (autosuggestflag) {
                $(this.target).find('#facetview_freetext').autocomplete({
                    source: []
                });
                autosuggestflag = false;
                $('#facetview_autosuggest_flag').attr('class', '');
            } else {
                autosuggestflag = true;
                $('#facetview_autosuggest_flag').attr('class', 'icon-ok')
            }
        };

        var fixadvfiltercount = function () {
          console.log("fixadvfiltercount is called"); // I: To check when this function is triggered
            $('[id^="optionsizefrom_"]').each(function () {
                var n = findfilterindata("size");
                $(this).html($(this).html().replace(/[(]+\w+[)]/, "(" + options.data["facets"][n]["size"][1][$(this).attr('id').split('_')[1]]['#text'] + ")"));
            });
            $('[id^="optiondatefrom_"]').each(function () {
                if(typeof options.data["facets"] != "undefined") {
                    var n = findfilterindata("lastmodified");
                    if ($(this).html() != 'Custom')
                        $(this).html($(this).html().replace(/[(]+\w+[)]/, "(" + options.data["facets"][n]["lastmodified"][1][$(this).attr('sn')]['#text'] + ")"));
                }
            });
        };


        // what to do when ready to go
        var whenready = function () {
          console.log("whenready is called"); // I: To check when this function is triggered
            // append the facetview object to this object

            thefacetview = thefacetview.replace(/{{HOW_MANY}}/gi, options.paging.size);
            thefacetview = thefacetview.replace(/{{HOW_MANY_nofsuggest}}/gi, options.nofsuggest);
            $(obj).append(thefacetview);


            // setup search option triggers
            $('#facetview_partial_match').bind('click', fixmatch);
            $('#facetview_exact_match').bind('click', fixmatch);
            $('#facetview_fuzzy_match').bind('click', fixmatch);
            $('#facetview_match_any').bind('click', fixmatch);
            $('#facetview_match_all').bind('click', fixmatch);
            $('#facetview_howmany').bind('click', howmany);
            $('#facetview_nofsuggest').bind('click', howmanynofsuggest);
            $('#sort_date').bind('click', sorter);
            $('#sort_alpha').bind('click', sorter);
            $('#sort_relevance').bind('click', sorter);
            $('#direction').bind('click', director);
            $('#facetview_autosuggest').bind('click', autosuggest);

            // resize the searchbar
            var thewidth = $('#facetview_searchbar').parent().width();
            $('#facetview_searchbar').css('width', thewidth - 140 + 'px');
            $('#facetview_freetext').css('width', thewidth - 180 + 'px');
            //set default size values
            for (var i in options.facets)
                if (options.facets[i]['size'])sizeq[options.facets[i]['field']] = options.facets[i]['size'];
                else {
                    options.facets[i]['size'] = 10;
                    sizeq[options.facets[i]['field']] = options.facets[i]['size'];
                }
            // check paging info is available
            !options.paging.size ? options.paging.size = 10 : "";
            !options.paging.from ? options.paging.from = 1 : ""; //I: Changed values from 0 to 1

            // append the filters to the facetview object
            buildfilters();
            //build advanced filters
            fixadvfilters();
            // set any default search values into the search bar
            if ($('#facetview_freetext').val() == "" && options.query != "") {
                $('#sort_btn_aligner').show('slow');
                $('#facetview_leftcol').show('slow');
                $('#facetview_rightcol > h3').show('slow');
                $('#facetview-searchbar').attr('style', 'margin-bottom:10px;');
                $('.header').attr('style', 'padding:5px;margin-top:15px;');
                $('#facetview_freetext').val(options.query);
                dosearch();
            }
            $('#facetview_freetext', obj).bindWithDelay('keyup', dosearch, options.freetext_submit_delay);
            if ((readCookie("searchblox_plugin_query") == "new" || readCookie("searchblox_plugin_query") == null) && (readCookie("searchblox_click") == "false" || readCookie("searchblox_click") == null))
                createCookie("searchblox_plugin_query", "new", 0);
            else if (readCookie("searchblox_click") == "false" && readCookie("searchblox_plugin_query") != "new") {
                createCookie("searchblox_plugin_query", "new", 0);
            }
            else {
                $.getJSON(options.search_url, "callback=?&" + readCookie("searchblox_plugin_query"),
                    function (data) {
                        createCookie("searchblox_click", "false", 0);
                        var temp = readCookie("searchblox_plugin_query");
                        temp = temp.split('&')[0].split('=')[1];
                        options.query = temp;
                        temp = readCookie("searchblox_plugin_query");
                        temp = temp.match(/f\.[a-zA-z0-9 ]+\.filter=[\w\d\s\-\[\:\*\]]+/g);

                        $('#facetview_freetext').val(unescape(options.query));
                        showresults(data);
                        for (var t in temp) {
                            var facetname = temp[t].split('.')[1];
                            var filtername = temp[t].split('=')[1];
                            $('[id=fltchoice_' + escape(filtername.replace(/ /g, '%%%')) + '][rel=' + facetname + ']').click();
                        }
                    }
                );
            }
        };

        // ===============================================
        // now create the plugin on the page
        return this.each(function () {
            // get this object
            obj = $(this);

            whenready();


        }); // end of the function

    };

    // facetview options are declared as a function so that they can be retrieved
    // externally (which allows for saving them remotely etc)
    $.fn.facetview.options = {}

});
