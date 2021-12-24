var margin = {top: 20, right: 20, bottom: 30, left: 50},
width = 1200 - margin.left - margin.right,
height = 800 - margin.top - margin.bottom,
margin2 = {top: 430, right: 20, bottom: 30, left: 40};


var svg = d3.select("#codeD3").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");
var height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var categories = [
  {"id" : 1, "name" : "Film & Animation"},
  {"id" : 2, "name" : "Autos & Vehicles"},
  {"id" : 10, "name" : "Music"},
  {"id" : 15, "name" : "Pets & Animals"},
  {"id" : 17, "name" : "Sports"},
  {"id" : 19, "name" : "Travel & Events"},
  {"id" : 20, "name" : "Gaming"},
  {"id" : 22, "name" : "People & Blogs"},
  {"id" : 23, "name" : "Comedy"},
  {"id" : 24, "name" : "Entertainment"},
  {"id" : 25, "name" : "News & Politics"},
  {"id" : 26, "name" : "Howto & Style"},
  {"id" : 27, "name" : "Education"},
  {"id" : 28, "name" : "Science & Technology"},
  {"id" : 29, "name" : "Nonprofits & Activism"}
];
var colorArray = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#809980",
    "#E6FF80",
    "#1AFF33",
    "#999933",
    "#FF3380",
    "#CCCC00",
    "#66E64D",
    "#4D80CC",
    "#FF4D4D",
    "#99E6E6",
    "#6666FF"
];

d3.json(
  "data/data.json"
).then(function (json) {

  //Create an array of datas By categories
  var structByCategories={};
//  console.log(categories)
  for (i in categories){
    let cat_video = json.filter(function(d){
      if(d.items[0] !== undefined){
        return d.items[0].snippet.categoryId == categories[i].id;
      }
    });
    structByCategories[i] = cat_video;
  }
//  console.log(structByCategories);

  //Create an array of all month between first and last video :
  var dates = [];
  var values = []
  const a = json.reduce((a, b) => (a.date < b.date) ? a.date : b.date);

  var dateEnd = new Date(json[0].date);
  var dateStart = new Date(json[json.length-1].date);
  var month = new Date(dateStart);
  var par = d3.timeFormat("%Y-%m")
  nbMonth = ((dateEnd.getYear()-dateStart.getYear())*12)+(dateEnd.getMonth()-dateStart.getMonth())
  //console.log(dateStart,dateEnd)
   while(!(dateEnd.getYear() == month.getYear() && dateEnd.getMonth() == month.getMonth())){
      dates.push(par(month));
      month = new Date(month.setMonth(month.getMonth()+1))
  }
  dates.push(par(month));

// add statistique date start and dateEnd
d3.select("#periodeDate").text(par(dateStart) +" - "+par(dateEnd))


//Create a structure of video by Categories AND Month
  let max = 0;
  let datas = []
  //Create Value Table

  for(i in dates){

    const da = new Date(dates[i]);
    let obj = {}
    obj.dates = da
    let values_cat = []
    for (j in structByCategories){
      //console.log(structByCategories[j])

      values_cat[j] = structByCategories[j].filter((d) =>
      (da.getYear() == new Date(d.date).getYear() &&
      da.getMonth() == new Date(d.date).getMonth())).length;

    }

    obj.values = values_cat;
    datas.push(obj)
  }
//Initialize vertical line
  var mouseLine = svg.append("line") // this is the black vertical line to follow mouse
    .attr("class","mouseLine")
    .attr('x1', 500)
    .attr('y1', 0)
    .attr('x2', 500)
    .attr('y2', height)
    .style("stroke","black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

//Initialize Rect to catch mouse position on the svg (For the vertical line)
  svg
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  //Initialize scales for Line Chart
  var x = d3.scaleTime().range([0, width]).domain(d3.extent(datas,(d)=> d.dates));
  svg.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
      .domain([0, d3.max(datas,(d)=> Math.max(...d.values) )])
      .range([ height, 0 ]);

  var axisY = svg.append("g")
      .call(d3.axisLeft(y));

  // define the 1st line
  var  x2 = d3.scaleTime().range([0, width]),
       y2 = d3.scaleLinear().range([height2, 0]);

  xAxis2 = d3.axisBottom(x2);
  //Initialize Legend :
  var legend = svg
      .append('g')
      .attr('class', 'legend')

//Stock All Lines
var lines = {};

//For each categories add a line and legend from datas
for(i in categories){
  //append Line
    path = svg.append("path")
    .datum(datas)
    .attr("fill", "none")
    .attr("class","lines")
    .attr("id","line_"+categories[i].id)
    .attr("stroke", colorArray[i])
    .attr("data-id",categories[i].id)
    .attr("stroke-width", 3)
    .attr("d", d3.line()
    .x(function(d) { return x(d.dates) })
    .y(function(d) { return y(d.values[i]) })
    ).on('mouseover', function (d, i) {

      const id = this.id//.classed("active", true)
      d3.selectAll(".lines").filter(function() {
      return !(this.id == id || this.attributes.class.value.includes("hide"))
    }, id).attr('opacity', 0.5);


  }).on('mouseout', function (d, i) {
      d3.selectAll(".lines").filter(function() {
      return !(this.attributes.class.value.includes("hide"))
    }).attr('opacity', 1);

  });

  //Set Path in dictionnary of lines
  lines[categories[i].id] = path;

  // Append legend
  legend.append('rect')
  .attr('x', width - 130)
  .attr('y', i* 20 -10 )
  .attr('width', 10)
  .attr('height', 10)
  .attr("data_id",categories[i].id)
  .attr("id","label_"+categories[i].id)
  .attr('class', 'label_rect')
  .style('fill', colorArray[i]).on('mouseover', function (d, i) {
    //  console.log(this)

    d3.select(this).transition()
    .duration('50')
    .attr('opacity', '.85');
  }).on('mouseout', function (d, i) {
    d3.select(this).transition()
    .duration('50')
    .attr('opacity', '1');
  }).on('click', function (d, i) {
    var id_cat = d3.select("#"+this.id).attr('data_id')
    //hide_categories(id_cat);
    updateView(id_cat)
  });
  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  legend.append('text')
    .attr('x', width - 115)
    .attr('y', i * 20)
    .style('font','icon')
    .attr('id',"labelText_"+categories[i].id)
    .attr('class', "labelText")
    .text(categories[i].name);

// Pour le brush
/*
  context.append("path")
    .datum(datas)
    .attr("class", "line")
    .attr("id","line_"+categories[i].id)
    .attr("stroke", colorArray[i])
    .attr("data-id",categories[i].id)
    .attr("stroke-width", 3)
    .attr("d", d3.line()
    .x(function(d) { return x(d.dates) })
    .y(function(d) { return y(d.values[i]) }));


  context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  context.append("g")
    .attr("class", "brush")*/
  //  .call(brush)
  //  .call(brush.move, x.range());


}

// This allows to find the closest X index of the mouse:
var bisect = d3.bisector(function(d) { return d.x; }).left;


// Create the text that travels along the curve of chart
// var focusText = svg
// .append('g')
// .append('text')
//   .style("opacity", 0)
//   .attr("text-anchor", "left")
//   .attr("alignment-baseline", "middle")
// Create a rect on top of the svg area: this rectangle recovers mouse position

//Function to update view when a category is hidden
var categories_hidden = []
function updateView(category_hidden){
  //console.log(category_hidden, lines[category_hidden]);
  lines[category_hidden].remove();

  categories_hidden.push(parseInt(category_hidden));
  //currentCategories = currentCategories.filter(function(d) {return d.id != category_hidden })
  //We're looking for the max of all lines without the current category
  let max = 0;
  datas.map(function(d){
    for (i in categories){
      if(!categories_hidden.includes(categories[i].id)){
        max = (max >= d.values[i]) ? max : d.values[i];
      }
    }
  });

  //Upgrade y axis
  y.domain([0,max])
  axisY.transition(500).call(d3.axisLeft(y));

  //Upgrade Others Paths :
  for(i in categories){
    if(!categories_hidden.includes(categories[i].id)){
      lines[categories[i].id].transition(500).attr("d", d3.line()
      .x(function(d) { return x(d.dates) })
      .y(function(d) { return y(d.values[i]) })
      )
      // console.log(lines[categories[i].id])
    }
  }

}

//Function mouse action on svg
  function mousemove(e) {
    var coordinates= d3.pointer(e);
    var cooX = coordinates[0];
    var cooY = coordinates[1];
    mouseLine.attr('x1', cooX).attr('x2', cooX)
  }

  function mouseover() {
    mouseLine
  .style("opacity", "0.5");
  }

  function mouseout() {
    mouseLine
  .style("opacity", "0");

  }



});
