// - implementation from  https://www.youtube.com/watch?v=QCX1Gtbjz5w&list=PLbyTU_tFIkcMK5FiV6btXxHQAy15p0j7X&index=21
// Circle class - represents a circle shape with position, color, and size
class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0, 0.0]; 
    this.color = [1.0, 1.0, 1.0, 1.0]; 
    this.size = 5.0; 
    this.segments = 10; 
  }
  
  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    var d = this.size/200.0; 
    
    let angleStep = 360/this.segments;
    for(var angle = 0; angle < 360; angle=angle+angleStep) {
      let centerPt = [xy[0], xy[1]];
      let angle1 = angle;
      let angle2 = angle+angleStep;
      let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
      let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
      let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
      let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];
      
      drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    }
  }
}

function drawTriangle(vertices) {
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
  // Clean up: delete the buffer
  gl.deleteBuffer(vertexBuffer);
}
