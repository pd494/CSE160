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
var gl;              
var canvas;          
var a_Position;      
var u_FragColor;    
var u_PointSize;    
var u_ModelMatrix;  
var u_GlobalRotateMatrix;
var g_globalAngle = 0;  
var g_globalXAngle = 0; 
var g_global = 5;   

// Mouse tracking variables
var g_isDragging = false;
var g_lastX = -1;
var g_lastY = -1;
var currentColor = [1.0, 0.0, 0.0, 1.0];
var currentSize = 10;  
var currentSegments = 10;  

// Joint angle variables for legs
// Upper leg (thigh) joint angles
var g_frontRightLegAngle = 0;  
var g_frontLeftLegAngle = 0;   
var g_backRightLegAngle = 0;   
var g_backLeftLegAngle = 0;    

// Lower leg (calf) joint angles
var g_frontRightCalfAngle = 0;  
var g_frontLeftCalfAngle = 0;   
var g_backRightCalfAngle = 0;   
var g_backLeftCalfAngle = 0;    

// Foot joint angles
var g_frontRightFootAngle = 0;    
var g_frontLeftFootAngle = 0;   
var g_backRightFootAngle = 0;   
var g_backLeftFootAngle = 0;    

// Drawing mode variables
var currentDrawingMode = 'point';  


// Animation control
var animationRunning = true; 
var animationId = null;

// Global time variable for animation
var g_time = 0;

// Poke animation variables
var g_isPokeAnimating = false;     
var g_pokeAnimTime = 0;       
var g_pokeAnimDuration = 60;  

// Animation angles - these will be updated by updateAnimationAngles()
// Leg animation variables
var g_rightLegAnimAngle = 0;
var g_rightCalfAnimAngle = 0;
var g_rightFootAnimAngle = 0;
var g_leftLegAnimAngle = 0;
var g_leftCalfAnimAngle = 0;
var g_leftFootAnimAngle = 0;
var g_backRightLegAnimAngle = 0;
var g_backRightCalfAnimAngle = 0;
var g_backRightFootAnimAngle = 0;
var g_backLeftLegAnimAngle = 0;
var g_backLeftCalfAnimAngle = 0;
var g_backLeftFootAnimAngle = 0;

// Head and body part animation variables
var g_headAnimAngle = 0;
var g_neckAnimAngle = 0;
var g_tailAnimAngle = 0;
var g_bodyAnimOffset = 0;

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
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = mouseMove;
  
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
  });
  
  document.getElementById('frontLeftFootSlider').addEventListener('input', function() {
    g_frontLeftFootAngle = parseFloat(this.value);
    document.getElementById('frontLeftFootValue').textContent = this.value + '°';
  });
  
  document.getElementById('backRightFootSlider').addEventListener('input', function() {
    g_backRightFootAngle = parseFloat(this.value);
    document.getElementById('backRightFootValue').textContent = this.value + '°';
  });
  
  document.getElementById('backLeftFootSlider').addEventListener('input', function() {
    g_backLeftFootAngle = parseFloat(this.value);
    document.getElementById('backLeftFootValue').textContent = this.value + '°';
  });

  document.getElementById('cameraAngleSlider').addEventListener('input', function() { 
    g_globalAngle = parseFloat(this.value); 
  });

  const canvasContainer = document.querySelector('canvas').parentNode;
  const mouseControlMsg = document.createElement('p');
  mouseControlMsg.innerHTML = '<strong>Mouse Control:</strong> Click and drag to rotate the giraffe';
  mouseControlMsg.style.textAlign = 'center';
  mouseControlMsg.style.marginTop = '5px';
  canvasContainer.appendChild(mouseControlMsg);
  
  document.getElementById('frontRightLegSlider').addEventListener('input', function() {
    g_frontRightLegAngle = parseFloat(this.value);
    document.getElementById('frontRightLegValue').textContent = this.value + '°';
  });
  
  document.getElementById('frontLeftLegSlider').addEventListener('input', function() {
    g_frontLeftLegAngle = parseFloat(this.value);
    document.getElementById('frontLeftLegValue').textContent = this.value + '°';
  });
  
  document.getElementById('backRightLegSlider').addEventListener('input', function() {
    g_backRightLegAngle = parseFloat(this.value);
    document.getElementById('backRightLegValue').textContent = this.value + '°';
  });
  
  document.getElementById('backLeftLegSlider').addEventListener('input', function() {
    g_backLeftLegAngle = parseFloat(this.value);
    document.getElementById('backLeftLegValue').textContent = this.value + '°';
  });
  
  document.getElementById('frontRightCalfSlider').addEventListener('input', function() {
    g_frontRightCalfAngle = parseFloat(this.value);
    document.getElementById('frontRightCalfValue').textContent = this.value + '°';
  });
  
  document.getElementById('frontLeftCalfSlider').addEventListener('input', function() {
    g_frontLeftCalfAngle = parseFloat(this.value);
    document.getElementById('frontLeftCalfValue').textContent = this.value + '°';
  });
  
  document.getElementById('backRightCalfSlider').addEventListener('input', function() {
    g_backRightCalfAngle = parseFloat(this.value);
    document.getElementById('backRightCalfValue').textContent = this.value + '°';
  });
  
  document.getElementById('backLeftCalfSlider').addEventListener('input', function() {
    g_backLeftCalfAngle = parseFloat(this.value);
    document.getElementById('backLeftCalfValue').textContent = this.value + '°';
  });
  


  
  // Set clear color and clear canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniform1f(u_PointSize, currentSize);
  
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
  
  if (animationRunning) {
    cancelAnimationFrame(animationId);
    animationRunning = false;
    animationId = null;
  }
  
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

function mouseDown(ev) {
  if (ev.shiftKey) {
    g_isPokeAnimating = true;
    g_pokeAnimTime = 0;
    console.log('Poke animation triggered!');
    return;
  }
  
  g_isDragging = true;
  g_lastX = ev.clientX;
  g_lastY = ev.clientY;
}

function mouseUp(ev) {
  g_isDragging = false;
}

function mouseMove(ev) {
  if (!g_isDragging) return;
  
  const dx = ev.clientX - g_lastX;
  const dy = ev.clientY - g_lastY;
  
  g_globalAngle += dx * 0.5;  
  g_globalXAngle += dy * 0.5; 
  
  if (g_globalXAngle > 90) g_globalXAngle = 90;
  if (g_globalXAngle < -90) g_globalXAngle = -90;
  
  g_lastX = ev.clientX;
  g_lastY = ev.clientY;
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
  var cube = new Cube();
  cube.color = color;
  cube.matrix.set(matrix);
  cube.render();
}

// Function to render the entire scene
function renderScene() {
    var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalXAngle, 1, 0, 0); 
  globalRotMat.rotate(g_globalAngle * 4, 0, 1, 0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  
  var modelMatrix = new Matrix4();  // The model matrix for the main body
  
  // BODY - Start with the body as the root
  var bodyY = 0.0;
  var bodyScale = 1.0;
  
  if (animationRunning) {
    bodyY = g_bodyAnimOffset; 
  }
  
  if (g_isPokeAnimating) {
    var progress = g_pokeAnimTime / (g_pokeAnimDuration / 2);
    if (progress > 1) progress = 2 - progress; 
    
    bodyY += Math.sin(progress * Math.PI) * 0.1;
    
    bodyScale = 1.0 + Math.sin(progress * Math.PI) * 0.15;
  }
  
  modelMatrix.setTranslate(0.0, bodyY + 0.2, 0.0);  
  modelMatrix.scale(bodyScale, bodyScale, bodyScale); 
  var bodyMatrix = new Matrix4(modelMatrix); 
  bodyMatrix.scale(0.25, 0.15, 0.4);       
  drawCube(bodyMatrix, [1.0, 0.8, 0.0, 1.0]);
  
  // BACK BODY EXTENSION - Connect to all legs
  var backBodyMatrix = new Matrix4(modelMatrix);
  backBodyMatrix.translate(0.0, 0.0, -0.2);  
  backBodyMatrix.scale(0.25, 0.15, 0.22);    
  drawCube(backBodyMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // NECK - Connects to the body - position at the front of the body
  var neckMatrix = new Matrix4(modelMatrix);
  neckMatrix.translate(0.0, 0.15, 0.1);      
  
  var neckAngle = -20; 
  if (animationRunning) {
    neckAngle += g_neckAnimAngle; 
  }
  
  if (g_isPokeAnimating) {
    var progress = g_pokeAnimTime / (g_pokeAnimDuration / 2);
    if (progress > 1) progress = 2 - progress; 
    
    neckAngle -= 30 * Math.sin(progress * Math.PI); 
  }
  
  neckMatrix.rotate(neckAngle, 1, 0, 0);      
  
  var neckTransformMatrix = new Matrix4(neckMatrix); 
  neckMatrix.scale(0.08, 0.4, 0.08);         
  drawCube(neckMatrix, [1.0, 0.8, 0.0, 1.0]); 

  var headMatrix = new Matrix4(neckTransformMatrix);
  headMatrix.translate(0.0, 0.4, 0.0);         
  
  if (animationRunning) {
    headMatrix.rotate(g_headAnimAngle, 1, 0, 0); 
  }
  
  var headTransformMatrix = new Matrix4(headMatrix); 
  headMatrix.scale(0.12, 0.12, 0.2);          
  drawCube(headMatrix, [1.0, 0.8, 0.0, 1.0]);  
  
  var bigEyeMatrix = new Matrix4(headTransformMatrix);
  bigEyeMatrix.translate(0.08, 0.0, 0.12);   
  bigEyeMatrix.scale(0.06, 0.06, 0.04);     
  drawCube(bigEyeMatrix, [1.0, 1.0, 1.0, 1.0]);  
  
  var bigPupilMatrix = new Matrix4(headTransformMatrix);
  bigPupilMatrix.translate(0.08, 0.0, 0.15);   
  bigPupilMatrix.scale(0.03, 0.03, 0.02);     
  drawCube(bigPupilMatrix, [0.0, 0.0, 0.0, 1.0]);     
  
  var leftEyeMatrix = new Matrix4(headTransformMatrix);
  leftEyeMatrix.translate(-0.05, 0.0, 0.1);    
  leftEyeMatrix.scale(0.03, 0.03, 0.03);       
  drawCube(leftEyeMatrix, [1.0, 1.0, 1.0, 1.0]); 
  
  var leftPupilMatrix = new Matrix4(headTransformMatrix);
  leftPupilMatrix.translate(-0.05, 0.0, 0.12);   
  leftPupilMatrix.scale(0.015, 0.015, 0.01);     
  drawCube(leftPupilMatrix, [0.0, 0.0, 0.0, 1.0]);  

  // TAIL - Connects to the back of the body extension
  var tailMatrix = new Matrix4(modelMatrix);
  tailMatrix.translate(0.0, 0.05, -0.32);      
  var tailAngle = -60; 
  if (animationRunning) {
    tailMatrix.rotate(g_tailAnimAngle, 0, 1, 0); 
    tailAngle += Math.abs(g_tailAnimAngle) * 0.2; 
  }
  
  // Apply the downward angle
  tailMatrix.rotate(tailAngle, 1, 0, 0);
  
  var tailTransformMatrix = new Matrix4(tailMatrix); 
  tailMatrix.scale(0.03, 0.6, 0.03);          
  drawCube(tailMatrix, [0.8, 0.6, 0.0, 1.0]);  
  
  // TAIL TIP - longer tuft at the end of the tail
  var tailTipMatrix = new Matrix4(tailTransformMatrix);
  tailTipMatrix.translate(0.0, -0.6, 0.0);     
  
  if (animationRunning) {
    tailTipMatrix.rotate(g_tailAnimAngle * 0.5, 0, 1, 0);
  }
  
  tailTipMatrix.scale(0.04, 0.15, 0.04);        
  drawCube(tailTipMatrix, [0.4, 0.3, 0.0, 1.0]); 

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
  
  frontRightLegMatrix.rotate(totalRightLegAngle, 1, 0, 0);
  
  var thighTransform = new Matrix4(frontRightLegMatrix); 
  
  frontRightLegMatrix.scale(0.06, 0.4, 0.06);       
  drawCube(frontRightLegMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // FRONT RIGHT LOWER LEG - Bottom half - Calf
  var calfMatrix = new Matrix4(thighTransform);
  calfMatrix.translate(0.0, -0.4 + 0.05, 0.0);    
  
  var totalCalfAngle = parseFloat(g_frontRightCalfAngle);
  if (animationRunning) {
    totalCalfAngle += g_rightCalfAnimAngle;
  }
  
  calfMatrix.rotate(totalCalfAngle, 1, 0, 0); 
  
  var calfTransform = new Matrix4(calfMatrix);
  
  calfMatrix.scale(0.06, 0.4, 0.06);       
  drawCube(calfMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // FRONT RIGHT FOOT (HOOF) - third level in hierarchy
  var footMatrix = new Matrix4(calfTransform);
  footMatrix.translate(0.0, -0.4 + 0.05, 0.0);        
  
  var totalFootAngle = parseFloat(g_frontRightFootAngle);
  if (animationRunning) {
    totalFootAngle += g_rightFootAnimAngle;
  }
  
  footMatrix.rotate(totalFootAngle, 1, 0, 0);
  
  footMatrix.scale(0.06, 0.05, 0.07);          
  drawCube(footMatrix, [1.0, 0.8, 0.0, 1.0]);   



  // FRONT LEFT LEG - Top half (yellow) - Thigh
  var frontLeftLegMatrix = new Matrix4(legsBaseMatrix);
  frontLeftLegMatrix.translate(-0.1, -0.15, 0.18);  
  
  var totalLeftLegAngle = parseFloat(g_frontLeftLegAngle);
  if (animationRunning) {
    totalLeftLegAngle += g_leftLegAnimAngle;
  }
  frontLeftLegMatrix.rotate(totalLeftLegAngle, 1, 0, 0); 
  
  var leftThighTransform = new Matrix4(frontLeftLegMatrix);
  
  frontLeftLegMatrix.scale(0.06, 0.4, 0.06);       
  drawCube(frontLeftLegMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // FRONT LEFT LOWER LEG - Bottom half - Calf
  var leftCalfMatrix = new Matrix4(leftThighTransform);
  leftCalfMatrix.translate(0.0, -0.4 + 0.05, 0.0);      
  
  var totalLeftCalfAngle = parseFloat(g_frontLeftCalfAngle);
  if (animationRunning) {
    totalLeftCalfAngle += g_leftCalfAnimAngle; 
  }
  leftCalfMatrix.rotate(totalLeftCalfAngle, 1, 0, 0); 
  
  var leftCalfTransform = new Matrix4(leftCalfMatrix);
  
  leftCalfMatrix.scale(0.06, 0.4, 0.06);        
  drawCube(leftCalfMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // FRONT LEFT FOOT (HOOF) - third level in hierarchy
  var leftFootMatrix = new Matrix4(leftCalfTransform);
  leftFootMatrix.translate(0.0, -0.4 + 0.05, 0.0);        
  
  var totalLeftFootAngle = parseFloat(g_frontLeftFootAngle);
  if (animationRunning) {
    totalLeftFootAngle += g_leftFootAnimAngle; 
  }
  leftFootMatrix.rotate(totalLeftFootAngle, 1, 0, 0); 
  
  leftFootMatrix.scale(0.06, 0.05, 0.07);           
  drawCube(leftFootMatrix, [1.0, 0.8, 0.0, 1.0]);   



  // BACK RIGHT LEG - Top half (yellow) - Thigh
  var backRightLegMatrix = new Matrix4(backLegsBaseMatrix);
  backRightLegMatrix.translate(0.1, -0.15, -0.1);    
  
  var totalBackRightLegAngle = parseFloat(g_backRightLegAngle);
  if (animationRunning) {
    totalBackRightLegAngle += g_backRightLegAnimAngle;
  }
  backRightLegMatrix.rotate(totalBackRightLegAngle, 1, 0, 0); 
  
  var backRightThighTransform = new Matrix4(backRightLegMatrix);
  
  backRightLegMatrix.scale(0.06, 0.4, 0.06);        
  drawCube(backRightLegMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // BACK RIGHT LOWER LEG - Bottom half - Calf
  var backRightCalfMatrix = new Matrix4(backRightThighTransform);
  backRightCalfMatrix.translate(0.0, -0.4 + 0.05, 0.0);    
  
  var totalBackRightCalfAngle = parseFloat(g_backRightCalfAngle);
  if (animationRunning) {
    totalBackRightCalfAngle += g_backRightCalfAnimAngle;
  }
  backRightCalfMatrix.rotate(totalBackRightCalfAngle, 1, 0, 0);
  
  var backRightCalfTransform = new Matrix4(backRightCalfMatrix);
  
  backRightCalfMatrix.scale(0.06, 0.4, 0.06);      
  drawCube(backRightCalfMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // BACK RIGHT FOOT (HOOF) - third level in hierarchy
  var backRightFootMatrix = new Matrix4(backRightCalfTransform);
  backRightFootMatrix.translate(0.0, -0.4 + 0.05, 0.0);     
  
  var totalBackRightFootAngle = parseFloat(g_backRightFootAngle);
  if (animationRunning) {
    totalBackRightFootAngle += g_backRightFootAnimAngle; 
  }
  backRightFootMatrix.rotate(totalBackRightFootAngle, 1, 0, 0); 
  
  backRightFootMatrix.scale(0.06, 0.05, 0.07);      
  drawCube(backRightFootMatrix, [1.0, 0.8, 0.0, 1.0]); 



  // BACK LEFT LEG - Top half (yellow) - Thigh
  var backLeftLegMatrix = new Matrix4(backLegsBaseMatrix);
  backLeftLegMatrix.translate(-0.1, -0.15, -0.1);   
  
  var totalBackLeftLegAngle = parseFloat(g_backLeftLegAngle);
  if (animationRunning) {
    totalBackLeftLegAngle += g_backLeftLegAnimAngle; 
  }
  backLeftLegMatrix.rotate(totalBackLeftLegAngle, 1, 0, 0); 
  
  var backLeftThighTransform = new Matrix4(backLeftLegMatrix);
  
  backLeftLegMatrix.scale(0.06, 0.4, 0.06);         
  drawCube(backLeftLegMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // BACK LEFT LOWER LEG - Bottom half - Calf
  var backLeftCalfMatrix = new Matrix4(backLeftThighTransform);
  backLeftCalfMatrix.translate(0.0, -0.4 + 0.05, 0.0);        
  
  var totalBackLeftCalfAngle = parseFloat(g_backLeftCalfAngle);
  if (animationRunning) {
    totalBackLeftCalfAngle += g_backLeftCalfAnimAngle;
  }
  backLeftCalfMatrix.rotate(totalBackLeftCalfAngle, 1, 0, 0); 
  
  var backLeftCalfTransform = new Matrix4(backLeftCalfMatrix);
  
  backLeftCalfMatrix.scale(0.06, 0.4, 0.06);       
  drawCube(backLeftCalfMatrix, [1.0, 0.8, 0.0, 1.0]); 

  // BACK LEFT FOOT (HOOF) - third level in hierarchy
  var backLeftFootMatrix = new Matrix4(backLeftCalfTransform);
  backLeftFootMatrix.translate(0.0, -0.4 + 0.05, 0.0);         
  
  var totalBackLeftFootAngle = parseFloat(g_backLeftFootAngle);
  if (animationRunning) {
    totalBackLeftFootAngle += g_backLeftFootAnimAngle; 
  }
  backLeftFootMatrix.rotate(totalBackLeftFootAngle, 1, 0, 0); 
  
  backLeftFootMatrix.scale(0.06, 0.05, 0.07);       
  drawCube(backLeftFootMatrix, [1.0, 0.8, 0.0, 1.0]); 


  drawGiraffeSpots(modelMatrix);
}

function drawGiraffeSpots(baseMatrix) {
  var bodySpotPositions = [
    [0.13, 0.07, 0.15, 0.025],   // Left/Right side front
    [0.13, 0.07, -0.05, 0.025],  // Left/Right side middle
    [0.13, 0.07, -0.2, 0.025],   // Left/Right side back
    [0.13, 0.1, 0.0, 0.025],     // Left/Right upper side
    [0.0, 0.15, 0.1, 0.03],      // Top front
    [0.0, 0.15, -0.15, 0.03],    // Top back
    [0.0, 0.05, 0.21, 0.025],    // Front center
    [0.08, 0.07, 0.21, 0.025],   // Front right/left
    [0.0, 0.05, -0.33, 0.025],   // Back center
    [0.08, 0.07, -0.33, 0.025]   // Back right/left
  ];
    
  bodySpotPositions.forEach(function(spot) {
    drawSpot(baseMatrix, spot[0], spot[1], spot[2], spot[3], spot[3], spot[3]);
    drawSpot(baseMatrix, -spot[0], spot[1], spot[2], spot[3], spot[3], spot[3]);

    if (spot[0] !== 0) {
      drawSpot(baseMatrix, spot[0] * 0.7, spot[1] * 1.1, spot[2] * 0.9, spot[3] * 0.8, spot[3] * 0.8, spot[3] * 0.8);
      drawSpot(baseMatrix, -spot[0] * 0.7, spot[1] * 1.1, spot[2] * 0.9, spot[3] * 0.8, spot[3] * 0.8, spot[3] * 0.8);
    }
  });
  
  var neckSpotMatrix = new Matrix4(baseMatrix);
  neckSpotMatrix.translate(0.0, 0.25, 0.08);
  neckSpotMatrix.rotate(-20, 1, 0, 0); 
  
  var neckSpotPositions = [
    [0.04, 0.1, 0.0, 0.02],    // Left/Right side lower 
    [0.04, 0.25, 0.0, 0.02],   // Left/Right side upper
    [0.0, 0.15, 0.04, 0.02],   // Front lower
    [0.0, 0.3, 0.04, 0.02],    // Front upper
    [0.0, 0.15, -0.04, 0.02],  // Back lower
    [0.0, 0.3, -0.04, 0.02]    // Back upper
  ];
  
  neckSpotPositions.forEach(function(spot) {
    if (spot[0] !== 0) {
      drawSpot(neckSpotMatrix, spot[0], spot[1], spot[2], spot[3], spot[3], spot[3]);
      drawSpot(neckSpotMatrix, -spot[0], spot[1], spot[2], spot[3], spot[3], spot[3]);
    } else {
      drawSpot(neckSpotMatrix, spot[0], spot[1], spot[2], spot[3], spot[3], spot[3]);
    }
    
    // Add some variation for visual interest
    if (spot[0] !== 0) {
      drawSpot(neckSpotMatrix, spot[0] * 0.8, spot[1] * 0.9, spot[2], spot[3] * 0.9, spot[3] * 0.9, spot[3] * 0.9);
      drawSpot(neckSpotMatrix, -spot[0] * 0.8, spot[1] * 0.9, spot[2], spot[3] * 0.9, spot[3] * 0.9, spot[3] * 0.9);
    }
  });
  
  // Leg spots - draw on all legs with proper positioning
  var legMatrices = [
    {matrix: new Matrix4(baseMatrix), x: 0.1, z: 0.18},    // Front right leg
    {matrix: new Matrix4(baseMatrix), x: -0.1, z: 0.18},   // Front left leg
    {matrix: new Matrix4(baseMatrix), x: 0.1, z: -0.3},    // Back right leg
    {matrix: new Matrix4(baseMatrix), x: -0.1, z: -0.3}    // Back left leg
  ];
  
  legMatrices.forEach(function(leg) {
    var legSpotMatrix = leg.matrix;
    legSpotMatrix.translate(leg.x, -0.15, leg.z);
    
    drawSpot(legSpotMatrix, 0.03, -0.07, 0.02, 0.018, 0.018, 0.018);  
    drawSpot(legSpotMatrix, -0.03, -0.07, 0.02, 0.018, 0.018, 0.018); 
    drawSpot(legSpotMatrix, 0.03, -0.15, 0.02, 0.018, 0.018, 0.018);  
    drawSpot(legSpotMatrix, -0.03, -0.15, 0.02, 0.018, 0.018, 0.018); 
    drawSpot(legSpotMatrix, 0.0, -0.1, 0.03, 0.018, 0.018, 0.018);    
    
    drawSpot(legSpotMatrix, 0.03, -0.07, -0.02, 0.018, 0.018, 0.018); 
    drawSpot(legSpotMatrix, -0.03, -0.07, -0.02, 0.018, 0.018, 0.018); 
  });
}

function drawSpot(baseMatrix, x, y, z, sx, sy, sz) {
  var spotMatrix = new Matrix4(baseMatrix);
  spotMatrix.translate(x, y, z);
  spotMatrix.scale(sx, sy, sz);
  
  var spotColor = [0.5, 0.25, 0.0, 1.0];
  
  if (g_isPokeAnimating) {
    var pulseFactor = Math.sin((g_pokeAnimTime / g_pokeAnimDuration) * Math.PI * 8);
    spotColor = [
      0.5 + pulseFactor * 0.3, 
      0.25, 
      0.0 + pulseFactor * 0.2, 
      1.0
    ];
  }
  
  drawCube(spotMatrix, spotColor);
}

function updateAnimationAngles() {
  if (g_isPokeAnimating) {
    g_pokeAnimTime++;
    
    // If we've reached the end of the animation, reset
    if (g_pokeAnimTime >= g_pokeAnimDuration) {
      g_isPokeAnimating = false;
      g_pokeAnimTime = 0;
    }
  }
  
  if (animationRunning) {
    g_time++;
    
    var speed = 0.03;
    
    g_rightLegAnimAngle = Math.sin(g_time * speed) * 15; 
    g_rightCalfAnimAngle = Math.sin((g_time * speed) + 0.5) * 10; 
    g_rightFootAnimAngle = Math.sin((g_time * speed) + 1.0) * 5; 
    
    // Front left leg animation 
    g_leftLegAnimAngle = Math.sin((g_time * speed) + Math.PI) * 15; // Opposite phase
    g_leftCalfAnimAngle = Math.sin((g_time * speed) + Math.PI + 0.5) * 10;
    g_leftFootAnimAngle = Math.sin((g_time * speed) + Math.PI + 1.0) * 5;
    
    // Back right leg animation
    g_backRightLegAnimAngle = Math.sin((g_time * speed) + Math.PI) * 15;
    g_backRightCalfAnimAngle = Math.sin((g_time * speed) + Math.PI + 0.5) * 10;
    g_backRightFootAnimAngle = Math.sin((g_time * speed) + Math.PI + 1.0) * 5;
    
    g_backLeftLegAnimAngle = Math.sin(g_time * speed) * 15;
    g_backLeftCalfAnimAngle = Math.sin((g_time * speed) + 0.5) * 10;
    g_backLeftFootAnimAngle = Math.sin((g_time * speed) + 1.0) * 5;
    
    g_headAnimAngle = Math.sin(g_time * speed * 0.7) * 5; 
    g_neckAnimAngle = Math.sin(g_time * speed * 0.7 + 0.3) * 3; 
    
    g_tailAnimAngle = Math.sin(g_time * speed * 1.5) * 10; 
    
    g_bodyAnimOffset = Math.abs(Math.sin(g_time * speed)) * 0.02; 
  }
}

function tick() {
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}
