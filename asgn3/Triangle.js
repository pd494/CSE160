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
  var n = vertices.length / 3;  // Calculate the number of vertices from array length
  if (n < 3) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
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
  
  // Draw the triangles - n is now the total number of vertices
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  // Clean up: delete the buffer
  gl.deleteBuffer(vertexBuffer);
}


function drawTriangle3DUV(vertices, uv) {
  var n = vertices.length / 3;  // Calculate the number of vertices from array length
  if (n < 3) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
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
  
  // UV coordinates buffer
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
  
  // Assign the buffer object to a_UV variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  
  // Enable the assignment to a_UV variable
  gl.enableVertexAttribArray(a_UV);
  
  // Draw the triangles - n is now the total number of vertices
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  // Clean up: delete the buffers
  gl.deleteBuffer(vertexBuffer);
  gl.deleteBuffer(uvBuffer);
}
