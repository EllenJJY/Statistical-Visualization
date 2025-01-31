
function visualize(data) {
  data = data.filter(d => d.IMDB_Rating > 0 & d.Rotten_Tomatoes_Rating > 0);
  let scales = make_scales(data)
  initialize(data, scales);
}

function initialize(data, scales) {
  d3.select("#circles")
    .selectAll("circle")
    .data(data, d => d.Title).enter()
    .append("circle")
    .attrs({
      opacity: 1,
      r: 2,
      cx: d => scales.x(d.IMDB_Rating),
      cy: d => scales.y(d.Rotten_Tomatoes_Rating),
      fill: d => scales.fill(d.Genre_Group)
    })

  annotations(scales)
  legend(scales.fill)
}

function legend(scale) {
  let legend = d3.legendColor()
  .title("Genre")
  .scale(scale);

  d3.select("#legend")
    .attr("transform", `translate(${0.7 * width}, ${margins.top})`)
    .call(legend);

  d3.select("#legend .legendCells")
    .selectAll(".cell")
    .on("click", (ev, d) => toggle_selection(ev, d))
}

/**
 *    array.indexOf():
 *      ```
 *      const beasts = ["ant", "bison", "camel", "duck", "bison"],
 *      console.log(beasts.indexOf("bison")); // expected output: 1
 *      console.log(beasts.indexOf("bison", 2)); // expected output: 4
 *      console.log(beasts.indexOf("giraffe)); // expected output: -1
 *      ```
 *    array.splice():
 *      - change the content of your array by removing or replacing existing elements with new ones
 *      - it needs at least one parameter, which is the start index where the splice operation starts
 *      ```
 *      let months = ["January", "February", "Monday", "Tuesday"];
 *      let days = months.splice(2); // will start removing elements from index 2
 *      console.log(days); // expected output: ["Monday", "Tuesday"]
 *      
 */

function toggle_selection(ev, d) {
  let ix = selected.indexOf(d)
  console.log(ix)
  console.log(selected)
  if (ix == -1) {
    selected.push(d);
  } else {
    selected.splice(ix, 1) // starts from ix and delete 1 element
  }
  console.log(selected)
  update_view()
}

function update_view() {
  d3.select("#circles")
    .selectAll("circle")
    .transition()
    .duration(500)
    .attrs({
      opacity: d => selected.indexOf(d.Genre_Group) == -1 ? 0.4 : 1,
      r: d => selected.indexOf(d.Genre_Group) == -1 ? 1 : 2
    })

  // below is used to change the opacity for Genres lable on the right side
  d3.select(".legendCells")
    .selectAll("rect")
    .attr("opacity", (d) => selected.indexOf(d) == -1 ? 0.4 : 1)
  d3.select(".legendCells")
    .selectAll("text")
    .attr("opacity", (d) => selected.indexOf(d) == -1 ? 0.4 : 1)
  }

function annotations(scales) {
  let x_axis = d3.select("#axes").append("g")
      y_axis = d3.select("#axes").append("g"),
      x_title = d3.select("#axes").append("text"),
      y_title = d3.select("#axes").append("text");

  x_axis.attr("transform", `translate(0, ${height - margins.bottom})`)
    .call(d3.axisBottom(scales.x).ticks(4))
  y_axis.attr("transform", `translate(${margins.left}, 0)`)
    .call(d3.axisLeft(scales.y).ticks(4))

  x_title.text("IMDB")
    .attrs({
      class: "label_title",
      transform: `translate(${0.5 * width}, ${height - 0.25 * margins.bottom})`,
    })
  y_title.text("Rotten Tomatoes")
    .attrs({
      class: "label_title",
      transform: `translate(${0.25 * margins.left}, ${0.5 * height})rotate(-90)`
    });
}

function make_scales(data) {
  return {
    x: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.IMDB_Rating)))
         .range([margins.left, 0.7 * width - margins.right]),
    y: d3.scaleLinear()
         .domain(d3.extent(data.map(d => d.Rotten_Tomatoes_Rating)))
         .range([height - margins.bottom, margins.top]),
    fill: d3.scaleOrdinal()
      .domain([... new Set(data.map(d => d.Genre_Group))])
      .range(d3.schemeSet3)
  }
}

let width = 700,
  height = 500,
  selected = ["Drama", "Other", "Musical", "Comedy", "Action", "Romantic Comedy",
              "Adventure", "Thriller/Suspense", "Horror"],
  margins = {left: 60, right: 60, top: 60, bottom: 60};
d3.csv("movies.csv", d3.autoType)
  .then(visualize);
