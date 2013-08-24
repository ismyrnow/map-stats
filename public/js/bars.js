var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../data/mapgeo_grotonma_stats.csv", function(data) {

  window.data = data;

  // Convert individual actions into groups, grouping by actions,
  // and calculating the total count of those actions.
  var actions = d3.nest() // group data
    .key(function(x) { return x.category + " - " + x.use; }) // key -> "category - use"
    .rollup(function(x) { return d3.sum(x, function(y) { return y.count; }); }) // values -> sum(count)
    .entries(data) // plugin our array of data
    .map(function(x) { return { "name": x.key, "count": x.values }; }); // { key, values } -> { name, count }

  // Specify the domain for X and Y coordinates
  x.domain(actions.map(function(d) { return d.name; }));
  y.domain([0, d3.max(actions, function(d) { return d.count; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Count");

  svg.selectAll(".bar")
      .data(actions)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.count); })
      .attr("height", function(d) { return height - y(d.count); });

});