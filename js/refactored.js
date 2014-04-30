"use strict";
var config = {
	
	height:300, width:480,
	margin : {top:40, bottom:40, left:40, right:40},
	maxPrice : 100,
	maxQuantity : 100,
	lineEndpoints : [{x:10,y:90}, {x:90,y:10}],
	lineID: "LineID",
	tableValueID: "TableID",
	font : "sans-serif",
	points : 9,
	pointRadius : 5,
	tableNames : [
		"$Q_1$",
		"$P_1$",
		"$Q_2$",
		"$P_2$",
		"$Slope$",
		"$E_d(Point)$",
		"$E_d(Midpoint/Arc)$"		     
	]
	
};

function makeTable(elem){
	var table = elem
		.append('table')
		.attr('class', 'fixed');
		
	var nameRow = table.append('tr');
	var valueRow = table.append('tr').attr("id", config.tableValueID);
	
	nameRow.selectAll('td')
		.data(config.tableNames)
		.enter()
		.append('td')
		.text(function(d){return d;})
	
	valueRow.selectAll('td')
		.data(new Array(config.tableNames.length))
		.enter()
		.append('td')
		.text(function(d){return +d;})
	
	clearTable(table);
}

function clearTable(table){

	var defaultValues = new Array(config.tableNames.length);
	for(var i = 0; i<defaultValues.length; i++){
		defaultValues[i] = "$NaN$"
	}
	
	defaultValues[4] = defaultSlopeEntry();
	
	updateTable(defaultValues);
}

function defaultSlopeEntry(){

	var x1 = config.lineEndpoints[0].x;
	var x2 = config.lineEndpoints[1].x;
	var y1 = config.lineEndpoints[0].y;
	var y2 = config.lineEndpoints[1].y;

	return '${' + x2 + '-' + x1 + '\\over' + y2 + '-' + y1 + '}=' + slope() + '$';
}

function updateTable(values){
	
	d3.select("#"+config.tableValueID)
		.selectAll("td")
		.data(values)
		.text(function(d){return d;})
		
	renderTable(d3.select("#"+config.tableValueID));
		
}

function computeTableValues(svg, scales, table){

	var points = selectedPoints();
	var p0, p1;
	if(+d3.select(points[0][0]).attr('index')){
		p1 = points[0][0];
		p0 = points[0][1];
	}else{
		p1 = points[0][1];
		p0 = points[0][0];
	}
	
	p0 = d3.select(p0);
	p1 = d3.select(p1);
	
	var x0 = +p0.attr('quantity');
	var y0 = +p0.attr('price');
	var x1 = +p1.attr('quantity');
	var y1 = +p1.attr('price');
	var slope = defaultSlopeEntry();
	var ep = elasticityPoint(x0, y0, x1, y1);
	var em = elasticityMidarc(x0, y0, x1, y1);
	
	var xs = scales.x;
	var ys = scales.y;
	
	svg.append('line')
		.attr('id', 'Arrow')
		.attr('x1', xs(x0))
		.attr('y1', ys(y0))
		.attr('x2', xs(x1))
		.attr('y2', ys(y1))
		.attr('marker-end', 'url(#arrow)')
		.style('stroke', 'red')
		.style('stroke-width', 2);
	
	updateTable([
		d(x0), d(y0),
		d(x1), d(y1),
		slope, ep, em
	]);
	
	function d(expr){
		return '$'+expr+'$';
	}
	
}

function elasticityPoint(x0, y0, x1, y1){

	var dx = x1-x0;
	var dy = y1-y0;

	var e = Math.abs(((dx/x0)/(dy/y0))).toFixed(4);
	
	return "$ \\left | {{("+x1+"-"+x0+")/"+x0+"}\\over{("+y1+"-"+y0+")/"+y0+"}} \\right | ="+e+"$";
	
}

function elasticityMidarc(x0, y0, x1, y1){

	var dx = x1-x0;
	var dy = y1-y0;

	var e = Math.abs((dx/(x0+x1))/(dy/(y0+y1))).toFixed(4);
	return 	"$ \\left| {{(" + x1 + "-" + x0 + ")"
		+"/(" + x1 + '+' + x0 + ")"
		+"/2}\\over{(" + y1 + "-" + y0 +")"
		+"/(" + y1 + '+' + y0 + ')/2'
		+"}} \\right |="+e+"$";
}

function renderTable(table){
	MathJax.Hub.Queue(['Typeset', MathJax.Hub, table]);
}

function slope(){
	
	var x1 = config.lineEndpoints[0].x;
	var x2 = config.lineEndpoints[1].x;
	var y1 = config.lineEndpoints[0].y;
	var y2 = config.lineEndpoints[1].y;
	
	return (x2 - x1) / (y2 - y1);
}



function makeSVG(elem){
	return elem
		.append('svg')
		.attr('width',  config.width + config.margin.left + config.margin.right)
		.attr('height', config.height + config.margin.top + config.margin.bottom)
		.append('g')
		.attr('transform', 'translate('+config.margin.left+','+config.margin.top+')');
}

function makeDefs(svg){
	return svg.append("defs");
}

function makeArrow(defs){
	return defs.append("marker")
	    .attr("id", "arrow")
	    .attr("viewBox", "-9 -6 11 12")
	    .attr("refX", 0)
	    .attr("refY", 0)
	    .attr("markerWidth", 6)
	    .attr("markerHeight", 6)
	    .attr("orient", "auto")
  		.append("path")
    		.attr("d", "M -8,-5  L 3,0  L -8,5");
}

var scales = function(){

	var x = d3.scale.linear()
		.domain([0, config.maxQuantity])
		.range([0, config.width]);
		
	var y = d3.scale.linear()
		.domain([0, config.maxPrice])
		.range([config.height, 0]);
		
	return {x:x,y:y};
	
}();

function makeAxes(svg, scales){
	
	var xAxis = d3.svg.axis()
		.scale(scales.x)
		.orient('bottom');
	
	var yAxis = d3.svg.axis()
	    .scale(scales.y)
	    .orient("left");
		
	var svgX = svg.append("g")
		.attr('class', 'x axis')
	  	.attr("transform", "translate(0," + config.height + ")")
	    .call(xAxis);
	
	var svgY = svg.append("g")
		.attr('class', 'y axis')
	  	.call(yAxis);
		
	return {x:svgX,y:svgY};
	  	
}

function makeAxesLabels(svg){
	
	var xLabel = svg.append("text")
	    .attr("class", "x label")
	    .attr("text-anchor", "end")
	    .attr('font-family', config.font)
	    .attr("x", config.width)
	    .attr("y", config.height + 30)
	    .text("Quantity");
	    
	var yLabel = svg.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "end")
	    .attr('font-family', 'sans-serif')
	    .attr("y", -40)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("Price");   
		
	return {x:xLabel,y:yLabel};
	    
}

function makeLine(elem, scales){
	
	var xs = scales.x;
	var ys = scales.y;
	
	var x1 = config.lineEndpoints[0].x;
	var x2 = config.lineEndpoints[1].x;
	var y1 = config.lineEndpoints[0].y;
	var y2 = config.lineEndpoints[1].y;
	
	return elem.append('path')
		.attr('id', config.lineID)
		.attr('d', 'M '+xs(x1)+' '+ys(y1)+' L '+xs(x2)+' '+ys(y2))
		.style('stroke', 'blue')
		.style('stoke-width', 2);
		
}

function makeLineLabel(svg, line){

	svg.append('text')
		.style('text-anchor', 'middle')
		.style('font-family', config.font)
		.attr('dy', -12)
		.append('svg:textPath')
			.attr({"xlink:href": "#"+line.attr("id")})
			.attr("startOffset","50%")
			.text("Demand");

}


function makePoints(svg, scales, table){

	var points = svg.append('g').attr('id', 'points');
	
	var x1 = config.lineEndpoints[0].x;
	var x2 = config.lineEndpoints[1].x;
	var y1 = config.lineEndpoints[0].y;
	var y2 = config.lineEndpoints[1].y;
	
	for(var i=0; i<config.points; i++){
		var p = i/(config.points-1);
		var px = p*x1 + (1-p)*x2;
		var py = p*y1 + (1-p)*y2;
		makePoint(points, {x:px, y:py}, scales, table);
	}
	
	return points;
}

function makePoint(svg, position, scale, table){
	
	var xs = scales.x;
	var ys = scales.y
	
	return svg.append('circle')
		.style('fill', 'blue')
		.attr('class', "")
		.attr('r', config.pointRadius)
		.attr('quantity', position.x)
		.attr('price', position.y)
		.attr('cx', xs(position.x))
		.attr('cy', ys(position.y))
		.on('mousedown', pointMousedown);

	function pointMousedown(){

		var point = d3.select(this);
		var cls = point.attr("class");
		
		if(cls == "selected"){
		
			unselectPoint(point);
			clearTable(table);
			d3.select('#Arrow').remove();
		
		}else{
		
			var points = selectedPoints();
			
			if(points[0].length == 2){
				
				for(var i=0; i<points[0].length; i++){
					unselectPoint(d3.select(points[0][i]));
					d3.select('#Arrow').remove();
				}
				
			}
			//TODO FIXME BUG ALERT
			selectPoint(point, pointIndex());
			
			if(points[0].length == 1){
				computeTableValues(svg, scale, table);
			}
		}
	}
		
}

function pointIndex(){
	var points = selectedPoints();
	if(points[0].length == 0){
		return 0;
	}else{
		if(d3.select(points[0][0]).attr("index") == "0"){
			return 1;
		}else{
			return 0;
		}
	}
}

function unselectPoint(point){
	return point
		.style('fill', 'blue')
		.attr('class', "")
		.attr('index', "");
}

function selectPoint(point, index){
	return point
		.style('fill', 'red')
		.attr('class', "selected")
		.attr('index', index);
}

function selectedPoints(){
	return d3.selectAll('.selected');
}


function main(){
	var visual = d3.select('#visual');
	visual.style('width', config.width);
	
	var table = makeTable(visual);
	
	var svg = makeSVG(visual);
	
	var defs = makeDefs(svg);
	var arrow = makeArrow(defs);
	
	var axes = makeAxes(svg, scales);
	var axesLabels = makeAxesLabels(svg);
	
	var line = makeLine(svg, scales);
	var lineLabel = makeLineLabel(svg, line);
	
	var points = makePoints(svg, scales, table);
	
}

window.onload = main;