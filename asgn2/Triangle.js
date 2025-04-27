// Triangle.js - Triangle class for WebGL drawing

// Triangle class - represents a right angle triangle at a given position
class Triangle {
  constructor() {
    this.type = 'triangle';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.vertices = [
      0.0, -1.0, 0.0,  // Point at bottom
     -1.0,  1.0, 0.0,  // Top left
      1.0,  1.0, 0.0   // Top right
    ];
  }
  

  
  // Render this triangle to the WebGL context (based on HelloTriangle.js)
  render() {
    var rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    drawTriangle3D(this.vertices);
  }
}

function drawTriangle3D(vertices) {
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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0); // Changed from 2 to 3 for 3D
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  
  // Clean up: delete the buffer
  gl.deleteBuffer(vertexBuffer);
}
