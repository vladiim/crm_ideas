var margin = {top: 80, right: 80, bottom: 80, left: 100},
    width = 960 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var randomN = function() {
  return (Math.random() * (10.0 - 0.1) + 0.1)
}

// setup x 
var xValue = function(d) { return ((d.effort * 10) + randomN()); }, // data -> value
    xScale = d3.scale.linear().range([0, width - 50]).domain([0, 110]), // value -> display
    xMap   = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis  = d3.svg.axis().scale(xScale).ticks(10).orient("bottom");

// setup y
var yValue = function(d) { return ((d.effectiveness * 10) + randomN() - 10); }, // data -> value
    yScale = d3.scale.linear().range([height, 0]).domain([0, 110]), // value -> display
    yMap   = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis  = d3.svg.axis().scale(yScale).ticks(10).orient("left");

// setup fill color
var cValue = function(d) { return d.context; },
    color  = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select(".dotplot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x-axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")") // move the x axis down
    .call(xAxis)
  .append("text")
    .attr("class", "label")
    .attr("x", width - 50)
    .attr("y", - 6)
    .style("text-anchor", "end")
    .text("Effort");

// y-axis
svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Effectiveness");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// return data based on the selected idea
var filterByIdea = function(data, idea) {
  return data.filter(function(d) {
    return d.idea == idea;
  });
};

var drawDots = function(data) {
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      .on("mouseover", mouseOverDot)
      .on("mouseout", mouseOutDot);
};

var mouseOverDot = function(data) {
  tooltip.transition()
       .duration(100)
       .style("opacity", .9)
       .style('background', 'lightgrey')
       .style("padding", "2px")
       .style("font-size", "14px");
  tooltip.html(renderTooltip(data))
       .style("left", (d3.event.pageX + 8) + "px")
       .style("top", (d3.event.pageY - 10) + "px");
}

var mouseOutDot = function() {
  tooltip.transition()
       .duration(500)
       .style("opacity", 0);
}

var resources, insights, resourcesList, insightsList, resourcesTemplate, insightsTemplate;
var renderTooltip = function(data) {
  resources = data.resources.split('_');
  resources.shift();
  resourcesList     = "<% _.each(resources, function(element) { %> <li><%= element.replace('�', '') %></li> <% }); %>";
  resourcesTemplate = _.template(resourcesList, resources)

  insights = data.insights.split('_');
  insights.shift();
  insightsList = "<% _.each(insights, function(element) { %> <li><%= element.replace('�', '') %></li> <% }); %>";
  insightsTemplate = _.template(insightsList, insights);

  return '<h4>' + data.title + '</h4><p>' + data.description + '</p><p><b>Persona:</b> ' + data.persona + '</p><ul>' + insightsTemplate + '</ul><b>Resources</b><ul>' + resourcesTemplate + '</ul>';
}

d3.csv("/data/contact_strategy_v1.0.csv", function(error, data) {

  // Unique list of ideas from 'idea' column
  var ideas = _.chain(data).pluck("idea").unique().value();
  ideas.unshift("All");

  // Build the dropdown menu
  d3.select(".ideaDropdown")
    .append("select")
    .selectAll("option")
    .data(ideas)
    .enter()
    .append("option")
    .attr('value', function(d) { return d; })
    .text(function(d) { return d; })

  d3.select("select")
    .on("change", function() {
      var value = this.options[this.selectedIndex].value;
      svg.selectAll(".dot").remove();
      if (value == "All") {
        drawDots(data);
      } else {
        drawDots(filterByIdea(data, value));
      }
    })

  drawDots(data);

 // draw legend
  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// draw legend colored rectangles
  legend.append("rect")
    .attr("x", width - 25)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

 // draw legend text
  legend.append("text")
    .attr("x", width - 5)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "left")
    .text(function(d) { return d;})
});