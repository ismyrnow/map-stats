var margin = {top: 10, right: 10, bottom: 30, left: 220},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../data/mapgeo_grotonma_stats.csv", function(rawData) {

  // Convert individual actions into groups, grouping by actions,
  // and calculating the total count of those actions.
  var data = d3.nest() // group data
    .key(function(x) { return x.category + " - " + x.use; }) // key -> "category - use"
    .rollup(function(x) { return d3.sum(x, function(y) { return y.count; }); }) // values -> sum(count)
    .entries(rawData) // plugin our array of data
    .map(function(x) { return { "name": x.key, "count": x.values }; }) // { key, values } -> { name, count }
    .sort(function(a, b) { return d3.ascending(a.name, b.name); });

  // Specify the domain for X and Y coordinates
  x.domain([0, d3.max(data, function(d) { return d.count; })]);
  y.domain(data.map(function(d) { return d.name; }));

  // Add the vertical X axis lines
  svg.selectAll("y-axis-line")
      .data(x.ticks(10))
    .enter().append("line")
      .attr("class", "y-axis-line")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "#ccc");

  // Add the X axis labels
  svg.selectAll(".rule")
      .data(x.ticks(10))
    .enter().append("text")
      .attr("class", "rule")
      .attr("x", x)
      .attr("y", 0)
      .attr("dy", -3)
      .attr("text-anchor", "middle")
      .text(String);

  // Add the X axis and 'Count' label.
  // svg.append("g")
  //     .attr("class", "x axis")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(xAxis)
  //   .append("text")
  //     .attr("x", width)
  //     .attr("dy", "-.71em")
  //     .style("text-anchor", "end")
  //     .text("Count");

  // Add the bars.
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("width", function(d) { return x(d.count); })
      .attr("y", function(d) { return y(d.name); })
      .attr("height", y.rangeBand());

  // Add the count labels inside of the bars.
  svg.selectAll(".count")
      .data(data)
    .enter().append("text")
      .attr("class", "count")
      .attr("x", function(d) { return x(d.count); })
      .attr("y", function(d) { return y(d.name) + y.rangeBand() / 2; })
      .attr("dx", -2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { return d.count >= 30 ? d.count : ""; });

  // Add the Y axis.
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // Event listener for checkbox
  d3.select("input").on("change", change);

  // Sort function
  function change() {
    // Copy-on-write since tweens are evaluated after a delay.
    var y0 = y.domain(data.sort(this.checked
        ? function(a, b) { return b.count - a.count; }
        : function(a, b) { return d3.ascending(a.name, b.name); })
        .map(function(d) { return d.name; }))
        .copy();

    var transition = svg.transition().duration(600);
    var delay = function(d, i) { return i * 40; };

    // Transition the bars.
    transition.selectAll(".bar")
        .delay(delay)
        .attr("y", function(d) { return y0(d.name); });

    // Transition the Y axis labels.
    transition.select(".y.axis")
        .call(yAxis)
      .selectAll("g")
        .delay(delay);        

    // Add the count labels inside of the bars.
    transition.selectAll(".count")
      .delay(delay)
      .attr("y", function(d) { return y(d.name) + y.rangeBand() / 2; });
  }
});