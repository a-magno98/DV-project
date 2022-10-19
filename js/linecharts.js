const linechart_viz = (data) => {
    // setting up svg and its dimensions
    var w = 800;
    var h = 450;
    var w_perc = "100%", h_perc = "100%";

    var margin = { top: 10, right: 10, bottom: 75, left: 50 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    var svg = d3.select("#linecharts")
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("width", w_perc)
        .attr("height", h_perc)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Vaccine data gets interesting after 2020-11 (start of vaccination campains)
    const parser = d3.timeParse("%Y-%m");
    data = data.filter(d => d.date >= parser("2020-11"))

    // group data depending on location, plot a single line for each one
    const sumstat = d3.group(data, d => d.location);

    // Compute the axes
    var x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, 300])
        .range([height, 0]);

    var yAxis = d3.axisLeft(y);

    // Add the plot
    var path = svg.selectAll("path:not(.domain)")
        .data(sumstat)
        .join(
            // if we are adding a new path then animate it being "drawn"
            enter => enter.append("path")
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("stroke-width", default_stroke_width)
                .attr("stroke-dashoffset", w * 10)
                .attr("stroke-dasharray", w * 10)
                .style("opacity", default_opacity)
                .attr("d", function (d) {
                    return d3.line()
                        .x(d => x(d.date))
                        .y(d => y(d.vaccination_rate))
                        (d[1])
                })
                .attr("class", function (d) {
                    return d[0].split(/\s/).join(""); // remove whitespace from class names
                })
                .call(enter => enter.transition()
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(transition_duration * 7)
                    .attr("stroke-dashoffset", 0)
                ),
        );

    // Interactivity
    path
        .on("mouseover", function (event, d) {
            var selected = $('#country_select').select2('data');

            var country_data = d[1];
            var formatter = d3.timeFormat("%B %Y");
            var [mouse_x, mouse_y] = d3.pointer(event, svg);

            // compute index of closest point in the array
            var i = d3.bisectCenter(country_data.map(d => x(d.date)), d3.pointer(event)[0]);

            mouse_y = mouse_y - 75;

            // if we don't have a selection then highlight the current path
            if (selected.length == 0) {
                // adding extra opacity to current selection
                var curr_line = d3.selectAll(`.${d[0].split(/\s/).join("")}:not(.domain)`)

                path.transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", background_opacity)

                curr_line.transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", highlight_opacity)
                    .attr("stroke-width", highlight_stroke_width)

                curr_line.raise()    // and bring the current selection to the front
            }

            // in any case display the tooltip
            var tooltip = d3.select("#linechart_tooltip");

            tooltip.style("left", mouse_x + "px")
                .style("top", mouse_y + "px");

            tooltip.select("#country_tooltip").text(country_data[i].location);
            tooltip.select("#date_tooltip").text(formatter(country_data[i].date));
            tooltip.select("#vax_tooltip").text(country_data[i].vaccination_rate.toFixed(2));

            tooltip.classed("hidden", false);
        })
        .on("mouseout", function () {
            // If we have a selection then just remove the tooltip
            // if we didn't then bring back everything to default styles
            var selected = $('#country_select').select2('data');
            if (selected.length == 0) {
                d3.selectAll("path:not(.domain)")
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", default_opacity)
                    .attr("stroke-width", default_stroke_width)
            }

            // in any case remove the tooltip
            d3.select("#linechart_tooltip")
                .classed("hidden", true);
        });


    // Add legends and axes        
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("id", "linechart_xaxis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    svg.append("g")
        .attr("id", "linechart_yaxis")
        .call(yAxis);

    svg.append("text")
        .attr("class", "ylabel")
        .attr("text-anchor", "end")
        .attr("x", -100)
        .attr("dy", "-2.5em")
        .style("font-size", "smaller")
        .attr("transform", "rotate(-90)")
        .text("Total vaccinations %");
}