// Cube.js - Cube class for WebGL drawing in 3D

// Draws a triangle using WebGL buffer and coordinates
function drawTriangle3D(vertices) {
  var n = vertices.length / 3; // Calculate number of vertices from array length
  
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Function to draw triangles with UV mapping more efficiently
function drawTriangle3DUVFast(vertices, uvs) {
  var n = vertices.length / 3; // Calculate number of vertices from array length
  
  // Create and set up position buffer
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the vertex buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  // Create and set up UV buffer
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the UV buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);
  
  // Draw all triangles in a single call
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  // Clean up
  gl.deleteBuffer(vertexBuffer);
  gl.deleteBuffer(uvBuffer);
}

// Function to draw lines using WebGL buffer and coordinates
function drawLines(vertices, mode = gl.LINE_LOOP) {
  var n = vertices.length / 3; // Calculate number of vertices from array length
  
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(mode, 0, n);
}

class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0]; 
    this.matrix = new Matrix4(); 
    this.textureNum = -1; 
  }
  
  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum)
      
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Front face (z = 0) with UV coordinates
    drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    // Back face (z = 1) with UV coordinates
    drawTriangle3DUV([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    // Top face (y = 1) with UV coordinates
    drawTriangle3DUV([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], [0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    // Bottom face (y = 0) with UV coordinates
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 1.0, 1.0, 0.0]);

    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    // Right face (x = 1) with UV coordinates
    drawTriangle3DUV([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);
    drawTriangle3DUV([1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], [0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);

    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    // Left face (x = 0) with UV coordinates
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], [0.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3DUV([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
  }
  
  renderFast() {
    var rgba = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    var allverts = [];
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // First triangle
      0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0   // Second triangle
    ]);
    
    // Back face (z = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // First triangle
      0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0   // Second triangle
    ]);
    
    // Top face (y = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    allverts = allverts.concat([
      0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,  // First triangle
      0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0   // Second triangle
    ]);
    
    // Bottom face (y = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // First triangle
      0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0   // Second triangle
    ]);
    
    // Right face (x = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    allverts = allverts.concat([
      1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,  // First triangle
      1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0   // Second triangle
    ]);
    
    // Left face (x = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,  // First triangle
      0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0   // Second triangle
    ]);
    
    // Draw all triangles at once
    drawTriangle3D(allverts);
  }
  
  renderFastUV() {
    var rgba = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    // Arrays to hold all vertices and UV coordinates
    var allverts = [];
    var alluvs = [];
    
    // Front face (z = 0)
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    
      0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0  
    ]);
    alluvs = alluvs.concat([
      0.0, 0.0, 1.0, 1.0, 1.0, 0.0,  
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0   
    ]);
    
    // Back face (z = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0,  
      0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0   
    ]);
    alluvs = alluvs.concat([
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0,  
      0.0, 0.0, 1.0, 1.0, 1.0, 0.0  
    ]);
    
    // Top face (y = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    allverts = allverts.concat([
      0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0,  
      0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0  
    ]);
    alluvs = alluvs.concat([
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  
      0.0, 0.0, 1.0, 1.0, 0.0, 1.0   
    ]);
    
    // Bottom face (y = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0,  
      0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0   
    ]);
    alluvs = alluvs.concat([
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0,  
      0.0, 0.0, 1.0, 1.0, 1.0, 0.0   
    ]);
    
    // Right face (x = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    allverts = allverts.concat([
      1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0,  
      1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0   
    ]);
    alluvs = alluvs.concat([
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  
      0.0, 0.0, 1.0, 1.0, 0.0, 1.0   
    ]);
    
    // Left face (x = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    allverts = allverts.concat([
      0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,  
      0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0   
    ]);
    alluvs = alluvs.concat([
      0.0, 0.0, 0.0, 1.0, 1.0, 1.0,  
      0.0, 0.0, 1.0, 1.0, 0.0, 1.0   
    ]);
    
    drawTriangle3DUVFast(allverts, alluvs);
  }
  
  renderWireframe() {
    var rgba = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    drawLines([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]);
    
    drawLines([0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0]);
    
    drawLines([0.0, 0.0, 0.0, 0.0, 0.0, 1.0], gl.LINES);
    drawLines([1.0, 0.0, 0.0, 1.0, 0.0, 1.0], gl.LINES);
    drawLines([1.0, 1.0, 0.0, 1.0, 1.0, 1.0], gl.LINES);
    drawLines([0.0, 1.0, 0.0, 0.0, 1.0, 1.0], gl.LINES);
  }
  
  renderFastWireframe() {
    var rgba = this.color;
    
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    
    var lineVertices = [
      // Front face
      0.0, 0.0, 0.0, 
      1.0, 0.0, 0.0,
      1.0, 1.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, // Close the loop
      
      0.0, 0.0, 1.0,
      1.0, 0.0, 1.0,
      1.0, 1.0, 1.0,
      0.0, 1.0, 1.0,
      0.0, 0.0, 1.0, // Close the loop
    ];
    
    drawLines(lineVertices, gl.LINE_STRIP);
    
    var connectingEdges = [
      // Connect front to back corners
      0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
      1.0, 0.0, 0.0, 1.0, 0.0, 1.0,
      1.0, 1.0, 0.0, 1.0, 1.0, 1.0,
      0.0, 1.0, 0.0, 0.0, 1.0, 1.0
    ];
    
    drawLines(connectingEdges, gl.LINES);
  }
}
