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

// Function to draw triangles with UV mapping and normals
function drawTriangle3DUVNormal(vertices, uvs, normals) {
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
  
  // Create and set up normal buffer
  var normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    console.log('Failed to create the normal buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);
  
  // Draw all triangles in a single call
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  // Clean up
  gl.deleteBuffer(vertexBuffer);
  gl.deleteBuffer(uvBuffer);
  gl.deleteBuffer(normalBuffer);
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

    // Front face (z = 0) - Normal pointing towards +Z (0, 0, 1)
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0], 
      [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
    );
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0], 
      [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0]
    );

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    // Back face (z = 1) - Normal pointing towards -Z (0, 0, -1)
    drawTriangle3DUVNormal(
      [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0], 
      [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]
    );
    drawTriangle3DUVNormal(
      [0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0], 
      [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0]
    );

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    // Top face (y = 1) - Normal pointing towards +Y (0, 1, 0)
    drawTriangle3DUVNormal(
      [0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0], 
      [0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
      [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
    );
    drawTriangle3DUVNormal(
      [0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0], 
      [0.0, 0.0, 1.0, 1.0, 0.0, 1.0],
      [0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]
    );

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    // Bottom face (y = 0) - Normal pointing towards -Y (0, -1, 0)
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0], 
      [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0]
    );
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0], 
      [0.0, 0.0, 1.0, 1.0, 1.0, 0.0],
      [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0]
    );

    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    // Right face (x = 1) - Normal pointing towards +X (1, 0, 0)
    drawTriangle3DUVNormal(
      [1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0], 
      [0.0, 0.0, 1.0, 0.0, 1.0, 1.0],
      [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    );
    drawTriangle3DUVNormal(
      [1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0], 
      [0.0, 0.0, 1.0, 1.0, 0.0, 1.0],
      [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    );

    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    // Left face (x = 0) - Normal pointing towards -X (-1, 0, 0)
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0], 
      [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
      [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]
    );
    drawTriangle3DUVNormal(
      [0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0], 
      [0.0, 0.0, 1.0, 1.0, 0.0, 1.0],
      [-1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0]
    );
  }
  
  renderWireframe() {
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
