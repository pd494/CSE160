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

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0]; 
    this.matrix = new Matrix4(); 
  }
  
  render() {
    var rgba = this.color;
    
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  
      1.0, 0.0, 0.0,  
      1.0, 1.0, 0.0   
    ]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  
      1.0, 1.0, 0.0,  
      0.0, 1.0, 0.0   
    ]);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 1.0,  
      0.0, 1.0, 1.0,  
      1.0, 1.0, 1.0   
    ]);
    drawTriangle3D([
      0.0, 0.0, 1.0,  
      1.0, 1.0, 1.0,  
      1.0, 0.0, 1.0   
    ]);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([
      0.0, 1.0, 0.0,  
      1.0, 1.0, 0.0,  
      1.0, 1.0, 1.0   
    ]);
    drawTriangle3D([
      0.0, 1.0, 0.0,  
      1.0, 1.0, 1.0,  
      0.0, 1.0, 1.0   
    ]);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  
      0.0, 0.0, 1.0,  
      1.0, 0.0, 1.0   
    ]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  
      1.0, 0.0, 1.0,  
      1.0, 0.0, 0.0   
    ]);

    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3D([
      1.0, 0.0, 0.0,  
      1.0, 0.0, 1.0,  
      1.0, 1.0, 1.0   
    ]);
    drawTriangle3D([
      1.0, 0.0, 0.0,  
      1.0, 1.0, 1.0,  
      1.0, 1.0, 0.0   
    ]);

    gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  
      0.0, 1.0, 0.0,  
      0.0, 1.0, 1.0   
    ]);
    drawTriangle3D([
      0.0, 0.0, 0.0,  
      0.0, 1.0, 1.0,  
      0.0, 0.0, 1.0   
    ]);
  }
}
