d3.select("#date_slider_map1").on("input", function (event) {
    const year_start = 2020;
    const month_start = 3;
    var slider = document.getElementById('date_slider_map1');
    var offset = +slider.value;
    var hover_date;

    if (offset > 9) {
        let year = year_start + 1;
        let month = month_start + offset - 9 - 3;

        hover_date = `${year}-${month.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`; // format the integer string to have a leading zero if single digit number
    }
    else {
        hover_date = `${year_start}-${(month_start + offset).toLocaleString('en-US', { minimumIntegerDigits: 2 })}`;
    }

    const parser = d3.timeParse("%Y-%m");
    const formatter = d3.timeFormat("%B %Y");

    d3.select("#date_slider_txt_map1").text(formatter(parser(hover_date)));
});