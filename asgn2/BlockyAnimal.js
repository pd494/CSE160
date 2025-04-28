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

// Joint angle variables for legs
// Upper leg (thigh) joint angles
var g_frontRightLegAngle = 0;  // Front right leg joint angle
var g_frontLeftLegAngle = 0;   // Front left leg joint angle
var g_backRightLegAngle = 0;   // Back right leg joint angle
var g_backLeftLegAngle = 0;    // Back left leg joint angle

// Lower leg (calf) joint angles
var g_frontRightCalfAngle = 0;  // Front right calf joint angle
var g_frontLeftCalfAngle = 0;   // Front left calf joint angle
var g_backRightCalfAngle = 0;   // Back right calf joint angle
var g_backLeftCalfAngle = 0;    // Back left calf joint angle

// Foot joint angles
var g_frontRightFootAngle = 0;  // Front right foot joint angle
var g_frontLeftFootAngle = 0;   // Front left foot joint angle
var g_backRightFootAngle = 0;   // Back right foot joint angle
var g_backLeftFootAngle = 0;    // Back left foot joint angle

// Drawing mode variables
var currentDrawingMode = 'point';  // Default drawing mode: 'point', 'triangle', or 'circle'

// Animation control
var animationRunning = true; // Default to running
var animationId = null;

// Global time variable for animation
var g_time = 0;

// Animation angles - these will be updated by updateAnimationAngles()
var g_rightLegAnimAngle = 0;
var g_rightCalfAnimAngle = 0;
var g_rightFootAnimAngle = 0;

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
  
  // Start the animation
  requestAnimationFrame(tick);
  
  // Register event handlers
  canvas.onmousedown = click;
  canvas.onmousemove = drag;
  
  // Add event listener for animation toggle button
  document.getElementById('animToggleBtn').addEventListener('click', function() {
    animationRunning = !animationRunning;
    this.textContent = animationRunning ? 'Animation: ON' : 'Animation: OFF';
    this.style.backgroundColor = animationRunning ? '#4CAF50' : '#555555';
  });
  
  // Add event listeners for foot sliders
  document.getElementById('frontRightFootSlider').addEventListener('input', function() {
    g_frontRightFootAngle = parseFloat(this.value);
    document.getElementById('frontRightFootValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('frontLeftFootSlider').addEventListener('input', function() {
    g_frontLeftFootAngle = parseFloat(this.value);
    document.getElementById('frontLeftFootValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('backRightFootSlider').addEventListener('input', function() {
    g_backRightFootAngle = parseFloat(this.value);
    document.getElementById('backRightFootValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('backLeftFootSlider').addEventListener('input', function() {
    g_backLeftFootAngle = parseFloat(this.value);
    document.getElementById('backLeftFootValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });

  document.getElementById('cameraAngleSlider').addEventListener('input', function() { 
    g_globalAngle = parseFloat(this.value); 
    // No need to call renderScene, tick will handle it
  });
  
  // Add event listeners for leg angle sliders
  document.getElementById('frontRightLegSlider').addEventListener('input', function() {
    g_frontRightLegAngle = parseFloat(this.value);
    document.getElementById('frontRightLegValue').textContent = this.value + '°';
    // Just update the display text, renderScene will be called by tick
  });
  
  document.getElementById('frontLeftLegSlider').addEventListener('input', function() {
    g_frontLeftLegAngle = parseFloat(this.value);
    document.getElementById('frontLeftLegValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('backRightLegSlider').addEventListener('input', function() {
    g_backRightLegAngle = parseFloat(this.value);
    document.getElementById('backRightLegValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('backLeftLegSlider').addEventListener('input', function() {
    g_backLeftLegAngle = parseFloat(this.value);
    document.getElementById('backLeftLegValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  // Add event listeners for calf angle sliders
  document.getElementById('frontRightCalfSlider').addEventListener('input', function() {
    g_frontRightCalfAngle = parseFloat(this.value);
    document.getElementById('frontRightCalfValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('frontLeftCalfSlider').addEventListener('input', function() {
    g_frontLeftCalfAngle = parseFloat(this.value);
    document.getElementById('frontLeftCalfValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('backRightCalfSlider').addEventListener('input', function() {
    g_backRightCalfAngle = parseFloat(this.value);
    document.getElementById('backRightCalfValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
  });
  
  document.getElementById('backLeftCalfSlider').addEventListener('input', function() {
    g_backLeftCalfAngle = parseFloat(this.value);
    document.getElementById('backLeftCalfValue').textContent = this.value + '°';
    // No need to call renderScene, tick will handle it
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

  // --- Animal Construction Begins with Proper Connections ---
  
  // Create matrices for tracking transformations
  var modelMatrix = new Matrix4();  // The model matrix for the main body
  
  // BODY - Start with the body as the root
  modelMatrix.setTranslate(0.0, 0.0, 0.0);  // Position the body
  var bodyMatrix = new Matrix4(modelMatrix); // Save the body matrix
  bodyMatrix.scale(0.25, 0.15, 0.4);       // Shorter in front to align with legs
  drawCube(bodyMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow body
  
  // BACK BODY EXTENSION - Connect to all legs
  var backBodyMatrix = new Matrix4(modelMatrix);
  backBodyMatrix.translate(0.0, 0.0, -0.2);  // Position slightly back from main body
  backBodyMatrix.scale(0.25, 0.15, 0.22);    // Same width as main body, extended back by 10%
  drawCube(backBodyMatrix, [1.0, 0.8, 0.0, 1.0]); // Same yellow as body

  // NECK - Connects to the body - position at the front of the body
  var neckMatrix = new Matrix4(modelMatrix);
  neckMatrix.translate(0.0, 0.15, 0.1);       // Move up and slightly forward from body center
  neckMatrix.rotate(-20, 1, 0, 0);           // Tilt the neck forward a bit
  var neckTransformMatrix = new Matrix4(neckMatrix); // Save for head positioning
  neckMatrix.scale(0.08, 0.4, 0.08);         // Scale for neck shape - long and thin
  drawCube(neckMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow neck

  // HEAD - Connects to the top of the neck
  var headMatrix = new Matrix4(neckTransformMatrix);
  headMatrix.translate(0.0, 0.4, 0.0);         // Move to top of neck
  // No rotation - head is straight now
  var headTransformMatrix = new Matrix4(headMatrix); // Save for ears and other features
  headMatrix.scale(0.12, 0.12, 0.2);          // Head shape - longer in z direction
  drawCube(headMatrix, [1.0, 0.8, 0.0, 1.0]);  // Yellow head

  // TAIL - Connects to the back of the body extension
  var tailMatrix = new Matrix4(modelMatrix);
  tailMatrix.translate(0.0, 0.05, -0.32);      // Position at the very back of the extended body
  tailMatrix.rotate(-20, 1, 0, 0);            // Angle the tail downward
  var tailTransformMatrix = new Matrix4(tailMatrix); // Save for tail tip
  tailMatrix.scale(0.03, 0.1, 0.03);          // Thin tail
  drawCube(tailMatrix, [0.8, 0.6, 0.0, 1.0]);  // Brown tail
  
  // TAIL TIP - small tuft at the end of the tail
  var tailTipMatrix = new Matrix4(tailTransformMatrix);
  tailTipMatrix.translate(0.0, -0.1, 0.0);     // Move to end of tail (downward now)
  tailTipMatrix.scale(0.04, 0.04, 0.04);        // Small tuft
  drawCube(tailTipMatrix, [0.4, 0.3, 0.0, 1.0]); // Dark brown tail tuft

  // LEGS
  // Reset to body position for the legs
  var legsBaseMatrix = new Matrix4(modelMatrix);
  // Create a separate base matrix for back legs to align with the back body extension
  var backLegsBaseMatrix = new Matrix4(modelMatrix);
  backLegsBaseMatrix.translate(0.0, 0.0, -0.2); // Align with the back body extension

  // FRONT RIGHT LEG - Top half (yellow) - Thigh
  var frontRightLegMatrix = new Matrix4(legsBaseMatrix);
  frontRightLegMatrix.translate(0.1, -0.15, 0.18);    // Position at front right
  
  // Apply leg rotation based on slider value and animation angle if enabled
  var totalRightLegAngle = parseFloat(g_frontRightLegAngle);
  
  // If animation is running, add the animation angle to the base position
  if (animationRunning) {
    totalRightLegAngle += g_rightLegAnimAngle;
  }
  
  // Apply the thigh rotation - first level in hierarchy
  frontRightLegMatrix.rotate(totalRightLegAngle, 1, 0, 0);
  
  // Save the thigh transform state before scaling (for use by the calf)
  var thighTransform = new Matrix4(frontRightLegMatrix); 
  
  // Now scale and draw the thigh
  frontRightLegMatrix.scale(0.06, 0.3, 0.06);       // Scale for thigh
  drawCube(frontRightLegMatrix, [1.0, 0.8, 0.0, 1.0]); // Same yellow as body

  // FRONT RIGHT LOWER LEG - Bottom half - Calf
  // Start with the thigh transform to maintain the hierarchy
  var calfMatrix = new Matrix4(thighTransform);
  calfMatrix.translate(0.0, -0.3, 0.0);    // Position at knee joint
  
  // Calculate calf rotation with animation if enabled
  var totalCalfAngle = parseFloat(g_frontRightCalfAngle);
  if (animationRunning) {
    totalCalfAngle += g_rightCalfAnimAngle;
  }
  
  // Apply the calf rotation - second level in hierarchy
  calfMatrix.rotate(totalCalfAngle, 1, 0, 0); 
  
  // Save the calf transform state before scaling (for use by the foot)
  var calfTransform = new Matrix4(calfMatrix);
  
  // Now scale and draw the calf
  calfMatrix.scale(0.06, 0.3, 0.06);       // Scale for calf
  drawCube(calfMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow color for lower leg

  // FRONT RIGHT FOOT (HOOF) - third level in hierarchy
  // Start with the calf transform to maintain the hierarchy
  var footMatrix = new Matrix4(calfTransform);
  footMatrix.translate(0.0, -0.3, 0.0);        // Position at ankle joint
  
  // Calculate foot rotation with animation if enabled
  var totalFootAngle = parseFloat(g_frontRightFootAngle);
  if (animationRunning) {
    totalFootAngle += g_rightFootAnimAngle;
  }
  
  // Apply the foot rotation - third level in hierarchy
  footMatrix.rotate(totalFootAngle, 1, 0, 0);
  
  // Scale and draw the foot/hoof
  footMatrix.scale(0.06, 0.05, 0.07);          // Scale for hoof
  drawCube(footMatrix, [1.0, 0.8, 0.0, 1.0]);   // Yellow hoof



  // FRONT LEFT LEG - Top half (yellow) - Thigh
  var frontLeftLegMatrix = new Matrix4(legsBaseMatrix);
  frontLeftLegMatrix.translate(-0.1, -0.15, 0.18);   // Position at front left
  
  // Apply leg rotation based on slider value
  frontLeftLegMatrix.rotate(g_frontLeftLegAngle, 1, 0, 0); // Rotate thigh around X-axis based on slider
  
  // Save the thigh transform state before scaling (for use by the calf)
  var leftThighTransform = new Matrix4(frontLeftLegMatrix);
  
  // Now scale and draw the thigh
  frontLeftLegMatrix.scale(0.06, 0.3, 0.06);        // Scale for thigh
  drawCube(frontLeftLegMatrix, [1.0, 0.8, 0.0, 1.0]); // Same yellow as body

  // FRONT LEFT LOWER LEG - Bottom half - Calf
  // Start with the thigh transform to maintain the hierarchy
  var leftCalfMatrix = new Matrix4(leftThighTransform);
  leftCalfMatrix.translate(0.0, -0.3, 0.0);      // Position at knee joint
  
  // Apply the calf rotation
  leftCalfMatrix.rotate(g_frontLeftCalfAngle, 1, 0, 0); // Rotate calf around X-axis based on slider
  
  // Save the calf transform state before scaling (for use by the foot)
  var leftCalfTransform = new Matrix4(leftCalfMatrix);
  
  // Now scale and draw the calf
  leftCalfMatrix.scale(0.06, 0.3, 0.06);        // Scale for calf
  drawCube(leftCalfMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow color

  // FRONT LEFT FOOT (HOOF) - third level in hierarchy
  // Start with the calf transform to maintain the hierarchy
  var leftFootMatrix = new Matrix4(leftCalfTransform);
  leftFootMatrix.translate(0.0, -0.3, 0.0);         // Position at ankle joint
  
  // Apply the foot rotation
  leftFootMatrix.rotate(g_frontLeftFootAngle, 1, 0, 0); // Rotate foot around X-axis based on slider
  
  // Scale and draw the foot/hoof
  leftFootMatrix.scale(0.06, 0.05, 0.07);           // Scale for hoof
  drawCube(leftFootMatrix, [1.0, 0.8, 0.0, 1.0]);    // Yellow hoof



  // BACK RIGHT LEG - Top half (yellow) - Thigh
  var backRightLegMatrix = new Matrix4(backLegsBaseMatrix);
  backRightLegMatrix.translate(0.1, -0.15, -0.1);    // Position at back right, connected to back body extension
  
  // Apply leg rotation based on slider value
  backRightLegMatrix.rotate(g_backRightLegAngle, 1, 0, 0); // Rotate thigh around X-axis based on slider
  
  // Save the thigh transform state before scaling (for use by the calf)
  var backRightThighTransform = new Matrix4(backRightLegMatrix);
  
  // Now scale and draw the thigh
  backRightLegMatrix.scale(0.06, 0.3, 0.06);        // Scale for thigh
  drawCube(backRightLegMatrix, [1.0, 0.8, 0.0, 1.0]); // Same yellow as body

  // BACK RIGHT LOWER LEG - Bottom half - Calf
  // Start with the thigh transform to maintain the hierarchy
  var backRightCalfMatrix = new Matrix4(backRightThighTransform);
  backRightCalfMatrix.translate(0.0, -0.3, 0.0);    // Position at knee joint
  
  // Apply the calf rotation
  backRightCalfMatrix.rotate(g_backRightCalfAngle, 1, 0, 0); // Rotate calf around X-axis based on slider
  
  // Save the calf transform state before scaling (for use by the foot)
  var backRightCalfTransform = new Matrix4(backRightCalfMatrix);
  
  // Now scale and draw the calf
  backRightCalfMatrix.scale(0.06, 0.3, 0.06);      // Scale for calf
  drawCube(backRightCalfMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow color

  // BACK RIGHT FOOT (HOOF) - third level in hierarchy
  // Start with the calf transform to maintain the hierarchy
  var backRightFootMatrix = new Matrix4(backRightCalfTransform);
  backRightFootMatrix.translate(0.0, -0.3, 0.0);     // Position at ankle joint
  
  // Apply the foot rotation
  backRightFootMatrix.rotate(g_backRightFootAngle, 1, 0, 0); // Rotate foot around X-axis based on slider
  
  // Scale and draw the foot/hoof
  backRightFootMatrix.scale(0.06, 0.05, 0.07);      // Scale for hoof
  drawCube(backRightFootMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow hoof



  // BACK LEFT LEG - Top half (yellow) - Thigh
  var backLeftLegMatrix = new Matrix4(backLegsBaseMatrix);
  backLeftLegMatrix.translate(-0.1, -0.15, -0.1);    // Position at back left, connected to back body extension
  
  // Apply leg rotation based on slider value
  backLeftLegMatrix.rotate(g_backLeftLegAngle, 1, 0, 0); // Rotate thigh around X-axis based on slider
  
  // Save the thigh transform state before scaling (for use by the calf)
  var backLeftThighTransform = new Matrix4(backLeftLegMatrix);
  
  // Now scale and draw the thigh
  backLeftLegMatrix.scale(0.06, 0.3, 0.06);         // Scale for thigh
  drawCube(backLeftLegMatrix, [1.0, 0.8, 0.0, 1.0]); // Same yellow as body

  // BACK LEFT LOWER LEG - Bottom half - Calf
  // Start with the thigh transform to maintain the hierarchy
  var backLeftCalfMatrix = new Matrix4(backLeftThighTransform);
  backLeftCalfMatrix.translate(0.0, -0.3, 0.0);     // Position at knee joint
  
  // Apply the calf rotation
  backLeftCalfMatrix.rotate(g_backLeftCalfAngle, 1, 0, 0); // Rotate calf around X-axis based on slider
  
  // Save the calf transform state before scaling (for use by the foot)
  var backLeftCalfTransform = new Matrix4(backLeftCalfMatrix);
  
  // Now scale and draw the calf
  backLeftCalfMatrix.scale(0.06, 0.3, 0.06);       // Scale for calf
  drawCube(backLeftCalfMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow color

  // BACK LEFT FOOT (HOOF) - third level in hierarchy
  // Start with the calf transform to maintain the hierarchy
  var backLeftFootMatrix = new Matrix4(backLeftCalfTransform);
  backLeftFootMatrix.translate(0.0, -0.3, 0.0);      // Position at ankle joint
  
  // Apply the foot rotation
  backLeftFootMatrix.rotate(g_backLeftFootAngle, 1, 0, 0); // Rotate foot around X-axis based on slider
  
  // Scale and draw the foot/hoof
  backLeftFootMatrix.scale(0.06, 0.05, 0.07);       // Scale for hoof
  drawCube(backLeftFootMatrix, [1.0, 0.8, 0.0, 1.0]); // Yellow hoof



  // No random spots - they've been removed as requested
}

// Function to update animation angles based on time
function updateAnimationAngles() {
  if (animationRunning) {
    // Update the global time variable
    g_time++;
    
    // Calculate animation for each part of the right leg (kicking motion)
    g_rightLegAnimAngle = Math.sin(g_time * 0.05) * 10; // 10 degree amplitude for thigh
    
    // Calf animation with slight phase offset for natural movement
    g_rightCalfAnimAngle = Math.sin((g_time * 0.05) + 0.5) * 15; // 15 degree amplitude for calf
    
    // Foot animation with another phase offset
    g_rightFootAnimAngle = Math.sin((g_time * 0.05) + 1.0) * 8; // 8 degree amplitude for foot
  }
}

// Animation tick function - called every frame
function tick() {
  // Update animation angles based on current time
  updateAnimationAngles();
  
  // Render the scene with the updated animation values
  renderScene();
  
  // Request the next animation frame
  requestAnimationFrame(tick);
}
