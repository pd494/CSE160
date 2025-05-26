// Lighting.js - Simple cube with normal visualization

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec3 a_Normal;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_WorldNormal;
  varying vec3 v_LightDir;
  varying float v_Lighting;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform vec4 u_Color;
  varying vec4 v_Color;
  uniform float u_PointSize;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  varying vec4 v_VertPos;
  uniform vec3 u_lightPos;
  
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_Color = u_Color;
    gl_PointSize = u_PointSize;
    v_UV = a_UV;
    
    // Transform vertex to world space
    v_VertPos = u_ModelMatrix * a_Position;
    
    // Transform normal to world space (using normal matrix)
    // Normal matrix = transpose(inverse(modelMatrix))
    // For orthogonal transforms, we can simplify by just using the model matrix
    mat4 normalMatrix = u_ModelMatrix;
    v_WorldNormal = normalize((normalMatrix * vec4(a_Normal, 0.0)).xyz);
    v_Normal = a_Normal;
    
    // Calculate light direction in world space
    v_LightDir = normalize(u_lightPos - vec3(v_VertPos));
    
    // Calculate basic lighting (for debugging and compatibility)
    v_Lighting = max(dot(v_WorldNormal, v_LightDir), 0.0);
  }
`;

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_WorldNormal;\n' +
  'varying vec3 v_LightDir;\n' +
  'varying float v_Lighting;\n' +
  'uniform vec4 u_FragColor;\n' +
  'uniform sampler2D u_Sampler0;\n' +
  'uniform int u_whichTexture;\n' +
  'uniform bool u_normalVisualization;\n' +
  'uniform int u_normalVisualizationMode;\n' +
  'uniform vec3 u_lightPos;\n' +
  'uniform vec3 u_cameraEye;\n' +
  'uniform vec3 u_lightColor;\n' +
  'varying vec4 v_VertPos;\n' +
  'void main() {\n' +
  '  if (u_normalVisualization) {\n' +
  '    // Standard normal visualization for both cube and sphere\n' +
  '    // Normalize from [-1,1] to [0,1] to avoid black faces\n' +
  '    vec3 normalizedNormal = v_Normal * 0.5 + 0.5;\n' +
  '    gl_FragColor = vec4(normalizedNormal, 1.0);\n' +
  '  } else if (u_whichTexture == -2) {\n' +
  '    gl_FragColor = u_FragColor;      // Use solid color\n' +
  '  } else if (u_whichTexture == -1) {\n' +
  '    gl_FragColor = vec4(v_UV, 1.0, 1.0);  // Use UV debug color\n' +
  '  } else if (u_whichTexture == 0) {\n' +
  '    gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use ground texture\n' +
  '  } else {\n' +
  '    gl_FragColor = vec4(1,0.2,0.2,1);  // Error, put Redish\n' +
  '  }\n' +
  '  // Apply lighting calculation\n' +
  '  // Option 1: Use pre-calculated lighting from vertex shader\n' +
  '  // gl_FragColor = gl_FragColor * v_Lighting;\n' +
  '  // Option 2: Calculate full Phong lighting in fragment shader (better quality)\n' +
  '  vec3 N = normalize(v_WorldNormal);\n' +
  '  vec3 L = normalize(v_LightDir);\n' +
  '  float NdotL = max(dot(N, L), 0.0);\n' +
  '  vec3 R = reflect(-L, N);\n' +
  '  vec3 E = normalize(u_cameraEye - vec3(v_VertPos));\n' +
  '  float specular = pow(max(dot(R, E), 0.0), 10.0);\n' +
  '  vec3 diffuse = vec3(gl_FragColor) * NdotL * u_lightColor;\n' +
  '  vec3 ambient = vec3(gl_FragColor) * 0.2;\n' +
  '  vec3 specularColor = u_lightColor * specular;\n' +
  '  gl_FragColor = vec4(ambient + diffuse + specularColor, 1.0);\n' +
  '}\n';

// Global Variables
var gl;              
var canvas;          
var a_Position;    
var a_Normal;
let a_UV;
var u_FragColor;    
var u_PointSize;    
var u_ModelMatrix;  
var u_GlobalRotateMatrix;
var u_ViewMatrix;
var u_ProjectionMatrix;
var u_normalVisualization;
var g_globalAngle = 0;  
var g_globalXAngle = 0; 

var u_Sampler0;
var u_whichTexture;
var u_normalVisualizationMode;
var u_lightPos;
var u_cameraEye;
var u_lightColor;

var g_camera;

// Room dimensions
var g_roomSize = 5.0;      // Size of the cubic room
var g_roomHeight = 5.0;    // Height of the room
var g_wallColor = [0.8, 0.8, 0.8, 1.0]; // Light gray walls

// Light position
var g_lightPos = [0, 1.2, 0];
var g_lightColor = [1.0, 1.0, 1.0]; // Default white light

// Light animation parameters
var g_lightMinX = -3.0;    // Left edge
var g_lightMaxX = 3.0;     // Right edge
var g_lightY = 1.2;        // Fixed height just above the shapes
var g_lightZ = 0.0;        // Fixed Z position level with shapes
var g_lightSpeed = 0.03;   // Speed of movement - reduced for smoother animation
var g_lightDirection = 1;  // 1 for right, -1 for left
var g_lightCenter = 0;     // Center position for animation (will be updated when user moves light)
var g_lightRange = 3.0;    // Range of movement in each direction

// Normal visualization toggle
var g_normalVisualization = false;

// Animation variables
var animationRunning = true; // Start with animation on
var g_time = 0;

// FPS counter variables
var g_fpsElement;
var g_lastTime = 0;
var g_frameCount = 0;
var g_fps = 0;

// Camera control variables
var g_isDraggingCamera = false;  
var g_mouseLastX = -1;
var g_mouseLastY = -1;
var g_cameraMode = false;  
var g_pointerLockActive = false;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  
  // Initialize camera
  g_camera = new Camera();
  g_camera.eye = new Vector3([0, 2, 3]); // Position camera higher and back to see cube on ground
  
  // Initialize FPS counter
  g_fpsElement = document.getElementById('fps-counter');
  g_lastTime = performance.now();
  
  // Set up event listeners
  canvas.onmousedown = function(ev) { 
    if (ev.button === 0) { // Left mouse button
      canvas.requestPointerLock();
    }
  };
  
  document.addEventListener('pointerlockchange', pointerLockChangeHandler);
  document.addEventListener('mousemove', handleMouseMovement);
  document.addEventListener('keydown', keydown);
  
  // Initialize textures
  initTextures(gl);
  
  // Set up UI controls
  setupUIControls();
  
  // Start rendering
  tick();
}

function initTextures(gl) {
  // Ground texture only
  var groundTexture = gl.createTexture();
  var groundImage = new Image();
  groundImage.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, groundImage);
    
    if (isPowerOf2(groundImage.width) && isPowerOf2(groundImage.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
  };
  groundImage.src = 'ground.jpg';
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

function setupUIControls() {
  // Animation toggle button
  var animToggleBtn = document.getElementById('animToggleBtn');
  if (animToggleBtn) {
    animToggleBtn.textContent = 'Animation: ON'; // Start with ON
    animToggleBtn.style.backgroundColor = '#4CAF50';
    animToggleBtn.onclick = function() {
      animationRunning = !animationRunning;
      this.textContent = animationRunning ? 'Animation: ON' : 'Animation: OFF';
      this.style.backgroundColor = animationRunning ? '#4CAF50' : '#f44336';
    };
  }
  
  // Normal visualization toggle button
  var normalToggleBtn = document.getElementById('normalToggleBtn');
  if (normalToggleBtn) {
    normalToggleBtn.onclick = function() {
      g_normalVisualization = !g_normalVisualization;
      this.textContent = g_normalVisualization ? 'Normal Visualization: ON' : 'Normal Visualization: OFF';
      this.style.backgroundColor = g_normalVisualization ? '#FF9800' : '#4CAF50';
    };
  }
  
  // Camera angle slider
  var cameraAngleSlider = document.getElementById('cameraAngleSlider');
  var cameraAngleValue = document.getElementById('cameraAngleValue');
  if (cameraAngleSlider && cameraAngleValue) {
    cameraAngleSlider.oninput = function() {
      g_globalAngle = this.value;
      cameraAngleValue.textContent = this.value + '°';
    };
  }
  
  // Light position sliders
  var lightXSlider = document.getElementById('lightXSlider');
  var lightXValue = document.getElementById('lightXValue');
  if (lightXSlider && lightXValue) {
    lightXSlider.oninput = function() {
      g_lightPos[0] = parseFloat(this.value);
      lightXValue.textContent = this.value;
      // Update the center position for animation
      g_lightCenter = g_lightPos[0];
    };
  }
  
  var lightYSlider = document.getElementById('lightYSlider');
  var lightYValue = document.getElementById('lightYValue');
  if (lightYSlider && lightYValue) {
    lightYSlider.oninput = function() {
      g_lightPos[1] = parseFloat(this.value);
      lightYValue.textContent = this.value;
    };
  }
  
  var lightZSlider = document.getElementById('lightZSlider');
  var lightZValue = document.getElementById('lightZValue');
  if (lightZSlider && lightZValue) {
    lightZSlider.oninput = function() {
      g_lightPos[2] = parseFloat(this.value);
      lightZValue.textContent = this.value;
    };
  }
  
  // Light color sliders
  var lightRedSlider = document.getElementById('lightRedSlider');
  var lightRedValue = document.getElementById('lightRedValue');
  if (lightRedSlider && lightRedValue) {
    lightRedSlider.oninput = function() {
      g_lightColor[0] = parseFloat(this.value);
      lightRedValue.textContent = this.value;
    };
  }
  
  var lightGreenSlider = document.getElementById('lightGreenSlider');
  var lightGreenValue = document.getElementById('lightGreenValue');
  if (lightGreenSlider && lightGreenValue) {
    lightGreenSlider.oninput = function() {
      g_lightColor[1] = parseFloat(this.value);
      lightGreenValue.textContent = this.value;
    };
  }
  
  var lightBlueSlider = document.getElementById('lightBlueSlider');
  var lightBlueValue = document.getElementById('lightBlueValue');
  if (lightBlueSlider && lightBlueValue) {
    lightBlueSlider.oninput = function() {
      g_lightColor[2] = parseFloat(this.value);
      lightBlueValue.textContent = this.value;
    };
  }
}

function keydown(ev) {
  switch(ev.code) {
    case 'KeyW': g_camera.forward(); break;
    case 'KeyS': g_camera.back(); break;
    case 'KeyA': g_camera.left(); break;
    case 'KeyD': g_camera.right(); break;
    case 'KeyR': g_camera.moveUp(); break;
    case 'KeyT': g_camera.moveDown(); break;
    case 'Escape':
      if (g_pointerLockActive) {
        document.exitPointerLock();
      }
      break;
  }
}

function pointerLockChangeHandler() {
  g_pointerLockActive = document.pointerLockElement === canvas;
  g_cameraMode = g_pointerLockActive;
}

function handleMouseMovement(e) {
  if (!g_pointerLockActive) return;
  
  var sensitivity = 0.2;
  var deltaX = e.movementX * sensitivity;
  var deltaY = e.movementY * sensitivity;
  
  g_camera.tilt(-deltaX);
  g_camera.pan(-deltaY);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.1, 0.1, 0.1, 1.0); // Dark background for better lighting effects
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }
  
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }
  
  u_cameraEye = gl.getUniformLocation(gl.program, 'u_cameraEye');
  if (!u_cameraEye) {
    console.log('Failed to get the storage location of u_cameraEye');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  u_normalVisualization = gl.getUniformLocation(gl.program, 'u_normalVisualization');
  if (!u_normalVisualization) {
    console.log('Failed to get the storage location of u_normalVisualization');
    return;
  }

  u_normalVisualizationMode = gl.getUniformLocation(gl.program, 'u_normalVisualizationMode');
  if (!u_normalVisualizationMode) {
    console.log('Failed to get the storage location of u_normalVisualizationMode');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Function to draw a wall cube
function drawWall(matrix, color) {
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniform1i(u_whichTexture, -2); // Use solid color for walls
  var cube = new Cube();
  cube.render();
}

function render() {
  // Clear canvas and set up shared uniforms
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set normal visualization uniform
  gl.uniform1i(u_normalVisualization, g_normalVisualization);
  
  // Set light position uniform
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  
  // Set light color uniform
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  
  // Set camera eye position for specular calculation
  gl.uniform3f(u_cameraEye, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  var globalRotMat = new Matrix4();
  // Rotate scene around Y axis using slider for left/right rotation
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  // Helper function to draw a cube with given parameters
  function drawCube(matrix, color, textureNum) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.uniform1i(u_whichTexture, textureNum);
    var cube = new Cube();
    cube.textureNum = textureNum;
    cube.render();
  }

  // Draw cube and sphere in one scene so they rotate together
  g_camera.updateProjectionMatrix(canvas.width / canvas.height);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  
  // Draw walls to create a room
  var halfSize = g_roomSize / 2;
  var wallThickness = 0.1;
  
  // Floor (ground)
  var floorMatrix = new Matrix4();
  floorMatrix.translate(0, -wallThickness/2, 0);
  floorMatrix.scale(g_roomSize, wallThickness, g_roomSize);
  drawWall(floorMatrix, [0.3, 0.3, 0.3, 1.0]); // Dark gray floor
  
  // Ceiling
  var ceilingMatrix = new Matrix4();
  ceilingMatrix.translate(0, g_roomHeight + wallThickness/2, 0);
  ceilingMatrix.scale(g_roomSize, wallThickness, g_roomSize);
  drawWall(ceilingMatrix, g_wallColor);
  
  // Left wall (X-)
  var leftWallMatrix = new Matrix4();
  leftWallMatrix.translate(-halfSize - wallThickness/2, g_roomHeight/2, 0);
  leftWallMatrix.scale(wallThickness, g_roomHeight, g_roomSize);
  drawWall(leftWallMatrix, g_wallColor);
  
  // Right wall (X+)
  var rightWallMatrix = new Matrix4();
  rightWallMatrix.translate(halfSize + wallThickness/2, g_roomHeight/2, 0);
  rightWallMatrix.scale(wallThickness, g_roomHeight, g_roomSize);
  drawWall(rightWallMatrix, g_wallColor);
  
  // Back wall (Z-)
  var backWallMatrix = new Matrix4();
  backWallMatrix.translate(0, g_roomHeight/2, -halfSize - wallThickness/2);
  backWallMatrix.scale(g_roomSize, g_roomHeight, wallThickness);
  drawWall(backWallMatrix, g_wallColor);
  
  // Front wall (Z+) (optional - depending on camera position)
  var frontWallMatrix = new Matrix4();
  frontWallMatrix.translate(0, g_roomHeight/2, halfSize + wallThickness/2);
  frontWallMatrix.scale(g_roomSize, g_roomHeight, wallThickness);
  drawWall(frontWallMatrix, g_wallColor);
  
  // Draw cube to the left
  var cubeModel = new Matrix4();
  cubeModel.translate(-1.5, 0.5, 0.0);
  cubeModel.scale(1.0, 1.0, 1.0);
  gl.uniform1i(u_normalVisualizationMode, 0); // Standard normal visualization for cube
  drawCube(cubeModel, [0.5, 0.0, 0.5, 1.0], -2);
  
  // Draw light cube
  var light = new Cube();
  light.color = g_lightColor; // Set light cube color to match light color
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(0.1, 0.1, 0.1);
  light.render();
  
  // Draw sphere to the right
  var sphereModel = new Matrix4();
  sphereModel.translate(1.5, 0.5, 0.0);
  sphereModel.scale(0.5, 0.5, 0.5);
  gl.uniform1i(u_normalVisualizationMode, 1); // Gradient normal visualization for sphere
  // instantiate and render sphere with its own model matrix and color
  var sphereObj = new Sphere();
  sphereObj.textureNum = -2;
  sphereObj.matrix = sphereModel;
  sphereObj.color = [1.0, 0.0, 0.0, 1.0];
  sphereObj.renderWithNormals();
}

function updateAnimationAngles() {
  if (!animationRunning) return;
  
  g_time += 1;
  
  // Update light position to move from left to right and back
  if (animationRunning) {
    // Calculate new X position around the center point with equal movement in both directions
    // We're using cosine instead of sine to start from center position
    g_lightPos[0] = g_lightCenter + Math.cos(g_time * g_lightSpeed) * g_lightRange;
    
    // Ensure we don't exceed the boundaries of the room
    if (g_lightPos[0] > g_lightMaxX) g_lightPos[0] = g_lightMaxX;
    if (g_lightPos[0] < g_lightMinX) g_lightPos[0] = g_lightMinX;
    
    // Don't update the Y and Z values - keep user settings
    // And don't update slider positions
  }
}

function tick() {
  // Calculate FPS
  var currentTime = performance.now();
  g_frameCount++;
  
  if (currentTime - g_lastTime >= 1000) { // Update FPS every second
    g_fps = Math.round((g_frameCount * 1000) / (currentTime - g_lastTime));
    g_fpsElement.textContent = 'FPS: ' + g_fps;
    g_frameCount = 0;
    g_lastTime = currentTime;
  }
  
  updateAnimationAngles();
  render();
  requestAnimationFrame(tick);
} 