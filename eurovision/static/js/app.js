//#########################################################################################//
//Pie Chart
//#########################################################################################//

function buildPiechart(edition) {

  // if the SVG Area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#pie-chart").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // Define SVG area dimensions
  var svgWidth = 500;
  var svgHeight = 300;

  // Define the chart's margins as an object
  var margin = {
    top: 10,
    right: 150,
    bottom: 100,
    left: 110
  };
  var svg = d3.select("#pie-chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth)
    .append("g");


  svg.append("g")
    .attr("class", "slices");
  svg.append("g")
    .attr("class", "labels");
  svg.append("g")
    .attr("class", "lines");

  var width = 860,
    height = 500,
    radius = Math.min(width, height) / 2;

  svg.append("text")
    .attr("x", "0")
    .attr("y", "0")
    .attr("fill", "blue")
    .style("opacity", 1)
    .style("text-anchor", "middle")
    .text("First 10 countries");  

  var pie = d3.pie()
    .sort(null)
    .value(function (d) {
      return d.value;
    });

  var arc = d3.arc()
    .outerRadius(radius * 0.8)
    .innerRadius(radius * 0.4);

  var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

  var arcOver = d3.arc()
    .innerRadius(radius * 1)
    .outerRadius(radius * 1);

  var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"])

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");



  d3.json(`/piechart/year/${edition}`).then(function (data, error) {

    // Throw an error if one occurs
    if (error) throw error;

    console.log(data);

    var key = function (d) {
      return d.data.label;
    };

    //var color = d3.scaleOrdinal(d3.schemeCategory20)
    //.domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
    //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    function randomData() {
      labels = data.label;
      values = data.value;
      //return {label:labels, value:values}
      retval = [];
      for (var i = 0; i < 10; i++) {
        retval.push({ label: data.label[i], value: data.value[i] });
      }
      return retval;
    };

    change(randomData());

    d3.select(".custom-select")
      .on("change", function () {
        console.log("change")
        change(randomData());
      });

    function mergeWithFirstEqualZero(first, second) {
      var secondSet = d3.set(); second.forEach(function (d) { secondSet.add(d.label); });

      var onlyFirst = first
        .filter(function (d) { return !secondSet.has(d.label) })
        .map(function (d) { return { label: d.label, value: 0 }; });
      return d3.merge([second, onlyFirst])
        .sort(function (a, b) {
          return d3.ascending(a.label, b.label);
        });
    }

    function change(data) {
      var duration = +document.getElementById("duration").value;
      //var duration = 3000
      var data0 = svg.select(".slices").selectAll("path.slice")
        .data().map(function (d) { return d.data });
      if (data0.length == 0) data0 = data;
      var was = mergeWithFirstEqualZero(data, data0);
      var is = mergeWithFirstEqualZero(data0, data);

      

      /* ------- SLICE ARCS -------*/

      var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(was), key);

      slice.enter()
        .insert("path")
        .attr("class", "slice")
        .style("fill", function (d) { return color(d.data.label); })
        .each(function (d) {
          this._current = d;
        });

      slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(is), key);

      slice
        .transition().duration(duration)
        .attrTween("d", function (d) {
          var interpolate = d3.interpolate(this._current, d);
          var _this = this;
          return function (t) {
            _this._current = interpolate(t);
            return arc(_this._current);
          };
        });

      slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

      slice
        .exit().transition().delay(duration).duration(0)
        .remove();

      /* ------- TEXT LABELS -------*/

      var text = svg.select(".labels").selectAll("text")
        .data(pie(was), key);

      text.enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("fill", "white")
        .style("opacity", 0)
        .text(function (d) {
          return d.data.label;
        })
        .each(function (d) {
          this._current = d;
        });

      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }

      text = svg.select(".labels").selectAll("text")
        .data(pie(is), key);

      text.transition().duration(duration)
        .style("opacity", function (d) {
          return d.data.value == 0 ? 0 : 1;
        })
        .attrTween("transform", function (d) {
          var interpolate = d3.interpolate(this._current, d);
          var _this = this;
          return function (t) {
            var d2 = interpolate(t);
            _this._current = d2;
            var pos = outerArc.centroid(d2);
            pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
            return "translate(" + pos + ")";
          };
        })
        .styleTween("text-anchor", function (d) {
          var interpolate = d3.interpolate(this._current, d);
          return function (t) {
            var d2 = interpolate(t);
            return midAngle(d2) < Math.PI ? "start" : "end";
          };
        });

      text = svg.select(".labels").selectAll("text")
        .data(pie(data), key);

      text
        .exit().transition().delay(duration)
        .remove();

      /* ------- SLICE TO TEXT POLYLINES -------*/

      var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(was), key);

      polyline.enter()
        .append("polyline")
        .attr("stroke", "white")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .style("opacity", 1)
        .each(function (d) {
          this._current = d;
        });

      polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(is), key);

      polyline.transition().duration(duration)
        .style("opacity", function (d) {
          return d.data.value == 0 ? 0 : .5;
        })
        .attrTween("points", function (d) {
          this._current = this._current;
          var interpolate = d3.interpolate(this._current, d);
          var _this = this;
          return function (t) {
            var d2 = interpolate(t);
            _this._current = d2;
            var pos = outerArc.centroid(d2);
            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
            return [arc.centroid(d2), outerArc.centroid(d2), pos];
          };
        });

      polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);

      polyline
        .exit().transition().delay(duration)
        .remove();
    };
  }).catch(function (error) {
    console.log(error);
  });
};

//#########################################################################################//
function buildyearlinegraph(year) {

  d3.json(`/yearinfo/${year}`).then(function (data) {
    //var slot = d3.select("line1");
    //slot.html("");
    // using entries to add key value pairs to the display slot
    var pointsbyCountry = [];
    for (var i = 0; i < data.length; i++) {
      var info = data;
      pointsbyCountry = [info[0].to_country, info[0].points];
      console.log(pointsbyCountry);
    }

    var trace = {
      type: "line",
      mode: "scatter",
      name: "Country vs Points",
      x: pointsbyCountry[0],
      y: pointsbyCountry[1],
      mode: "lines+markers",
      marker: {
        color: "#2077b4",
        symbol: "hexagram"
      },
      line: {
        color: "#green",
        width: 7,
      }
    };

    var linegraph = [trace];

    var layout = {
      title: {
        text: `Points by country in ${year}`,
        font: {
          //family: 'Courier New, monospace',
          size: 18,
          color: '#fff',
        },
      },
      xaxis: {
        title: {
          text: `Countries`,
          font: {
            //family: 'Courier New, monospace',
            size: 16,
            color: '#fff',
          },
        },
        showgrid: true,
        zeroline: true,
        showline: true,
        //mirror: 'ticks',
        tickcolor: '#fff',
        tickfont: {
          size: 14,
          color: 'rgba(255,255,255,1)'
        },
        gridcolor: '#343a40',
        gridwidth: 1,
        linecolor: '#636363',
        linewidth: 6
      },
      //xaxis: { title: "Countries" },
      yaxis: {
        title: {
          text: `Points`,
          font: {
            //family: 'Courier New, monospace',
            size: 16,
            color: '#fff',
          },
        //title: "Number of Points",
        autorange: true,
        type: "linear"
        },
        //mirror: 'ticks',
        tickcolor: '#fff',
        tickfont: {
          size: 14,
          color: 'rgba(255,255,255,1)'
        },
        zerolinecolor: '#fff',
        zerolinewidth: 2,
        gridcolor: '#343a40',
        gridwidth: 1,
        linecolor: '#636363',
        linewidth: 6
      },
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)',
      showlegend: false,
      height: 600,
      width: 1000
    };

    Plotly.newPlot("plot", linegraph, layout);

  })
};

function buildcountrygraph(country) {

  d3.json(`/cinfo/${country}`).then(function (data) {
    //var slot = d3.select("line2");
    //slot.html("");
    // using entries to add key value pairs to the display slot
    var pointsbyYear = [];
    for (var i = 0; i < data.length; i++) {
      var info = data;
      pointsbyYear = [info[0].year, info[0].points];
      console.log(pointsbyYear);
    }
    var trace = {
      type: "line",
      mode: "scatter",
      name: "Points Of a Country over the period",
      x: pointsbyYear[0],
      y: pointsbyYear[1],
      mode: "lines+markers",
      marker: {
        color: "#2077b4",
        symbol: "hexagram"
      },
      line: {
        color: "orange",
        width: 5,
      }
    };

    var linegraph = [trace];

    var layout = {
      title: {
        text: `Points by year for ${country}`,
        font: {
          //family: 'Courier New, monospace',
          size: 18,
          color: '#fff',
        },
      },
      xaxis: {
        title: {
          text: `Years`,
          font: {
            //family: 'Courier New, monospace',
            size: 16,
            color: '#fff',
          },
        },
        showgrid: true,
        zeroline: true,
        showline: true,
        //mirror: 'ticks',
        tickcolor: '#fff',
        tickfont: {
          size: 14,
          color: 'rgba(255,255,255,1)'
        },
        gridcolor: '#343a40',
        gridwidth: 1,
        linecolor: '#636363',
        linewidth: 6
      },
      yaxis: {
        title: {
          text: `Points`,
          font: {
            //family: 'Courier New, monospace',
            size: 16,
            color: '#fff',
          },
        //title: "Number of Points",
        autorange: true,
        type: "linear"
        },
        //mirror: 'ticks',
        tickcolor: '#fff',
        tickfont: {
          size: 14,
          color: 'rgba(255,255,255,1)'
        },
        zerolinecolor: '#fff',
        zerolinewidth: 2,
        gridcolor: '#343a40',
        gridwidth: 1,
        linecolor: '#636363',
        linewidth: 6
      },
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)',
      showlegend: false,
      height: 600,
      width: 1000
    };
    

    Plotly.newPlot("scatter", linegraph, layout);

  })
};

//#########################################################################################//

function buildbargraph(country){
  d3.json(`/barchart/${country}`).then(function(data){
    //var slot = d3.select("bar");
    //slot.html("");
    // using entries to add key value pairs to the display slot
    var pointsbyCountry = [];
    for (var i = 0; i < data.length; i++) {
      var info = data;
      pointsbyCountry = [info[0].year, info[0].points, info[0].to_country];
      console.log("bar graph function " + info[0].to_country);
    }
    // Trace1 for the Greek Data
    var trace1 = {
      x: pointsbyCountry[2],
      y: pointsbyCountry[1],
      text: pointsbyCountry[2],
      name: `What country is voting for ${country}`,
      type: "bar",
      marker: {
        color: 'rgb(142,124,195)'
      }
    };
    // Combining both traces
    var data = [trace1];
    // Apply the group barmode to the layout
    var layout = {
      title: {
        text: `${country} votes for:`,
        font: {
          //family: 'Courier New, monospace',
          size: 18,
          color: '#fff',
        },
      },
      xaxis: {
        title: {
          text: ``,
          font: {
            //family: 'Courier New, monospace',
            size: 16,
            color: '#fff',
          },
        },
        showgrid: true,
        zeroline: true,
        showline: false,
        //mirror: 'ticks',
        tickcolor: '#fff',
        tickfont: {
          size: 14,
          color: 'rgba(255,255,255,1)'
        },
        gridcolor: '#343a40',
        gridwidth: 1,
        linecolor: '#636363',
        linewidth: 6
      },
      yaxis: {
        title: {
          text: `Points`,
          font: {
            //family: 'Courier New, monospace',
            size: 16,
            color: '#fff',
          },
        //title: "Number of Points",
        autorange: true,
        type: "linear"
        },
        //mirror: 'ticks',
        tickcolor: '#fff',
        tickfont: {
          size: 14,
          color: 'rgba(255,255,255,1)'
        },
        zerolinecolor: '#fff',
        zerolinewidth: 1,
        gridcolor: '#343a40',
        gridwidth: 1,
        linecolor: '#636363',
        linewidth: 6
      },
      paper_bgcolor:'rgba(0,0,0,0)',
      plot_bgcolor:'rgba(0,0,0,0)',
      showlegend: false,
      height: 600,
      width: 1000
    };
    
    // Render the plot to the div tag with id "plot"
    Plotly.newPlot("barg", data, layout);
  });
  }

//#########################################################################################//


function init() {

  var selectorEd = d3.select("#selEdition");

  // Use the list of sample names to populate the select options
  d3.json("/editionname").then((editionNames) => {
    editionNames.forEach((names) => {
      selectorEd
        .append("option")
        .text(names)
        .property("value", names);
    });

    // Use the first sample from the list to build the initial plots
    const firstSampleed = editionNames[0];
    buildPiechart(firstSampleed);
  });

  // Grab a reference to the dropdown select element
  var selectorYears = d3.select("#selYears");

  // Use the list of sample names to populate the select options
  d3.json("/years").then((years) => {
    years.forEach((year) => {
      selectorYears
        .append("option")
        .text(year)
        .property("value", year);
    });

    // Use the first sample from the list to build the initial plots
    const yearchoice = years[0];
    console.log(years[0])
    buildyearlinegraph(yearchoice);
  });


  var countries = d3.select("#selcountry");

  d3.json("/country").then((country) => {
    country.forEach((countr) => {
      countries
        .append("option")
        .text(countr)
        .property("value", countr);
    });

    // Use the first sample from the list to build the initial plots
    const firstCountry = country[0];
    buildcountrygraph(firstCountry);
  });

  //// Grab a reference to the dropdown select element
  //

  //var selector = d3.select("#selDataset");
  ////​
  ////// Use the list of sample names to populate the select options
  //d3.json("/countries").then((sampleNames) => {
    //sampleNames.forEach((from_country) => {
      //selector
        //.append("option")
        //.text(from_country)
        //.property("value", from_country);
    //});
    ////
    ////// Use the first sample from the list to build the initial plots
    //const firstSample = sampleNames[0];
    ////console.log(firstSample);
    //buildbargraph(firstSample);
  //});

  var barc = d3.select("#barcountry");

  d3.json("/countries").then((barcountry) => {
    barcountry.forEach((bc) =>{
      barc.append("option").text(bc).property("value", bc);
    });
    const barcountryc = barcountry[0];
    buildbargraph(barcountryc);
  });
}

function editionChanged(newSample) {
  // Fetch new data each time a new edition is selected
  buildPiechart(newSample);
}

function yearchanged(year) {
  buildyearlinegraph(year);
}

function countrychanged(country) {
  buildcountrygraph(country);
}

function bargraph(country){
  buildbargraph(country);
}

//function optionChanged(newSample) {
//// Fetch new data each time a new sample is selected
//buildCharts(newSample);
//};

// Initialize the dashboard
init();


//##########     Granim     #############################
var granimInstance = new Granim({
  element: '#canvas-complex',
  direction: 'left-right',
  isPausedWhenNotInView: true,
  states: {
    "default-state": {
      gradients: [
        [
          { color: '#833ab4', pos: .2 },
          { color: '#fd1d1d', pos: .8 },
          { color: '#38ef7d', pos: 1 }
        ], [
          { color: '#40e0d0', pos: 0 },
          { color: '#ff8c00', pos: .2 },
          { color: '#ff0080', pos: .75 }
        ],
      ]
    }
  }
});

