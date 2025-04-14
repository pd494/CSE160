// ColoredPoint.js (c) 2012 matsuda - Reorganized for better structure
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +  // Add uniform for point size
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +  // Use the uniform variable
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global variables
var gl;
var canvas;
var a_Position;
var u_FragColor;
var u_PointSize;  // Point size uniform location
var currentColor = [1.0, 0.0, 0.0, 1.0];  // Current drawing color (red by default)
var currentSize = 10;  // Current point size (default: 10)
var currentSegments = 10;  // Current number of segments for circles (default: 10)

// Drawing mode variables
var currentDrawingMode = 'point';  // Default drawing mode: 'point', 'triangle', or 'circle'

// Scene graph - list of all shapes to be rendered
var shapesList = [];

// Point and Triangle classes are now in separate files (Point.js and Triangle.js)

function main() {
  // Setup WebGL context
  if (!setupWebGL()) {
    console.log('Failed to setup WebGL context');
    return;
  }
  
  // Connect variables to GLSL
  if (!connectVariablesToGLSL()) {
    console.log('Failed to connect variables to GLSL');
    return;
  }
  
  // Register event handlers
  canvas.onmousedown = click;
  canvas.onmousemove = drag;
  
  // Register color slider event handlers
  document.getElementById('redSlider').addEventListener('input', updateColor);
  document.getElementById('greenSlider').addEventListener('input', updateColor);
  document.getElementById('blueSlider').addEventListener('input', updateColor);
  
  // Register color preset button event handlers
  document.getElementById('redBtn').addEventListener('click', setRedColor);
  document.getElementById('greenBtn').addEventListener('click', setGreenColor);
  document.getElementById('blueBtn').addEventListener('click', setBlueColor);
  
  // Register size slider event handler
  document.getElementById('sizeSlider').addEventListener('input', updateSize);
  
  // Register segments slider event handler
  document.getElementById('segmentsSlider').addEventListener('input', updateSegments);
  
  // Register drawing mode button event handlers
  document.getElementById('pointBtn').addEventListener('click', setPointMode);
  document.getElementById('triangleBtn').addEventListener('click', setTriangleMode);
  document.getElementById('circleBtn').addEventListener('click', setCircleMode);

  // Register clear button event handler
  document.getElementById('clearBtn').addEventListener('click', clearCanvas);
  
  // Set clear color and clear canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Initialize point size
  gl.uniform1f(u_PointSize, currentSize);
}

// Update color based on slider values
function updateColor() {
  // Get slider values
  var r = parseFloat(document.getElementById('redSlider').value);
  var g = parseFloat(document.getElementById('greenSlider').value);
  var b = parseFloat(document.getElementById('blueSlider').value);
  
  // Update current color
  currentColor = [r, g, b, 1.0];
  
  // Update displayed values
  document.getElementById('redValue').textContent = r.toFixed(2);
  document.getElementById('greenValue').textContent = g.toFixed(2);
  document.getElementById('blueValue').textContent = b.toFixed(2);
}

// Set color to red (1,0,0)
function setRedColor() {
  // Set slider values
  document.getElementById('redSlider').value = 1;
  document.getElementById('greenSlider').value = 0;
  document.getElementById('blueSlider').value = 0;
  
  // Update color
  updateColor();
}

// Set color to green (0,1,0)
function setGreenColor() {
  // Set slider values
  document.getElementById('redSlider').value = 0;
  document.getElementById('greenSlider').value = 1;
  document.getElementById('blueSlider').value = 0;
  
  // Update color
  updateColor();
}

// Set color to blue (0,0,1)
function setBlueColor() {
  // Set slider values
  document.getElementById('redSlider').value = 0;
  document.getElementById('greenSlider').value = 0;
  document.getElementById('blueSlider').value = 1;
  
  // Update color
  updateColor();
}

// Update point size based on slider value
function updateSize() {
  // Get slider value
  var size = parseFloat(document.getElementById('sizeSlider').value);
  
  // Update current size
  currentSize = size;
  
  // Update displayed value
  document.getElementById('sizeValue').textContent = size.toFixed(1);
}

// Update circle segments based on slider value
function updateSegments() {
  // Get slider value
  var segments = parseInt(document.getElementById('segmentsSlider').value);
  
  // Update current segments
  currentSegments = segments;
  
  // Update displayed value
  document.getElementById('segmentsValue').textContent = segments;
}

// Clear the canvas by emptying the shapes list and redrawing
function clearCanvas() {
  // Clear the shapes list
  shapesList = [];
  
  // Reset triangle vertices if in triangle mode
  triangleVertices = [];
  
  // Redraw the empty canvas
  renderAllShapes();
}

// Set drawing mode to point
function setPointMode() {
  currentDrawingMode = 'point';
  
  // Update button styling to show active mode
  document.getElementById('pointBtn').style.backgroundColor = '#000000';
  document.getElementById('triangleBtn').style.backgroundColor = '#555555';
  document.getElementById('circleBtn').style.backgroundColor = '#555555';
}

// Set drawing mode to triangle
function setTriangleMode() {
  currentDrawingMode = 'triangle';

  // Update button styling to show active mode
  document.getElementById('pointBtn').style.backgroundColor = '#555555';
  document.getElementById('triangleBtn').style.backgroundColor = '#000000';
  document.getElementById('circleBtn').style.backgroundColor = '#555555';
}

// Set drawing mode to circle
function setCircleMode() {
  currentDrawingMode = 'circle';
  
  // Update button styling to show active mode
  document.getElementById('pointBtn').style.backgroundColor = '#555555';
  document.getElementById('triangleBtn').style.backgroundColor = '#555555';
  document.getElementById('circleBtn').style.backgroundColor = '#000000';
}

// Setup WebGL context
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }

  // Get the rendering context for WebGL with preserveDrawingBuffer for better performance
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return false;
  }
  
  return true;
}

// Connect JavaScript variables to GLSL variables
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return false;
  }
  
  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }
  
  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return false;
  }
  
  // Get the storage location of u_PointSize
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return false;
  }
  
  return true;
}

// Handle mouse click event
function click(ev) {
  addPoint(ev);
}

// Handle mouse drag event
function drag(ev) {
  // Only draw if mouse button is pressed (button 1 is the left mouse button)
  if (ev.buttons === 1) {
    addPoint(ev);
  }
}

// Add a point or triangle at the current mouse position
function addPoint(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  // Convert coordinates to WebGL coordinate system
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  if (currentDrawingMode === 'point') {
    // Point Mode: Create a new Point object with current position, color, and size
    var newPoint = new Point(
      [x, y],                   // position
      currentColor.slice(),     // color (make a copy)
      currentSize               // size
    );
    
    // Add the new point to the shapes list
    shapesList.push(newPoint);
  } 
  else if (currentDrawingMode === 'triangle') {
    // Triangle Mode: Create a right angle triangle at the clicked position
    var triangleSize = currentSize / 50; // Scale triangle size based on point size
    var newTriangle = new Triangle(
      [x, y],                   // position (apex of right angle)
      currentColor.slice(),     // color (make a copy)
      triangleSize              // size
    );
    
    // Add the new triangle to the shapes list
    shapesList.push(newTriangle);
  }
  else if (currentDrawingMode === 'circle') {
    // Circle Mode: Create a circle at the clicked position
    var newCircle = new Circle();
    
    // Set circle properties
    newCircle.position = [x, y, 0.0];  // Center position
    newCircle.color = currentColor.slice();  // Color (make a copy)
    newCircle.size = currentSize;  // Size based on current point size
    newCircle.segments = currentSegments;  // Number of segments based on slider
    
    // Add the new circle to the shapes list
    shapesList.push(newCircle);
  }

  // Render all shapes with performance monitoring
  var startTime = performance.now();
  renderAllShapes();
  var endTime = performance.now();
  
  // Log rendering time if it's taking too long (more than 16ms, which is roughly 60fps)
  var renderTime = endTime - startTime;
  if (renderTime > 16) {
    console.log('Rendering ' + shapesList.length + ' shapes took ' + renderTime.toFixed(2) + ' ms');
  }
}

// Render all shapes in the scene graph
function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw all shapes in the shapes list
  for(var i = 0; i < shapesList.length; i++) {
    // Call the render method of each shape
    shapesList[i].render();
  }
}
