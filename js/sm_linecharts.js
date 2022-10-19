const small_multiples_viz = (data) => {
    // setting up the svg and its dimension
    var w = 300;
    var h = 300;
    var w_perc = "50%", h_perc = "100%";

    var margin = { top: 50, right: 50, bottom: 75, left: 50 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    // no vaccine data before this
    const parser = d3.timeParse("%Y-%m");
    data = data.filter(d => d.date >= parser("2020-11"))

    const groups = d3.group(data, d => d.income, d => d.location);
    // append the svg object to the body of the page
    var svg = d3.select("#sm_linecharts")
        .selectAll("smallMultiples")
        .data(groups)
        .enter()
        .append("svg")
        .attr("class", d => d[0])
        .attr("width", w_perc)
        .attr("height", h_perc)
        .attr("viewBox", `0 0 ${w} ${h}`)
        .append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Compute the axes
    var x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    var xAxis = d3.axisBottom(x);

    var y = d3.scaleLinear()
        .domain([0, 300])
        .range([height, 0]);

    var yAxis = d3.axisLeft(y);

    // adding the title for each small multiple
    svg
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 0)
        .text(function (d) { return (d[0]); })

    // adding y axis label to the first sm
    d3.select("#sm_linecharts")
        .select("svg")
        .append("text")
        .attr("class", "ylabel")
        .attr("text-anchor", "end")
        .attr("x", -80)
        .attr("dy", "2em")
        .style("font-size", "10px")
        .attr("transform", "rotate(-90)")
        .text("Total vaccinations %");

    for (const key of groups.keys()) {
        var curr_svg = d3.select(`.${key}`)

        // Plot a single small multiple
        var path = curr_svg.selectAll("path:not(.domain)")
            .data(groups.get(key))
            .join(
                // if we are adding a new path then animate it being "drawn"
                enter => enter.append("path")
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2.5)
                    .attr("stroke-dashoffset", w * 10)
                    .attr("stroke-dasharray", w * 10)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)
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

        // add mouseover effects
        path
            .on("mouseover", function (event, d) {
                let curr_paths = d3.selectAll("path:not(.domain)")

                var selected = $('#country_select').select2('data');

                var country_data = d[1];
                var formatter = d3.timeFormat("%B %Y");
                var [mouse_x, mouse_y] = d3.pointer(event, svg);
                // compute index of closest point in the array
                var i = d3.bisectCenter(country_data.map(d => x(d.date)), d3.pointer(event)[0]);

                [mouse_x, mouse_y] = d3.pointer(event, curr_svg);
                mouse_y = mouse_y - 75;

                if (selected.length == 0) {
                    // adding extra opacity to current selection
                    var curr_line = d3.selectAll(`.${d[0].split(/\s/).join("")}`)

                    curr_paths.transition()
                        .ease(easing)
                        .duration(transition_duration)
                        .style("opacity", background_opacity)

                    curr_line.transition()
                        .ease(easing)
                        .duration(transition_duration)
                        .style("opacity", highlight_opacity)

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
                let curr_paths = d3.selectAll("path:not(.domain)")

                // when we have a mouseout we have to check if we have a selection
                // so that we can ensure the same behavior
                var selected = $('#country_select').select2('data');

                if (selected.length == 0) {
                    curr_paths.transition()
                        .ease(easing)
                        .duration(transition_duration)
                        .style("opacity", default_opacity)
                }

                // in any case remove the tooltip
                d3.select("#linechart_tooltip")
                    .classed("hidden", true);
            });
    }

    // if we are plotting for the first time add axes to the svgs
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("id", "linechart_xaxis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("id", "linechart_yaxis")
        .call(yAxis);
};