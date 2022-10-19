const sankey_viz = (sankeydata) => {
    const sankey_background_opacity = 0.1;
    const sankey_default_opacity = 0.25;
    const sankey_highlight_opacity = 0.4;

    // setting up the svg and its dimensions
    var sankey = d3.sankey();

    var w = 1280, h = 600;
    var w_perc = "100%", h_perc = "100%";

    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#sankey")
        .append("svg")
        .attr("viewBox", `0 0 ${w} ${h}`)
        .attr("width", w_perc)
        .attr("height", h_perc)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .nodeAlign(d3.sankeyJustify)
        .size([width, height]);

    graph = sankey(sankeydata);

    var link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", d => `${d.source.name}-${d.target.name}`)
        .classed("link", true)
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", d => d.width)
        .attr("stroke", d => `url(#${getGradID(d)})`)
        .attr("fill", "none")
        .style("stroke-opacity", sankey_default_opacity)

    function getGradID(d) { return "linkGrad-" + d.source.name + d.target.name; }

    // adding gradients for the links
    var defs = svg.append("defs");

    var grads = defs.selectAll("linearGradient")
        .data(graph.links, getGradID)
        .enter().append("linearGradient")
        .attr("id", getGradID)
        .attr("gradientUnits", "userSpaceOnUse");

    grads.attr("x1", d => d.source.x0)
        .attr("y1", d => d.source.y0)
        .attr("x2", d => d.target.x0)
        .attr("y2", d => d.target.y0)

    grads.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d => d.source.color)

    grads.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d => d.target.color)

    // add in the nodes
    var node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .classed("node", true);

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", d => d.color)
        //.style("stroke", "dodgerblue")
        .append("title")
        .text(d => d.name);

    // add in the title for the nodes
    node.append("text")
        .attr("x", function (d) { return d.x0 - 6; })
        .attr("y", function (d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(function (d) { return d.name; })
        .filter(function (d) { return d.x0 < width / 2; })
        .attr("x", function (d) { return d.x1 + 6; })
        .attr("text-anchor", "start");

    // add interactivity
    svg.selectAll(".link")
        .on("mouseover", function (event, d) {
            var other_links = svg.selectAll(`.link:not(.${d.source.name}-${d.target.name}`);
            var this_link = svg.select(`.${d.source.name}-${d.target.name}`);

            other_links
                .transition()
                .ease(easing)
                .duration(transition_duration)
                .style("stroke-opacity", sankey_background_opacity)

            this_link
                .transition()
                .ease(easing)
                .duration(transition_duration)
                .style("stroke-opacity", sankey_highlight_opacity)
        })
        .on("mousemove", function (event, d) {
            var info_str;
            if (d.index > 5) {
                info_str = `${d.value}% of ${d.target.name.toLowerCase()} is ${d.source.name.toLowerCase()}`
            } else {
                info_str = `${d.value}% of ${d.source.name.toLowerCase()} are of ${d.target.name.toLowerCase()} individuals`
            }

            var [mouse_x, mouse_y] = d3.pointer(event, svg);

            var tooltip = d3.select("#sankey_tooltip");
            tooltip.style("left", mouse_x + 15 + "px")
                .style("top", mouse_y - 35 + "px");

            tooltip.select("#info").text(info_str);

            tooltip.classed("hidden", false);
        })

    svg.selectAll(".link")
        .on("mouseout", function () {
            var tooltip = d3.select("#sankey_tooltip");

            tooltip.classed("hidden", true);

            svg.selectAll(".link")
                .transition()
                .ease(easing)
                .duration(transition_duration)
                .style("stroke-opacity", sankey_default_opacity)
        })
}