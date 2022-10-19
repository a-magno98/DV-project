const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

// define constants
transition_duration = 500;
easing = d3.easeQuadOut;

map_default_opacity = 0.8;
map_highlight_opacity = 1;
map_background_opacity = 0.35;

map_highlight_stroke_width = 1;
map_default_stroke_width = 0.3;

highlight_opacity = 1;
default_opacity = 0.25;
background_opacity = 0.1;

highligh_stroke_width = 5;
default_stroke_width = 2.5;


tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.tabTarget);
        tabContents.forEach(tabContent => { tabContent.classList.remove('active') });
        tabs.forEach(tab => { tab.classList.remove('active') })
        tab.classList.add("active")
        target.classList.add("active")
    })
})

// tab1 will be the first active, start off by drawing its contents.
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data/owid-covid-monthly-newcases.csv", function (d) {
        return {
            iso_code: d.iso_code,
            date: d.date,
            location: d.location,
            vaccination_rate: +d.total_vaccinations_per_hundred,
            positive_rate: +d.new_cases_smoothed_per_million
        };
    })
]).then(map1_viz);

const label_tab2 = document.getElementById("label_tab2");
label_tab2.addEventListener("click", () => {
    if (label_tab2.classList.contains("unopened")) {
        start_select2_handler();

        d3.csv('data/owid-covid-monthly.csv', function (d) {
            const parser = d3.timeParse("%Y-%m");

            return {
                iso_code: d.iso_code,
                location: d.location,
                income: d.income_class,
                date: parser(d.date),
                vaccination_rate: +d.total_vaccinations_per_hundred
            };
        }).then(linechart_viz)

        d3.csv('data/owid-covid-monthly.csv', function (d) {
            const parser = d3.timeParse("%Y-%m");

            return {
                iso_code: d.iso_code,
                location: d.location,
                income: d.income_class,
                date: parser(d.date),
                vaccination_rate: +d.total_vaccinations_per_hundred
            };
        }).then(small_multiples_viz)

        label_tab2.classList.remove("unopened");
    }

})

const label_tab3 = document.getElementById("label_tab3");
label_tab3.addEventListener("click", () => {
    if (label_tab3.classList.contains("unopened")) {
        Promise.all([
            d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
            d3.csv("data/owid-covid-monthly-deaths.csv", function (d) {
                return {
                    iso_code: d.iso_code,
                    date: d.date,
                    location: d.location,
                    vaccination_rate: +d.total_vaccinations_per_hundred,
                    positive_rate: +d.new_deaths_per_million
                };
            })
        ]).then(map2_viz);

        d3.csv("data/weekly_deaths_by_state.csv", function (d) {
            var total = (+d.deaths_2020) + (+d.deaths_2021)

            return {
                iso_code: d.iso_code,
                location: d.location,
                week: +d.week,
                deaths_2020: +d.deaths_2020,
                deaths_2021: +d.deaths_2021,
                total: total
            };
        }).then(radial_stacked_barchart_viz);
        d3.json("data/vax_novax_california.json").then(sankey_viz);

        label_tab3.classList.remove("unopened");
    }

})