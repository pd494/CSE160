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
  uniform vec3 u_spotlightPos;
  
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_Color = u_Color;
    gl_PointSize = u_PointSize;
    v_UV = a_UV;
    
    v_VertPos = u_ModelMatrix * a_Position;
    
    mat4 normalMatrix = u_ModelMatrix;
    v_WorldNormal = normalize((normalMatrix * vec4(a_Normal, 0.0)).xyz);
    v_Normal = a_Normal;
    
    v_LightDir = normalize(u_lightPos - vec3(v_VertPos));
    
    v_Lighting = max(dot(v_WorldNormal, v_LightDir), 0.0);
  }
`;

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
  'uniform vec3 u_lightPos;\n' +
  'uniform vec3 u_spotlightPos;\n' +
  'uniform vec3 u_cameraEye;\n' +
  'uniform vec3 u_lightColor;\n' +
  'uniform bool u_lightOn;\n' +
  'uniform bool u_spotlightEnabled;\n' +
  'uniform vec3 u_spotlightDirection;\n' +
  'uniform float u_spotlightInnerLimit;\n' +
  'uniform float u_spotlightOuterLimit;\n' +
  'varying vec4 v_VertPos;\n' +
  'void main() {\n' +
  '  vec4 originalColor;\n' +
  '  if (u_normalVisualization) {\n' +
  '    vec3 normalizedNormal = v_Normal * 0.5 + 0.5;\n' +
  '    originalColor = vec4(normalizedNormal, 1.0);\n' +
  '  } else if (u_whichTexture == -2) {\n' +
  '    originalColor = u_FragColor;\n' +
  '  } else if (u_whichTexture == -1) {\n' +
  '    originalColor = vec4(v_UV, 1.0, 1.0);\n' +
  '  } else if (u_whichTexture == 0) {\n' +
  '    originalColor = texture2D(u_Sampler0, v_UV);\n' +
  '  } else {\n' +
  '    originalColor = vec4(1.0, 0.2, 0.2, 1.0);\n' +
  '  }\n' +
  '\n' +
  '  if (u_lightOn) {\n' +
  '    vec3 N = normalize(v_WorldNormal);\n' +
  '    vec3 L = normalize(v_LightDir);\n' +
  '    float NdotL = max(dot(N, L), 0.0);\n' +
  '    vec3 R = reflect(-L, N);\n' +
  '    vec3 E = normalize(u_cameraEye - vec3(v_VertPos));\n' +
  '    float specular = pow(max(dot(R, E), 0.0), 64.0) * 0.8;\n' +
  '    vec3 ambient = vec3(originalColor) * 0.2;\n' +
  '    \n' +
  '    if (u_spotlightEnabled) {\n' +
  '      vec3 spotL = normalize(u_spotlightPos - vec3(v_VertPos));\n' +
  '      vec3 spotDir = normalize(u_spotlightDirection);\n' +
  '      float dotFromDirection = dot(-spotL, spotDir);\n' +
  '      float spotEffect = smoothstep(u_spotlightOuterLimit, u_spotlightInnerLimit, dotFromDirection);\n' +
  '      float spotNdotL = max(dot(N, spotL), 0.0);\n' +
  '      vec3 diffuse = vec3(originalColor) * NdotL * u_lightColor;\n' +
  '      vec3 spotDiffuse = vec3(originalColor) * spotNdotL * u_lightColor;\n' +
  '      vec3 specularColor = u_lightColor * specular;\n' +
  '      float spotIntensity = 1.5;\n' +
  '      vec3 finalColor = ambient + diffuse + specularColor + (spotDiffuse + specularColor) * spotEffect * spotIntensity;\n' +
  '      gl_FragColor = vec4(finalColor, 1.0);\n' +
  '    } else {\n' +
  '      vec3 diffuse = vec3(originalColor) * NdotL * u_lightColor;\n' +
  '      vec3 specularColor = u_lightColor * specular;\n' +
  '      gl_FragColor = vec4(ambient + diffuse + specularColor, 1.0);\n' +
  '    }\n' +
  '  } else {\n' +
  '    gl_FragColor = originalColor;\n' +
  '  }\n' +
  '}\n';

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
var u_lightOn;

var g_camera;

var g_roomSize = 5.0;
var g_roomHeight = 5.0;
var g_wallColor = [0.8, 0.8, 0.8, 1.0];

var g_lightPos = [0, 1.2, 0];
var g_lightColor = [1.0, 1.0, 1.0];
var g_lightOn = true;

var g_spotlightDirection = [0, -1, 0];
var g_spotlightCutoffAngle = 15.0;
var g_spotlightExponent = 20.0;
var g_spotlightEnabled = false;
var g_spotlightInnerLimit = Math.cos(15.0 * Math.PI / 180);
var g_spotlightOuterLimit = Math.cos(25.0 * Math.PI / 180);
var g_spotlightPos = [0, 4.5, 0];

var g_lightMinX = -2.5;
var g_lightMaxX = 2.5;
var g_lightY = 1.2;
var g_lightZ = 0.0;
var g_lightSpeed = 0.03;
var g_lightDirection = 1;
var g_lightCenter = 0;
var g_lightRange = 2.5;

var g_normalVisualization = false;

var animationRunning = true;
var g_time = 0;

var g_fpsElement;
var g_lastTime = 0;
var g_frameCount = 0;
var g_fps = 0;

var g_isDraggingCamera = false;  
var g_mouseLastX = -1;
var g_mouseLastY = -1;
var g_cameraMode = false;  
var g_pointerLockActive = false;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  
  g_camera = new Camera();
  g_camera.eye = new Vector3([0, 2, 3]); 
  
  g_fpsElement = document.getElementById('fps-counter');
  g_lastTime = performance.now();
  
  canvas.onmousedown = function(ev) { 
    if (ev.button === 0) { // Left mouse button
      canvas.requestPointerLock();
    }
  };
  
  document.addEventListener('pointerlockchange', pointerLockChangeHandler);
  document.addEventListener('mousemove', handleMouseMovement);
  document.addEventListener('keydown', keydown);
  
  initTextures(gl);
  
  setupUIControls();
  
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
  var animToggleBtn = document.getElementById('animToggleBtn');
  if (animToggleBtn) {
    animToggleBtn.textContent = 'Animation: ON'; // Start with ON
    animToggleBtn.style.backgroundColor = '#4CAF50';
    animToggleBtn.onclick = function() {
      animationRunning = !animationRunning;
      this.textContent = animationRunning ? 'Animation: ON' : 'Animation: OFF';
      this.style.backgroundColor = animationRunning ? '#4CAF50' : '#f44336';
      
      if (!animationRunning) {
        g_lightPos[0] = 0; // Center X position
        
        let lightXSlider = document.getElementById('lightXSlider');
        if (lightXSlider) {
          lightXSlider.value = g_lightPos[0].toFixed(1);
          document.getElementById('lightXValue').textContent = g_lightPos[0].toFixed(1);
        }
      }
    };
  }
  
  var lightToggleBtn = document.getElementById('lightToggleBtn');
  if (lightToggleBtn) {
    lightToggleBtn.onclick = function() {
      g_lightOn = !g_lightOn;
      this.textContent = g_lightOn ? 'Light: ON' : 'Light: OFF';
      this.style.backgroundColor = g_lightOn ? '#4CAF50' : '#f44336';
    };
  }
  
  var spotlightToggleBtn = document.getElementById('spotlightToggleBtn');
  if (spotlightToggleBtn) {
    spotlightToggleBtn.onclick = function() {
      g_spotlightEnabled = !g_spotlightEnabled;
      this.textContent = g_spotlightEnabled ? 'Spotlight: ON' : 'Spotlight: OFF';
      this.style.backgroundColor = g_spotlightEnabled ? '#4CAF50' : '#f44336';
    };
  }
  
  var normalToggleBtn = document.getElementById('normalToggleBtn');
  if (normalToggleBtn) {
    normalToggleBtn.onclick = function() {
      g_normalVisualization = !g_normalVisualization;
      this.textContent = g_normalVisualization ? 'Normal Visualization: ON' : 'Normal Visualization: OFF';
      this.style.backgroundColor = g_normalVisualization ? '#FF9800' : '#4CAF50';
    };
  }
  
  var cameraAngleSlider = document.getElementById('cameraAngleSlider');
  var cameraAngleValue = document.getElementById('cameraAngleValue');
  if (cameraAngleSlider && cameraAngleValue) {
    cameraAngleSlider.oninput = function() {
      g_globalAngle = this.value;
      cameraAngleValue.textContent = this.value + '°';
    };
  }
  
  var lightXSlider = document.getElementById('lightXSlider');
  var lightXValue = document.getElementById('lightXValue');
  if (lightXSlider && lightXValue) {
    lightXSlider.oninput = function() {
      g_lightPos[0] = parseFloat(this.value);
      lightXValue.textContent = this.value;
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
  
  var spotDirXSlider = document.getElementById('spotDirXSlider');
  var spotDirXValue = document.getElementById('spotDirXValue');
  if (spotDirXSlider && spotDirXValue) {
    spotDirXSlider.oninput = function() {
      var xDir = parseFloat(this.value);
      spotDirXValue.textContent = this.value;
      
      g_spotlightDirection[0] = xDir;
      g_spotlightDirection[1] = -1;
      g_spotlightDirection[2] = 0;
      
      var length = Math.sqrt(
        g_spotlightDirection[0] * g_spotlightDirection[0] + 
        g_spotlightDirection[1] * g_spotlightDirection[1] + 
        g_spotlightDirection[2] * g_spotlightDirection[2]
      );
      
      if (length > 0) {
        g_spotlightDirection[0] /= length;
        g_spotlightDirection[1] /= length;
        g_spotlightDirection[2] /= length;
      }
    };
  }
  
  var spotCutoffSlider = document.getElementById('spotCutoffSlider');
  var spotCutoffValue = document.getElementById('spotCutoffValue');
  if (spotCutoffSlider && spotCutoffValue) {
    spotCutoffSlider.oninput = function() {
      var innerAngle = parseFloat(this.value);
      g_spotlightInnerLimit = Math.cos(innerAngle * Math.PI / 180);
      
      var outerAngle = innerAngle + 10;
      g_spotlightOuterLimit = Math.cos(outerAngle * Math.PI / 180);
      
      spotCutoffValue.textContent = innerAngle + '° (outer: ' + outerAngle + '°)';
    };
  }
  
  var spotExponentSlider = document.getElementById('spotExponentSlider');
  var spotExponentValue = document.getElementById('spotExponentValue');
  if (spotExponentSlider && spotExponentValue) {
    spotExponentSlider.oninput = function() {
      var innerAngle = parseFloat(spotCutoffSlider.value);
      var range = parseFloat(this.value) / 2; // Divide by 2 to get a reasonable range (1-25 degrees)
      
      var outerAngle = innerAngle + range;
      g_spotlightOuterLimit = Math.cos(outerAngle * Math.PI / 180);
      
      spotExponentValue.textContent = this.value + ' (range: ' + range.toFixed(1) + '°)';
      spotCutoffValue.textContent = innerAngle + '° (outer: ' + outerAngle.toFixed(1) + '°)';
    };
  }
  
  var lightColorSlider = document.getElementById('lightColorSlider');
  var colorPreview = document.getElementById('colorPreview');
  if (lightColorSlider && colorPreview) {
    lightColorSlider.oninput = function() {
      let hue = parseFloat(this.value);
      let rgb = hsvToRgb(hue, 1.0, 1.0);
      
      g_lightColor[0] = rgb[0];
      g_lightColor[1] = rgb[1];
      g_lightColor[2] = rgb[2];
      
      colorPreview.style.backgroundColor = `rgb(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)})`;
    };
  }
}

function hsvToRgb(h, s, v) {
  let r, g, b;
  
  let i = Math.floor(h / 60) % 6;
  let f = h / 60 - Math.floor(h / 60);
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);
  
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  
  return [r, g, b];
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
  
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }
  
  // Spotlight uniforms
  u_spotlightEnabled = gl.getUniformLocation(gl.program, 'u_spotlightEnabled');
  if (!u_spotlightEnabled) {
    console.log('Failed to get the storage location of u_spotlightEnabled');
    return;
  }
  
  u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
  if (!u_spotlightDirection) {
    console.log('Failed to get the storage location of u_spotlightDirection');
    return;
  }
  
  u_spotlightInnerLimit = gl.getUniformLocation(gl.program, 'u_spotlightInnerLimit');
  if (!u_spotlightInnerLimit) {
    console.log('Failed to get the storage location of u_spotlightInnerLimit');
    return;
  }
  
  u_spotlightOuterLimit = gl.getUniformLocation(gl.program, 'u_spotlightOuterLimit');
  if (!u_spotlightOuterLimit) {
    console.log('Failed to get the storage location of u_spotlightOuterLimit');
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

  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
    console.log('Failed to get the storage location of u_spotlightPos');
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
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniform1i(u_normalVisualization, g_normalVisualization);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform1i(u_spotlightEnabled, g_spotlightEnabled);
  gl.uniform3f(u_spotlightDirection, g_spotlightDirection[0], g_spotlightDirection[1], g_spotlightDirection[2]);
  gl.uniform1f(u_spotlightInnerLimit, g_spotlightInnerLimit);
  gl.uniform1f(u_spotlightOuterLimit, g_spotlightOuterLimit);
  gl.uniform3f(u_cameraEye, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  function drawCube(matrix, color, textureNum) {
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
    gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
    gl.uniform1i(u_whichTexture, textureNum);
    var cube = new Cube();
    cube.textureNum = textureNum;
    cube.render();
  }

  g_camera.updateProjectionMatrix(canvas.width / canvas.height);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  
  var halfSize = g_roomSize / 2;
  var wallThickness = 0.1;
  
  var floorMatrix = new Matrix4();
  floorMatrix.translate(0, -wallThickness/2, 0);
  floorMatrix.scale(g_roomSize, wallThickness, g_roomSize);
  drawWall(floorMatrix, [0.3, 0.3, 0.3, 1.0]);
  
  var ceilingMatrix = new Matrix4();
  ceilingMatrix.translate(0, g_roomHeight + wallThickness/2, 0);
  ceilingMatrix.scale(g_roomSize, wallThickness, g_roomSize);
  drawWall(ceilingMatrix, g_wallColor);
  
  var leftWallMatrix = new Matrix4();
  leftWallMatrix.translate(-halfSize - wallThickness/2, g_roomHeight/2, 0);
  leftWallMatrix.scale(wallThickness, g_roomHeight, g_roomSize);
  drawWall(leftWallMatrix, g_wallColor);
  
  var rightWallMatrix = new Matrix4();
  rightWallMatrix.translate(halfSize + wallThickness/2, g_roomHeight/2, 0);
  rightWallMatrix.scale(wallThickness, g_roomHeight, g_roomSize);
  drawWall(rightWallMatrix, g_wallColor);
  
  var backWallMatrix = new Matrix4();
  backWallMatrix.translate(0, g_roomHeight/2, -halfSize - wallThickness/2);
  backWallMatrix.scale(g_roomSize, g_roomHeight, wallThickness);
  drawWall(backWallMatrix, g_wallColor);
  
  var frontWallMatrix = new Matrix4();
  frontWallMatrix.translate(0, g_roomHeight/2, halfSize + wallThickness/2);
  frontWallMatrix.scale(g_roomSize, g_roomHeight, wallThickness);
  drawWall(frontWallMatrix, g_wallColor);
  
  var cubeModel = new Matrix4();
  cubeModel.translate(-1.5, 0.5, 0.0);
  cubeModel.scale(1.0, 1.0, 1.0);
  drawCube(cubeModel, [0.5, 0.0, 0.5, 1.0], -2);
  
  if (g_lightOn) {
    var light = new Cube();
    light.color = g_lightColor;
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(0.1, 0.1, 0.1);
    light.render();
    
    if (g_spotlightEnabled) {
      var spotDirection = new Vector3([
        g_spotlightDirection[0],
        g_spotlightDirection[1],
        g_spotlightDirection[2]
      ]);
      spotDirection.normalize();
      
      var spotSource = new Cube();
      spotSource.color = [1.0, 1.0, 0.0, 1.0];
      spotSource.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
      spotSource.matrix.scale(0.15, 0.15, 0.15);
      spotSource.render();
      
      var dirIndicator = new Cube();
      dirIndicator.color = [1.0, 0.5, 0.0, 1.0];
      
      dirIndicator.matrix.translate(
        g_spotlightPos[0] + spotDirection.elements[0] * 2.0,
        g_spotlightPos[1] + spotDirection.elements[1] * 2.0,
        g_spotlightPos[2] + spotDirection.elements[2] * 2.0
      );
      dirIndicator.matrix.scale(0.05, 0.05, 0.05);
      dirIndicator.render();
    }
  }
  
  var sphereModel = new Matrix4();
  sphereModel.translate(1.5, 0.5, 0.0);
  sphereModel.scale(0.5, 0.5, 0.5);
  var sphereObj = new Sphere();
  sphereObj.textureNum = -2;
  sphereObj.matrix = sphereModel;
  sphereObj.color = [1.0, 0.0, 0.0, 1.0];
  sphereObj.renderWithNormals();
}

function updateAnimationAngles() {
  if (!animationRunning) return;
  
  g_time += 1;
  
  if (animationRunning) {
    let t = Math.sin(g_time * g_lightSpeed);
    g_lightPos[0] = g_lightCenter + t * g_lightRange;
    
    if (g_lightPos[0] > g_lightMaxX) g_lightPos[0] = g_lightMaxX;
    if (g_lightPos[0] < g_lightMinX) g_lightPos[0] = g_lightMinX;
    
    g_spotlightPos[0] = 0;
    g_spotlightPos[1] = 4.5;
    g_spotlightPos[2] = 0;
  }
}

function tick() {
  var currentTime = performance.now();
  g_frameCount++;
  
  if (currentTime - g_lastTime >= 1000) {
    g_fps = Math.round((g_frameCount * 1000) / (currentTime - g_lastTime));
    g_fpsElement.textContent = 'FPS: ' + g_fps;
    g_frameCount = 0;
    g_lastTime = currentTime;
  }
  
  updateAnimationAngles();
  render();
  requestAnimationFrame(tick);
} 
