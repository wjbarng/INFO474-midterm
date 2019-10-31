'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let circle;
  const colors = {
    "Bug": "#4E79A7",
    "Dark": "#A0CBE8",
    "Electric": "#F28E2B",
    "Fairy": "#FFBE&D",
    "Fighting": "#59A14F",
    "Fire": "#8CD17D",
    "Ghost": "#B6992D",
    "Grass": "#499894",
    "Ground": "#86BCB6",
    "Ice": "#86BCB6",
    "Normal": "#E15759",
    "Poison": "#FF9D9A",
    "Psychic": "#79706E",
    "Steel": "#BAB0AC",
    "Water": "#D37295"

}
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
    
    // get arrays of fertility rate data and life Expectancy data
    let def_data = data.map((row) => parseFloat(row["Sp. Def"]));
    let total_data = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(def_data, total_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    d3.select("body").append("text").text("Legendary: ")
    var legnedDropDown = d3.select("body")
                          .append("select")

    d3.select("body").append("text").text("Generation: ")
    var generationDropDown = d3.select("body")
                    .append("select")

    var leg = data.map((row) => row["Legendary"])
    var gen = data.map((row) => row["Generation"])

    var legend = ["All"].concat([...new Set(leg)])
    var generation = ["All"].concat([...new Set(gen)])

    var generationOptions = generationDropDown.selectAll("option")
                  .data(generation)
                  .enter()
                  .append("option")

    generationOptions.text(function (d) { return d})
    .attr("value", function(d) { return d});

    var legendOptions = legnedDropDown.selectAll("option")
                .data(legend)
                .enter()
                .append("option")
    
    legendOptions.text(function (d) { return d})
    .attr("value", function(d) { return d});

    let generationSelected = "All";
    let legendSelected = "All";
    generationDropDown.on("change", function() {
      generationSelected = this.value;
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";

      if (generationSelected == "All") {
        console.log("bye")
        if (legendSelected == "All") {
          circle.attr("display", display)
        } else {
          circle.filter(function(d) {return (legendSelected != d.Legendary);})
          .attr("display", displayOthers);
        
          circle.filter(function(d) {return legendSelected == d.Legendary;})
          .attr("display", display);
        }
      } else {
        if (legendSelected == "All") {
          circle.filter(function(d) {return generationSelected != d.Generation;})
          .attr("display", displayOthers);
          
          circle.filter(function(d) {return generationSelected == d.Generation;})
          .attr("display", display);
        } else {
          circle.filter(function(d) {return generationSelected != d.Generation || legendSelected != d.Legendary;})
          .attr("display", displayOthers);
          
          circle.filter(function(d) {return generationSelected == d.Generation && legendSelected == d.Legendary;})
          .attr("display", display);
        }
      }

    });

    legnedDropDown.on("change", function() {
      legendSelected = this.value;
      var displayOthers = this.checked ? "inline" : "none";
      var display = this.checked ? "none" : "inline";
      console.log(generationSelected)
      if (legendSelected == "All") {
        console.log("hi")
        if (generationSelected == "All") {
          circle.attr("display", display);
        } else {
            console.log("hihi")
            circle.filter(function(d) {return (generationSelected != d.Generation);})
            .attr("display", displayOthers);
          
            circle.filter(function(d) {return generationSelected == d.Generation;})
            .attr("display", display);
          }
      } else {
        if (generationSelected == "All") {
          circle.filter(function(d) {return legendSelected != d.Legendary;})
          .attr("display", displayOthers);
          
          circle.filter(function(d) {return legendSelected == d.Legendary;})
          .attr("display", display);
        } else {
          circle.filter(function(d) {return (legendSelected != d.Legendary || generationSelected != d.Generation);})
          .attr("display", displayOthers);
          
          circle.filter(function(d) {return legendSelected == d.Legendary && generationSelected == d.Generation;})
          .attr("display", display);
        }
      }

    });

  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 300)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 440)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 250)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    let pop_data = data.map((row) => +row["Sp. Def"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



    // append data to SVG and plot as points
    circle = svgContainer.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', xMap)
      .attr('cy', yMap)
      // .attr('r', (d) => pop_map_func(d["pop_mlns"]))
      .attr('r', 5)
      // .attr('fill', "white")
      .attr('fill', (d) => colors[d['Type 1']])
      // .style("stroke", "blue")
      // add tooltip functionality to points
      .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html("Name: " + d.Name + "<br/>" + 
                  "Type 1:" + d["Type 1"] + "<br/>" + 
                  "Type 2: " + d["Type 2"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 900]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
