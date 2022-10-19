const radial_stacked_barchart_viz = (data) => {

    var x, y, arc;

    // setting up the svg and its dimensions
    var w = 600;
    var h = 600;
    var w_perc = "100%", h_perc = "75%";

    var margin = { top: 50, right: 50, bottom: 50, left: 50 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    var innerRadius = 120;
    var outerRadius = Math.min(width, height) * 0.5;

    var svg = d3.select("#radial_barchart")
        .append("svg")
        .attr("viewBox", `${-w / 2} ${-h / 2} ${w} ${h}`)
        .style("width", w_perc)
        .style("height", h_perc)
        .style("font", "10px sans-serif");

    var columns = ['Deaths 2020', 'Deaths 2021'];
    var z = d3.scaleOrdinal()
        .domain(columns)
        .range(["#98abc5", "#8a89a6"]);

    // Adding title and legend
    svg.append("g")
        .append("text")
        .text("Deaths by week")
        .attr("transform", 'translate(-35, -35)')

    svg.append("g")
        .selectAll("g")
        .data(columns)
        .join("g")
        .attr("transform", (d, i) => `translate(-30,${(i - (columns.length - 1) / 2) * 20})`)
        .call(svg => svg.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => z(d))
            .attr("class", d => d.replaceAll(" ", "")))
        .call(svg => svg.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .attr("class", d => d.replaceAll(" ", ""))
            .text(d => d))

    // adding interactivity to legend
    svg.selectAll("rect")
        .on("mouseover", function (event, d) {
            if (d == "Deaths 2020") {
                svg.selectAll(".Deaths2021:not(.bar)")
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", 0.2);

                // if we select 2020 => hide 2021
                svg.selectAll(".bar.Deaths2021")
                    .transition()
                    .delay(function (d) {
                        const base_delay = 25;
                        let curr_delay = 0;

                        curr_delay += d.data.week * base_delay;

                        return curr_delay
                    })
                    .ease(easing)
                    .duration(transition_duration)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d[1], d[0]);

                        return function (t) {
                            d[1] = i(t);
                            return arc(d);
                        };
                    });
            } else if (d == "Deaths 2021") {
                svg.selectAll(".Deaths2020:not(.bar)")
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", 0.2);

                // if we select 2021 => hide 2020
                svg.selectAll(".bar.Deaths2020")
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d[1], d[0]);

                        return function (t) {
                            d[1] = i(t);
                            return arc(d);
                        };
                    });

                // move the current bars to their palce
                svg.selectAll(".bar.Deaths2021")
                    .transition()
                    .delay(function (d) {
                        const base_delay = 25;
                        let curr_delay = transition_duration;

                        curr_delay += d.data.week * base_delay;

                        return curr_delay
                    })
                    .ease(easing)
                    .duration(transition_duration)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d[1], d.data.deaths_2021); // controls top of bar
                        var j = d3.interpolate(d[0], 0); // controls bottom

                        return function (t) {
                            d[0] = j(t);
                            d[1] = i(t);
                            return arc(d);
                        };
                    });
            }
        })
        .on("mouseout", function (event, d) {
            if (d == "Deaths 2020") {
                svg.selectAll(".Deaths2021:not(.bar)")
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", 1);

                // if we selected 2020 => make again visible 2021
                svg.selectAll(".bar.Deaths2021")
                    .transition()
                    .delay(function (d) {
                        const base_delay = 25;
                        let curr_delay = 0;

                        curr_delay += d.data.week * base_delay;

                        return curr_delay
                    })
                    .ease(easing)
                    .duration(transition_duration)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d[0], d[0] + d.data.deaths_2021);

                        return function (t) {
                            d[1] = i(t);
                            return arc(d);
                        };
                    });
            } else if (d == "Deaths 2021") {
                svg.selectAll(".Deaths2020:not(.bar)")
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .style("opacity", 1);

                // move 2021 bars back up
                svg.selectAll(".bar.Deaths2021")
                    .transition()
                    .delay(function (d) {
                        const base_delay = 25;
                        let curr_delay = 0;

                        curr_delay += d.data.week * base_delay;

                        return curr_delay
                    })
                    .ease(easing)
                    .duration(transition_duration)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d[1], d.data.deaths_2020 + d.data.deaths_2021); // controls top of bar
                        var j = d3.interpolate(d[0], d.data.deaths_2020); // controls bottom

                        return function (t) {
                            d[0] = j(t);
                            d[1] = i(t);
                            return arc(d);
                        };
                    });

                // and fill again 2020 in
                // if we selected 2020 => make again visible 2021
                svg.selectAll(".bar.Deaths2020")
                    .transition()
                    .delay(function (d) {
                        const base_delay = 25;
                        let curr_delay = 0;

                        curr_delay += d.data.week * base_delay;

                        return curr_delay
                    })
                    .ease(easing)
                    .duration(transition_duration)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(0, d.data.deaths_2020);

                        return function (t) {
                            d[1] = i(t);
                            return arc(d);
                        };
                    });
            }
        })

    // handle select
    d3.select("#country_select_barchart").on("change", function (d) {
        var selected_country = document.getElementById("country_select_barchart").value.replaceAll("_", " ");

        svg.selectAll(".bar")
            .transition()
            .ease(easing)
            .duration(transition_duration)
            .attrTween("d", function (d) {
                var i = d3.interpolate(d[1], 0);
                var j = d3.interpolate(d[0], 0);

                return function (t) {
                    d[0] = j(t);
                    d[1] = i(t);
                    return arc(d);
                };
            });

        svg.selectAll("#yaxis")
            .selectAll("circle")
            .transition()
            .ease(easing)
            .duration(transition_duration)
            .attr("r", y(0))

        svg.selectAll("#yaxis")
            .selectAll("text")
            .transition()
            .ease(easing)
            .duration(transition_duration)
            .attr("y", -y(0))
            .textTween(function (d) {
                var i = d3.interpolate(d, 0);

                return function (t) {
                    d = i(t)
                    return parseInt(d);
                };
            });

        setTimeout(function () {
            svg.selectAll(".bars").remove();
            svg.selectAll("#yaxis").remove();

            update_rsb(selected_country);
        }, transition_duration);
    });


    function update_rsb(country) {
        var columns = data.columns.slice(2);
        var curr_data = data.filter(d => d.location == country);

        x = d3.scaleBand()
            .domain(curr_data.map(d => d.week))
            .range([0, 2 * Math.PI])
            .align(0);

        var xAxis = svg => svg
            .attr("text-anchor", "middle")
            .call(g => g.selectAll("g")
                .data(curr_data)
                .join("g")
                .attr("transform", d => `
                rotate(${((x(d.week) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
                translate(${innerRadius},0)
                `)
                .call(svg => svg.append("line")
                    .attr("x2", -5)
                    .attr("stroke", "#000"))
                .call(svg => svg.append("text")
                    .attr("transform", d => (x(d.week) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                        ? "rotate(90)translate(0,16)"
                        : "rotate(-90)translate(0,-9)")
                    .text(d => d.week)))

        y = d3.scaleRadial()
            .domain([0, d3.max(curr_data, d => d.total)])
            .range([innerRadius, outerRadius]);


        var ticks = y.ticks(5);
        if (ticks.length < 5) {
            ticks = Array(5 - ticks.length).fill(0).concat(ticks);
        }

        var yAxis = svg => svg
            .attr("text-anchor", "middle")
            .call(svg => svg.selectAll("g")
                .data([ticks[2], ticks[4]])
                .join("g")
                .attr("fill", "none")
                .call(svg => svg.append("circle")
                    .attr("stroke", "#000")
                    .attr("stroke-opacity", 0.5)
                    .attr("r", y(0))
                    .transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .attr("r", d => y(d)))
                .call(svg => svg.append("text")
                    .attr("y", d => -y(0))
                    .attr("dy", "0.35em")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2.5)
                    .text(0)
                    .call(s => s
                        .transition()
                        .ease(easing)
                        .duration(transition_duration)
                        .attr("y", d => -y(d))
                        .textTween(function (d) {
                            var i = d3.interpolate(0, d);

                            return function (t) {
                                d = i(t)
                                return parseInt(d);
                            };
                        }))
                    .clone(true)
                    .attr("fill", "#000")
                    .attr("stroke", "none")
                    .call(s => s
                        .transition()
                        .ease(easing)
                        .duration(transition_duration)
                        .attr("y", d => -y(d))
                        .textTween(function (d) {
                            var i = d3.interpolate(0, d);

                            return function (t) {
                                d = i(t)
                                return parseInt(d);
                            };
                        }))
                ));

        // arc that will draw each bar
        arc = d3.arc()
            .innerRadius(d => y(d[0]))
            .outerRadius(d => y(d[1]))
            .startAngle(d => x(d.data.week))
            .endAngle(d => x(d.data.week) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius);

        svg
            .append("g")
            .selectAll("g")
            .data(d3.stack().keys(columns.slice(1))(curr_data))
            .join("g")
            .attr("fill", d => z(d.key))
            .classed("bars", true)
            .selectAll("path")
            .data(d => d)
            .join(
                enter => enter
                    .append("path")
                    .attr("class", d => `bar ${d[1] != d.data.deaths_2020 ? "Deaths2021" : "Deaths2020"}`)
                    .transition()
                    .delay(function (d) {
                        const base_delay = 25;
                        let curr_delay = 0;
                        if (d[1] != d.data.deaths_2020) {
                            // we are in 2021, add a whole year of delay
                            curr_delay += base_delay * 53;
                        }

                        curr_delay += d.data.week * base_delay;

                        return curr_delay
                    })
                    .ease(easing)
                    .duration(1000)
                    .attrTween("d", function (d) {
                        var i = d3.interpolate(d[0], d[1])

                        return function (t) {
                            d[1] = i(t);
                            return arc(d);
                        };
                    })
            );

        // add the axes
        if (d3.select("#xaxis").empty()) {
            svg.append("g")
                .attr("id", "xaxis")
                .call(xAxis);
        }

        svg.append("g")
            .attr("id", "yaxis")
            .call(yAxis);
    }

    // load the default radial stacked barchart
    update_rsb("Italy")
}