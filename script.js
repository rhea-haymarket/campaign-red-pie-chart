var data = [
  {
    "Title": "Dentsu",
    "Amount": 777600
  },
  {
    "Title": "Havas",
    "Amount": 219200
  },
  {
    "Title": "Independent",
    "Amount": 1242000
  },
  {
    "Title": "Interpublic",
    "Amount": 381500
  },
  {
    "Title": "Omnicom",
    "Amount": 4569200
  },
  {
    "Title": "Publicis Groupe",
    "Amount": 1577800
  },
  {
    "Title": "Publicis Media",
    "Amount": 113000
  },
  {
    "Title": "WPP",
    "Amount": 1551500
  },
  {
    "Title": "Others",
    "Amount": 195700
  }
];

data.sort((a, b) => b.Amount - a.Amount);

var width = parseInt(d3.select('#pieChart').style('width'), 10);
var height = width;
var radius = (Math.min(width, height) - 15) / 2;

var total = 0;      // used to calculate %s
data.forEach((d) => {
  total += d.Amount;
})

var title = function getObject(obj) {
  titles = [];
  for (var i = 0; i < obj.length; i++) {
    titles.push(obj[i].Title);
  }
  return titles
};

// grabs the responsive value in 'counter-reset' css value
let innerRadius = $('#pieChart').css('counter-reset').split(' ')[1];

var arcOver = d3.arc()
  .outerRadius(radius + 10)
  .innerRadius(innerRadius);


var color = d3.scaleOrdinal(); 
color.domain(title(data))
  // Comment in/out between ranges below to change colors
  .range(["#ba1823", "#ddbdbf", "#d47175", "#9a191e", '#e30613', '#661316', "#434343", "#848484", "#afafaf"]);

var arc = d3.arc()
  .outerRadius(radius - 10)
  .innerRadius(innerRadius);

var pie = d3.pie()
  .sort(null)
  .value(function(d) {
    return +d.Amount;
  });


// direction of the slice angle (for responsiveness)
let sliceDirection = 90;
if(window.matchMedia("(max-width: 767px)").matches) {
  sliceDirection = 180;
}


var prevSegment = null;
var change = function(d, i) {
  var angle = sliceDirection - ((d.startAngle * (180 / Math.PI)) +((d.endAngle - d.startAngle) * (180 / Math.PI) / 2));

  svg.transition()
    .duration(1000)
    .attr("transform", "translate(" + radius +
          "," + height / 2 + ") rotate(" + angle + ")");
  d3.select(prevSegment)
    .transition()
    .attr("d", arc)
    .style('filter', '');
  prevSegment = i;

  d3.select(i)
    .transition()
    .duration(1000)
    .attr("d", arcOver)
    .style("filter", "url(#drop-shadow)");
};


var svg = d3.select("#pieChart").append("svg")
  .attr("width", '100%')
  .attr("height", '100%')
  .attr('viewBox', '0 0 ' + Math.min(width, height) + ' ' + Math.min(width, height))
  .attr('preserveAspectRatio', 'xMinYMin')
  .append("g")
  .attr("transform", "translate(" + radius + "," + height / 2 + ")")
  .style("filter", "url(#drop-shadow)");

// Append text to the center of the pie chart
svg.append("text")
  .attr("text-anchor", "middle")
  .attr("dy", "0.35em")
  .attr("font-size", "13px")  // Adjust the font size as needed
  .attr("font-weight", "bold")
.attr("fill", "#fff")
  .text("Billings in 2024 Q1 and Q2");

// Create Drop Shadow on Pie Chart
var defs = svg.append("defs");
var filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 5.5)
    .attr("result", "blur");

filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("result", "offsetBlur");

var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");


// toggle to allow animation to halfway finish before switching segment again
var buttonToggle = true;
var switchToggle = () => {
  setTimeout(() => {
    buttonToggle = true;
  }, 1500)
}

var timeline = new TimelineLite();

var g = svg.selectAll("path")
  .data(pie(data))
  .enter().append("path")
  .style("fill", function(d) {
    return color(d.data.Title);
  })
  .attr("d", arc)
  .style("fill", function(d) {
    return color(d.data.Title);
  })
  .on("click", function(d) {
    
    if(buttonToggle) {
      buttonToggle = false;
      switchToggle();
      
      change(d, this);
      
      var timeline = new TimelineLite();

      //TweenMax.set(".panel", {perspective:800});
      //TweenMax.set(".content-wrapper", {transformStyle:"preserve-3d"});

      timeline.to('.content-wrapper', .5, {
        rotationX: '90deg',
        opacity: 0,
        ease: Linear.easeNone,
        onComplete: () => {$('.content-wrapper').hide();}
      }).to('.panel', .5, {
        width: '0%',
        opacity: .05,
        ease: Linear.easeNone,
        onComplete: () => {
          $('#segmentTitle').replaceWith(`<h1 id="segmentTitle">${d.data.Title} - ${Math.round((d.data.Amount/total) * 1000) / 10}%</h1>`);
          $('#segmentText').replaceWith('<p id="segmentText">' + d.data.Description + '</p>');
          $('.panel').css('background-color', `${ColorLuminance(color(d.data.Title), -0.3)}`)
        }
      });


      timeline.to('.panel', .5, {
        width: '100%',
        opacity: 1,
        ease: Linear.easeNone,
        onComplete: () => {$('.content-wrapper').show();}
      }).to('.content-wrapper', .5, {
        rotationX: '0deg',
        opacity: 1,
        ease: Linear.easeNone,
      })
    }
  });


timeline.from('#pieChart', .5, {
  rotation: '-120deg',
  scale: .1,
  opacity: 0,
  ease: Power3.easeOut,
}).from('.panel', .75, {
  width: '0%',
  opacity: 0,
  ease: Linear.easeNone,
  onComplete: () => {$('.content-wrapper').show();}
}, '+=.55').from('.content-wrapper', .75, {
  rotationX: '-90deg',
  opacity: 0,
  ease: Linear.easeNone,
})


// Function to darken Hex colors
function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}


//document.querySelector('style').textContent += '@media(max-width:767px) {#pieChart { transform: rotate(90deg); transform-origin: 50% 50%; transition: 1s; max-width: 50%; } .text-container { width: 100%; min-height: 0; }} @media(min-width:768px) {#pieChart { transition: 1s;}}'