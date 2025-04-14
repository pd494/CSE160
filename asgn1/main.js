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

// Animation control
var animationRunning = false;
var animationId = null;

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
  
  // Register show drawing button event handler
  document.getElementById('drawingBtn').addEventListener('click', showMyDrawing);
  
  // Set clear color and clear canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Initialize point size
  gl.uniform1f(u_PointSize, currentSize);
}

function updateColor() {
  var r = parseFloat(document.getElementById('redSlider').value);
  var g = parseFloat(document.getElementById('greenSlider').value);
  var b = parseFloat(document.getElementById('blueSlider').value);
  
  currentColor = [r, g, b, 1.0];
  
  document.getElementById('redValue').textContent = r.toFixed(2);
  document.getElementById('greenValue').textContent = g.toFixed(2);
  document.getElementById('blueValue').textContent = b.toFixed(2);
}

function setRedColor() {
  document.getElementById('redSlider').value = 1;
  document.getElementById('greenSlider').value = 0;
  document.getElementById('blueSlider').value = 0;
  
  updateColor();
}

function setGreenColor() {
  document.getElementById('redSlider').value = 0;
  document.getElementById('greenSlider').value = 1;
  document.getElementById('blueSlider').value = 0;
  
  updateColor();
}

function setBlueColor() {
  document.getElementById('redSlider').value = 0;
  document.getElementById('greenSlider').value = 0;
  document.getElementById('blueSlider').value = 1;
  
  // Update color
  updateColor();
}

function updateSize() {
  var size = parseFloat(document.getElementById('sizeSlider').value);
  
  currentSize = size;
  
  document.getElementById('sizeValue').textContent = size.toFixed(1);
}

function updateSegments() {
  var segments = parseInt(document.getElementById('segmentsSlider').value);
  
  currentSegments = segments;
  
  document.getElementById('segmentsValue').textContent = segments;
}

function clearCanvas() {
  console.log('Clearing canvas and stopping animation');
  
  if (animationRunning) {
    cancelAnimationFrame(animationId);
    animationRunning = false;
  }
  
  shapesList = [];
  
  triangleVertices = [];
  
  var imageContainer = document.getElementById('imageContainer');
  if (imageContainer) {
    imageContainer.style.display = 'none';
  }
  
  renderAllShapes();
}

function setPointMode() {
  currentDrawingMode = 'point';
  
  document.getElementById('pointBtn').style.backgroundColor = '#000000';
  document.getElementById('triangleBtn').style.backgroundColor = '#555555';
  document.getElementById('circleBtn').style.backgroundColor = '#555555';
}

function setTriangleMode() {
  currentDrawingMode = 'triangle';

  document.getElementById('pointBtn').style.backgroundColor = '#555555';
  document.getElementById('triangleBtn').style.backgroundColor = '#000000';
  document.getElementById('circleBtn').style.backgroundColor = '#555555';
}

function setCircleMode() {
  currentDrawingMode = 'circle';
  
  // Update button styling to show active mode
  document.getElementById('pointBtn').style.backgroundColor = '#555555';
  document.getElementById('triangleBtn').style.backgroundColor = '#555555';
  document.getElementById('circleBtn').style.backgroundColor = '#000000';
}

function setupWebGL() {
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

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return false;
  }
  
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }
  
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return false;
  }
  
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return false;
  }
  
  return true;
}

function click(ev) {
  addPoint(ev);
}

function drag(ev) {
  if (ev.buttons === 1) {
    addPoint(ev);
  }
}

function addPoint(ev) {
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  if (currentDrawingMode === 'point') {
    var newPoint = new Point(
      [x, y],                  
      currentColor.slice(),    
      currentSize              
    );
    
    shapesList.push(newPoint);
  } 
  else if (currentDrawingMode === 'triangle') {
    var triangleSize = currentSize / 50; 
    var newTriangle = new Triangle(
      [x, y],                  
      currentColor.slice(),     
      triangleSize              
    );
    
    shapesList.push(newTriangle);
    shapesList.push(newTriangle);
  }
  else if (currentDrawingMode === 'circle') {
    var newCircle = new Circle();
    
    newCircle.position = [x, y, 0.0];  
    newCircle.color = currentColor.slice();  
    newCircle.size = currentSize;  
    newCircle.segments = currentSegments;  
    
    shapesList.push(newCircle);
  }

  var startTime = performance.now();
  renderAllShapes();
  var endTime = performance.now();
  
  var renderTime = endTime - startTime;
  if (renderTime > 16) {
    console.log('Rendering ' + shapesList.length + ' shapes took ' + renderTime.toFixed(2) + ' ms');
  }
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for(var i = 0; i < shapesList.length; i++) {
    shapesList[i].render();
  }
}

function showMyDrawing() {
  console.log('Show My Drawing button clicked');
  
  shapesList = [];
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  renderMyDrawing();
  
  initSnowflakes();
  animate();
  
  
  console.log('Drawing rendered with ' + shapesList.length + ' triangles');
}
