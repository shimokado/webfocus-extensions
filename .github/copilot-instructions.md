# 指示文
WebFOCUSの拡張グラフ開発を支援してください。
**常に日本語で会話してください**

## 参考資料

### 拡張グラフ開発ガイド
* 参考資料: "doc\Editing_Creating_a_WebFOCUS_Extension.md"

### 拡張グラフデータインタフェース
* 参考資料: "doc\Editing_Extension_Data_Interface.md"

### 拡張グラフプロパティJSONについて
* 参考資料: "doc\Editing_Extension_Configuration_with_properties.json.md"

## 拡張グラフの作成手順

1. `npm run create-extension`コマンドを実行して、"com.shimokado.simple_bar"または"com.shimokado.params"を複製する。
1. 複製したフォルダの"properties.json"を編集する
    - 外部モジュールの読み込み
    - 英語と日本語の対応
    - 作成者などの情報
1. 作成した機能名のcom.shimokado.*.jsファイルを編集
1. test.htmlを編集してテスト
1. WebFOCUSにデプロイ`npm run deploy`コマンド

## 拡張グラフの作り方
```html
<html lang="en">


<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Creating Your Own Chart Types</title>
</head>

<body>
    <div class="container">
        <div class="topic_topic_title">
            <div class="topic_topic_title__content">Creating Your Own Chart Types</div>
        </div>

        <p>WebFOCUS BUE supports the ability to add new, custom chart types
            to its list of built-in charts. These custom chart types are called <span
                style="font-style:italic">extensions</span> or <span style="font-style:italic">plug-ins</span>.
            An extension is a block of code that accesses resources external
            to WebFOCUS BUE. This topic describes the structure of an extension
            and the steps necessary to create your own and add it to the chart
            library.
        </p>

        <div class="topic"><a name="WS3284DDCB-999B-4143-8861-3E380C414D98" /><a
                name="_OPENTOPIC_TOC_PROCESSING_d0e29794"><span style="display:none">x</span></a>
            <div class="topic_topic_topic_title">
                <div class="topic_topic_topic_title__content">Introducing Chart Extensions</div>
            </div>
            <p>Chart extensions are written in JavaScript. The visual
                part of a visualization can be drawn with HTML, Canvas, or SVG.
                Extensions can include external CSS and JS libraries (such as d3),
                which can be used to build almost any visualization. The WebFOCUS Extension
                API is limited to new, complete chart types only. It is not possible
                to add features to existing chart types, and it is not possible
                to modify or extend parts of WebFOCUS BUE outside of the chart area
                allocated to your extension.

            </p>
            <p>

            </p>
            <p>This topic summarizes the process of writing, configuring, and
                installing a chart extension. Detailed instructions can be found
                on the Information Builders GitHub site:</p>
            <p>
                <span /><a class="xref" href="https://github.com/ibi/wf-extensions-chart"
                    target="_blank">https://github.com/ibi/wf-extensions-chart</a>
            </p>
            <p>WebFOCUS BUE extensions must be placed
                in the extensions folder under the web_resource folder of your WebFOCUS
                BUE installation. By default, this is the following location:</p>
            <pre>c:\ibi\<span style="color:blue">install_dir</span>\config\web_resource\extensions</pre>
            <p>where:</p>
            <dl>
                <dt><span style="color:blue">install_dir</span></dt>
                <dd>
                    <p class="definition">Is your WebFOCUS BUE installation directory. </p>
                </dd>
            </dl>
            <p>Several sample chart extensions have
                already been installed in the extensions folder so that you can
                see their code, their structure, and how they are accessed in the
                WebFOCUS BUE tools.</p>
            <p><span style="font-weight:bold">Note: </span>The user installing the extension must know how
                to write JavaScript code for what the chart extension needs to generate.
                The GitHub site documents how to make the extension conform to the
                WebFOCUS API and how to install the extension in the WebFOCUS BUE
                chart library. It does not describe how to write JavaScript code.</p>
        </div>



        <div class="topic"><a name="WS5EB05363-B7D9-410a-99B7-457AA853B6FA" /><a
                name="_OPENTOPIC_TOC_PROCESSING_d0e29865"><span style="display:none">x</span></a>
            <div class="topic_topic_topic_title">
                <div class="topic_topic_topic_title__content">Creating a Chart Extension</div>
            </div>
            <table cellpadding="6" cellspacing="0" width="100%"
                style="vertical-align: top;background-color: white;border:1px solid black;border-collapse: collapse">
                <tr valign="top">
                    <td style="padding:6px">
                        <p><span style="font-weight:bold">Reference: </span></p>
                        <ul>
                            <li><a class="topic_list_ul_li__content"
                                    href="05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e29882">Build Cycle for Writing
                                    an Extension</a></li>
                            <li><a class="topic_list_ul_li__content"
                                    href="05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e29912">Extension Structure</a>
                            </li>
                        </ul>
                    </td>
                </tr>
            </table>
            <p>This section summarizes the build cycle for creating
                an extension and the structure and components of an extension.

            </p>




            <div class="topic"><a name="WS7199C1B1-883A-4892-B452-A1F781EDFA72" /><a
                    name="_OPENTOPIC_TOC_PROCESSING_d0e29882"><span style="display:none">x</span></a>
                <div class="topic_topic_topic_topic_title">
                    <div class="infotype"><span style="font-style:italic">Reference: </span>Build Cycle for Writing an
                        Extension</div>
                </div>


                <p>Creating an extension often involves
                    cycles of writing, running, and then debugging code. </p>
                <p>When
                    you make changes to the properties.js file for your extension, you
                    need to clear the WebFOCUS BUE cache in order for those changes
                    to be recognized. Clear the cache using the <span style="font-weight:bold">Clear cache</span> link
                    in the Administration Console.</p>
                <p>If you change the .js code
                    for your extension (for example, com.ibi.simple_bar.js), you do
                    not need to make any changes to WebFOCUS BUE. You only need to clear
                    your own browser cache, to ensure that the new JavaScript file is
                    downloaded. The same is true if you change any additional .js files
                    included by your extension.

                </p>


            </div>



            <div class="topic"><a name="WSB3785F61-24C0-443e-9A26-DF34631A490E" /><a
                    name="_OPENTOPIC_TOC_PROCESSING_d0e29912"><span style="display:none">x</span></a>
                <div class="topic_topic_topic_topic_title">
                    <div class="infotype"><span style="font-style:italic">Reference: </span>Extension Structure</div>
                </div>


                <p>The
                    Simple Bar extension example demonstrates the required and optional
                    files in an extension, and how those files are typically laid out.

                </p>
                <p>You
                    can open com.ibi.simple_bar and com.ibi.simple_bar.js in a text
                    editor to see exactly how an extension is written.</p>
                <p>The extension
                    ID (ext_id) is a string in the form com.<span style="font-weight:bold">your_company</span>.<span
                        style="font-weight:bold">extension_name</span>.
                    The ext_id must be all lowercase, and can include only letters,
                    numbers, underscores and dots. The entire extension lives in a folder
                    named <span style="font-weight:bold">ext_id</span>. The core of the extension lives
                    in a file named <span style="font-style:italic">ext_id.js</span>. This file includes code to render
                    the extension as a new chart type within WebFOCUS BUE.</p>
                <p>The
                    properties.json file configures your extension to run in WebFOCUS
                    BUE. This file includes all the metadata needed to include your
                    extension in the WebFOCUS BUE user interface, as well as a list
                    of all properties you wish to expose to end users, so they can customize
                    the behavior of your extension. </p>
                <p>The extension folder can
                    also include optional additional folders for external css and lib
                    resources. If your extension uses any additional CSS or JavaScript
                    library files, you can keep those resources organized in dedicated
                    folders, such as css and lib, as you choose. External resources
                    are configured and loaded inside the base ext_id.js file of your extension.</p>


            </div>
        </div>



        <div class="topic"><a name="WSE8FB255E-8E48-473c-8760-E4F0CF71F2B8" /><a
                name="_OPENTOPIC_TOC_PROCESSING_d0e29958"><span style="display:none">x</span></a>
            <div class="topic_topic_topic_title">
                <div class="topic_topic_topic_title__content">Using the Chart Extension API</div>
            </div>
            <table cellpadding="6" cellspacing="0" width="100%"
                style="vertical-align: top;background-color: white;border:1px solid black;border-collapse: collapse">
                <tr valign="top">
                    <td style="padding:6px">
                        <p><span style="font-weight:bold">Topics: </span></p>
                        <ul>
                            <li><a class="topic_list_ul_li__content"
                                    href="05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e29981">Rendering Charts</a>
                            </li>
                            <li><a class="topic_list_ul_li__content"
                                    href="05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e30320">Configuring Your Chart
                                    Extension</a></li>
                            <li><a class="topic_list_ul_li__content"
                                    href="05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e30746">Accessing Data for Your
                                    Extension</a></li>
                        </ul>
                    </td>
                </tr>
            </table>
            <p>To see examples of everything that the chart extension
                API provides, look at <span style="font-style:italic">com.ibi.simple_bar.js</span>. It is divided
                into two main parts, chart rendering and extension configuration.


            </p>




            <div class="topic"><a name="WS7B983E27-74D6-45d8-8C06-C2DD4216D0C2" /><a
                    name="_OPENTOPIC_TOC_PROCESSING_d0e29981"><span style="display:none">x</span></a>
                <div class="topic_topic_topic_topic_title">
                    <div class="topic_topic_topic_topic_title__content">Rendering Charts</div>
                </div>

                <p>The extension API provides three entry points that you
                    can use as needed by defining your own JavaScript callback functions.
                    They are passed a set of properties in a config object. Some properties
                    are available during the entire rendering process, and some are
                    only available during render callback.</p>





                <div class="topic"><a name="WSAEBE6628-5DDE-46c7-8897-902658485FFE" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e29992"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="infotype"><span style="font-style:italic">Reference: </span>Chart Rendering Callback
                            Functions</div>
                    </div>


                    <p>You can define the following three JavaScript
                        callback functions. Only the renderCallback function is always required.


                    </p>
                    <ul>
                        <li>
                            <span style="font-weight:bold">initCallback(successCallback, config)</span> This
                            optional function is invoked by the engine exactly once during library
                            load time, providing a way to implement document.onload initialization
                            code. This function is passed a successCallback, which you must
                            invoke with <span style="font-weight:bold">true</span> if your initialization code
                            succeeded or <span style="font-weight:bold">false</span> if was not successful.
                            If you call successCallback(false), no further interaction with
                            your extension will occur, and your extension will render as an
                            empty page.

                        </li>
                        <li>
                            <span style="font-weight:bold">preRenderCallback(config)</span> This optional function is
                            invoked
                            each time your extension is to be rendered, as the very first step
                            in the overall rendering process. This is a good place to examine
                            and tweak or override any internal chart properties that will affect
                            the subsequent rendering.

                        </li>
                        <li>
                            <span style="font-weight:bold">renderCallback(config)</span> This required function must
                            contain
                            all of the code that will actually draw your chart. The <span
                                style="font-style:italic">config</span> object
                            will contain the properties described in the following sections.

                        </li>
                    </ul>
                    <p>Each
                        of the three entry point callbacks is passed a config object, which
                        contains a set of useful properties. </p>




                    <table width="100%">
                        <tbody>
                            <tr>
                                <td width="40%">
                                    <hr />
                                </td>

                                <td width="20%">
                                    <div style="text-align:center"><a href="#top">Top of page</a></div>
                                </td>

                                <td width="40%">
                                    <hr />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <a name="_OPENTOPIC_TOC_PROCESSING_d0e30067">
                        <div class="infotype"><span style="font-style:italic">Example: </span>Sample renderCallback
                            Function</div>
                    </a>
                    <p>The following sample renderCallback
                        code renders the Simple Bar extension.</p>
                    <pre>function renderCallback(renderConfig) {
    var chart = renderConfig.moonbeamInstance;
    var props = renderConfig.properties;
    var container = d3.select(renderConfig.container)
     .attr('class', 'com_ibi_chart');
    var data = renderConfig.data;
    if (renderConfig.dataBuckets.depth === 1) {
     data = [data];
    }
     
    var seriesCount = data[0].length;
    var seriesLabels = data[0].map(function(el){return el.labels;});
    data = d3.transpose(data).map(function(el, idx) {
     el = el[0];
     var v = Array.isArray(el.value) ? el.value : [el.value];
     var y0 = 0;
     return v.map(function(d, s) {
      return chart.mergeObjects(d, {y0: y0, y1: y0 += d, seriesID: s, value: d, labels: seriesLabels[idx]});
     });
    });
    
    var w = renderConfig.width;
    var h = renderConfig.height;
    var x = d3.scale.ordinal().domain(pv.range(seriesCount)).rangeRoundBands([0, w], 0.2);
    var ymax = d3.max([].concat.apply([], data), function(d){return d.y1;});
    var y = d3.scale.linear().domain([0, ymax]).range([25, h]);
    var svg = container.selectAll("g")
     .data(data)
     .enter().append('g')
     .attr('transform', function(d, i){return 'translate(' + x(i) + ', 0)';});
     </pre>
                    <pre>  svg.selectAll("rect")
     .data(function(d){return d;})
     .enter().append('rect')
     .attr("width", x.rangeBand())
     .attr("y", function(d) {return h - y(d.y1);})
     .attr("height", function(d){return y(d.y1) - y(d.y0);})
     .attr('tdgtitle', function(d, s, g) {
      // To support tooltips, each chart object that should draw a tooltip must 
      // set its 'tdgtitle' attribute to the tooltip's content string.
      
      // Retrieve the chart engine's user-defined tooltip content with getToolTipContent():
      // 's' and 'g' are the series and group IDs for the riser in question.
      // 'd' is this riser's individual datum, and seriesData is the array of data for this riser's series.
      var seriesData = chart.data[s];
      var tooltip = renderConfig.modules.tooltip.getToolTipContent(s, g, d, seriesData);
      // getToolTipContent() return values:
      //  - undefined: do not add any content to this riser's tooltip
      //  - the string 'auto': you must define some 'nice' automatic tooltip content for this riser
      //  - anything else: use this directly as the tooltip content
      if (tooltip === 'auto') {
       if (d.hasOwnProperty('color')) {
        return 'Bar Size: ' + d.value + '&lt;br /&gt;Bar Color: ' + d.color;
       }
       return 'Bar Size: ' + d.value;
      }
      return tooltip;
     })
     .attr('class', function(d, s, g) {
      // To support data selection and tooltips, each riser must include a class name with the appropriate seriesID and groupID
      // Use chart.buildClassName to create an appropriate class name.
      // 1st argument must be 'riser', 2nd is seriesID, 3rd is groupID, 4th is an optional extra string which can be used to identify the risers in your extension.
      return chart.buildClassName('riser', s, g, 'bar');
     })
     .attr('fill', function(d) {
      // getSeriesAndGroupProperty(seriesID, groupID, property) is a handy function
      // to easily look up any series dependent property.  'property' can be in
      // dot notation (eg: 'marker.border.width').
      return chart.getSeriesAndGroupProperty(d.seriesID, null, 'color');
     });
     
    svg.append('text')
     .attr('transform', function(d) {return 'translate(' + (x.rangeBand() / 2) + ',' + (h - 5) + ')';})
     .text(function(d, i){return seriesLabels[i];})
     
    renderConfig.modules.tooltip.updateToolTips();  // Tell the chart engine your chart is ready for tooltips to be added
    renderConfig.modules.dataSelection.activateSelection();  // Tell the chart engine your chart is ready for data selection to be enabled
   }</pre>

                </div>




                <div class="topic"><a name="WSB1DE4987-5EA1-4404-B8DA-1E1E64574D9A" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e30080"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="infotype"><span style="font-style:italic">Reference: </span>Properties That Are
                            Always Available</div>
                    </div>


                    <p>The following properties are always
                        available.
                    </p>

                    <table style="border-collapse: collapse;">
                        <colgroup>
                            <col width="34.365693865396075%" />
                            <col width="65.63430613460393%" />
                        </colgroup>


                        <thead class="tgroup_thead">
                            <tr valign="top">
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Property Name</span>
                                    </p>
                                </th>
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Description</span>
                                    </p>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="tgroup_tbody">
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">moonbeamInstance</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">The chart instance currently being rendered.</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">data</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">The data set being rendered. </p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">properties </p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">The block of properties for your extension,
                                        as set by the user.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p>

                    </p>


                </div>




                <div class="topic"><a name="WS7C691B51-3F8B-47bc-9B04-6F0787DA20B1" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e30186"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="infotype"><span style="font-style:italic">Reference: </span>Properties Available
                            Only During Render Callback</div>
                    </div>


                    <p>The following properties are available
                        only during render callback, and are used by your chart rendering
                        code (renderCallback).
                    </p>

                    <table style="border-collapse: collapse;">
                        <colgroup>
                            <col width="32.98989113530327%" />
                            <col width="67.01010886469673%" />
                        </colgroup>


                        <thead class="tgroup_thead">
                            <tr valign="top">
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Property Name</span>
                                    </p>
                                </th>
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Description</span>
                                    </p>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="tgroup_tbody">
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">width</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Width of the container your extension renders
                                        into, in pixels.</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">height</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Height of the container your extension renders
                                        into, in pixels.</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">containerIDPrefix</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">The ID of the DOM container your extension renders
                                        into. Prepend this to <span style="font-style:italic">all</span> IDs your
                                        extension generates, to
                                        ensure multiple copies of your extension work on one page.</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">container</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">DOM node for your extension to render into,
                                        either an HTML DIV element or an SVG G element, depending on your
                                        chosen containerType extension configuration</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">rootContainer</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">DOM node containing the specific chart engine instance
                                        being rendered.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>



                </div>
            </div>



            <div class="topic"><a name="WSAE5016E2-76CD-4387-A349-1053CB857137" /><a
                    name="_OPENTOPIC_TOC_PROCESSING_d0e30320"><span style="display:none">x</span></a>
                <div class="topic_topic_topic_topic_title">
                    <div class="topic_topic_topic_topic_title__content">Configuring Your Chart Extension</div>
                </div>

                <p>Extension configuration consists
                    of two parts.

                </p>
                <ul>
                    <li>Chart Engine Configuration configures the extension to interact
                        with the chart engine and chart canvas in WebFOCUS BUE. This part
                        of the extension configuration is defined in the config object that
                        is passed to the chart renderer functions.</li>
                    <li>Chart Interface Configuration interacts with the chart type
                        picker in the user interface and the chart attribute categories.
                        This part of the extension configuration is defined in the properties.json
                        file.</li>
                </ul>





                <div class="topic"><a name="WSCEDE6876-E723-4885-8FBE-79B4B51D4FE6" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e30346"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="topic_topic_topic_topic_topic_title__content">Creating a config Object for Chart
                            Engine Configuration</div>
                    </div>

                    <p>To configure your extension, create a <span style="font-style:italic">config</span> object
                        with all the information unique to your extension, then register
                        your extension with the extension API.


                    </p>





                    <div class="topic"><a name="WS59F2B1B3-6FA4-4d9a-A436-2AE83D09AF48" /><a
                            name="_OPENTOPIC_TOC_PROCESSING_d0e30369"><span style="display:none">x</span></a>
                        <div class="topic_topic_topic_topic_topic_topic_title">
                            <div class="infotype"><span style="font-style:italic">Reference: </span>Creating a config
                                Object for Your Extension</div>
                        </div>


                        <p>Required and optional properties in
                            your config object are described in the following table. </p>
                        <p>

                        </p>


                        <table style="border-collapse: collapse;">
                            <colgroup>
                                <col width="33.52803738317757%" />
                                <col width="66.47196261682244%" />
                            </colgroup>


                            <thead class="tgroup_thead">
                                <tr valign="top">
                                    <th align="left" scale="col" class="ts_border-1">
                                        <p class="p_table">
                                            <span style="font-weight:bold">Property Name</span>
                                        </p>
                                    </th>
                                    <th align="left" scale="col" class="ts_border-1">
                                        <p class="p_table">
                                            <span style="font-weight:bold">Description</span>
                                        </p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="tgroup_tbody">
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">id</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Is the extension ID described in <span /><a class="xref"
                                                href="05_chart_types.htm#WSB3785F61-24C0-443e-9A26-DF34631A490E">Extension
                                                Structure</a>.</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">name</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Is the name for the chart type to be displayed
                                            in the user interface.</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">description</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Is a description for the chart type to be
                                            displayed in the user interface.</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">containerType</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Is either 'html' or 'svg' (the default).</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">initCallback</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Optional. References your initCallback function, described
                                            in <span /><a class="xref"
                                                href="05_chart_types.htm#WS7B983E27-74D6-45d8-8C06-C2DD4216D0C2">Rendering
                                                Charts</a>.</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">preRenderCallback</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Optional. References your preRenderCallback function,
                                            described in <span /><a class="xref"
                                                href="05_chart_types.htm#WS7B983E27-74D6-45d8-8C06-C2DD4216D0C2">Rendering
                                                Charts</a>.</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">renderCallback</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Required. References your renderCallback function,
                                            described in <span /><a class="xref"
                                                href="05_chart_types.htm#WS7B983E27-74D6-45d8-8C06-C2DD4216D0C2">Rendering
                                                Charts</a>.</p>
                                    </td>
                                </tr>
                                <tr valign="top">
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">resources</p>
                                    </td>
                                    <td align="left" class="ts_border-1">
                                        <p class="p_table">Optional. Are additional external resources
                                            (CSS and JS) required by this extension. </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>




                        <table width="100%">
                            <tbody>
                                <tr>
                                    <td width="40%">
                                        <hr />
                                    </td>

                                    <td width="20%">
                                        <div style="text-align:center"><a href="#top">Top of page</a></div>
                                    </td>

                                    <td width="40%">
                                        <hr />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <a name="_OPENTOPIC_TOC_PROCESSING_d0e30559">
                            <div class="infotype"><span style="font-style:italic">Example: </span>Sample config Object
                            </div>
                        </a>
                        <p>The following code is a sample of the
                            config object used with the Simple Bar extension.</p>
                        <pre>var config = {
      id: 'com.ibi.simple_bar',     // string that uniquely identifies this extension
      containerType: 'svg',  // either 'html' or 'svg' (default)
      initCallback: initCallback,  // Refers to your init callback fn (optional)
      preRenderCallback: preRenderCallback,  // Refers to your preRender callback fn (optional)
      renderCallback: renderCallback,  // Refers to your render fn (required)
      resources:  {  // Additional external resources (CSS &amp; JS) required by this extension (optional)
          script: ['lib/d3.min.js'],
          css: ['css/extension.css']
      },
     }</pre>

                    </div>




                    <div class="topic"><a name="WSA2BF8E34-765F-4328-B638-EE428E8EF6CC" /><a
                            name="_OPENTOPIC_TOC_PROCESSING_d0e30570"><span style="display:none">x</span></a>
                        <div class="topic_topic_topic_topic_topic_topic_title">
                            <div class="infotype"><span style="font-style:italic">Reference: </span>Registering Your
                                Extension</div>
                        </div>


                        <p>To register your extension with the
                            WebFOCUS extension API, call:


                        </p>
                        <pre>tdgchart.extensionManager.register(config);</pre>

                    </div>




                    <div class="topic"><a name="WS730B81A4-3E12-4e74-8331-B7A593315345" /><a
                            name="_OPENTOPIC_TOC_PROCESSING_d0e30596"><span style="display:none">x</span></a>
                        <div class="topic_topic_topic_topic_topic_topic_title">
                            <div class="infotype"><span style="font-style:italic">Reference: </span>Tips for Building
                                Your Extension</div>
                        </div>


                        <p>The easiest way to build your own extension
                            is to clone the Simple Bar example, then tweak it. Assume the ID
                            of the new extension is com.foo.bar:

                        </p>
                        <ol>
                            <li>Rename root folder to com.foo.bar. Rename com.ibi.simple_bar.js
                                to com.foo.bar.js.</li>
                            <li>In com.foo.bar.js, delete the inner content of the three callback
                                functions.</li>
                            <li>In com.foo.bar.js, change the entries for each property in config
                                to match the requirements of your extension.</li>
                            <li>Add any external resources you need to <span style="font-weight:bold">lib</span> and
                                <span style="font-weight:bold">css</span>,
                                and load them by setting config.resources in com.foo.bar.js.</li>
                            <li>Implement renderCallback in com.foo.bar.js to draw your extension.</li>
                        </ol>


                    </div>
                </div>




                <div class="topic"><a name="WSBBA8FE4F-F7FB-4ea8-AAD8-3C084D20F4AE" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e30642"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="topic_topic_topic_topic_topic_title__content">Configuring the Chart Interface</div>
                    </div>

                    <p>Each extension must include a properties.json file,
                        which defines the information needed by WebFOCUS BUE when drawing
                        its user interface.


                    </p>
                    <p>The properties.json file consists of
                        the following blocks.</p>
                    <ul>
                        <li>
                            <span style="font-weight:bold">info.</span> This block defines several general purpose
                            configuration options.
                        </li>
                        <li>
                            <span style="font-weight:bold">properties.</span> This block defines any properties of your
                            extension that the end user may want to change. The user can change
                            these properties in the GRAPH_JS blocks in a WebFOCUS BUE chart
                            procedure.
                        </li>
                        <li>
                            <span style="font-weight:bold">propertyAnnotations.</span> This block validates the content
                            of the properties block. Everything in properties must appear in
                            propertyAnnotations. The possible types of any non-object (leaf)
                            property in properties must be notated as one of "str", "bool", or
                            "number".
                        </li>
                        <li>
                            <span style="font-weight:bold">dataBuckets.</span> This block defines the set of chart
                            attribute
                            categories that appear in the Query pane in the WebFOCUS BUE user
                            interface when creating a chart. Each member in the dataBuckets
                            collection is a bucket.<p>There are two
                                types of buckets, built-in and custom. Built-in buckets provide
                                an easy way to reuse the existing WebFOCUS BUE data bucket logic.
                                There are currently two built-in buckets, tooltip, and series_break.
                                Use any of these buckets by setting the associated dataBuckets property
                                to <span style="font-style:italic">true</span>. </p>
                        </li>
                        <li>
                            <span style="font-weight:bold">bucket.</span> Each bucket block defines one custom chart
                            attribute
                            category. Each custom bucket requires the following properties:<ul>
                                <li>
                                    <span style="font-weight:bold">id.</span> This property corresponds exactly to the
                                    dataArrayMap
                                    and data properties that will be received by the render function
                                    for your chart.
                                </li>
                                <li>
                                    <span style="font-weight:bold">type.</span> This property defines the type of data
                                    field this
                                    bucket accepts, "measure", "dimension", or "both".
                                </li>
                                <li>
                                    <span style="font-weight:bold">count.</span> Consists of count.min and count.max,
                                    which define
                                    the minimum and maximum number of fields this bucket can accept.
                                    A minimum of 0 means this bucket is optional.
                                </li>
                            </ul>
                        </li>
                        <li>
                            <span style="font-weight:bold">translations.</span> Defines translations in different
                            languages
                            for every label to be drawn in the WebFOCUS BUE interface. The translation
                            object has one property for each language the extension supports,
                            keyed by ISO-639 two letter locale strings.
                        </li>
                    </ul>



                    <table width="100%">
                        <tbody>
                            <tr>
                                <td width="40%">
                                    <hr />
                                </td>

                                <td width="20%">
                                    <div style="text-align:center"><a href="#top">Top of page</a></div>
                                </td>

                                <td width="40%">
                                    <hr />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <a name="_OPENTOPIC_TOC_PROCESSING_d0e30732">
                        <div class="infotype"><span style="font-style:italic">Example: </span>Sample properties.json
                            File</div>
                    </a>
                    <p>The following properties.json file is
                        from the Simple Bar extension.</p>
                    <pre>{
      // Define some general extension configuration options
      "info": {
          "version": "1.0",  // version number of your extension.
          "implements_api_version": "1.0",  // version number of the WebFocus API used by your extension.
          "author": "Information Builders",
          "copyright": "Information Builders Inc.",
          "url": "https://github.com/ibi/wf-extensions-chart/tree/master/simple_bar%20example",
          "icons": {
              "medium": "icons/medium.png"  // Reference to an image in the extension, used in the WF chart picker
          }
      },
      // Define any properties of your extension that end user may want to change.  
      "properties": {
          "exampleProperty": 50
      },
      // Define the possible values for each property in 'properties'.
      "propertyAnnotations": {
          "exampleProperty": "number"
      },
      // Define the available data buckets drawn in WF's 'Query' data bucket tree.  
      "dataBuckets":  {
          // Choose whether or not to reuse existing WF data buckets.  All optional.
          "tooltip": false,
          "series_break": true,</pre>
                    <pre>        // Define your own custom data buckets.  Optional
          "buckets": [
              {
                  "id": "value",
                  "type": "measure",
                  "count": {"min": 1, "max": 5}
              },
              {
                  "id": "labels",
                  "type": "dimension",
                  "count": {"min": 1, "max": 5}
              }
          ]
      },
      // Define the set of labels used in the WF interface for buckets and chart type picker.
      "translations": {
          "en": {
              "name": "My Simple Bar Chart",
              "description": "This chart is just a simple bar chart, nothing to see here.",
              "icon_tooltip": "This extension does ...", 
              "value_name": "Value Bucket", 
              "value_tooltip": "Drop a measure here", 
              "labels_name": "Label Bucket", 
              "labels_tooltip": "Drop a dimension here"
          },
          "fr": {
              "name": "Un Bar Chart tres simple",
              "description": "C'est un Bar Chart vraiment simple",
              "icon_tooltip": "This extension does ...", 
              "value_name": "Value Bucket", 
              "value_tooltip": "Drop a measure here", 
              "labels_name": "Label Bucket", 
              "labels_tooltip": "Drop a dimension here"
          }
      }
  }</pre>

                </div>
            </div>



            <div class="topic"><a name="WSB414884A-C529-49ef-92F0-6C02F46A3A00" /><a
                    name="_OPENTOPIC_TOC_PROCESSING_d0e30746"><span style="display:none">x</span></a>
                <div class="topic_topic_topic_topic_title">
                    <div class="topic_topic_topic_topic_title__content">Accessing Data for Your Extension</div>
                </div>

                <p>Each time an extension is rendered, the render callback
                    for the extension is passed the current data set using the renderConfig.data
                    argument. The overall structure of the data set is defined by the
                    set of buckets listed in the properties.json file, while the specific
                    content of the data is defined by the data fields the user has added
                    to each bucket.

                </p>





                <div class="topic"><a name="WS12E23FD9-253D-4f4b-AAAE-5CC52A7555A3" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e30763"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="topic_topic_topic_topic_topic_title__content">Defining and Using Buckets in an
                            Extension</div>
                    </div>

                    <p>The data set is passed into an extension using the data
                        property of the first argument of the render callback, typically
                        named renderConfig. Additional information about the current set
                        of fields in each bucket is in renderConfig.dataBuckets.


                    </p>
                    <p>A data set is represented in JavaScript as arrays of objects.
                        If an extension defines only custom buckets, the data set will be
                        a flat array of objects. If an extension uses some built-in buckets,
                        the data set may contain deeply nested arrays of arrays. The renderConfig.dataBuckets.depth
                        property will be set to the number of array dimensions in the current
                        data set.</p>
                    <p>
                        <span style="font-weight:bold">Custom Buckets</span>
                    </p>
                    <p>Each innermost object within the arrays of data (called a <span
                            style="font-style:italic">datum</span>)
                        will have one property for each data bucket that contains a field.
                        Each property will be the id of a custom bucket, as defined in the
                        dataBuckets.buckets section of properties.json. The type of values of
                        these properties depend on the bucket type. Dimension buckets have
                        string values, while measure buckets have numeric values. If a bucket
                        contains more than one field, the associated property for each innermost
                        object will be an array of string or number values.</p>
                    <p>
                        <span style="font-weight:bold">Built-in Buckets</span>
                    </p>
                    <p>An extension can use buckets that are built-in and predefined
                        by WebFOCUS BUE. These buckets will affect more than just the data
                        set. Each bucket will also set specific chart engine properties,
                        to pass in additional information related to that bucket. </p>
                    <p>Each built in WebFOCUS BUE bucket is
                        either a <span style="font-style:italic">standard</span> bucket or a <span
                            style="font-style:italic">break</span> bucket.</p>
                    <ul>
                        <li>Standard buckets behave exactly like custom buckets. The
                            data set remains a single array, and each datum object will include
                            an additional property named after the bucket.</li>
                        <li>Break buckets divide the data set into additional arrays of
                            data. For each break bucket used, each datum object will be transformed
                            into a full array of datum objects. The number of datum objects
                            in each array will remain unchanged, but the number of arrays or
                            datum arrays will correspond to the number of entries in the break field.</li>
                    </ul>
                    <p>
                        <span style="font-weight:bold">Types of Break Buckets</span>
                    </p>
                    <p>Break buckets can be of two types:</p>
                    <ul>
                        <li> A series-break bucket breaks the data set into one array
                            for each entry in the series break field chosen by the user. A series-break
                            bucket uses series-dependent properties defined in the chart engine,
                            and the data names are now listed in those series-dependent properties.
                            Each entry in the series-break field will generate a corresponding
                            series property object in the chart engine, retrievable with
                            renderConfig.moonbeamInstance.getSeries(<span style="font-style:italic">x</span>),
                            where <span style="font-style:italic">x</span> is an integer for the series to be retrieved.
                            getSeries
                            returns an object with properties such as color and label, which
                            are unique to the chosen series. </li>
                        <li>A matrix-break bucket is used for the sort fields that define
                            the columns and rows in a matrix chart. A matrix-break bucket also
                            adds more array dimensions to the data set. A matrix-break bucket
                            is broken into <span style="font-style:italic">column</span> and <span
                                style="font-style:italic">row</span> sub-buckets. If either
                            the row or column bucket contains any fields, the data set will
                            contain two additional dimensions of data, even if one of the matrix
                            buckets is empty. That is, the data set will either contain neither
                            row nor column data, or both row and column data, never just one
                            or the other. bucket.depth will always be at least three.</li>
                    </ul>
                    <p>
                        <span style="font-weight:bold">The Tooltip Bucket</span>
                    </p>
                    <p>The tooltip bucket is not a break bucket, and does not add any
                        additional array dimensions to the data set. Instead, tooltip behaves
                        like a custom bucket. Each inner datum object will contain a property
                        named <span style="font-style:italic">tooltip</span>, with a value of type string for
                        dimensions,
                        number for measures, and an array of values for multiple fields
                        in the bucket.</p>
                    <p>The usefulness of this bucket is that in addition to including
                        tooltip-specific data in the data set, WebFOCUS BUE also generates
                        meaningful tooltip content for each series. This tooltip content
                        is the same content used for all of the built in WebFOCUS BUE chart
                        types. Using the tooltip bucket means the extension does not have
                        to figure out what ought to go into each tooltip.</p>



                    <table width="100%">
                        <tbody>
                            <tr>
                                <td width="40%">
                                    <hr />
                                </td>

                                <td width="20%">
                                    <div style="text-align:center"><a href="#top">Top of page</a></div>
                                </td>

                                <td width="40%">
                                    <hr />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <a name="_OPENTOPIC_TOC_PROCESSING_d0e30871">
                        <div class="infotype"><span style="font-style:italic">Example: </span>Sample Series-Break Bucket
                            Definition</div>
                    </a>
                    <p>This example uses the following sample
                        data.</p>

                    <table style="border-collapse: collapse;">
                        <colgroup>
                            <col width="28.659678023212283%" />
                            <col width="35.51104455260202%" />
                            <col width="35.829277424185705%" />
                        </colgroup>



                        <thead class="tgroup_thead">
                            <tr valign="top">
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Car</span>
                                    </p>
                                </th>
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Country</span>
                                    </p>
                                </th>
                                <th align="left" scale="col" class="ts_border-1">
                                    <p class="p_table">
                                        <span style="font-weight:bold">Seats</span>
                                    </p>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="tgroup_tbody">
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">BMW</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Germany</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">5</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Audi</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Germany</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">4</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Peugeot</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">France</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">5</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Alfa Romeo</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Italy</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">4</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Maserati</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Italy</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">2</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Toyota</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">Japan</p>
                                </td>
                                <td align="left" class="ts_border-1">
                                    <p class="p_table">4</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <p>The following code defines
                        a series-break bucket.</p>
                    <pre>dataBuckets:
          series_break: true,
          buckets: [
              {id: "label", type: "dimension"},
              {id: "value", type: "measure"}
          ]</pre>
                    <p>Consider the following
                        fields assigned to each of the buckets:</p>
                    <ul>
                        <li>"Country" assigned
                            to the "series_break" bucket.</li>
                        <li>"Car" assigned to the "label" bucket.</li>
                        <li>"Seats" assigned to the "value" bucket.</li>
                    </ul>
                    <p>In the renderConfig function, the renderConfig.data
                        object will be similar to the following, in which the Country values
                        are no longer part of the data array. However, a new array starts
                        for each change in the Country value:</p>
                    <pre> [{labels: "PEUGEOT", value: 5}],
          [{labels: "ALFA ROMEO", value: 4}, {labels: "MASERATI", value: 2],
          [{labels: "TOYOTA", value: 4}],
          [{labels: "AUDI" ,value: 4}, {labels: "BMW", value: 5}]</pre>
                    <p>The renderConfig.dataBuckets object
                        will be defined as follows:</p>
                    <pre>renderConfig.dataBuckets = {
          depth: 2,
          series_break: {title: "Country"},
          buckets: {
              label: {title: "Car"},
              value: {title: "Seats"}</pre>

                </div>




                <div class="topic"><a name="WSFDDCEA39-AF06-4723-A323-7DAF5FFE7F81" /><a
                        name="_OPENTOPIC_TOC_PROCESSING_d0e31076"><span style="display:none">x</span></a>
                    <div class="topic_topic_topic_topic_topic_title">
                        <div class="topic_topic_topic_topic_topic_title__content">Handling Partial and Null Data in an
                            Extension</div>
                    </div>

                    <p>In many cases, the end user working with an extension
                        cannot populate all of the extension buckets immediately. An extension
                        must correctly handle these partial data cases, and cannot crash
                        if one or more buckets are empty. It is important to check renderConfig.dataBuckets
                        to see which buckets have been populated, and act accordingly.





                    </p>
                    <p>In addition, data sets are often incomplete, missing some values
                        for a given combination of dimensions and measures. These missing
                        values may show up in the data set as null entries within an array
                        (instead of datum objects), or they may show up as entirely empty
                        arrays. It is important to detect and handle these missing data
                        cases, and render a visualization appropriate for such missing data.</p>
                    <p>Most extensions require some minimum number of populated buckets
                        before anything can be rendered. Use the count.min properties of
                        each dataBuckets.bucket entry in properties.json to define these
                        minimum requirements. If the fields in all buckets do not meet the
                        minimum counts, then the renderCallback for the extension will not
                        be called. Instead, the noDataPreRenderCallback for the extension
                        is called. This allows the extension to render in a special <span style="font-style:italic">no
                            data</span> mode. In this mode, the extension should render in grey
                        scale, using renderCallback.baseColor as the main color. This should
                        be a very simplified, sample rendering of the extension. </p>



                    <table width="100%">
                        <tbody>
                            <tr>
                                <td width="40%">
                                    <hr />
                                </td>

                                <td width="20%">
                                    <div style="text-align:center"><a href="#top">Top of page</a></div>
                                </td>

                                <td width="40%">
                                    <hr />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <a name="_OPENTOPIC_TOC_PROCESSING_d0e31115">
                        <div class="infotype"><span style="font-style:italic">Example: </span>Sample
                            noDataPreRenderCallback Function</div>
                    </a>
                    <p>The following noDataPreRenderCallback
                        function is from the Simple Bar sample extension.</p>
                    <pre>function noDataRenderCallback(renderConfig) {
    var grey = renderConfig.baseColor;
    renderConfig.data = [{value: [3, 3]}, {value: [4, 4]}, {value: [5, 5]}, {value: [6, 6]}, {value: [7, 7]}];
    renderConfig.moonbeamInstance.getSeries(0).color = grey;
    renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
    renderCallback(renderConfig);
   }</pre>

                </div>
            </div>
        </div>

        <div class="topic"><a name="WSFE6C906C-8928-46ce-AD9A-BDFE2B02E4AE" /><a
                name="_OPENTOPIC_TOC_PROCESSING_d0e31128"><span style="display:none">x</span></a>
            <div class="topic_topic_topic_title">
                <div class="topic_topic_topic_title__content">Installing a Chart Extension</div>
            </div>
            <table cellpadding="6" cellspacing="0" width="100%"
                style="vertical-align: top;background-color: white;border:1px solid black;border-collapse: collapse">
                <tr valign="top">
                    <td style="padding:6px">
                        <p><span style="font-weight:bold">Reference: </span></p>
                        <ul>
                            <li><a class="topic_list_ul_li__content"
                                    href="05_chart_types.htm#_OPENTOPIC_TOC_PROCESSING_d0e31222">Preserving Custom Chart
                                    Types When Reinstalling the WebFOCUS Client</a></li>
                        </ul>
                    </td>
                </tr>
            </table>
            <ol>
                <li>Find the extensions folder for your local WebFOCUS
                    BUE installation. This is typically the following folder.


                    <pre>C:\ibi\<span style="color:blue">install_dir</span>\config\web_resource\extensions</pre>
                    <p>where:</p>
                    <dl>
                        <dt><span style="color:blue">install_dir</span></dt>
                        <dd>
                            <p class="definition">Is your WebFOCUS BUE installation directory.</p>
                        </dd>
                    </dl>
                    <p><span style="font-weight:bold">Note: </span>The
                        WebFOCUS Extension section of the Information Builders GitHub page
                        maintains a list of publicly available and supported extensions.
                        To install one of those, click the extension you want to install,
                        then right click the zip file for that extension, for example <span
                            style="font-weight:bold">com.ibi.xyz.zip</span>,
                        and choose <span style="font-weight:bold">Save link as...</span></p>
                </li>
                <li>Unzip the downloaded zip file into the WebFOCUS BUE extensions
                    folder. For example, for the <span style="font-weight:bold">com.ibi.xyz.zip</span> zip
                    file, this should create the following folder.
                    <pre>C:\ibi\<span style="color:blue">install_dir</span>\config\web_resource\extensions\com.ibi.xyz</pre>
                    <p>If
                        you are installing your own extension from your own environment,
                        copy or download it to the WebFOCUS BUE extensions folder, using
                        the same naming conventions for the folder and the extension ID
                        as described for the sample extensions.</p>
                </li>
                <li>Edit C:\ibi\<span
                        style="font-weight:bold">install_dir</span>\config\web_resource\extensions\html5chart_extensions.json.
                    Create a new line for the new extension in the form:
                    <pre>"com.ibi.<span style="color:blue">abc</span>": {"enabled": true},</pre>
                    <p>where:</p>
                    <dl>
                        <dt><span style="color:blue">abc</span></dt>
                        <dd>
                            <p class="definition">Is the name of the extension.</p>
                        </dd>
                    </dl>
                </li>
                <li>In the Administration Console, click <span style="font-weight:bold">Clear cache</span>.
                    This will force WebFOCUS to reload all extensions.</li>
            </ol>
            <p>Following is a sample html5chart_extensions.json.
            </p>
            <pre>{
          "com.ibi.simple_bar": {enabled: true},
          "com.ibi.liquid_gauge": {enabled: false},
          "com.ibi.sankey": {enabled: true}
      }</pre>



            <div class="topic"><a name="WSEA6F1EE7-1EB5-43cf-96A1-4C3E2C286513" /><a
                    name="_OPENTOPIC_TOC_PROCESSING_d0e31222"><span style="display:none">x</span></a>
                <div class="topic_topic_topic_topic_title">
                    <div class="infotype"><span style="font-style:italic">Reference: </span>Preserving Custom Chart
                        Types When Reinstalling the WebFOCUS Client</div>
                </div>


                <p>If
                    you reinstall the WebFOCUS Client, your extensions folder will be
                    overwritten. Therefore, if you have installed any custom chart extensions,
                    you should preserve them by copying them to another location prior
                    to reinstalling the WebFOCUS Client and copying them back to the
                    extensions folder after reinstalling the WebFOCUS Client.

                </p>
                <p>You
                    will also have to copy the entries for your custom extensions into
                    the new html5chart_extensions.json file installed with the new version
                    of the WebFOCUS Client.</p>
                <p>
                    <span style="font-weight:bold">Note:</span> The extensions that are
                    delivered as part of WebFOCUS BUE will be reinstalled automatically,
                    so you should not preserve those extensions. In that way, if any enhancements
                    have been made to those extensions, you will automatically have
                    access to the enhanced versions when you reinstall the WebFOCUS Client.
                </p>


            </div>
        </div>



        <div class="topic"><a name="WS15C49D49-67EF-4a36-A71A-E79AA408272C" /><a
                name="_OPENTOPIC_TOC_PROCESSING_d0e31253"><span style="display:none">x</span></a>
            <div class="topic_topic_topic_title">
                <div class="topic_topic_topic_title__content">Using Your Extension in a WebFOCUS Request</div>
            </div>
            <p>If you have installed and configured
                your extension as described, your extension will be available for
                use in the WebFOCUS BUE tools as a chart type in the <span style="font-weight:bold">Other</span> format
                category under <span style="font-weight:bold">HTML5 Extension</span>, as shown
                in the following image.

            </p>
            <p>
                <img src="files/images/82_custom_tools2.gif" class="image" alt="" />
            </p>
            <p>The attribute categories you defined in the dataBuckets object
                of your extension are available in the query pane.</p>
            <p>In the FOCEXEC: </p>
            <ul>
                <li>The LOOKGRAPH value is EXTENSION.</li>
                <li>The actual extension to use is identified in the chartType property
                    of the *GRAPH_JS block in the StyleSheet. For example:
                    <pre>*GRAPH_JS
  chartType: "com.ibi.simple_bar",
  }</pre>
                </li>
                <li>Each custom attribute category name is prepended with a greater-than
                    character (&gt;). For example:
                    <pre>TYPE=DATA, COLUMN=N1, BUCKET= &gt;labels, $
  TYPE=DATA, COLUMN=N2, BUCKET= &gt;value, $
  TYPE=DATA, COLUMN=N3, BUCKET= &gt;value, $
  TYPE=DATA, COLUMN=N4, BUCKET= &gt;value, $
  TYPE=DATA, COLUMN=N5, BUCKET= &gt;value, $</pre>
                </li>
            </ul>
            <p>The following is a sample request using
                the Simple Bar extension.</p>
            <pre>GRAPH FILE WF_RETAIL_LITE
  SUM COGS_US
  GROSS_PROFIT_US
  REVENUE_US
  DISCOUNT_US
  BY PRODUCT_CATEGORY
  ON GRAPH PCHOLD FORMAT JSCHART
  ON GRAPH SET LOOKGRAPH EXTENSION
  ON GRAPH SET AUTOFIT ON
  ON GRAPH SET STYLE *
  INCLUDE=IBFS:/FILE/IBI_HTML_DIR/javaassist/intl/EN/combine_templates/ENWarm.sty,$
  TYPE=DATA, COLUMN=PRODUCT_CATEGORY, BUCKET= &gt;labels, $
  TYPE=DATA, COLUMN=COGS_US, BUCKET= &gt;value, $
  TYPE=DATA, COLUMN=GROSS_PROFIT_US, BUCKET= &gt;value, $
  TYPE=DATA, COLUMN=REVENUE_US, BUCKET= &gt;value, $
  TYPE=DATA, COLUMN=DISCOUNT_US, BUCKET= &gt;value, $
  *GRAPH_JS
  chartType: "com.ibi.simple_bar",
  *END
  ENDSTYLE
  END</pre>
            <p>Run the chart. The output is shown in
                the following image.</p>
            <p><img src="files/images/82_custom_output2.gif" class="image" alt="" /></p>
        </div>
        <table width="100%">
            <tr>
                <td valign="bottom">
                    <hr color="#004982" />
                </td>
                <td width="75" align="right"><span style="color:#004982;font-size:13px;font-weight:bold">WebFOCUS</span>
                </td>
            </tr>
        </table>
        <table width="100%">
            <tbody>
                <tr>
                    <td width="40%" valign="top"><a
                            href="http://documentation.informationbuilders.com/WFHelpFeedback/feedback.asp">
                            <div style="font-size:15px;font-weight:bold;line-height: 70%;">Feedback</div>
                        </a></td>
                    <p id="back-top"><a href="#top"><span /></a></p>
                </tr>
            </tbody>
        </table>
    </div>
</body>

</html>
```

## 作成した拡張グラフのサンプル
以下のコードを見てプログラムの構造を理解してください。

* com.shimokado.params.js
```javascript
/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {

	// 全ての拡張機能のコールバック関数は標準の'renderConfig'引数を受け取ります:
	//
	// 常に利用可能なプロパティ(preRenderConfig、renderConfig):
	//   moonbeamInstance: 現在レンダリング中のチャートインスタンス
	//   data: レンダリング中のデータセット
	//   properties: ユーザーによって設定された拡張機能のプロパティブロック
	//   modules: 拡張機能の設定からの'modules'オブジェクトと追加のAPIメソッド
	//
	// レンダリングコールバック時に利用可能なプロパティ(renderConfig):
	//   width: 拡張機能がレンダリングされるコンテナの幅（px）
	//   height: 拡張機能がレンダリングされるコンテナの高さ（px）
	//   containerIDPrefix: 拡張機能がレンダリングされるDOMコンテナのID。拡張機能が生成する全てのIDの前にこれを付加し、1ページ上で拡張機能の複数のコピーが動作することを保証します。
	//   container: 拡張機能がレンダリングされるDOMノード
	//   rootContainer: レンダリング中の特定のチャートエンジンインスタンスを含むDOMノード

	/**
	 * チャートエンジンの初期化時に1回だけ呼び出されます（オプション）
	 * @param {Function} successCallback - 拡張機能が完全に初期化された時に呼び出す必要のある関数。初期化が成功した場合はtrue、そうでない場合はfalseを渡します。
	 * @param {Object} initConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function initCallback(successCallback, initConfig) {
		successCallback(true);
		// 初回のみ実行する処理を記述
		// 例: プロパティを取得
		// const properties = initConfig.properties;
	}

	/**
	 * データを含まない各描画の前に1回呼び出されます（オプション）
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataPreRenderCallback(preRenderConfig) {
		console.log('noDataPreRenderCallback:', preRenderConfig);
		// 実行前に実行する処理を記述
	}
	
	/**
	 * この拡張機能を描画する必要があるが、まだデータがない場合に呼び出されます（オプション）
	 * @param {Object} renderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataRenderCallback(renderConfig) {
		console.log('noDataRenderCallback:', renderConfig);
		// サンプルデータとバケットを使用してrenderCallbackを呼び出す
		// renderConfig.data= [
		// 	[
		// 	  [
		// 		'ENGLAND'
		// 	   ,37853
		// 	  ]
		// 	 ,[
		// 		'FRANCE'
		// 	   ,4631
		// 	  ]
		// 	]
		// ];
		// renderConfig.dataBuckets = {
		// 	labels: {
		// 	  title: 'Country'
		// 	}
		// 	,value: {
		// 	  title: 'Sales'
		// 	}
		// };
		// renderCallback(renderConfig);
		//　または、データが無い場合のメッセージを表示する
		
		const container = renderConfig.container;
	}

	/**
	 * 各チャートエンジンの描画サイクルの最初に1回呼び出されます（オプション）
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト
	 */
	function preRenderCallback(preRenderConfig) {
		console.log('preRenderCallback:', preRenderConfig);
		// 実行前に実行する処理を記述
	}

	/**
	 * 各チャートエンジンの描画サイクル中に呼び出されます（必須）
	 * ここで拡張機能をレンダリングする必要があります
	 * @param {Object} renderConfig - width、heightなどの追加プロパティを含む標準のコールバック引数オブジェクト
	 * @param {object} renderConfig.moonbeamInstance - Moonbeamインスタンス
	 * @param {object} renderConfig.properties - プロパティ
	 * @param {object} renderConfig.container - コンテナ
	 * @param {object} renderConfig.data - データ
	 * @param {object} renderConfig.dataBuckets - データバケット
	 * @param {object} renderConfig.dataBuckets.labels - ラベルデータバケット
	 * @param {object} renderConfig.dataBuckets.value - 値データバケット
	 * @param {function} renderConfig.renderComplete - レンダリング完了時に呼び出すコールバック関数
	 */
	function renderCallback(renderConfig) {
		// データをコンソールに表示
		console.log('renderCallback:', renderConfig);

		const props = renderConfig.properties; // 実行プログラムでセットされているプロパティ
		const container = renderConfig.container; // 出力先のコンテナ
		const data = renderConfig.data; // WebFOCUSが出力したデータ
		const dataBuckets = renderConfig.dataBuckets; // データバケット
		const buckets = dataBuckets.buckets; // バケットの配列
		const height = renderConfig.height; // 領域の高さ
		const width = renderConfig.width; // 領域の幅
		const dataContainer = document.createElement('div');

		// データコンテナの高さと幅を設定
		dataContainer.style.height = height + 'px';
		dataContainer.style.width = width + 'px';

		// データコンテナをスクロール可能にする
		dataContainer.style.overflow = 'scroll';

		// データコンテナのクラス名を設定
		dataContainer.className = 'data-container';

		// データコンテナのタイトルを設定
		dataContainer.innerHTML = '<h1>com.shimokado.params</h1>';
		dataContainer.innerHTML += '<h2>renderConfigオブジェクトをコンソールに表示しています</h2>';

		// データをコンソールに表示していることを示すメッセージを表示
		dataContainer.innerHTML = '<h2>ConsoleにrenderConfigオブジェクトを表示しています</h2>';

		// データを表示		
		// データコンテナにプロパティ、データバケット、データを表示
		dataContainer.innerHTML += '<h3>renderConfig.properties:</h3>';
		var propsTextArea = document.createElement('pre');
		propsTextArea.textContent = JSON.stringify(props, null, 2);
		dataContainer.appendChild(propsTextArea);
		
		dataContainer.innerHTML += '<h3>renderConfig.dataBuckets.buckets:</h3>';
		var dataBucketsTextArea = document.createElement('pre');
		dataBucketsTextArea.textContent = JSON.stringify(dataBuckets, null, 2);
		dataContainer.appendChild(dataBucketsTextArea);
		
		dataContainer.innerHTML += '<h3>renderConfig.data:</h3>';
		var dataTextArea = document.createElement('pre');
		dataTextArea.textContent = JSON.stringify(data, null, 2);
		dataContainer.appendChild(dataTextArea);

		// bucketsは、データの有無や個数によって扱いにくいため配列に統一する

		dataContainer.innerHTML += '<h2>bucketsのオブジェクトは常に配列にした方が使いやすい</h2>';

		// バケットが存在しない場合は空の配列を返し、存在する場合は常に配列を返す
		const labelsTitles = buckets.labels ? (Array.isArray(buckets.labels.title) ? buckets.labels.title : [buckets.labels.title]) : [];
		const labelsFieldNames = buckets.labels ? (Array.isArray(buckets.labels.fieldName) ? buckets.labels.fieldName : [buckets.labels.fieldName]) : [];
		const valueTitles = buckets.value ? (Array.isArray(buckets.value.title) ? buckets.value.title : [buckets.value.title]) : [];
		const valueFieldNames = buckets.value ? (Array.isArray(buckets.value.fieldName) ? buckets.value.fieldName : [buckets.value.fieldName]) : [];
		const valueNumberFormats = buckets.value ? (Array.isArray(buckets.value.numberFormat) ? buckets.value.numberFormat : [buckets.value.numberFormat]) : [];
		const detailTitles = buckets.detail ? (Array.isArray(buckets.detail.title) ? buckets.detail.title : [buckets.detail.title]) : [];

		// dataの配列内でもlabels, value, detailが存在しない場合と配列でない場合があるため、それを配列に変換する
		const datas = data.map(function(d) {
			return {
				labels: d.labels !== undefined ? (Array.isArray(d.labels) ? d.labels : [d.labels]) : [],
				value: d.value !== undefined ? (Array.isArray(d.value) ? d.value : [d.value]) : [],
				detail: d.detail !== undefined ? (Array.isArray(d.detail) ? d.detail : [d.detail]) : []
			};
		});

		// labelsTitlesを表示
		dataContainer.innerHTML += '<h3>labelsTitles:</h3>';
		var labelsTitlesTextArea = document.createElement('pre');
		labelsTitlesTextArea.textContent = JSON.stringify(labelsTitles, null, 2);
		dataContainer.appendChild(labelsTitlesTextArea);

		// labelsFieldNamesを表示
		dataContainer.innerHTML += '<h3>labelsFieldNames:</h3>';
		var labelsFieldNamesTextArea = document.createElement('pre');
		labelsFieldNamesTextArea.textContent = JSON.stringify(labelsFieldNames, null, 2);
		dataContainer.appendChild(labelsFieldNamesTextArea);

		// valueTitlesを表示
		dataContainer.innerHTML += '<h3>valueTitles:</h3>';
		var valueTitlesTextArea = document.createElement('pre');
		valueTitlesTextArea.textContent = JSON.stringify(valueTitles, null, 2);
		dataContainer.appendChild(valueTitlesTextArea);

		// valueeFieldNamesを表示
		dataContainer.innerHTML += '<h3>valueFieldNames:</h3>';
		var valueFieldNamesTextArea = document.createElement('pre');
		valueFieldNamesTextArea.textContent = JSON.stringify(valueFieldNames, null, 2);
		dataContainer.appendChild(valueFieldNamesTextArea);

		// valueNumberFormatsを表示
		dataContainer.innerHTML += '<h3>valueNumberFormats:</h3>';
		var valueNumberFormatsTextArea = document.createElement('pre');
		valueNumberFormatsTextArea.textContent = JSON.stringify(valueNumberFormats, null, 2);
		dataContainer.appendChild(valueNumberFormatsTextArea);

		// detailTitlesを表示
		dataContainer.innerHTML += '<h3>detailTitles:</h3>';
		var detailTitlesTextArea = document.createElement('pre');
		detailTitlesTextArea.textContent = JSON.stringify(detailTitles, null, 2);
		dataContainer.appendChild(detailTitlesTextArea);

		// datasを表示
		dataContainer.innerHTML += '<h3>datas(配列化したdata):</h3>';
		var datasTextArea = document.createElement('pre');
		datasTextArea.textContent = JSON.stringify(datas, null, 2);
		dataContainer.appendChild(datasTextArea);


		// table要素を作成
		const table = document.createElement('table');
		table.className = 'data-table';
		// thead要素を作成
		const thead = document.createElement('thead');
		// tr要素を作成
		const tr = document.createElement('tr');
		// th要素を作成(labesTitles, valueTitles, detailTitlesの数だけ作成)
		labelsTitles.forEach(function(title) {
			const th = document.createElement('th');
			th.textContent = title;
			tr.appendChild(th);
		});
		valueTitles.forEach(function(title) {
			const th = document.createElement('th');
			th.textContent = title;
			tr.appendChild(th);
		});
		detailTitles.forEach(function(title) {
			const th = document.createElement('th');
			th.textContent = title;
			tr.appendChild(th);
		});
		thead.appendChild(tr);
		table.appendChild(thead);

		// tbody要素を作成
		const tbody = document.createElement('tbody');
		// datasを元にtr要素を作成（labels, value, detailの数だけ作成）
		datas.forEach(function(d) {
			const tr = document.createElement('tr');
			// labelsを元にtd要素を作成
			d.labels.forEach(function(label) {
				const td = document.createElement('td');
				td.textContent = label;
				tr.appendChild(td);
			});
			// valueを元にtd要素を作成
			d.value.forEach(function(value, i) {
				const td = document.createElement('td');
				td.textContent = value ?? ' ';
				if (valueNumberFormats[i]) {
					td.style.textAlign = 'right';
					td.style.paddingRight = '10px';
					// 数値フォーマットを適用(moonbeamInstanceには、このように便利な関数が用意されている)
					td.textContent = renderConfig.moonbeamInstance.formatNumber(value, valueNumberFormats[i]);
				}
				tr.appendChild(td);
			});
			// detailを元にtd要素を作成
			d.detail.forEach(function(detail) {
				const td = document.createElement('td');
				td.textContent = detail;
				tr.appendChild(td);
			});
			tbody.appendChild(tr);
		});
		table.appendChild(tbody);
		dataContainer.appendChild(table);

		// データを表示
		container.appendChild(dataContainer);

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	var config = {
		id: 'com.shimokado.params',	// エクステンションID
		containerType: 'html',	// // 'html'または'svg'（デフォルト）
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {
			/* 配列の中にオブジェクトを入れることで、外部ライブラリの読み込み順序を指定できる
			*/
			// script: [],
			// css: []
			script: ['lib/script.js'],
			css: ['css/style.css']

			// コールバック関数を使用して動的に読み込む外部ライブラリを定義する例
			// callbackArgは'properties'を含む標準のコールバック引数オブジェクトです
			// これはライブラリ読み込み時に呼び出されるため、チャートインスタンスはまだ利用できません
			// function(callbackArg) {
			// 	return callbackArg.properties.external_library;
			// }
			// ※ このサンプルでは、properties.external_libraryを参照していません。
		},
		modules: {
			dataSelection: {
				supported: true,  // 拡張機能でデータ選択を有効にする場合はtrueに設定
				needSVGEventPanel: false, // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、これをtrueに設定すると、チャートエンジンがユーザー操作を捕捉するために必要なSVG要素を挿入します
				svgNode: function() {}  // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、ルートSVGノードへの参照をここで返します
			},
			eventHandler: {
				supported: true // イベントハンドラを有効にする場合はtrueに設定
			},
			tooltip: {
				supported: true,  // 拡張機能でHTMLツールチップを有効にする場合はtrueに設定
				// デフォルトのツールチップコンテンツがチャートに渡されない場合にこのコールバックが呼び出されます
				// 指定されたターゲット、ID、データに対して'nice'なデフォルトツールチップを定義するために使用します
				// 戻り値は文字列（HTMLを含む）、HTMLノード、またはMoonbeamツールチップAPIオブジェクトのいずれかです
				autoContent: function(target, s, g, d) {
					return d.labels + ': ' + d.value; // 単純な文字列を返す
				}
			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);
}());
```
* com.shimokado.simple_bar.js
```javascript
/*global tdgchart: false, pv: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function () {

	// すべての拡張機能コールバック関数には標準の'renderConfig'引数が渡されます：
	//
	// 常に利用可能なプロパティ：
	//   moonbeamInstance: 現在レンダリング中のチャートインスタンス
	//   data: レンダリング中のデータセット
	//   properties: ユーザーによって設定された拡張機能のプロパティブロック
	//   modules: 拡張機能の設定からの'modules'オブジェクトと追加のAPIメソッド
	//
	// レンダーコールバック時に利用可能なプロパティ：
	//   width: 拡張機能がレンダリングされるコンテナの幅（px）
	//   height: 拡張機能がレンダリングされるコンテナの高さ（px）
	//   containerIDPrefix: 拡張機能がレンダリングされるDOMコンテナのID。1ページ上で拡張機能の複数のコピーが動作するように、生成するすべてのIDの前にこれを付加します。
	//   container: 拡張機能がレンダリングされるDOMノード
	//   rootContainer: レンダリングされる特定のチャートエンジンインスタンスを含むDOMノード


	// オプション: 定義されている場合、チャートエンジンの初期化時に1回だけ呼び出されます
	// 引数:
	//  - successCallback: 拡張機能が完全に初期化されたときに呼び出す必要がある関数
	//     初期化が成功した場合はtrue、失敗した場合はfalseを渡します
	// - initConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	// オプション: 定義されている場合、データを含まない描画の前に1回呼び出されます
	// 引数:
	//  - preRenderConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	// オプション: 定義されている場合、拡張機能を描画する必要があるがデータがまだない場合に呼び出されます
	// 拡張機能の初期の「グレー状態」の外観を定義するために使用します
	// 引数:
	//  - renderConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [
			[{ value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }],
			[{ value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }]
		];
		renderConfig.dataBuckets.depth = 2;
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
	}

	// オプション: 定義されている場合、各チャートエンジンの描画サイクルの最初に1回呼び出されます
	// レンダリング前に特定のチャートエンジンインスタンスを設定するために使用します
	// 引数:
	//  - preRenderConfig: 標準コールバック引数オブジェクト
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;

		// この拡張機能のフォルダパスにあるファイルを手動で読み込んで使用する例
		var info = tdgchart.util.ajax(preRenderConfig.loadPath + 'lib/extra_properties.json', { asJSON: true });



		if (!chart.title.visible) {    //開発者がGRAPHリクエストでHEADINGを設定していない場合、preRenderConfig.loadPath + 'lib/extra_properties.json'にあるカスタムタイトルを使用
			// チャートエンジンの組み込みタイトルプロパティの使用例
			chart.title.visible = true;
			chart.title.text = info.custom_title;
		} // if (!chart.title.visible) //開発者がGRAPHリクエストでFOOTINGを設定していない場合、カスタムプログラムによるフッター割り当ての例として'footnote'テキストを使用

		if (!chart.footnote.visible) {
			chart.footnote.visible = true;
			chart.footnote.text = 'footnote';
			chart.footnote.align = 'right';

		} //if (!chart.footnote.visible)




	}

	// 必須: 各チャートエンジンの描画サイクル中に呼び出されます
	// ここで拡張機能をレンダリングします
	// 引数:
	//  - renderConfig: width、heightなどの追加プロパティを含む標準コールバック引数オブジェクト
	// このシンプルな棒グラフ拡張機能は以下をサポートします:
	//  - 汎用的な'value'バケットの複数の測定エントリ。各値は独自のsplit-y軸に描画されます。
	//  - 汎用的な'labels'バケットの1次元エントリ。このバケットは順序軸のラベルセットを定義します。
	//  - 組み込みの'series_break'バケットの1次元エントリ。これにより各値エントリが類似した複数の色に分割されます。
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var w = renderConfig.width;
		var h = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');

		// series_breakに何もない場合、dataBuckets.depthは1になり、dataは単純な配列オブジェクトになります。
		// series_breakの有無に関わらず、内部データが常に2次元配列になるように正規化します。
		if (renderConfig.dataBuckets.depth === 1) {
			data = [data];
		}

		// 1つの測定値しかない場合、measure titleは配列ではなく文字列なので、これも正規化します
		if (renderConfig.dataBuckets.buckets.value && !Array.isArray(renderConfig.dataBuckets.buckets.value.title)) {
			renderConfig.dataBuckets.buckets.value.title = [renderConfig.dataBuckets.buckets.value.title];
		}

		// データセット全体から一意な軸ラベルのリストを作成
		var axisLabels = pv.blend(data).map(function (el) { return el.labels; }).filter(function () {
			var seen = {};
			return function (el) {
				return el != null && !(el in seen) && (seen[el] = 1);
			};
		}());

		// ラベルバケットが空の場合、'Label X'プレースホルダーを使用
		if (!axisLabels.length) {
			var labelCount = d3.max(data, function (el) { return el.length; });
			axisLabels = d3.range(0, labelCount).map(function (el) { return 'Label ' + el; });
		}

		var splitYCount = tdgchart.util.get('dataBuckets.buckets.value.count', renderConfig, 1);
		var splitYData = [];

		// データは{value: [a, b, c]}エントリの配列の配列として到着します。
		// 'value'の各エントリは独自のsplit-y軸に描画されます
		// その長いリストを分割して、各split-y軸用の値のリストを作成します
		data.forEach(function (array) {
			array.forEach(function (el, i) {
				el.value = Array.isArray(el.value) ? el.value : [el.value];
				if (!el.labels) {
					el.labels = 'Label ' + i;
				}
				el.value.forEach(function (v, idx) {
					splitYData[idx] = splitYData[idx] || [];
					var labelIndex = axisLabels.indexOf(el.labels);
					if (labelIndex >= 0) {
						splitYData[idx][labelIndex] = splitYData[idx][labelIndex] || [];
						splitYData[idx][labelIndex].push({
							value: v, yaxis: idx, labels: el.labels
						});
					}
				});
			});
		});

		// 各スタックの各ライザーの開始位置と終了位置のためのY値を計算
		splitYData.forEach(function (el) {
			el.forEach(function (stack) {
				var acc = 0;
				stack.forEach(function (d) {
					d.y0 = acc;
					d.y1 = acc + d.value;
					acc += d.value;
				});
			});
		});

		var xLabelHeight = 25;
		var yHeight = (h - xLabelHeight) / splitYCount;
		var x = d3.scale.ordinal().domain(axisLabels).rangeRoundBands([xLabelHeight, w - 25], 0.2);
		var yScaleList = splitYData.map(function (el) {
			var ymax = d3.max(el.map(function (a) { return d3.sum(a, function (d) { return d.value; }); }));
			return d3.scale.linear().domain([0, ymax]).range([yHeight, 20]);
		});

		var splitYGroups = container.selectAll('g')
			.data(splitYData)
			.enter().append('g')
			.attr('transform', function (d, i) {
				return 'translate(' + xLabelHeight + ', ' + (h - xLabelHeight - (yHeight * (i + 1))) + ')';
			});

		// 軸の区切り線を追加
		splitYGroups.append('path')
			.attr('d', function (d, i) {
				return 'M0,' + yScaleList[i](0) + 'l' + (w - 25) + ',0';
			})
			.attr('stroke', 'grey')
			.attr('stroke-width', 1)
			.attr('shape-rendering', 'crispEdges');

		// 回転したY軸のラベルを追加
		splitYGroups.append('text')
			.attr('transform', function () {
				return 'translate(-10,' + (yHeight / 2) + ') rotate(-90)';
			})
			.attr('fill', 'black')
			.attr('font-size', '12px')
			.attr('font-family', 'helvetica')
			.attr('text-anchor', 'middle')
			.text(function (d, i) { return tdgchart.util.get('dataBuckets.buckets.value.title[' + i + ']', renderConfig, ''); });

		// スタックでグループ化されたライザーを追加
		var riserGroups = splitYGroups.selectAll('g')
			.data(function (d) {
				return d;  // d: ライザーデータの単純な配列
			})
			.enter().append('g');

		// 実際のライザーを描画
		riserGroups.selectAll('rect')
			.data(function (d) {
				return d;  // d: 単一の{y0, y1, label}データ（ついに！）
			})
			.enter().append('rect')
			.attr('shape-rendering', 'crispEdges')
			.attr('x', function (d) {
				return x(d.labels);
			})
			.attr('y', function (d) {
				return yScaleList[d.yaxis](d.y1);
			})
			.attr('width', x.rangeBand())
			.attr('height', function (d) {
				return Math.abs(yScaleList[d.yaxis](d.y1) - yScaleList[d.yaxis](d.y0));
			})
			.attr('class', function (d, s, g) {

				// データ選択、イベント、ツールチップをサポートするために、各ライザーには適切なseriesIDとgroupIDを含むクラス名が必要です
				// クラス名を作成するにはchart.buildClassNameを使用します
				// 第1引数は'riser'、第2引数はseriesID、第3引数はgroupID、第4引数は拡張機能でライザーを識別するための任意の文字列です
				return chart.buildClassName('riser', s, g, 'bar');
			})
			.attr('fill', function (d, s) {

				// getSeriesAndGroupPropertyは、シリーズに依存するプロパティを簡単に検索できる便利な関数です
				// プロパティはドット記法で指定できます（例：'marker.border.width'）
				return chart.getSeriesAndGroupProperty(s, null, 'color');
			})
			.each(function (d, s, g) {

				// addDefaultToolTipContentは、組み込みのチャートタイプと同じツールチップをこのライザーに追加します
				// このノードには完全修飾されたシリーズ＆グループのクラス文字列が含まれていることを前提としています
				// addDefaultToolTipContentはオプションの引数を受け付けることもできます：
				// addDefaultToolTipContent(target, s, g, d, data)は、このノードにクラスがない場合や
				// デフォルトのシリーズ/グループ/データの検索ロジックをオーバーライドする場合に便利です
				renderConfig.modules.tooltip.addDefaultToolTipContent(this, s, g, d);
			});

		// 下部の順序X軸ラベルを追加
		container.append('g')
			.selectAll('text')
			.data(axisLabels)
			.enter().append('text')
			.attr('transform', function (d) {
				return 'translate(' + (x(d) + xLabelHeight + (x.rangeBand() / 2)) + ',' + (h - 5) + ')';
			})
			.attr('fill', 'black')
			.attr('font-size', '12px')
			.attr('font-family', 'helvetica')
			.attr('text-anchor', 'middle')
			.text(function (d, i) { return axisLabels[i]; });

		renderConfig.renderComplete();
	}

	// 拡張機能の設定
	var config = {
		id: 'com.shimokado.simple_bar',     // この拡張機能を一意に識別する文字列
		containerType: 'svg',  // 'html'または'svg'（デフォルト）
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。以下で定義される'preRenderConfig'オブジェクトが渡されます。Monbeamインスタンスの設定に使用
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。'renderConfig'オブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // この拡張機能に必要な追加の外部リソース（CSSとJS）
			script: [
				// 動的に読み込む外部ライブラリを定義するための関数コールバックの使用例
				// callbackArgは'properties'を含む標準のコールバック引数オブジェクトです
				// これはライブラリ読み込み時に呼び出されるため、チャートインスタンスはまだ利用できません
				function (callbackArg) {
					return callbackArg.properties.external_library;
				}
			]
		},
		modules: {
			dataSelection: {
				supported: true,  // データ選択を有効にする場合はtrueに設定
				needSVGEventPanel: false, // HTMLコンテナを使用するか、SVGコンテナを変更する場合はtrueに設定。チャートエンジンがユーザー操作を捕捉するために必要なSVG要素を挿入します
				svgNode: function () { }  // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、ルートSVGノードへの参照をここで返します
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,  // HTMLツールチップを有効にする場合はtrueに設定
				// デフォルトのツールチップコンテンツがチャートに渡されない場合に呼び出されるコールバック
				// 指定されたターゲット、ID、データに対する「良い」デフォルトツールチップを定義するために使用
				// 戻り値は文字列（HTMLを含む）、HTMLノード、またはMoonbeamツールチップAPIオブジェクトのいずれか
				autoContent: function (target, s, g, d) {
					if (d.hasOwnProperty('color')) {
						return '棒の大きさ: ' + d.value + '<br />棒の色: ' + d.color;
					}
					return '棒の大きさ: ' + d.value;
				}
			}
			// この拡張機能では使用されていません。ドキュメント目的で記載
			//			colorScale: {
			//				supported: true,
			//				minMax: function(arg){}  // オプション: カラースケールの最小値と最大値に使用する{min, max}オブジェクトを返します
			//			}
			//			sizeScale: {
			//				supported: false,
			//				minMax: function(arg){}  // オプション: サイズスケールの最小値と最大値に使用する{min, max}オブジェクトを返します
			//			},
			//			legend: {
			//				colorMode: function(arg){}, // 'data'または'series'を返します。実装すると、チャートエンジンはこのカラーモードの凡例を使用します
			//				sizeMode: function(arg){},  // 'size'またはfalsey値を返します。実装すると、チャートエンジンはこのサイズ凡例を使用します
			//			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);

})();
```


