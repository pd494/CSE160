// Triangle.js - Triangle class for WebGL drawing

// Triangle class - represents a right angle triangle at a given position
class Triangle {
  constructor(position, color, size = 0.1) {
    this.type = 'triangle';
   
    this.position = position;  
    this.color = color;        
    this.size = size;          
    
    this.vertices = [
      [position[0], position[1]],  
      [position[0] + this.size, position[1]], 
      [position[0], position[1] + this.size]   
    ];
    
    this.vertexBuffer = null;  
    this.initVertexBuffer();   
  }
  
  initVertexBuffer() {
    // Create a buffer object
    this.vertexBuffer = gl.createBuffer();
    if (!this.vertexBuffer) {
      console.log('Failed to create the buffer object for Triangle');
      return;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    
    // Create Float32Array from vertices (flattened array)
    var verticesArray = [];
    for (var i = 0; i < 3; i++) {
      verticesArray.push(this.vertices[i][0]); // x
      verticesArray.push(this.vertices[i][1]); // y
    }
    var vertices = new Float32Array(verticesArray);
    
    // Write data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Unbind buffer (good practice)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  
  // Render this triangle to the WebGL context (based on HelloTriangle.js)
  render() {
    if (!this.vertexBuffer) {
      console.log('Triangle vertex buffer not initialized');
      return;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    // Unbind buffer after drawing
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
