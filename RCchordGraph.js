d3.text('network.csv', function(error, data) {
    
    var data = d3.csv.parseRows(data);
    data.forEach(function(arr) { 
        arr.forEach( function(num, index) {
            arr[index] = +num;
        })})

    console.log(data);

    var chord = d3.layout.chord()
        .padding(0)
        .sortSubgroups(d3.descending)
        .matrix(data);

    var width = 1000,
        height = 700,
        innerRadius = Math.min(width, height) * .4,
        outerRadius = innerRadius * 1.1;

    var fill = d3.scale.category20b();

    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g").selectAll("path")
    .data(chord.groups)
  .enter().append("path")
    .style("fill", function(d) { return fill(d.index); })
    .style("stroke", function(d) { return fill(d.index); })
    .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
    .on("mouseover", fade(.1))
    .on("mouseout", fade(1));

console.log(chord.groups());

    svg.append("g")
    .attr("class", "chord")
  .selectAll("path")
    .data(chord.chords)
  .enter().append("path")
    .attr("d", d3.svg.chord().radius(innerRadius))
    .style("fill", function(d) { return fill(d.target.index); })
    .style("opacity", 1);


    // Returns an event handler for fading a given chord group.
function fade(opacity) {
  return function(g, i) {
    svg.selectAll(".chord path")
        .filter(function(d) { return d.source.index != i && d.target.index != i; })
      .transition()
        .style("opacity", opacity);
  };
}
});


