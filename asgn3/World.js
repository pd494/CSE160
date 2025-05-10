// BlockyAnimal.js - Main file for the Blocky Animal assignment

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Normal;

  attribute vec2 a_UV;
  varying vec2 v_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform vec4 u_Color;
  varying vec4 v_Color;
  uniform float u_PointSize;

  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_Color = u_Color;
    gl_PointSize = u_PointSize;
    v_UV = a_UV;


  }
`;

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' +
  'uniform vec4 u_FragColor;\n' +
  'uniform sampler2D u_Sampler0;\n' +
  'uniform sampler2D u_Sampler1;\n' +
  'uniform int u_whichTexture;\n' +
  'void main() {\n' +
  '  if (u_whichTexture == -2) {\n' +
  '    gl_FragColor = u_FragColor;      // Use color\n' +
  '  } else if (u_whichTexture == -1) {\n' +
  '    gl_FragColor = vec4(v_UV, 1.0, 1.0);  // Use UV debug color\n' +
  '  } else if (u_whichTexture == 0) {\n' +
  '    gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0 (sky)\n' +
  '  } else if (u_whichTexture == 1) {\n' +
  '    gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1 (ground)\n' +
  '  } else {\n' +
  '    gl_FragColor = vec4(1,0.2,0.2,1);  // Error, put Redish\n' +
  '  }\n' +
  '}\n';

// Global Variables
var gl;              
var canvas;          
var a_Position;    
let a_UV;
var u_FragColor;    
var u_PointSize;    
var u_ModelMatrix;  
var u_GlobalRotateMatrix;
var u_ViewMatrix;
var u_ProjectionMatrix;
var g_globalAngle = 0;  
var g_globalXAngle = 0; 
var g_global = 5;   

// Texture variables


// Texture variables
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;

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

// Global Variables for controlling rendering optimization
var g_useOptimizedRendering = false; // Set to false by default

// FPS counter variables
var g_lastTime = 0;
var g_frameCount = 0;
var g_frameTime = 0;
var g_fps = 0;
var g_fpsElement;

// Define a 32x32 map where each value represents wall height (0 = no wall)
var g_map = [];
var g_walls = []; // Array to store wall objects

// Initialize the map with walls around the perimeter and some random structures
function initializeMap() {
  // Create empty 32x32 map
  for (var i = 0; i < 32; i++) {
    g_map[i] = [];
    for (var j = 0; j < 32; j++) {
      // Default: no walls (0)
      g_map[i][j] = 0;
      
      // Create walls around the perimeter
      if (i === 0 || i === 31 || j === 0 || j === 31) {
        g_map[i][j] = 1; // 1 unit high wall
      }
    }
  }
  
  // Pillars in corners - shorter now
  g_map[5][5] = 2;   // 2 units high
  g_map[5][26] = 2;
  g_map[26][5] = 2;
  g_map[26][26] = 2;
  
  // Some random walls
  g_map[10][5] = 1;
  g_map[11][5] = 1;
  g_map[12][5] = 1;
  g_map[13][5] = 1;
  
  // Move the taller structures away from the center to avoid covering the animal
  // Place them near the perimeter instead
  g_map[5][12] = 3;  // A 3-unit high tower near the left wall
  g_map[5][13] = 3;
  g_map[26][12] = 3; // A 3-unit high tower near the right wall
  g_map[26][13] = 3;
  
  // Clear the center area completely (just to be safe)
  for (var i = 12; i < 20; i++) {
    for (var j = 12; j < 20; j++) {
      g_map[i][j] = 0;
    }
  }
  
  // Build walls from the map
  buildWallsFromMap();
}

// Function to build wall objects from the map data
function buildWallsFromMap() {
  // Clear existing walls
  g_walls = [];
  
  // Create walls based on the map values
  for (var x = 0; x < 32; x++) {
    for (var z = 0; z < 32; z++) {
      if (g_map[x][z] > 0) { // If there's a wall here
        for (var y = 0; y < g_map[x][z]; y++) { // Loop through the height
          var wall = new Cube();
          
          // Main wall color (slightly off-white to show borders)
          wall.color = [0.95, 0.95, 0.95, 1.0];
          
          // Alternate colors for top of wall
          if (y === g_map[x][z] - 1) {
            wall.color = [1.0, 1.0, 1.0, 1.0]; // Bright white for top
          }
          
          wall.textureNum = -2; // Use solid color without texture mapping
          
          // Position the wall cube - slightly farther apart but still close
          wall.matrix.translate((x - 16) * 0.22, y - 0.75, (z - 16) * 0.22); 
          
          // Scale smaller to create more visible gaps between cubes
          wall.matrix.scale(0.7, 0.9, 0.7);
          
          // Store the wall in the array
          g_walls.push(wall);
        }
      }
    }
  }
}

// Function to draw all walls from the walls array
function drawMap() {
  // Draw all walls from the array
  for (var i = 0; i < g_walls.length; i++) {
    var wall = g_walls[i];
    if (g_useOptimizedRendering) {
      wall.renderFast();
    } else {
      wall.render();
    }
  }
}

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

  // Initialize camera
  g_camera = new Camera();

  // Get the FPS counter element
  g_fpsElement = document.getElementById('fps-counter');
  updateFPSDisplay(); // Initialize with default values

  // Initialize the map and build walls
  initializeMap();
  
  initTextures(gl);
  
  // Start the animation
  g_lastTime = performance.now();
  requestAnimationFrame(tick);
  
  // Register event handlers
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = mouseMove;

  document.onkeydown = keydown;
  
  // Add event listener for animation toggle button
  document.getElementById('animToggleBtn').addEventListener('click', function() {
    animationRunning = !animationRunning;
    this.textContent = animationRunning ? 'Animation: ON' : 'Animation: OFF';
    this.style.backgroundColor = animationRunning ? '#4CAF50' : '#555555';
  });
  
  // Add event listener for optimization toggle button
  document.getElementById('optimizeToggleBtn').addEventListener('click', function() {
    g_useOptimizedRendering = !g_useOptimizedRendering;
    this.textContent = g_useOptimizedRendering ? 'Optimization: ON' : 'Optimization: OFF';
    this.style.backgroundColor = g_useOptimizedRendering ? '#4CAF50' : '#555555';
    console.log('Optimization ' + (g_useOptimizedRendering ? 'enabled' : 'disabled'));
    updateFPSDisplay();
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


function keydown(ev){
  if (ev.keyCode == 65) { // A key - move left
    g_camera.left();
  }
  if (ev.keyCode == 68) { // D key - move right
    g_camera.right();
  }
  if (ev.keyCode == 87) { // W key - move forward
    g_camera.forward();
  }
  if (ev.keyCode == 83) { // S key - move backward
    g_camera.back();
  }
  if (ev.keyCode == 81) { // Q key - pan left
    g_camera.panLeft();
  }
  if (ev.keyCode == 69) { // E key - pan right
    g_camera.panRight();
  }
  renderScene();
  console.log(ev.keyCode)
}
// This function is no longer used - textures are loaded in initTextures

function initTextures(gl) {
  // Load sky texture (texture0)
  var skyImage = new Image();
  if (!skyImage) {
    console.log('Failed to create the sky image object');
    return false;
  }
  
  // Load ground texture (texture1)
  var groundImage = new Image();
  if (!groundImage) {
    console.log('Failed to create the ground image object');
    return false;
  }
  
  // Create textures
  var skyTexture = gl.createTexture();
  var groundTexture = gl.createTexture();
  if (!skyTexture || !groundTexture) {
    console.log('Failed to create texture objects');
    return false;
  }
  
  // Register sky texture handler
  skyImage.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, skyTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, skyImage);
    gl.uniform1i(u_Sampler0, 0);
  };
  
  // Register ground texture handler
  groundImage.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, groundImage);
    gl.uniform1i(u_Sampler1, 1);
  };
  
  // Start loading the images
  skyImage.src = 'sky.jpg';
  groundImage.src = 'ground.jpg';
  
  return true;
}



// Helper function to check if a value is a power of 2
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
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

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
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

   // Get the storage location of u_Sampler
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }
   
   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }

   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
     console.log('Failed to get the storage location of u_whichTexture');
     return false;
   }

   // Get the storage locations of view and projection matrices
   u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   if (!u_ViewMatrix) {
     console.log('Failed to get the storage location of u_ViewMatrix');
     return false;
   }

   u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
   if (!u_ProjectionMatrix) {
     console.log('Failed to get the storage location of u_ProjectionMatrix');
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
function drawCube(matrix, color, textureNum) {
  var cube = new Cube();
  cube.color = color;
  cube.matrix.set(matrix);
  
  // Check if textureNum is passed as a parameter
  if (textureNum !== undefined) {
    cube.textureNum = textureNum;
  } 
  // Check if matrix has a textureNum property
  else if (matrix.textureNum !== undefined) {
    cube.textureNum = matrix.textureNum;
  }
  
  if (g_useOptimizedRendering) {
    // Use optimized rendering methods when enabled
    if (cube.textureNum >= 0) {
      // If it has a texture (sky or ground), use renderFastUV
      cube.renderFastUV();
    } else {
      // Otherwise use renderFast for solid colors
      cube.renderFast();
    }
  } else {
    // Use original render method for safety until optimized methods are fixed
    cube.render();
  }
}

// Initialize camera
var g_camera;

// Function to render the entire scene
function renderScene() {
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Activate texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalXAngle, 1, 0, 0); 
  globalRotMat.rotate(g_globalAngle * 4, 0, 1, 0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  var modelMatrix = new Matrix4();  // The model matrix for the main body
  
  // Update and use camera's view and projection matrices
  g_camera.updateProjectionMatrix(canvas.width / canvas.height);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  // Draw the sky
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  if (g_useOptimizedRendering) {
    sky.renderFastUV();
  } else {
    sky.render();
  }

  // Draw the floor with ground texture
  var floor = new Cube();
  floor.color = [1.0, 1.0, 1.0, 1.0]; // White (will be multiplied by texture color)
  floor.textureNum = 1; // Use the ground texture (texture1)
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(25, 0, 25); // Much larger ground
  floor.matrix.translate(-0.5, 0, -0.5);
  if (g_useOptimizedRendering) {
    floor.renderFastUV();
  } else {
    floor.render();
  }

  // Draw the map (walls)
  drawMap();
  
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
  bodyMatrix.textureNum = -2; // Set to -2 for solid color
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
  headMatrix.textureNum = -2; // Set to -2 for solid color instead of 0
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
  footMatrix.textureNum = -2; // Set to -2 for solid color instead of 0
  
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
  
  // Set textureNum to -2 to ensure solid color rendering
  spotMatrix.textureNum = -2;
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

function updateFPSDisplay() {
  const mode = g_useOptimizedRendering ? 'Optimized' : 'Standard';
  g_fpsElement.textContent = `FPS: ${g_fps} (${mode})`;
}

function tick() {
  updateAnimationAngles();
  
  // Calculate FPS
  const now = performance.now();
  const delta = now - g_lastTime;
  g_lastTime = now;
  
  // Update frame time counter
  g_frameTime += delta;
  g_frameCount++;
  
  // Update FPS display every 500ms
  if (g_frameTime >= 500) {
    g_fps = Math.round((g_frameCount * 1000) / g_frameTime);
    updateFPSDisplay();
    g_frameCount = 0;
    g_frameTime = 0;
  }
  
  renderScene();
  requestAnimationFrame(tick);
}
