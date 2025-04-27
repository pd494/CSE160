// Cube.js - Cube class for WebGL drawing in 3D

// Draws a triangle using WebGL buffer and coordinates
function drawTriangle3D(vertices) {
  var n = 3; // Number of vertices
  
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Cube class - represents a complete 3D cube with 6 faces
class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0]; // Default color: white
    this.matrix = new Matrix4(); // Matrix for transformations
  }
  
  render() {
    var rgba = this.color;
    
    // Pass the model matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Front face - positive z
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  // Vertex 1
      1.0, 0.0, 0.0,  // Vertex 2
      1.0, 1.0, 0.0   // Vertex 3
    ]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  // Vertex 1
      1.0, 1.0, 0.0,  // Vertex 3
      0.0, 1.0, 0.0   // Vertex 4
    ]);

    // Back face - negative z
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 1.0,  // Vertex 5
      0.0, 1.0, 1.0,  // Vertex 6
      1.0, 1.0, 1.0   // Vertex 7
    ]);
    drawTriangle3D([
      0.0, 0.0, 1.0,  // Vertex 5
      1.0, 1.0, 1.0,  // Vertex 7
      1.0, 0.0, 1.0   // Vertex 8
    ]);

    // Top face - positive y
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([
      0.0, 1.0, 0.0,  // Vertex A
      1.0, 1.0, 0.0,  // Vertex B
      1.0, 1.0, 1.0   // Vertex C
    ]);
    drawTriangle3D([
      0.0, 1.0, 0.0,  // Vertex A
      1.0, 1.0, 1.0,  // Vertex C
      0.0, 1.0, 1.0   // Vertex D
    ]);

    // Bottom face - negative y
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  // Vertex E
      0.0, 0.0, 1.0,  // Vertex F
      1.0, 0.0, 1.0   // Vertex G
    ]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  // Vertex E
      1.0, 0.0, 1.0,  // Vertex G
      1.0, 0.0, 0.0   // Vertex H
    ]);

    // Right face - positive x
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3D([
      1.0, 0.0, 0.0,  // Vertex I
      1.0, 0.0, 1.0,  // Vertex J
      1.0, 1.0, 1.0   // Vertex K
    ]);
    drawTriangle3D([
      1.0, 0.0, 0.0,  // Vertex I
      1.0, 1.0, 1.0,  // Vertex K
      1.0, 1.0, 0.0   // Vertex L
    ]);

    // Left face - negative x
    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  // Vertex M
      0.0, 1.0, 0.0,  // Vertex N
      0.0, 1.0, 1.0   // Vertex O
    ]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  // Vertex M
      0.0, 1.0, 1.0,  // Vertex O
      0.0, 0.0, 1.0   // Vertex P
    ]);
  }
}
