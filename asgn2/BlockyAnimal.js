// BlockyAnimal.js - Main file for the Blocky Animal assignment

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform vec4 u_Color;
  varying vec4 v_Color;
  uniform float u_PointSize;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_Color = u_Color;
    gl_PointSize = u_PointSize;
  }
`;

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Global Variables
var gl;              // WebGL context
var canvas;          // Drawing canvas
var a_Position;      // Shader variable: vertex position
var u_FragColor;    // Shader variable: fragment color
var u_PointSize;    // Shader variable: point size
var u_ModelMatrix;  // Shader variable: model matrix
var u_GlobalRotateMatrix; // Shader variable: global rotation matrix
var g_globalAngle = 0;  // Global rotation angle controlled by slider
var g_global = 5;   // Initial camera angle
var currentColor = [1.0, 0.0, 0.0, 1.0];  // Current drawing color (red by default)
var currentSize = 10;  // Current point size (default: 10)
var currentSegments = 10;  // Current number of segments for circles (default: 10)

// Drawing mode variables
var currentDrawingMode = 'point';  // Default drawing mode: 'point', 'triangle', or 'circle'

// Animation control
var animationRunning = false;
var animationId = null;

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

  document.getElementById('cameraAngleSlider').addEventListener('input', function() { 
    g_globalAngle = this.value; 
    renderScene(); 
  });
  


  
  // Set clear color and clear canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Initialize matrices and point size
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniform1f(u_PointSize, currentSize);
  
  // Render the scene at the end of initialization
  renderScene();
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
  
  updateColor();
}

function updateSize() {
  currentSize = parseInt(document.getElementById('sizeSlider').value);
  document.getElementById('sizeValue').textContent = currentSize;
  
  gl.uniform1f(u_PointSize, currentSize);
}

function updateSegments() {
  currentSegments = parseInt(document.getElementById('segmentsSlider').value);
  document.getElementById('segmentsValue').textContent = currentSegments;
}

function clearCanvas() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Reset animation if running
  if (animationRunning) {
    cancelAnimationFrame(animationId);
    animationRunning = false;
    animationId = null;
  }
  
  // Show image container if it exists
  var imageContainer = document.querySelector('div[style*="border: 1px solid #ccc"]');
  if (imageContainer) {
    imageContainer.style.display = 'block';
  }
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
  
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return false;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
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
    
    newPoint.render();
  } 
  else if (currentDrawingMode === 'triangle') {
    var triangleSize = currentSize / 50; 
    var newTriangle = new Triangle(
      [x, y],                  
      currentColor.slice(),     
      triangleSize              
    );
    
    newTriangle.render();
  }
  else if (currentDrawingMode === 'circle') {
    var newCircle = new Circle();
    
    newCircle.position = [x, y, 0.0];  
    newCircle.color = currentColor.slice();  
    newCircle.size = currentSize;  
    newCircle.segments = currentSegments;  
    
    newCircle.render();
  }
}

// Function to draw a cube with a given transformation matrix
function drawCube(matrix, color) {
  // Create a cube instance
  var cube = new Cube();
  cube.color = color;
  cube.matrix.set(matrix);
  cube.render();
}

// Function to render the entire scene
function renderScene() {
  // Set up the global rotation matrix
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle * 4, 0, 1, 0); // Multiply by 4 to get 0-360 degree rotation
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  // Clear the canvas with depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // --- Animal Construction Begins ---
  
  // Body matrix (center of the giraffe)
  var bodyMatrix = new Matrix4();
  bodyMatrix.setTranslate(0.0, -0.2, 0.0);
  bodyMatrix.scale(0.3, 0.2, 0.5);
  drawCube(bodyMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow body

  // Neck matrix
  var neckMatrix = new Matrix4();
  neckMatrix.setTranslate(0.0, 0.0, 0.0); // Base position at the top of body
  neckMatrix.translate(0.0, 0.2, 0.0); // Move up to position the neck
  neckMatrix.scale(0.15, 0.6, 0.15); // Make it tall and thin
  drawCube(neckMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow neck

  // Head matrix
  var headMatrix = new Matrix4();
  headMatrix.setTranslate(0.0, 0.5, 0.1); // Position at the top of the neck
  headMatrix.scale(0.2, 0.2, 0.3); // Head shape
  drawCube(headMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow head

  // Front Right Leg (upper segment)
  var frontRightLegMatrix = new Matrix4();
  frontRightLegMatrix.setTranslate(0.15, -0.4, 0.2); // Position at the bottom right of body
  frontRightLegMatrix.scale(0.08, 0.2, 0.08); // Leg shape
  drawCube(frontRightLegMatrix, [0.8, 0.6, 0.0, 1.0]); // Darker yellow leg

  // Front Right Leg (lower segment) - this is a child of the upper segment
  var lowerRightLegMatrix = new Matrix4();
  lowerRightLegMatrix.setTranslate(0.15, -0.6, 0.2); // Position below the upper segment
  lowerRightLegMatrix.rotate(20, 1, 0, 0); // Slight bend in the leg
  lowerRightLegMatrix.scale(0.06, 0.2, 0.06); // Slightly thinner than upper leg
  drawCube(lowerRightLegMatrix, [0.8, 0.6, 0.0, 1.0]); // Darker yellow leg

  // Front Right Hoof - this is a child of the lower leg segment
  var hoofMatrix = new Matrix4();
  hoofMatrix.setTranslate(0.15, -0.7, 0.25); // Position at the bottom of the lower leg
  hoofMatrix.scale(0.08, 0.05, 0.1); // Flat hoof shape
  drawCube(hoofMatrix, [0.4, 0.3, 0.0, 1.0]); // Dark brown hoof

  // Front Left Leg
  var frontLeftLegMatrix = new Matrix4();
  frontLeftLegMatrix.setTranslate(-0.15, -0.4, 0.2);
  frontLeftLegMatrix.scale(0.08, 0.4, 0.08);
  drawCube(frontLeftLegMatrix, [0.8, 0.6, 0.0, 1.0]);

  // Back Right Leg
  var backRightLegMatrix = new Matrix4();
  backRightLegMatrix.setTranslate(0.15, -0.4, -0.2);
  backRightLegMatrix.scale(0.08, 0.4, 0.08);
  drawCube(backRightLegMatrix, [0.8, 0.6, 0.0, 1.0]);

  // Back Left Leg
  var backLeftLegMatrix = new Matrix4();
  backLeftLegMatrix.setTranslate(-0.15, -0.4, -0.2);
  backLeftLegMatrix.scale(0.08, 0.4, 0.08);
  drawCube(backLeftLegMatrix, [0.8, 0.6, 0.0, 1.0]);

  // Spot 1 on body
  var spot1Matrix = new Matrix4();
  spot1Matrix.setTranslate(0.1, -0.15, 0.1);
  spot1Matrix.scale(0.1, 0.1, 0.1);
  drawCube(spot1Matrix, [0.6, 0.3, 0.0, 1.0]); // Brown spot

  // Spot 2 on body
  var spot2Matrix = new Matrix4();
  spot2Matrix.setTranslate(-0.1, -0.2, -0.1);
  spot2Matrix.scale(0.08, 0.08, 0.08);
  drawCube(spot2Matrix, [0.6, 0.3, 0.0, 1.0]); // Brown spot
}
