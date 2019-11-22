function buildCharts(edition) {
  // Use `d3.json` to fetch the sample data for the plots
  d3.json(`/piechart/year/${edition}`).then(function(data) {
  console.log(data);

  let points = data.value.slice(0,10);
  let countries = data.label.slice(0,10);
    

    var trace1 = {
      labels: countries,
      values: points,
      hovertext: points,
      hoverinfo: 'hovertext',
      type: 'pie'
    };
    var data = [trace1];
    var layout = {
      title: {
        text: `Belly Button Bacteria Repartition<br>`,
        font: {
          family: 'Courier New, monospace',
          size: 18,
          color: '#fff',
        },
      },
      margin: {
        l: 90,
        r: 30,
        b: 50,
        t: 50,
        pad: 0
      },
      paper_bgcolor:'rgba(255,255,255,0)',
      plot_bgcolor:'rgba(255,255,255,0)',
      autosize: false,
      height: 550,
      width: 500,
      legend: {
      orientation: "h",
      font: {
        family: 'sans-serif',
        size: 12,
        color: '#fff'
      }},
    };
    var PIE = document.getElementById("pie-chart");
    Plotly.newPlot(PIE, data, layout);
  });
};


function init() {

  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/editionname").then((editionNames) => {
    editionNames.forEach((names) => {
      selector
        .append("option")
        .text(names)
        .property("value", names);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = editionNames[0];
    buildCharts(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
}

// Initialize the dashboard
init();

//function buildCharts(from_country) {
//
  //// if the SVG Area isn’t empty when the browser loads,
  //// remove it and replace it with a resized version of the chart
  //var svgArea = d3.select("#barchart").select("svg");
  //if (!svgArea.empty()) {
    //svgArea.remove();
  //}
  //// Define SVG area dimensions
  //var svgWidth = 900;
  //var svgHeight = 650;
//
  //// Define the chart's margins as an object
  //var chartMargin = {
    //top: 30,
    //right: 30,
    //bottom: 30,
    //left: 80
  //};
//
  //// Define dimensions of the chart area
  //var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
  //var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
//
  //// Select body, append SVG area to it, and set the dimensions
  //var svg = d3
    //.select("#barchart")
    //.append("svg")
    //.attr("height", svgHeight)
    //.attr("width", svgWidth);
//
  //// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
  //// to the margins set in the "chartMargin" object.
  //var chartGroup = svg.append("g")
    //.attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
//
  //var barSpacing = 10; // desired space between each bar
  //var scaleY = 10; // 10x scale on rect height
//
  //// @TODO
//
//
  //// Load data from /barchart/<from_country>\
  //d3.json(`/barchart/${from_country}`).then(function (data, error) {
//
    //if (error) throw error;
    //retval = [];
    //for (var i = 0; i < data.to_country.length; i++) {
      //retval.push({ to_country: data.to_country[i], points: data.points[i] });
    //}
//
    //console.log(data);
//
    //// Configure a band scale for the horizontal axis with a padding of 0.1 (10%)
    //// var xBandScale = d3.scaleBand().rangeRound([0, chartWidth]);
//
    //var xBandScale = d3.scaleBand()
      //.domain(data.to_country)
      //.range([0, chartWidth])
      //.padding(0.15);
//
    //// d3.scaleBand()
    ////   .domain(data.map(d => d.to_country))
    ////   .range([0, chartWidth])
    ////   .padding(0.1);
    //console.log(d3.max(data.points));
//
    //// Create a linear scale for the vertical axis.
    //var yLinearScale = d3.scaleLinear()
      //.domain([0, d3.max(data.points)])
      //.range([chartHeight, 0]);
//
    //// Create two new functions passing our scales in as arguments
    //// These will be used to create the chart's axes
    //var bottomAxis = d3.axisBottom(xBandScale);
    //var leftAxis = d3.axisLeft(yLinearScale)
      //.ticks(10)
      //.tickSize(10,0);
//
    //chartGroup.append("g")
      //.call(leftAxis)
      //.selectAll("text")
      //.style("fill", "white")
      //.style("font-size", "15px")
//
    //chartGroup.append("g")
      //.attr("class", "x axis")
      //.attr("transform", `translate(0, ${chartHeight})`)
      //.call(bottomAxis)
      //.selectAll("text")
      //.attr("transform", "rotate(90)")
      //.style("fill", "white");
//
    //// Create a 'barWidth' variable so that the bar chart spans the entire chartWidth.
    //var barWidth = (chartWidth - (barSpacing * (data.length - 1))) / data.length;
//
    //// Create code to build the bar chart using the tvData.
    //chartGroup.selectAll(".bar")
      //.data(retval)
      //.enter()
      //.append("rect")
      //.classed("bar", true)
      //.style("stroke", "black")
      //.style("fill-opacity", .5)
      //.attr("fill", "blue")
      //.attr("width", xBandScale.bandwidth())
      ////.attr("width", d => barWidth)
      //.attr("height", d => yLinearScale(d.points))
      //.attr("x", d => xBandScale(d.to_country))
     ////.attr("x", (d, i) => i * (barWidth + barSpacing))
      //.attr("y", d => chartHeight - yLinearScale(d.points))
  //}).catch(function (error) {
    //console.log(error);
  //});
//};