// Point.js - Point class for WebGL drawing

// Point class - represents a point shape with position, color, and size
class Point {
  constructor(position, color, size) {
    this.type = 'point';
    this.position = position;  // [x, y]
    this.color = color;        // [r, g, b, a]
    this.size = size;          // point size
  }
  
  // Render this point to the WebGL context
  render() {
    // Disable vertex attribute array (needed for proper triangle/point switching)
    gl.disableVertexAttribArray(a_Position);
    
    // Pass the position to a_Position variable
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    
    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    
    // Pass the size to u_PointSize variable
    gl.uniform1f(u_PointSize, this.size);
    
    // Draw the point
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
