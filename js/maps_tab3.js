const map2_viz = (loadData) => {
    // setting up the svg and its dimensions
    var w = 1280;
    var h = 500;
    var w_perc = "100%", h_perc = "100%";

    var margin = { top: 5, right: 15, bottom: 5, left: 15 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    var map2_svg = d3.select("#maps_tab3")
        .append("svg")
        .attr("id", "tab3map")
        .attr("width", w_perc)
        .attr("height", h_perc)
        .attr("viewBox", `0 0 ${w} ${h}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Map and projection
    const path = d3.geoPath();
    const projection = d3.geoMercator()
        .scale(90)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    let topo = loadData[0]

    // default values
    let var_type = "cases";
    let interesting_date = "2021-12";

    // event listener for switch changes
    d3.select("#cases_vax_switch_map2")
        .on("change", function (event) {
            if (document.getElementById("cases_vax_switch_map2").checked)
                var_type = "vax";
            else
                var_type = "cases";

            data = loadData[1].filter(e => e.date == interesting_date);
            plot_data_map2(topo, data, var_type);
        })

    // event listener for slider changes
    d3.select("#date_slider_map2")
        .on("change", function (event) {
            const year_start = 2020;
            const month_start = 3;
            var slider = document.getElementById('date_slider_map2');
            var offset = +slider.value;

            if (offset > 9) {
                let year = year_start + 1;
                let month = month_start + offset - 9 - 3;

                interesting_date = `${year}-${month.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`; // format the integer string to have a leading zero if single digit number
            }
            else {
                interesting_date = `${year_start}-${(month_start + offset).toLocaleString('en-US', { minimumIntegerDigits: 2 })}`;
            }

            // if we have data for vaccines enable the switch, otherwise disable it
            var cv_switch = d3.select("#cases_vax_switch_map2");
            if (offset < 9) {
                // if we are disabling the switch, and we are on vaccines then first go back to cases
                if (document.getElementById('cases_vax_switch_map2').checked) {
                    var_type = "cases";
                    cv_switch.property("checked", false);
                }
                cv_switch.property("disabled", true);
            } else {
                cv_switch.property("disabled", false);
            }

            data = loadData[1].filter(e => e.date == interesting_date);
            plot_data_map2(topo, data, var_type);
        });

    data = loadData[1].filter(e => e.date == interesting_date);
    plot_data_map2(topo, data, var_type)

    function plot_data_map2(topo, data, variable_type) {
        const vax = "vax";
        const cases = "cases";

        const no_data_color = "#888888";

        //define the color scale depending on the variable we are using
        var colorScale;
        var colorScaleStr;
        const domain_mult = 0.85;
        if (variable_type == vax) {
            colorScale = d3.scaleQuantize()
                .domain([0, d3.max(data.map(e => e.vaccination_rate)) * domain_mult])
                .range(d3.schemeGreens[5]);

            colorScaleStr = d3.scaleQuantize()
                .domain([0, d3.max(data.map(e => e.vaccination_rate)) * domain_mult])
                .range(d3.range(5).map(i => "vax-q" + (i + 1) + "-5"));
        }
        else if (variable_type == cases) {
            colorScale = d3.scaleQuantize()
                .domain([0, d3.max(data.map(e => e.positive_rate)) * domain_mult])
                .range(d3.schemeReds[5]);

            colorScaleStr = d3.scaleQuantize()
                .domain([0, d3.max(data.map(e => e.positive_rate)) * domain_mult])
                .range(d3.range(5).map(i => "cases-q" + (i + 1) + "-5"));
        }

        //Add a legend, requires Susie Lu's d3-legend script
        var legend = d3.legendColor()
            .scale(colorScaleStr)
            .ascending(true)
            .shapeHeight(15)
            .shapeWidth(15)
            .title(variable_type == "cases" ? "New deaths per million inhabitants" : "Vaccination %")
            .useClass(true)
            .labels(function ({ // custom function that changes how each label is printed, allows us to have printing 
                i,              // like for thresholded scales, which are not implemented for quantized ones
                genLength,
                generatedLabels,
                labelDelimiter
            }) {
                if (i === 0) {
                    const values = generatedLabels[i].split(" to ");
                    return `Less than ${values[1]}`;
                } else if (i === genLength - 1) {
                    const values = generatedLabels[i].split(" to ");
                    return `${values[0]} or more`;
                }
                return generatedLabels[i];
            });

        map2_svg.selectAll("path")
            .data(topo.features.filter(e => e.id !== "ATA")) // remove antartica from the projection
            .join(
                // if we have data for a country for the first time then add its path
                enter => enter.append("path")
                    .attr("d", d3.geoPath()
                        .projection(projection)
                    )
                    .attr("fill", function (d) {
                        let res = data.filter(e => e.iso_code == d.id);
                        // if we have no data for said country
                        // add empty placeholder
                        if (res.length == 0) {
                            data.push({
                                iso_code: d.id,
                                location: d.properties.name,
                                vaccination_rate: "No data available",
                                positive_rate: "No data available"
                            })

                            return no_data_color;
                        }

                        // if we have data return the color corresponding to the current value
                        if (variable_type == vax)
                            return colorScale(res[0].vaccination_rate);
                        else if (variable_type == cases)
                            return colorScale(res[0].positive_rate);
                    })
                    .style("stroke", "gray")
                    .style("stroke-width", map_default_stroke_width)
                    .attr("class", function (d) {
                        // classes are used for coloring and interactivity
                        let res = data.filter(e => e.iso_code == d.id);

                        // if we have no data for said country
                        if (isNaN(res[0].vaccination_rate) && isNaN(res[0].positive_rate))
                            return "Country " + "no_data";

                        if (variable_type == vax)
                            return "Country " + colorScaleStr(res[0].vaccination_rate);

                        if (variable_type == cases)
                            return "Country " + colorScaleStr(res[0].positive_rate);
                    })
                    .style("opacity", map_default_opacity),

                // if we already have it then we need to transition to the new values
                update => update.transition()
                    .duration(transition_duration)
                    .ease(easing)
                    .attr("fill", function (d) {
                        res = data.filter(e => e.iso_code == d.id)

                        // if we have no data for the current country skip it
                        if (res.length == 0) {
                            data.push({
                                iso_code: d.id,
                                location: d.properties.name,
                                vaccination_rate: "No data available",
                                positive_rate: "No data available"
                            })

                            return no_data_color;
                        }

                        // if we have data return the color corresponding to the current value
                        if (variable_type == vax)
                            return colorScale(res[0].vaccination_rate);
                        else if (variable_type == cases)
                            return colorScale(res[0].positive_rate);
                    })
                    .attr("class", function (d) {
                        let res = data.filter(e => e.iso_code == d.id);

                        // if we have no data for said country
                        if (isNaN(res[0].vaccination_rate) && isNaN(res[0].positive_rate))
                            return "Country " + "no_data";

                        // otherwise use actual color classes
                        if (variable_type == vax)
                            return "Country " + colorScaleStr(res[0].vaccination_rate);

                        if (variable_type == cases)
                            return "Country " + colorScaleStr(res[0].positive_rate);
                    }),

                exit => exit.remove()
            )

        // add mouse interactivity
        map2_svg.selectAll(".Country")
            .on("mousemove", function (event, d) {
                map2_svg.selectAll(".Country")
                    .style("opacity", map_background_opacity);

                d3.select(this)
                    .style("opacity", map_highlight_opacity)
                    .style("stroke", "black")
                    .style("stroke-width", map_highlight_stroke_width);

                var tooltip = d3.select("#map2_tooltip");
                [mouse_x, mouse_y] = d3.pointer(event, map2_svg);
                tooltip.style("left", mouse_x + 15 + "px")
                    .style("top", mouse_y + "px");

                let res = data.filter(e => e.iso_code == d.id);

                let pos_value = res[0].positive_rate;
                let vax_value = res[0].vaccination_rate;

                tooltip.select("#location").text(res[0].location);
                // if we have a number then print it with 2 decimal position
                // if not regular print a string
                tooltip.select("#positive_rate").text(isNaN(pos_value) ? pos_value : pos_value.toFixed(2));
                tooltip.select("#vaccine_rate").text(isNaN(vax_value) ? vax_value : vax_value.toFixed(2));

                tooltip.classed("hidden", false);
            })
            .on("mouseleave", function () {
                map2_svg.selectAll(".Country")
                    .style("opacity", map_default_opacity);

                d3.select(this)
                    .style("stroke", "gray")
                    .style("stroke-width", map_default_stroke_width);

                d3.select("#map2_tooltip")
                    .classed("hidden", true);
            });

        // adding the legend, if already present we need to remove the previous one first
        var l = map2_svg.select("#legend")

        if (!l.empty()) {
            l.remove()
        }

        map2_svg.append("g")
            .attr("transform", `translate(${width * 0.75}, 100)`)
            .attr("id", "legend")
            .call(legend);

        // add interactivity to the legend
        map2_svg.selectAll(".swatch")
            .on("mouseover", function (event, d) {
                map2_svg.selectAll(".Country")
                    .transition()
                    .duration(transition_duration)
                    .ease(easing)
                    .style("opacity", map_background_opacity);

                map2_svg.selectAll(".Country." + d)
                    .transition()
                    .duration(transition_duration)
                    .ease(easing)
                    .style("opacity", map_highlight_opacity);
            })
            .on("mouseleave", function () {
                map2_svg.selectAll(".Country")
                    .transition()
                    .duration(transition_duration)
                    .ease(easing)
                    .style("opacity",map_default_opacity);
            })
    }
}