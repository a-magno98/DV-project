// handle the selection of countries
const colors = ["#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#17becf"];

var old_selection = [];
var available_colors = [...colors];
var country_color_dict = {}

function start_select2_handler() {

    $(document).ready(function () {
        $(".select2-multiple").select2({
            maximumSelectionLength: 5,
        });
    })

    $("#country_select").select2().on("change", function (event) {
        var selected = $('#country_select').select2('data');

        if (selected.length != 0) {
            // we have a selection, make all path less visible to highlight it
            let selected_classes_str = selected.map(e => e.id)
                .reduce((prev, e) => `.${e},` + prev, '.domain, .Country, .bar, .link') // the axes should never be touched, nor other paths from maps

            d3.selectAll(`path:not(${selected_classes_str})`)
                .attr("pointer-events", "none")
                .transition()
                .ease(easing)
                .duration(transition_duration)
                .style("opacity", background_opacity)

            // if we have a selection also add a legend
            for (const v of selected) {
                if (!(v.id in country_color_dict))
                    country_color_dict[v.id] = available_colors.pop();
            }

            var country_scale = d3.scaleOrdinal()
                .domain(selected.map(e => e.text))
                .range(selected.map(e => country_color_dict[e.id]));

            var linechart_legend = d3.legendColor()
                .scale(country_scale)
                .orient("vertical")
                .title("Selected Countries")

            var linechart_svg = d3.select("#linecharts").select("svg");

            var l = linechart_svg.select("#legend")

            if (!l.empty()) {
                l.remove()
            }

            linechart_svg.append("g")
                .attr("transform", `translate(70, 50)`)
                .attr("id", "legend")
                .call(linechart_legend);
        }

        if (selected.length == 0) {
            // no selection, then make everything back to default
            d3.selectAll("path:not(.domain, .Country, .bar, .link)")
                .attr("pointer-events", "all")
                .transition()
                .ease(easing)
                .duration(transition_duration)
                .style("opacity", default_opacity)

            var l = d3.select("#linecharts").select("#legend")

            if (!l.empty()) {
                l.remove()
            }
        }

        // remove old ones
        for (const v of old_selection) {
            if (!selected.includes(v)) {
                var old_path = d3.selectAll(`.${v.id}`);
                // make the current color available to other paths
                available_colors.push(country_color_dict[v.id]);
                delete country_color_dict[v.id];

                old_path.transition()
                    .ease(easing)
                    .duration(transition_duration)
                    .attr("stroke", "gray")
                    .style("opacity", selected.length != 0 ? background_opacity : default_opacity);
            }
        }

        // add selection
        for (const [i, v] of selected.entries()) {

            if (old_selection.includes(v))
                continue;   // no need to transition if we were already plotted

            var curr_path = d3.selectAll(`.${v.id}`)

            curr_path
                .attr("pointer-events", "all")
                .transition()
                .ease(easing)
                .duration(transition_duration)
                .attr("stroke", country_color_dict[v.id])
                .style("opacity", highlight_opacity);

            curr_path.raise();
        }

        old_selection = selected;
    });

    // default selection
    // get animated after lines are drawn in
    setTimeout(function () {
        $("#country_select").val(["Egypt", "Italy", "Mozambique", "China"]);
        $("#country_select").trigger("change");
    }, 1000);
}