function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var YlOrBr = {
  3: ["#fff7bc","#fec44f","#d95f0e"],
  4: ["#ffffd4","#fed98e","#fe9929","#cc4c02"],
  5: ["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
  6: ["#ffffd4","#fee391","#fec44f","#fe9929","#d95f0e","#993404"],
  7: ["#ffffd4","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
  8: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#8c2d04"],
  9: ["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]
  }

function get_color(value, min, max, breaks, palette, reverse = 0, nan_color = '#e6e6e6') {
  var nbins = breaks.length-1;
  var breaks_new = breaks.concat(value) 

  breaks_new.sort(function(a, b) {
    return a - b;
  });
  var bin = breaks_new.indexOf(value) - 1;
  if (value <= min) {
    bin = 1;
  } else if (value >= max) {
    bin = nbins - 1;
  }
  //console.log(bin)
    
  if (value == null){
    return nan_color
  }

  if (nbins <= 11) {
    if (reverse == 1) {
      return palette[nbins].reverse()[bin];
    } else {
      return palette[nbins][bin];
    }
  }
}

function select_unicolor(z, min, max, breaks, pal = YlOrBr) {
    return(get_color(z, min, max, breaks, pal))
}


function get_values(from, to, by){
  var arr = [];
  var val = from;
  while (to - val >= - 0.5 * by) {
    arr.push(round(val,1));
    val += by;
  }
  return arr;
}

function get_text_color(z) {
  if (z > 0) {
    return '#000';
  } else {
    return '#FFFFFF';
  }
}

module.exports = {
  get_color, get_values, round, get_text_color, select_unicolor
}
