var margin = {top: 40, left: 40, right: 40, bottom: 40};

var width = 600;
var height = 480;

var maxPrice = 100;
var maxQuantity = 100;

var line = {x1: 10, y1: 90, x2: 90, y2: 10};
var segments = 8;

var table = d3.select('#visual')
	.append('table')
	.attr('class', 'fixed');

var svg = d3.select('#visual')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate('+margin.left+','+margin.right+')');
	
var values = [];

var x = d3.scale.linear()
	.domain([0, maxQuantity])
	.range([0, width]);
	
var y = d3.scale.linear()
	.domain([0, maxPrice])
	.range([height, 0]);
	
var initAxis = function(){
	
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');
	
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
		
	svg.append("g")
		.attr('class', 'x axis')
	  	.attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	svg.append("g")
		.attr('class', 'y axis')
	  	.call(yAxis);
	  	
}();

var initAxisLabel = function(){
	
	svg.append("text")
	    .attr("class", "x label")
	    .attr("text-anchor", "end")
	    .attr('font-family', 'sans-serif')
	    .attr("x", width)
	    .attr("y", height - 6)
	    .text("Quantity");
	    
	svg.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "end")
	    .attr('font-family', 'sans-serif')
	    .attr("y", 6)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("Price");   
	    
}();

var initLine = function(){
	
	svg.append('line')
		.attr('x1', x(line.x1))
		.attr('y1', y(line.y1))
		.attr('x2', x(line.x2))
		.attr('y2', y(line.y2))
		.style('stroke', 'blue')
		.style('stoke-width', 2);
	
}();

var selectedPoints = [];

var initPoints = function(){
	var points = [];
	for(var i=0; i<=segments; i++){
		var initPoint = function(){
			
		        var k = i;
			var p = i/segments;
			var px = p*line.x1 + (1-p)*line.x2;
			var py = p*line.y1 + (1-p)*line.y2;
			var selected = false;
	
			function mouseover(){
				if(!selected){
					d3.select(this).style('fill', 'purple');
				}
			}
	
			function mouseout(){
				if(!selected){
					d3.select(this).style('fill', 'blue');
				}
			}
			
		        function flip(){selected = !selected;}

			function mousedown(){
				var point = d3.select(this);
				if(!selected){
					if(selectedPoints.length >= 2){
					        for(var j=0; j<selectedPoints.length; j++){
						    points[selectedPoints[j][2]].style('fill', 'blue').flip();
						}
						selectedPoints.splice(0,2);
					        clear();
					}
					selectedPoints.push([px,py, k]);
					if(selectedPoints.length == 1){
						updateP1(px,py);
					}else if(selectedPoints.length == 2){
						updateP2(px,py);
					}
					point.style('fill', 'red');
					selected = true;
				}else{
					var index = -1;
					for(var j=0; j<selectedPoints.length; j++){
						if(selectedPoints[j][0] == px){
							index = j;
							break;
						}
					}
					selectedPoints.splice(index,1);
					clear();
					if(selectedPoints.length == 1){
						updateP1(selectedPoints[0][0],selectedPoints[0][1]);
					}
					point.style('fill', 'blue');
					selected = false;
				}
			}
			
			var point = svg.append('circle')
				.style('fill', 'blue')
				.attr('r', 5)
				.attr('cx', x(px))
				.attr('cy', y(py))
				.on('mouseover', mouseover)
				.on('mouseout', mouseout)
				.on('mousedown', mousedown);
		        point.flip = flip;
		        return point;
		}();
	    points.push(initPoint);
	}
}();

var initTable = function(){
	var names = ["$Q_1$",
		     "$P_1$",
		     "$Q_2$",
		     "$P_2$",
		     "$E_d=\\left | {\\% \\Delta Q_d}\\over{\\%\\Delta P} \\right |$"
		    ];
	var nameRow = table.append('tr');
	var valueRow = table.append('tr');
	for(var i=0;i<names.length;i++){
		nameRow.append('td')
			.html(names[i]);
		values.push(valueRow.append('td')
			.text('NaN'));			
	}
}();

function clear(){
	values[0].text(NaN);
	values[1].text(NaN);
	values[2].text(NaN);
	values[3].text(NaN);
	values[4].text(NaN);
}

function updateP1(x, y){
	values[0].text(x);
	values[1].text(y);
}

var elasticity = values[4][0][0];

function updateP2(xp, yp){
	var x = +values[0].text();
	var y = +values[1].text();
	var dx = xp-x;
	var dy = yp-y;
	values[2].text(xp);
	values[3].text(yp);
	values[4].text("${{("+xp+"-"+x+")/"+x+"}\\over{("+yp+"-"+y+")/"+y+"}}="+((dx/x)/(dy/y)).toFixed(4)+"$");
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, elasticity]);
}
