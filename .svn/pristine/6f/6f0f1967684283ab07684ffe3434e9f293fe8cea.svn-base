function GraphEngine (config) {

var self={};
canvas="",
ratio_x=0,
ratio_y=0,
max_x=0,
max_y=0,
deltaTime=0,
then=Date.now(),
fps = 60,
interval = 1000/fps,
dragging= false,
mousedown= false,
mousePosition={x:0,y:0},
clickPosition={x:0,y:0},
drag_vecx=0,
drag_vecy=0,
allowclick= true,
zooming= false,
offset_x= 0,
offset_y=0,
outsidecanvas=false,
scale=1.0,
oldscale=1.0,
oldzoom= 1.0,
minzoom= 1.0,
zoom= 1.0,
global_point_size=0.0,
vertex_buffer="",
edgeIndexBuffer="",
arrowIndexBuffer="",
vertex_buffer_edges="",
vertex_buffer_arrows="",
rawDataArrowslength = 0,
indices="",
arrow_indices="",
edges="",
nodes="",
bidirectional_edges = "",
rawDataNodes=[],
rawDataEdges=[],
rawDataArrows=[],
nodeToEdges = [],
edgewidth = 0.2,
edgegap = 0.3,
nodedrag = false,
selectedNode = {idx:0,x:0,y:0,clickOffsetx:0,clickOffsety:0},
max_pointsize=0,
largest_node_size=0;
smallest_node_size=100000;
const_fac = Math.pow(2,1/25),  //25th root of 2 means 25 zooms to double mapsize
maxzoom = 0,
use_arrows = false,
arrow_width =0.7,
arrow_lenght = 1.5,
start_zoom = 90.0,
texturedefined = false,
min_y = Infinity;
max_y = 0;
min_x = Infinity;
max_x = 0;
x_at_min_y=0;
x_at_max_y=0;
min_fuck = Infinity;
max_fuck = 0;



self.loadShaders = function(callback) 
{

    vs_source = null,
    fs_source = null;
$.ajax({
    url: 'assets/shaders/vertex_shader.vs',
    success: function (data) {
        vs_source = $(data).html(); 

        $.ajax({
		    url: 'assets/shaders/fragment_shader.fs',
		    success: function (data) {
		        fs_source = $(data).html();
		        callback();
		    },
		    dataType: 'html'
		});


    },
    dataType: 'html'
});


}


self.createCanvas = function(cv) {


  var  ctx = cv.getContext('2d');

var grd = ctx.createLinearGradient(0,0,255,0);
grd.addColorStop(0,"red");
grd.addColorStop(0.5,"blue");
grd.addColorStop(1,"white");

// Fill with gradient
ctx.fillStyle = grd;
ctx.fillRect(0,0,255,50);


}

self.getMinMaxF = function(fuck_values){


for(var i=0;i<fuck_values.length;i++){

if(fuck_values[i]<min_fuck)min_fuck= fuck_values[i];
if(fuck_values[i]>max_fuck)max_fuck=fuck_values[i];

}


}

self.init = function(graph,canvas_id){


if(config){
	console.log(config);
 start_zoom = config.start_zoom;
}

// console.log(graph);	

canvas = document.getElementById(canvas_id);
	
gl = canvas.getContext('experimental-webgl',{antialias:true});
//gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE); 
gl.enable(0x8642); //support firefox only?

gl.enable(gl.BLEND);
gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

gl.getExtension('OES_element_index_uint');
gl.getExtension('OES_standard_derivatives');

var gl_max_pointsize = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
max_pointsize = gl_max_pointsize;

gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);


self.createShaderProgram();
self.getShaderVariableLocations();

var sample_size = gl.getParameter(gl.SAMPLES);

	if(sample_size==0){

		gl.uniform1f(line_antialiasing_loc,1.0);
	}

	else {gl.uniform1f(line_antialiasing_loc,0.0);}


gl.uniform1f(offset_x_loc,0);
gl.uniform1f(offset_y_loc,0);

gl.uniform1f(scale_loc,1.0);

gl.uniform1f(linewidth_loc,edgewidth);

gl.uniform1f(indexlength_loc,256.0);


nodes = graph.nodes;
edges = graph.edges; 

edges=[];

if(edges.length>0){

bidirectional_edges = [2,3]; //edges 2, 3 are bidirectional
self.markBidirectEdges(edges,bidirectional_edges);
self.sortEdgesByFrom(edges);

console.log("HERE");
nodeToEdges = self.buildNodeToEgdes(nodes,edges);
//console.log(nodeToEdges);

console.log("THERE");
console.log(nodeToEdges.length);

}



maxzoom = self.getMaxZoom(nodes)-1;

this.mouseMoveHandler(canvas_id);
this.addListeners();

use_arrows = false;

//special offset
// offset_x = -17340;
// offset_y = 	218;

self.getMinMax_x();
console.log(min_x);
console.log(max_x);

var cv  = document.getElementById('barcanvas_1');
self.createCanvas(cv);

self.createTexture('barcanvas_1');

}

self.getShaderVariableLocations =function(){


  samplerLoc = gl.getUniformLocation(pointProgram, "uSampler");	
  drawingmodeloc = gl.getUniformLocation(pointProgram, "drawing_mode");
  mouseposloc = gl.getUniformLocation(pointProgram, "mouse_pos");
  pointsizeloc = gl.getUniformLocation(pointProgram, "pointSize");
  width_loc = gl.getUniformLocation(pointProgram, "width");
  height_loc = gl.getUniformLocation(pointProgram, "height");
  offset_x_loc = gl.getUniformLocation(pointProgram, "offset_x");
  offset_y_loc = gl.getUniformLocation(pointProgram, "offset_y");
  scale_loc =gl.getUniformLocation(pointProgram, "scale");
  ratio_loc = gl.getUniformLocation(pointProgram, "ratio");
  linewidth_loc = gl.getUniformLocation(pointProgram, "linewidth");
  line_antialiasing_loc = gl.getUniformLocation(pointProgram, "line_antialiasing");
  indexlength_loc = gl.getUniformLocation(pointProgram, "indexLength");


} // getShaderVariableLocations()

self.createShaderProgram = function()
{
  var vertexSrc = vs_source;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSrc);
  gl.compileShader(vertexShader);

  var fragmentSrc = fs_source;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentSrc);
  gl.compileShader(fragmentShader);

  pointProgram = gl.createProgram();
  gl.attachShader(pointProgram, vertexShader);
  gl.attachShader(pointProgram, fragmentShader);
  gl.linkProgram(pointProgram);

  gl.useProgram(pointProgram);

} // createShaderProgram()


self.run = function()
{
        console.log("GraphEngine is starting...");

        	

				max_x = 500.0+100.0/2; // add calc later // 100 = size
				max_y = 400.0+100.0/2;


				// ratio_x = canvas.width / max_x;
				// ratio_y = canvas.height / max_y;

				var simple_edges = self.getEdgeData(edges);
	
				var c = 0;
				var cc = 0;
				var count = 0;
			  	for (var key in simple_edges) {

			  	var cur_edge = simple_edges[key];
				var normal = self.calculateNormal(cur_edge.p1,cur_edge.p2);

	  			rawDataEdges[0+c] = cur_edge.p1.x;
	       		rawDataEdges[1+c] =	cur_edge.p1.y;
	   	     	rawDataEdges[2+c] = normal.x;
   	     		rawDataEdges[3+c] = normal.y;
   		   	 	rawDataEdges[4+c] = cur_edge.p1.x;
	   	     	rawDataEdges[5+c] = cur_edge.p1.y;
 	   	     	rawDataEdges[6+c] = -normal.x;
   	     		rawDataEdges[7+c] = -normal.y;
   		   	 	rawDataEdges[8+c] = cur_edge.p2.x;
		   	 	rawDataEdges[9+c] = cur_edge.p2.y;
	   	     	rawDataEdges[10+c] = normal.x;
   	     		rawDataEdges[11+c] = normal.y;
   		   	 	rawDataEdges[12+c] = cur_edge.p2.x;
	   		  	rawDataEdges[13+c] = cur_edge.p2.y;
	   	     	rawDataEdges[14+c] = -normal.x;
   	     		rawDataEdges[15+c] = -normal.y;

   	     		if(use_arrows){

	   	     		var d ={x:cur_edge.p2.x-cur_edge.p1.x,y:cur_edge.p2.y-cur_edge.p1.y};
	   	     		d = self.normalize(d);

	   	     		rawDataArrows[0+cc] = cur_edge.p2.x+normal.x*arrow_width;
	   	     		rawDataArrows[1+cc]	= cur_edge.p2.y+normal.y*arrow_width;
	     			rawDataArrows[2+cc] = cur_edge.p2.x-normal.x*arrow_width;
	   	     		rawDataArrows[3+cc]	= cur_edge.p2.y-normal.y*arrow_width;
	     			rawDataArrows[4+cc] = cur_edge.p2.x+d.x*arrow_lenght;
	   	     		rawDataArrows[5+cc]	= cur_edge.p2.y+d.y*arrow_lenght;

	   	     		cc+=6;
   	     		}
	  			c+=16;
	  			count++;
			  	}

			  	count = 0;
			  	cc = 0;
			  	rawDataArrowslength = rawDataArrows.length;

			  	//put bidirectional arrows at the end of arrowdata. save length before for access.

			  	if(use_arrows){

			  	for (var key in simple_edges) {

			  	if(edges[count].bidirectional==true){

			  	var cur_edge = simple_edges[key];
			  	var normal = self.calculateNormal(cur_edge.p1,cur_edge.p2);			

	  			var d ={x:cur_edge.p2.x-cur_edge.p1.x,y:cur_edge.p2.y-cur_edge.p1.y};
   	     		d = self.normalize(d);	

   	     		rawDataArrows[rawDataArrowslength+0+cc]  = cur_edge.p1.x+normal.x*arrow_width;
   	     		rawDataArrows[rawDataArrowslength+1+cc]  = cur_edge.p1.y+normal.y*arrow_width;
     			rawDataArrows[rawDataArrowslength+2+cc]  = cur_edge.p1.x-normal.x*arrow_width;
   	     		rawDataArrows[rawDataArrowslength+3+cc]	 = cur_edge.p1.y-normal.y*arrow_width;
     			rawDataArrows[rawDataArrowslength+4+cc]  = cur_edge.p1.x-d.x*arrow_lenght;
   	     		rawDataArrows[rawDataArrowslength+5+cc]  = cur_edge.p1.y-d.y*arrow_lenght;
				cc+=6;
   	     		}	
   	     		count++;

			  	}

			    }


			    var fuck_values = [];

			     for (var key in nodes) {

			     	var node = nodes[key];
			     	fuck_values.push(self.getFloatValue(node.x))

			     }

			     self.getMinMaxF(fuck_values);

			     for(var i=0;i<fuck_values.length;i++){

			     fuck_values[i] = (fuck_values[i]-min_fuck)/(max_fuck-min_fuck)	


			     }

			    var fcount =0;
			  	c=0;
		  	    for (var key in nodes) {
                var node = nodes[key];

		  	   		rawDataNodes[0+c] = node.x;
		  	    	rawDataNodes[1+c] = node.y;
		  	    	rawDataNodes[2+c] = (fuck_values[fcount]);
		  	    fcount++;
	  	    	c+=3;
				}

          
				   gl.uniform2fv(ratio_loc,[ratio_x,ratio_y]); 


				   	//FILL BUFFERS 

		     	   vertex_buffer = gl.createBuffer();
         		   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    	           gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawDataNodes), gl.STATIC_DRAW);
   
       	          		 gl.bindBuffer(gl.ARRAY_BUFFER, null); 
		
		     	   vertex_buffer_edges = gl.createBuffer();
         		   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_edges);
    	           gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawDataEdges), gl.STATIC_DRAW);


    	           indices = self.create6IndexBuffer();
    	           edgeIndexBuffer = gl.createBuffer();
    			   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);
                   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

            	   if(use_arrows){

                   		 gl.bindBuffer(gl.ARRAY_BUFFER, null); 

               	   vertex_buffer_arrows = gl.createBuffer();
         		   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_arrows);
    	           gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rawDataArrows), gl.STATIC_DRAW);	 

                   		 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 

                   arrow_indices = self.create3IndexBuffer();		 
                   arrowIndexBuffer = gl.createBuffer();
    			   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowIndexBuffer);
                   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(arrow_indices), gl.STATIC_DRAW);

                   }

              delete rawDataEdges;
              delete rawDataArrows;
              delete rawDataNodes;
		        			

		      console.log("da");	
  	
		     self.draw();	
     	     self.setStartZoom();
         	 console.log("GraphEngine is running...");

 	    
}


self.getFloatValue= function(x){


//var result = ((x-min_y)/((max_y-min_y)*x_at_min_y)) + ((max_y-x)/((max_y-min_y)*x_at_max_y));

var result = (((x-x_at_min_y)/(x_at_max_y-x_at_min_y))*max_y) + (((x_at_max_y-x)/(x_at_max_y-x_at_min_y))*min_y); 

return result;

}

self.getMinMax_x = function(){

for(var i=0;i<nodes.length;i++){

if(nodes[i].y>max_y){max_y = nodes[i].y;x_at_max_y = nodes[i].x}
if(nodes[i].y<min_y){min_y = nodes[i].y;x_at_min_y = nodes[i].x}

if(nodes[i].x>max_x){max_x = nodes[i].x;}
if(nodes[i].x<min_x){min_x = nodes[i].x}


}



}

    self.draw = function(){

    	 now = Date.now();
         deltaTime = now - then;

         if (deltaTime > interval) {

       	 self.resize(gl.canvas);

		    gl.uniform1f(offset_x_loc,offset_x);
   		  	gl.uniform1f(offset_y_loc,offset_y);
      		gl.uniform1f(scale_loc,scale); 

	        var coord = gl.getAttribLocation(pointProgram, "coordinates");
            var value_loc = gl.getAttribLocation(pointProgram,"float_value");

		       gl.bindBuffer(gl.ARRAY_BUFFER, null); 
    	 	   // gl.disableVertexAttribArray(point_size_loc);
		       // gl.disableVertexAttribArray(type_loc);    // IMPORTANT! OTHERWISE SHADER WILL NOT WORK FOR NEW BUFFER WITHOUT THESE ATTRIBUTES

		 if(edges.length>0){    

		       gl.uniform1f(drawingmodeloc,1.0);    

	       	   
	       	   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
       		   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgeIndexBuffer);

			       gl.bindBuffer(gl.ARRAY_BUFFER, null);
	               gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_edges);
	               gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 16, 0);
	               gl.enableVertexAttribArray(coord);


	    		   gl.vertexAttribPointer(normal_loc, 2, gl.FLOAT, false, 16, 8);
 		   		   gl.enableVertexAttribArray(normal_loc);


		   	   gl.drawElements(gl.TRIANGLES,indices.length, gl.UNSIGNED_INT,0); 
  		
  		}  

			 	gl.uniform1f(drawingmodeloc,0.0); 	


		    	   gl.bindBuffer(gl.ARRAY_BUFFER, null);
     		       gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  
	    	       var stride = 12; // 4(x) + 4(y) + 4(for every other attribute) how many bytes to skip until next "object" starts.
	    	       var offset = 0;

                
			       gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, stride, offset);
			       gl.enableVertexAttribArray(coord);

			       offset += 8;

			       gl.vertexAttribPointer(value_loc, 1, gl.FLOAT, false, stride, offset);
			       gl.enableVertexAttribArray(value_loc);

		       gl.drawArrays(gl.POINTS, 0, nodes.length);

		       if(use_arrows){


       	 	   gl.uniform1f(drawingmodeloc,2.0);

       	 	   gl.disableVertexAttribArray(point_size_loc);
		       gl.disableVertexAttribArray(type_loc); 

     	       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null); 
       		   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowIndexBuffer);

               gl.bindBuffer(gl.ARRAY_BUFFER, null);
               gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_arrows);

               gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 8, 0);
               gl.enableVertexAttribArray(coord);  
		       	
               gl.drawElements(gl.TRIANGLES,arrow_indices.length, gl.UNSIGNED_INT,0); 
           	}
		         
		   }//if delta

	
           requestAnimationFrame(self.draw);
		  
		  }



		  self.createTexture = function(id)
			{
			  var cv = document.getElementById(id);


			  if(texturedefined){gl.deleteTexture(myTexture);} // delete old texture


			  myTexture = gl.createTexture();
			  gl.bindTexture(gl.TEXTURE_2D, myTexture);
			  gl.texImage2D(gl.TEXTURE_2D,
			                0,
			                gl.RGBA,
			                gl.RGBA,
			                gl.UNSIGNED_BYTE,
			                cv);

			  texturedefined = true;

			  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S    , gl.CLAMP_TO_EDGE);
			  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T    , gl.CLAMP_TO_EDGE);

			  gl.bindTexture(gl.TEXTURE_2D, null);

			  gl.activeTexture(gl.TEXTURE0);
			  gl.bindTexture(gl.TEXTURE_2D, myTexture);
			  gl.uniform1i(samplerLoc, 0);


			} // createTexture()


  		  self.resize = function(canvas){

  		  	  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

			  var width = gl.canvas.clientWidth;
			  var height = gl.canvas.clientHeight;

			  if (gl.canvas.width != width ||
			      gl.canvas.height != height) {

			     	gl.canvas.width = width;
			        gl.canvas.height = height;
			    }

			gl.uniform1f(width_loc,width);
			gl.uniform1f(height_loc,height);

			// ratio_x = width / max_x;
			// ratio_y = height / max_y;

			// offset_x = 0;
			// offset_y = 0;

			//gl.uniform2fv(ratio_loc,[ratio_x,ratio_y]);

		}


	self.addListeners = function(){

		// mousePosition = new Object();

		var that = self;

		// if (document.addEventListener) {
		// 	document.addEventListener("mousewheel", this.zoom, false);
		// 	document.addEventListener("DOMMouseScroll", this.zoom, false);
		// }
		// else document.attachEvent("onmousewheel", this.zoom);


		 $('#canvascontainer').mousedown(function(){

     	 that.mousedown=true;
  		 that.nodedrag=false;

		 var x = mousePosition.x;
		 var y = mousePosition.y;
		 clickPosition.x = x;
		 clickPosition.y = y;
		 drag_vecx  = offset_x-x;
		 drag_vecy  = offset_y-y;

  	      for (var i=0;i<nodes.length;i++) {

  	      var node_pos = {x:0,y:0};	
  	      node_pos.x = (nodes[i].x*scale)+offset_x;
  	      node_pos.y = (nodes[i].y*scale)+offset_y;

  	      var dist = self.euclideanDistance(clickPosition,node_pos);
  	      var radius = nodes[i].size/2.0;
  	      if(dist<radius*scale){
  	      	 that.nodedrag = true;
  	      	 var clo_x= (node_pos.x-clickPosition.x);
	      	 var clo_y= (node_pos.y-clickPosition.y);

  	      	 selectedNode = {idx:i,x:node_pos.x,y:node_pos.y,clickOffsetx:clo_x,clickOffsety:clo_y};
  	      	 break;
  	      }
  
  	      } //maybe use faster loop 



	     });


		  $('#canvascontainer').mouseout(function() {
		  that.outsidecanvas = true;		  		
		  });

		  $('#wrapper').mouseup(function() {
		  	if(that.outsidecanvas){
		  		$('#canvascontainer').off('mousemove');	
		  		$('#canvascontainer').css('cursor', 'default');
		  	}

		  });


		$('#canvascontainer').mouseup(function() {
		  $('#canvascontainer').css('cursor', 'default');
		  $(this).off('mousemove');
		  that.outsidecanvas = false;

		 if(that.dragging)that.allowclick = false;
		    
		 setTimeout(function(){that.allowclick = true;that.dragging = false;}, 10);
 		 that.mousedown = false;
		});	


		//IF MOUSEUP OCCURS OUTSIDE WINDOW

		$(window).mouseup(function(){
		    $('#canvascontainer').css('cursor', 'default');
		    $('#canvascontainer').off('mousemove');
		 if(that.dragging)allowclick = false;   
		 setTimeout(function(){that.allowclick = true;that.dragging = false;}, 10);
		that.mousedown = false; 
		that.nodedrag=false;   
		});


		$('#canvascontainer').on('mousewheel DOMMouseScroll', self.handleMouseWheel);
  
	


	 },

 self.handleMouseWheel = function(e){

  e.preventDefault();

   if(!self.nodedrag){

   	self.zoom(e);

   }

   else{

   	self.scaleNode(e);

   }


 },	


 self.scaleNode = function(e){

    var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))	

	var idx = selectedNode.idx;
	var size = nodes[idx].size;  
	size += delta*0.4;	

	if(size<=largest_node_size&&size>=smallest_node_size){

   	nodes[idx].size = size;

	var updateArray = [];

   		updateArray[0] = nodes[idx].x;
   		updateArray[1] = nodes[idx].y;
   		updateArray[2] = size;
    	updateArray[3] = nodes[idx].type;

   		gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
 		gl.bufferSubData(gl.ARRAY_BUFFER, idx*16, new Float32Array(updateArray));

	self.updateEdges();
	}


 }, 

 self.zoom = function(e) {	

 e.preventDefault();

   zooming = true; 

	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))

   		if(minzoom<=zoom+delta){
			  if(maxzoom>=zoom+delta){
  			   zoom += delta;

	   		   if(zoom>oldzoom){
	   		        scale = oldscale*const_fac;
	   			 }

		   		 else{
		    	     scale = scale/const_fac;
	        	}
	       }
	       else{zoom=maxzoom} 	 
    	}
    	else{zoom = minzoom;} 

			    var scalefactor = scale/oldscale;

		    	offset_x = offset_x * scalefactor;
				offset_y = offset_y * scalefactor;

			    var newpos = new Object();
			    newpos.x = mousePosition.x * scalefactor;
			    newpos.y = mousePosition.y * scalefactor;

							
			    var diffvec = new Object();
			    diffvec.x = mousePosition.x - newpos.x;
			    diffvec.y = mousePosition.y - newpos.y;

			    
			   offset_x +=  diffvec.x;
			   offset_y +=  diffvec.y;
			   
			   oldzoom = zoom;
			   oldscale = scale;

			   zooming = false; 
	   
	}

	   self.mouseMoveHandler = function(canvas_id){

			var that = self;

		  	$('#'+canvas_id).on('mousemove',function(event){
	  	    var rect = canvas.getBoundingClientRect();	
  			var x = event.clientX - rect.left; 
  			var y = event.clientY - rect.top;

  			mousePosition.x  = x;
  			mousePosition.y  = y;

  		    gl.uniform2fv(mouseposloc,[x,y]);

  		    if(that.mousedown&&!that.nodedrag)self.drag(event);
  		    if(that.nodedrag)self.dragNode(event);

  			
		  	// x/=that.ratio_x;  // change screencoords to relative coords
		  	// y/=that.ratio_y;


		  	});


		  }

	   self.drag = function(e) {

				  mousedown = true;
				 
				  dragging = false;
				  outsidecanvas = false;

				  var that = self;	

				  // $('#canvascontainer').on('mousemove',function(event) {

				  $(this).css('cursor', 'pointer');
				
				  var math = Math.abs((clickPosition.x-mousePosition.x)+(clickPosition.y-mousePosition.y));
	 				
				  if(math>1) that.dragging = true; //> param = distance mouse has moved determines sesibility of click with move
				 				   
				  var delta_x = mousePosition.x +drag_vecx;
				  var delta_y = mousePosition.y +drag_vecy;

				   offset_x = delta_x;
				   offset_y = delta_y;

				 // });

				},

	   self.dragNode = function(e) {

	   	//newpositions must be transformed back to original coords because shader will apply scale and translation afterwards anyawy
	   	var newpos_x = (mousePosition.x-offset_x+selectedNode.clickOffsetx)/scale;
   		var newpos_y = (mousePosition.y-offset_y+selectedNode.clickOffsety)/scale;
	   	var idx = selectedNode.idx;

   		nodes[idx].x = newpos_x;
   		nodes[idx].y = newpos_y;

   		var updateArray = [];

   		updateArray[0] = newpos_x;
    	updateArray[1] = newpos_y;
   		updateArray[2] = nodes[idx].size;
    	updateArray[3] = nodes[idx].type;

   		gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
 		gl.bufferSubData(gl.ARRAY_BUFFER, idx*16, new Float32Array(updateArray));

   	     //TODO update node to last position in array so that it has the "highest z-index"; 

   		//update Edges 
   		self.updateEdges();
	   },



	   self.updateEdges = function(){


   		var edges_to_update = nodeToEdges[selectedNode.idx];

		var base_edges = [];
   		for(var i=0;i<edges_to_update.length;i++){
   			base_edges[i] = edges[edges_to_update[i]];
   		}//maybe not needed loop 

   		var simple_edges = self.getEdgeData(base_edges);

 
   		var count = 0;
   		 	for (var key in simple_edges) {

	  			var cur_edge = simple_edges[key];
	  			var from_node = nodes[base_edges[count].from];
  				var from_radius = (from_node.size/2.0);
	  			var to_node = nodes[base_edges[count].to];
	  			var to_radius = (to_node.size/2.0);
	  			var dist = self.euclideanDistance(from_node,to_node);
	  			var updateArray = [];

	  			if((dist<(from_radius+to_radius+(2*edgegap)))){
	  			cur_edge.p1={x:0,y:0};
	  			cur_edge.p2={x:0,y:0};		
	  			}// better than not execution below code on !condition. no false fragments remain. better would be integrate to simple_edges

				var normal = self.calculateNormal(cur_edge.p1,cur_edge.p2);
		
	  			var idx =  edges_to_update[count]*16;

	  			updateArray[0] = cur_edge.p1.x;
	       		updateArray[1] = cur_edge.p1.y;
	   	     	updateArray[2] = normal.x;
   	     		updateArray[3] = normal.y;
   		   	 	updateArray[4] = cur_edge.p1.x;
	   	     	updateArray[5] = cur_edge.p1.y;
 	   	     	updateArray[6] = -normal.x;
   	     		updateArray[7] = -normal.y;
   		   	 	updateArray[8] = cur_edge.p2.x;
		   	 	updateArray[9] = cur_edge.p2.y;
	   	     	updateArray[10] = normal.x;
   	     		updateArray[11] = normal.y;
   		   	 	updateArray[12] = cur_edge.p2.x;
	   		  	updateArray[13] = cur_edge.p2.y;
	   	     	updateArray[14] = -normal.x;
   	     		updateArray[15] = -normal.y;

   	     		 gl.bindBuffer(gl.ARRAY_BUFFER, null);
	             gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_edges);
	             gl.bufferSubData(gl.ARRAY_BUFFER,idx*4, new Float32Array(updateArray));


   	     		if(use_arrows){

   	     		updateArray = [];	
   	     			
     			var d ={x:cur_edge.p2.x-cur_edge.p1.x,y:cur_edge.p2.y-cur_edge.p1.y};
   	     		d = self.normalize(d);

   	     		var idx2 =  edges_to_update[count]*6;

   	     		updateArray[0] 	= cur_edge.p2.x+normal.x*arrow_width;
   	     		updateArray[1]	= cur_edge.p2.y+normal.y*arrow_width;
     			updateArray[2] 	= cur_edge.p2.x-normal.x*arrow_width;
   	     		updateArray[3]	= cur_edge.p2.y-normal.y*arrow_width;
     			updateArray[4] 	= cur_edge.p2.x+d.x*arrow_lenght;
   	     		updateArray[5]	= cur_edge.p2.y+d.y*arrow_lenght;


	     		gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_arrows);
             	gl.bufferSubData(gl.ARRAY_BUFFER, idx2*4, new Float32Array(updateArray));

	 				if(base_edges[count].bidirectional==true){
	 					
	 				var idx_in_bidirect_edges = base_edges[count].bidirectional_idx;
	 			
	 				var idx3 = rawDataArrowslength+idx_in_bidirect_edges*6;
	   	     		updateArray[0]	= cur_edge.p1.x+normal.x*arrow_width;
	   	     		updateArray[1]  = cur_edge.p1.y+normal.y*arrow_width;
	     			updateArray[2]	= cur_edge.p1.x-normal.x*arrow_width;
	   	     		updateArray[3]	= cur_edge.p1.y-normal.y*arrow_width;
	     			updateArray[4]	= cur_edge.p1.x-d.x*arrow_lenght;
	   	     		updateArray[5]	= cur_edge.p1.y-d.y*arrow_lenght;


			     	 gl.bindBuffer(gl.ARRAY_BUFFER, null);
		             gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_arrows);
		             gl.bufferSubData(gl.ARRAY_BUFFER, idx3*4, new Float32Array(updateArray));

	   	     		}

   	     		}

 
	   		 	count++;

			  	}

	   },			

			self.create6IndexBuffer = function()
			{
			  var numOfSquares =edges.length;
	
			  var indices= new Array(numOfSquares*6); // 1 square
			  var index=0;
			  var cc=0;
			  for ( var k=0 ; k<numOfSquares; k++ )
			  {
			    indices[index]=cc;
			    indices[index+1]=cc+3;
			    indices[index+2]=cc+2;
			    indices[index+3]=cc;
			    indices[index+4]=cc+1;
			    indices[index+5]=cc+3;
		
			    index+=6;
			    cc+=4;

			  } // for k

			 return indices;

			}

				self.create3IndexBuffer = function()
			{
			  var numOfArrows =edges.length+Object.keys(bidirectional_edges).length;;
	
			  var indices= new Array(numOfArrows*3); // 1 square
			  var index=0;
			  var cc=0;
			  for ( var k=0 ; k<numOfArrows; k++ )
			  {
			    indices[index]=cc;
			    indices[index+1]=cc+1;
			    indices[index+2]=cc+2;
		
			    index+=3;
			    cc+=3;

			  } // for k

			 return indices;

			}



		  self.getEdgeData = function(edges){

		  var result = [];
		  var count = 0; 		
		  	for (var i=0;i<edges.length; i++) {
  				  var edge = edges[i];
  				  if(edge.bidirectional==true)bidirect=true;
  				  else bidirect = false;
  				  var s1 = self.calcCirclePoint(nodes[edge.from],nodes[edge.to],false,bidirect); //calculates intersection at from_node
  				  var s2 = self.calcCirclePoint(nodes[edge.to],nodes[edge.from],true,bidirect);	//calculates intersection at to_node

  				  var s ={p1:"",p2:""};
  				  s.p1 = s1;
  				  s.p2 = s2;
  				  result[count] = s;
  				  count ++;
  				  				
				}

			return result; 		
		  }

		self.calcCirclePoint = function(node_from, node_to, reverse,bidirect){

  				var d = {x:0,y:0};	
			  	d.x = node_to.x - node_from.x;
			    d.y = node_to.y - node_from.y;	

			  	var s = {x:0,y:0};

				var factor = 0.0;
				if((reverse||bidirect)&&use_arrows){factor=arrow_lenght;}//increases the gap for arrowhead to fit in

			  	var r = (node_from.size/2.0)+edgegap+factor;

			  	s.x = node_from.x + r*(d.x/self.getVectorLength(d));
		 	 	s.y = node_from.y + r*(d.y/self.getVectorLength(d));

			  return s;

		 }

		 self.calculateNormal = function(p1,p2){
		 //get normalized normal
		 var dx = p2.x - p1.x;
		 var dy = p2.y - p1.y;

		 var normal = {x:-dy,y:dx};	
		 var length = self.getVectorLength(normal);

		 return {x:normal.x/length,y:normal.y/length};

		 	}


		self.normalize = function(vector){

		 var length = self.getVectorLength(vector);	
		 return {x:vector.x/length,y:vector.y/length};

		}

		self.translateLine = function(edge,factor){

		var result = {p1:{x:0,y:0},p2:{x:0,y:0}};	
			
		var d = {x:0,y:0};
	    d.y = -(edge.p2.x - edge.p1.x);
	    d.x = edge.p2.y - edge.p1.y;

	    var mag = self.getVectorLength(d);
	    d.x /=mag;
	    d.y /=mag;

	    var p1xnew = edge.p1.x+d.x*factor;
        var p1ynew = edge.p1.y+d.y*factor;
        var p2xnew = edge.p2.x+d.x*factor;
        var p2ynew = edge.p2.y+d.y*factor;

        result.p1.x = p1xnew;
        result.p1.y = p1ynew;
        result.p2.x = p2xnew;
        result.p2.y = p2ynew;

        return result;

		}



		self.getVectorLength = function(vector){

		 return Math.sqrt(vector.x*vector.x + vector.y*vector.y);

		}


		self.buildNodeToEgdes= function(nodes,edges){

		var result = new Array();
		var nodecount = 0;
	
		for (var i=0;i<nodes.length; i++) {
		result[i] = new Array();	
		}

			for (var i=0;i<edges.length;i++) {
		
			  		edge = edges[i];	
			  		if(edge.from==nodecount){
			  			result[nodecount].push(i);
			  			result[edge.to].push(i);
			  			
			  		}
			  		else{nodecount++;
			  			result[nodecount].push(i);
			  			result[edge.to].push(i);
			  			}

		 }

			 return result;
		}


		self.sortEdgesByFrom = function(edges){

			edges.sort(function(a, b){
    			return a.from - b.from;
			});


		}


		self.markBidirectEdges= function(edges,bidirectional_edges){

			  for (var i=0;i<bidirectional_edges.length; i++) {
			  	   var idx = bidirectional_edges[i];
			  	   edges[idx].bidirectional=true;
			  	   edges[idx].bidirectional_idx = i;
			 }
		}		


		self.setStartZoom=function(){

		while(zoom<start_zoom){

	   	 scale *= const_fac;
	   	 zoom++;
		}	

		zoom= start_zoom;
		oldzoom = zoom;
		oldscale = scale;

		}


		self.getMaxZoom = function(nodes){
		var max = 0.1;
		var min = 0.1;
		var result;
			  

		largest_node_size = max;
		smallest_node_size =min;	 

		var count = 0;

			 while(max<max_pointsize){
			 max*=const_fac;
			 count++;
			 }

			 return count;
		}

		self.euclideanDistance = function(p1,p2){

		return Math.sqrt(Math.pow((p2.x-p1.x),2)+Math.pow((p2.y-p1.y),2));		

		}

		self.printCanvas = function(){

			console.log(canvas);
		}
		
return self;

}
