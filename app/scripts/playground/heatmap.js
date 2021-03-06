/*jslint browser: true*/
/*global $, jQuery, d3, _*/

if (d3.charts === null || typeof(d3.charts) !== "object") { d3.charts = {}; }

// Based on http://bost.ocks.org/mike/chart/
this.d3.charts.heatmap = function() {
 'use strict';

  var width  = 1000,
      height = 600,
      controlHeight = 30,
      svg = {},
      legend = [],
      margin = {top: 10, right: 184, bottom: 20, left: 168},
      titleMargin = {top: 30},
      rowTitleMargin = {top: 60},
      titleText = "HEATMAP CHART EXAMPLE",
      subTitleText = "Subtext as needed",
      grouped = true;

    var topMargin  = function () {
      var top = margin.top + titleMargin.top + rowTitleMargin.top;
      top += grouped ? controlHeight : 0;
      return top;
    };

  function my(selection) {
    var chartWidth    = 0,
        chartHeight   = 0,
        x  = {},
        x2 = {},
        y  = {},
        title    = {},
        categorySelect = {},
        heatmap  = {},
        columns  = {},
        meta     = {},
        controls = {},
        rows     = {};

    var drawHeatmap = function(data) {
      // Update domains with newest data set
      x.domain(d3.utilities.uniqueProperties(data, 'xAxis'));
      y.domain(d3.utilities.uniqueProperties(data, 'yAxis'));

      // Enter, Update, Exit squares
      var rect  = heatmap.selectAll("g.heatmap .square").data(data);
      rect.enter().append("rect")
          .attr("class", "square")
          .attr("style", function(d) {return "fill:"+d.color; });
      rect
          .attr("x", function(d) { return x(d.xAxis);})
          .attr("y", function(d) { return y(d.yAxis);})
          .attr("rx", 0)
          .attr("ry", 0)
          .attr("width", x.rangeBand())
          .attr("height", y.rangeBand())
          .transition()
          .style("fill", function(d) {return d.color;});
      rect.exit().remove();

      // Enter, Update, Exit text values
      var cellFont = d3.scale.linear().domain([0,10000, 125000, 250000]).range(['small', 'small', 'medium', 'large']);
      var area = x.rangeBand() * y.rangeBand();
      var value = heatmap.selectAll("g.heatmap .cell.value").data(data);

      value.enter().append("text");
      value
          .attr("text-anchor", "middle")
          .attr("x", function(d) { return x(d.xAxis);})
          .attr("y", function(d) { return y(d.yAxis);})
          .attr("dy", function() { return y.rangeBand()/2 + 4;})
          .attr("dx", function() { return x.rangeBand()/2;})
          .attr('class', 'cell value ' + cellFont(area))
          .text(function(d) {return d.value;} )
      value.exit().remove();

      rowColumnLabels();
    };

    var drawControls = function(categories) {
      controls = svg.append("g")
          .attr("class", "controls")
          .attr("transform", "translate(" + margin.left + "," + (topMargin() - rowTitleMargin.top - controlHeight) + ")")
      controls.append("rect")
          .attr("class", "border")
          .attr("x", 0)
          .attr("y", 0)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("width", chartWidth)
          .attr("height", controlHeight);

      var controlsBox = controls.selectAll(".text").data(categories).enter().append("g")
      controlsBox
          .attr("category", function(d) {return d})
        .append("rect")
          .attr("class", "control-box")
          .attr("x", function(d) {return x2(d)})
          .attr("y", 0)
          .attr("width", x2.rangeBand())
          .attr("height", controlHeight)
      controlsBox
        .append("text")
          .attr("x", function(d) {return (x2(d) + x2.rangeBand()/2)})
          .attr("y", 20)
          .attr("width", x2.rangeBand())
          .attr("height", controlHeight)
          .text(function(d) {return d})
          .attr("style", "cursor: pointer;")
          .on("click", categorySelect);
    }

    var setMetaData = function(clicked) {
      var category = meta.selectAll('category').data([clicked]);
      category.enter().append("category");
      category.text(function(d) { return d;});
    }

    var rowColumnLabels = function() {
      var columnLabel = columns.selectAll("g.top-nav .text").data(x.domain());
      columnLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .attr("class", "column-label")
          .attr("style", "height:" + rowTitleMargin.top + "px; width:" +x.rangeBand()+ "px;")
        .append("xhtml:div")
          .html(function(schema) {return schema;});;
      columnLabel
          .attr("width",  x.rangeBand())
          .attr("height", rowTitleMargin.top)
          .attr("x", function(d) {return x(d)})
          .attr("y", function(d) {return y(y.domain()[0])})
      columnLabel.exit().remove();

      var rowLabel = rows.selectAll("g.left-nav .text").data(y.domain());
     rowLabel.enter().append("svg:foreignObject").attr("class", "text").append("xhtml:div")
          .attr("class", "row-label")
          .html(function(schema) {return schema;});;
      rowLabel
          .attr("width",  margin.left)
          .attr("height", y.rangeBand())
          .attr("x", function(d) {return x(x.domain()[0])})
          .attr("y", function(d) {return y(d)})
          .attr("style", "line-height:"+y.rangeBand()+"px")
      rowLabel.exit().remove();
    }

    var drawLegend = function() {
      var color  = d3.scale.ordinal()
          .domain(_.map(legend, function(d) {return d.name}))
          .range(_.map(legend, function(d) {return d.color}));
      var d3Legend = d3.charts.legend().color(color);

      d3Legend
          .y(topMargin() - rowTitleMargin.top )
          .x(chartWidth + 30 + margin.right);
      svg.datum(_.map(legend, function(d) { return d.name })).call(d3Legend);
    }

    selection.each(function(data) {
      // Setup functions now that we have data
      var categories = d3.utilities.uniqueProperties(data, 'name');
      if (categories.length <= 1) { grouped = false; }
      chartWidth    = width  - margin.left - margin.right;
      chartHeight   = height - topMargin() - margin.bottom;
      x  = d3.scale.ordinal().rangeRoundBands([0, chartWidth]);
      x2 = d3.scale.ordinal().rangeRoundBands([0, chartWidth]);
      y  = d3.scale.ordinal().rangeRoundBands([0, chartHeight]);
      title    = d3.charts.chartTitle().title(titleText).subTitle(subTitleText);

      x2.domain(categories)

      // Function on what to do with data after visualization is interacted
      categorySelect = function(clicked) {
        controls.select(".selected").attr("class","")
        controls.select("[category=\""+clicked+"\"]").attr("class","selected")

        var chartData = _.find(data, function(d) {return d.name == clicked}).data;
        drawHeatmap(chartData);
        setMetaData(clicked);
      }

      // SVG Container
      svg = d3.select(this).append("svg")
          .attr("class", "heatmap")
          .attr("width",  chartWidth  + margin.left + margin.right)
          .attr("height", chartHeight + topMargin() + margin.bottom);

      // Chart title
      title.x(16).y(margin.top);
      svg.call(title);

      // Legend
      if (! _.isEmpty(legend)) {
        drawLegend();
      }


      // Heatmap
      heatmap = svg.append("g").attr("class", "heatmap")
          .attr("transform", "translate(" + margin.left + "," + topMargin() + ")");

      // Row Labels
      columns = svg.append("g")
          .attr("class", "top-nav")
          .attr("transform", "translate(" + margin.left + "," + (topMargin() - rowTitleMargin.top) + ")")

      // Column Labels
      rows = svg.append("g")
          .attr("class", "left-nav")
          .attr("transform", "translate(" + (0) + "," + topMargin() + ")")

      // Group selection
      meta = svg.append("meta-data");

      // Controls
      if (categories.length > 1) {
        drawControls(categories);
        categorySelect(categories[0])
      }
      else {
        drawHeatmap(data[0].data);
      }

    });
  }

  // Getters and Setters
  my.width = function(value) {
    if (!arguments.length) { return width; }
    width = value;
    return my;
  };

  my.height = function(value) {
    if (!arguments.length) { return height; }
    height = value;
    return my;
  };

  my.svg = function() {
    return svg;
  };

  my.title = function(value) {
    if (!arguments.length) { return titleText; }
    titleText = value;
    return my;
  };

  my.subtitle = function(value) {
    if (!arguments.length) { return subTitleText; }
    subTitleText = value;
    return my;
  };

  my.legend = function(value) {
    if (!arguments.length) { return legend; }
    legend = value;
    return my;
  };

  return my;
};

