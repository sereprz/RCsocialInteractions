d3.text('network.csv', function(error, data) {
   
    var data = d3.csv.parseRows(data);
    var labels = data.shift();

    data.forEach(function(el){
        el = el.map(function(num, index){
            el[index] = +num;
        })
    })

    var chord = d3.layout.chord()
        .padding(0)
        .sortSubgroups(d3.descending)
        .matrix(data);

    var width = 1000,
        height = 700,
        r1 = height / 2,
        innerRadius = Math.min(width, height) * .38,
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

    svg.append("g")
    .attr("class", "chord")
  .selectAll("path")
    .data(chord.chords)
  .enter().append("path")
    .attr("d", d3.svg.chord().radius(innerRadius))
    .style("fill", function(d) { return fill(d.target.index); })
    .style("opacity", 1);

    // svg.append("g").selectAll(".chord")
    //     .data(chord.chords)
    //     .enter().append("text")
    //     .attr({
    //         "dy": ".30em",
    //         "fill":"white",
    //         "text-anchor": function(d) { return ((d.source.startAngle + d.source.endAngle) / 2) > Math.PI ? "end" : null; },
    //         "transform": function(d) {
    //       return "rotate(" + (((d.source.startAngle + d.source.endAngle) / 2) * 180 / Math.PI - 90) + ")"
    //               + "translate(" + (outerRadius + 10) + ")"
    //               + "rotate(" +  -(((d.source.startAngle + d.source.endAngle) / 2) * 180 / Math.PI - 90) + ")"; }    })   
    //     .text(function(d) {  return labels[d.source.index];  } );

        svg.append("g").selectAll(".arc")
        .data(chord.groups)
        .enter().append("text")
        .attr({
            "dy": ".30em",
            "opacity": 0,
            "text-anchor": function(d) { return ((d.startAngle + d.endAngle) / 2) > Math.PI ? "end" : null; },
            "transform": function(d) {
          return "rotate(" + (((d.startAngle + d.endAngle) / 2) * 180 / Math.PI - 90) + ")"
                  + "translate(" + (outerRadius + 10) + ")"
                  + "rotate(" +  -(((d.startAngle + d.endAngle) / 2) * 180 / Math.PI - 90) + ")"; }    })   
        .text(function(d) {  return labels[d.index];  } );


    // Returns an event handler for fading a given chord group.
    function fade(opacity) {
      return function(g, i) {
        svg.selectAll(".chord path")
            .filter(function(d) { return d.source.index != i && d.target.index != i; })
          .transition()
            .style("opacity", opacity);

        svg.selectAll("text")
                .filter( function(d) { return d.index == i; })
                .attr("opacity", opacity < 1 ? 1:0) ;
        };
    }

});


