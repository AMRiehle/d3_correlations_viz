var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "diabetes";
var chosenYAxis = "notInLaborForce"

// function used for updating x-scale var upon click on axis label
function xScale(correlationsData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(correlationsData, d => d[chosenXAxis]) * 0.8,
      d3.max(correlationsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(correlationsData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(correlationsData, d => d[chosenYAxis]) * 0.8,
      d3.max(correlationsData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, margin.top]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
    function renderTextX(textLabels, newXScale, chosenXAxis) {
        textLabels.transition()
            .duration(1500)
            .attr('x', d => newXScale(d[chosenXAxis] * 0.99));
        return textLabels;
    }

    function renderTextY(textLabels, newYScale, chosenYAxis) {
        textLabels.transition()
            .duration(1500)
            .attr('y', d => newYScale(d[chosenYAxis]));
        return textLabels;
    }

    // function used for updating circles group with a transition to new circles
    function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {
        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
        return circlesGroup;
    }

    function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
        circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis == "diabetes") {
    var xLabel = "Have Diabetes:";
  }
  else if (chosenXAxis == "collegeGrads") {
    var xLabel = "College Graduates:"
  }
  else {
    var xLabel = "Physically Active:";
  }

  if (chosenYAxis == "notInLaborForce") {
    var yLabel = "Don't Work:";
  }
  else if (chosenYAxis == "workInManagementBizScienceArts") {
    var yLabel = "Work in MBSA:"
  }
  else {
    var yLabel = "Work at Home:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`State: ${d.state_name}</br>${xLabel} ${d[chosenXAxis]}</br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("correlsData.csv", function(err, correlationsData) {
  if (err) throw err;

  // parse data
  correlationsData.forEach(function(data) {
    data.state = data.state
    data.state_name = data.state_name
    data.diabetes = +data.diabetes;
    data.collegeGrads = +data.collegeGrads;
    data.physicalActivity = +data.physicalActivity;
    data.notInLaborForce = +data.notInLaborForce;
    data.workInManagementBizScienceArts = +data.workInManagementBizScienceArts;
    data.workAtHome = +data.workAtHome;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(correlationsData, chosenXAxis);
  var yLinearScale = yScale(correlationsData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
      .attr("transform", `translate(0, 0)`)
      .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(correlationsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "violet")
    .attr("opacity", ".2");

    var circleText = chartGroup.selectAll(null)
        .data(correlationsData)
        .enter()
        .append('text')
        .classed("circles-text", true)
            // .attr('fill','url(#svgGradient2)')
            
    var textLabels = circleText
        .attr('x', d => xLinearScale(d[chosenXAxis] * 0.99))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('alignment-baseline', 'middle')
        .text(d => d.state)
        .style("font-size", 12)

  // Create group for  2 x- axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var diabetesLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "diabetes") // value to grab for event listener
    .classed("active", true)
    .text("Have Diabetes");

  var collegeGradsLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "collegeGrads") // value to grab for event listener
    .classed("inactive", true)
    .text("College Graduates and Above");

  var physicalActivityLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "physicalActivity") // value to grab for event listener
    .classed("inactive", true)
    .text("Participated in Physical Activity in Past Month");

  // append y axis
  var labelsGroupY = chartGroup.append("g")

  var notInLaborForceLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left+50)
    .attr("dy", "1em")
    .attr("value", "notInLaborForce") // value to grab for event listener
    .classed("active", true)
    .text("Not in Labor Force");

  var workInManagementBizScienceArtsLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left+30)
    .attr("dy", "1em")
    .attr("value", "workInManagementBizScienceArts") // value to grab for event listener
    .classed("inactive", true)
    .text("Work in Management, Business, Science, or the Arts");

  var workAtHomeLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 0 - margin.left+10)
    .attr("dy", "1em")
    .attr("value", "workAtHome") // value to grab for event listener
    .classed("inactive", true)
    .text("Work at Home");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textLabels);

  // x axis labels event listener
  
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = xScale(correlationsData, chosenXAxis);
        xAxis = renderXAxis(xLinearScale, xAxis);
        circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textLabels);
        textLabels = renderTextX(textLabels, xLinearScale, chosenXAxis)
        if (chosenXAxis == "diabetes") {
          diabetesLabel
            .classed("active", true)
            .classed("inactive", false);
          collegeGradsLabel
            .classed("active", false)
            .classed("inactive", true);
          physicalActivityLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (chosenXAxis == "collegeGrads") {
          diabetesLabel
            .classed("active", false)
            .classed("inactive", true);
          collegeGradsLabel
            .classed("active", true)
            .classed("inactive", false);
          physicalActivityLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else {
          diabetesLabel
            .classed("active", false)
            .classed("inactive", true);
          collegeGradsLabel
            .classed("active", false)
            .classed("inactive", true);
          physicalActivityLabel
            .classed("active", true)
            .classed("inactive", false)
          }
      }
    })

  labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value != chosenYAxis) {
        chosenYAxis = value;
        yLinearScale = yScale(correlationsData, chosenYAxis);
        yAxis = renderYAxis(yLinearScale, yAxis);
        circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textLabels);
        textLabels = renderTextY(textLabels, yLinearScale, chosenYAxis)
        if (chosenYAxis == "notInLaborForce") {
          notInLaborForceLabel
            .classed("active", true)
            .classed("inactive", false);
          workInManagementBizScienceArtsLabel
            .classed("active", false)
            .classed("inactive", true);
          workAtHomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (chosenYAxis == "workInManagementBizScienceArts") {
          notInLaborForceLabel
            .classed("active", false)
            .classed("inactive", true);
          workInManagementBizScienceArtsLabel
            .classed("active", true)
            .classed("inactive", false);
          workAtHomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else {
          notInLaborForceLabel
            .classed("active", false)
            .classed("inactive", true);
          workInManagementBizScienceArtsLabel
            .classed("active", false)
            .classed("inactive", true);
          workAtHomeLabel
            .classed("active", true)
            .classed("inactive", false)
          }
      }
    })
  });