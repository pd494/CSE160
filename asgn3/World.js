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

var g_gems = [];
var g_gemsCollected = 0;
var g_totalGems = 5;
var g_gameStarted = false;
var g_gameComplete = false;
var g_gameStartTime = 0;
var g_gameTimer = 0;

var u_Sampler0;
var u_Sampler1;
var u_Sampler2;
var u_Sampler3;
var u_Sampler4;
var u_whichTexture;

var g_isDragging = false;
var g_lastX = -1;
var g_lastY = -1;
var currentColor = [1.0, 0.0, 0.0, 1.0];
var currentSize = 10;  
var currentSegments = 10;  

var g_frontRightLegAngle = 0;  
var g_frontLeftLegAngle = 0;   
var g_backRightLegAngle = 0;   
var g_backLeftLegAngle = 0;    

var g_frontRightCalfAngle = 0;  
var g_frontLeftCalfAngle = 0;   
var g_backRightCalfAngle = 0;   
var g_backLeftCalfAngle = 0;    

var g_frontRightFootAngle = 0;    
var g_frontLeftFootAngle = 0;   
var g_backRightFootAngle = 0;   
var g_backLeftFootAngle = 0;    

var currentDrawingMode = 'point';  

var animationRunning = true; 
var animationId = null;

var g_time = 0;

var g_isPokeAnimating = false;     
var g_pokeAnimTime = 0;       
var g_pokeAnimDuration = 60;  

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

var g_headAnimAngle = 0;
var g_neckAnimAngle = 0;
var g_tailAnimAngle = 0;
var g_bodyAnimOffset = 0;

var g_useOptimizedRendering = false;

var g_lastTime = 0;
var g_frameCount = 0;
var g_frameTime = 0;
var g_fps = 0;
var g_fpsElement;

var g_map = [];
var g_walls = [];

var g_currentBlockColor = [1.0, 1.0, 1.0, 1.0];

var g_isDraggingCamera = false;  
var g_mouseLastX = -1;
var g_mouseLastY = -1;
var g_cameraMode = false;  

var g_showBirds = false;          
var g_showTrees = true;          
var g_birds = [];                 
var g_trees = [];                 
var g_giraffeWalking = false;     
var g_giraffePosition = [0, 0, 0]; 
var g_giraffeDirection = 0;        
var g_giraffeWalkSpeed = 0.02;     
var g_giraffePath = [];            
var g_giraffePathIndex = 0;        
var g_numBirds = 10;               
var g_numTrees = 8;                
var g_showRain = false;            
var g_raindrops = [];              
var g_numRaindrops = 200;          
var g_wowFactorEnabled = false;    
var g_wallsVisible = true; 
function worldToMapCoord(x, z) {
  var mapX = Math.round(x / 0.22 + 16);
  var mapZ = Math.round(z / 0.22 + 16);
  
  return { x: mapX, z: mapZ };
}

function getBlockInFrontOfCamera() {
  var direction = new Vector3();
  direction.set(g_camera.at);
  direction.sub(g_camera.eye);
  direction.normalize();
  
  for (var distance = 1.0; distance <= 5.0; distance += 0.2) {
    var targetX = g_camera.eye.elements[0] + direction.elements[0] * distance;
    var targetY = g_camera.eye.elements[1] + direction.elements[1] * distance;
    var targetZ = g_camera.eye.elements[2] + direction.elements[2] * distance;
    
    for (var offsetX = -0.5; offsetX <= 0.5; offsetX += 0.5) {
      for (var offsetZ = -0.5; offsetZ <= 0.5; offsetZ += 0.5) {
        var checkX = targetX + offsetX;
        var checkZ = targetZ + offsetZ;
        
        var mapCoord = worldToMapCoord(checkX, checkZ);
        
        if (mapCoord.x >= 0 && mapCoord.x < g_map.length && 
            mapCoord.z >= 0 && mapCoord.z < g_map[mapCoord.x].length) {
          
          extendMapIfNeeded(mapCoord.x, mapCoord.z);
          
          if (g_map[mapCoord.x][mapCoord.z].height > 0) {
            var blockTop = g_map[mapCoord.x][mapCoord.z].height - 0.75;
            if (Math.abs(targetY - blockTop) < 1.5) {
              return mapCoord;
            }
          }
        }
      }
    }
  }
  
  return null;
}

function addBlock() {
  // Make sure we exit game mode if trying to add blocks
  if (g_gameStarted) {
    resetGame();
  }
  
  g_wallsVisible = true;
  
  var blockCoord = getBlockInFrontOfCamera();
  
  if (!blockCoord) {
    var direction = new Vector3();
    direction.set(g_camera.at);
    direction.sub(g_camera.eye);
    direction.normalize();
    
    var distance = 3.0;
    var targetX = g_camera.eye.elements[0] + direction.elements[0] * distance;
    var targetZ = g_camera.eye.elements[2] + direction.elements[2] * distance;
    
    blockCoord = worldToMapCoord(targetX, targetZ);
  }
  
  if (blockCoord.x >= -100 && blockCoord.x < 100 && blockCoord.z >= -100 && blockCoord.z < 100) {
    extendMapIfNeeded(blockCoord.x, blockCoord.z);
    
    var currentHeight = g_map[blockCoord.x][blockCoord.z].height;
    
    if (currentHeight < 10) {
      g_map[blockCoord.x][blockCoord.z].height = currentHeight + 1;
      buildWallsFromMap();
      showStatusMessage(`Added block at (${blockCoord.x}, ${blockCoord.z})`);
    } else {
      showStatusMessage(`Maximum height reached at (${blockCoord.x}, ${blockCoord.z})`, true);
    }
  } else {
    showStatusMessage(`Cannot build beyond the world limits`, true);
  }
}

//  delete a block in front of the camera
function deleteBlock() {
  if (g_gameStarted) {
    resetGame();
  }
  
  g_wallsVisible = true;
  
  var blockCoord = getBlockInFrontOfCamera();
  
  if (!blockCoord) {
    showStatusMessage('No block in range to delete', true);
    return;
  }
  
  extendMapIfNeeded(blockCoord.x, blockCoord.z);
  var currentHeight = g_map[blockCoord.x][blockCoord.z].height;
  
  if (currentHeight > 0) {
    g_map[blockCoord.x][blockCoord.z].height = currentHeight - 1;
    buildWallsFromMap();
    showStatusMessage(`Block deleted at (${blockCoord.x}, ${blockCoord.z})`);
  } else {
    showStatusMessage('No block to delete here', true);
  }
}

function extendMapIfNeeded(x, z) {
  if (!g_map[x]) {
    g_map[x] = [];
  }
  
  if (!g_map[x][z]) {
    g_map[x][z] = { height: 0 };
  }
}

function showStatusMessage(message, isError = false) {
  let statusElement = document.getElementById('status-message');
  
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'status-message';
    statusElement.style.position = 'fixed';
    statusElement.style.top = '10px';
    statusElement.style.left = '50%';
    statusElement.style.transform = 'translateX(-50%)';
    statusElement.style.padding = '10px 20px';
    statusElement.style.borderRadius = '5px';
    statusElement.style.zIndex = '1000';
    statusElement.style.fontWeight = 'bold';
    statusElement.style.transition = 'opacity 0.5s ease-in-out';
    document.body.appendChild(statusElement);
  }
  
  if (isError) {
    statusElement.style.backgroundColor = '#f44336';
    statusElement.style.color = 'white';
  } else {
    statusElement.style.backgroundColor = '#4CAF50';
    statusElement.style.color = 'white';
  }
  
  statusElement.textContent = message;
  statusElement.style.opacity = '1';
  
  setTimeout(() => {
    statusElement.style.opacity = '0';
  }, 3000);
}

function initializeMap() {
  for (var i = 0; i < 32; i++) {
    g_map[i] = [];
    for (var j = 0; j < 32; j++) {
      g_map[i][j] = { height: 0 };
      
      if (i === 0 || i === 31 || j === 0 || j === 31) {
        // Front and back walls (Z = 0 or 31) are always height 1
        if (j === 0 || j === 31) {
          g_map[i][j] = { height: 1 };
        }
        else if (i === 0 || i === 31) {
          g_map[i][j] = { height: 1 };
          if (Math.random() < 0.4) {  // 40% chance for taller walls
            var extraHeight = Math.floor(Math.random() * 3) + 1;  
            g_map[i][j].height += extraHeight;
          }
        }
      }
    }
  }
  
  const tallSections = [
    {x: 0, z: 10, height: 4},
    {x: 0, z: 20, height: 3},
    {x: 31, z: 15, height: 4},
    {x: 31, z: 25, height: 3}
  ];
  
  tallSections.forEach(section => {
    if (g_map[section.x] && g_map[section.x][section.z]) {
      g_map[section.x][section.z].height = section.height;
    }
  });
  
  buildWallsFromMap();
}

function buildWallsFromMap() {
  g_walls = [];
  
  for (var x in g_map) {
    x = parseInt(x);
    for (var z in g_map[x]) {
      z = parseInt(z);
      
      if (g_map[x][z] && g_map[x][z].height > 0) {
        for (var y = 0; y < g_map[x][z].height; y++) {
          var wall = new Cube();
          
          // Create dirt/earth colored blocks
          if (y === 0) {
            wall.color = [0.45, 0.29, 0.07, 1.0];
          } else if (y === g_map[x][z].height - 1) {
            wall.color = [0.55, 0.35, 0.11, 1.0];
          } else {
            var variation = (Math.random() * 0.1) - 0.05;
            wall.color = [0.5 + variation, 0.32 + variation, 0.09 + variation, 1.0];
          }
          
          wall.textureNum = -2;
          
          wall.matrix.translate((x - 16) * 0.22, y - 0.75, (z - 16) * 0.22);
          wall.matrix.scale(0.7, 0.9, 0.7);
          
          g_walls.push(wall);
        }
      }
    }
  }
}

function drawMap() {
  if (g_wallsVisible) {
    for (var i = 0; i < g_walls.length; i++) {
      var wall = g_walls[i];
      if (g_useOptimizedRendering) {
        wall.renderFast();
      } else {
        wall.render();
      }
    }
  }
  
  if (!g_gameStarted) {
    drawTargetedBlockHighlight();
  }
}

function drawTargetedBlockHighlight() {
  var targetCoord = getBlockInFrontOfCamera();
  
  if (targetCoord) {
    extendMapIfNeeded(targetCoord.x, targetCoord.z);
    
    var height = g_map[targetCoord.x][targetCoord.z].height;
    
    var highlightCube = new Cube();
    highlightCube.textureNum = -2;
    highlightCube.color = [1.0, 0.5, 0.0, 1.0];
    
    highlightCube.matrix.translate(
      (targetCoord.x - 16) * 0.22, 
      height - 0.75, 
      (targetCoord.z - 16) * 0.22
    );
    
    highlightCube.matrix.scale(0.8, 1.0, 0.8);
    
    if (g_useOptimizedRendering) {
      highlightCube.renderFastWireframe();
    } else {
      highlightCube.renderWireframe();
    }
    
    updateBlockInfoDisplay(targetCoord);
  }
}

function updateBlockInfoDisplay(targetCoord) {
  const blockInfo = document.getElementById('block-info');
  if (!blockInfo) return;
  
  extendMapIfNeeded(targetCoord.x, targetCoord.z);
  
  const currentHeight = g_map[targetCoord.x][targetCoord.z].height;
  
  blockInfo.innerHTML = `
    <strong style="font-size: 16px;">Target Block:</strong>
    <ul style="margin: 5px 0; padding-left: 20px;">
      <li>X: ${targetCoord.x}, Z: ${targetCoord.z}</li>
      <li>Height: ${currentHeight} block(s)</li>
      <li>Action: ${currentHeight > 0 ? "Space to add, Backspace to delete" : "Space to add"}</li>
    </ul>
  `;
}

function main() {
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
  
  g_camera.eye = new Vector3([0, 1.5, 6.5]);   
  g_camera.at = new Vector3([0, 0, 0]);        
  g_camera.up = new Vector3([0, 1, 0]);        
  
  g_camera.updateViewMatrix();
  g_camera.updateProjectionMatrix();

  g_fpsElement = document.getElementById('fps-counter');
  updateFPSDisplay();

  initializeMap();
  initializeNatureScene();
  initTextures(gl);
  
  g_lastTime = performance.now();
  requestAnimationFrame(tick);
  
  canvas.onmousedown = function(ev) {
    mouseDown(ev);
    
    document.onmousemove = mouseMove;
    document.onmouseup = function(ev) {
      mouseUp(ev);
      document.onmousemove = null;
      document.onmouseup = null;
    };
    
    // Prevent default behaviors
    ev.preventDefault();
  };

  document.onkeydown = keydown;
  
  document.getElementById('animToggleBtn').addEventListener('click', function() {
    animationRunning = !animationRunning;
    this.textContent = animationRunning ? 'Animation: ON' : 'Animation: OFF';
    this.style.backgroundColor = animationRunning ? '#4CAF50' : '#555555';
  });
  
  const gameBtn = document.createElement('button');
  gameBtn.id = 'gameBtn';
  gameBtn.textContent = 'Start Gem Hunt Game (G)';
  gameBtn.style.padding = '8px 16px';
  gameBtn.style.backgroundColor = '#2196F3';
  gameBtn.style.color = 'white';
  gameBtn.style.border = 'none';
  gameBtn.style.borderRadius = '4px';
  gameBtn.style.cursor = 'pointer';
  gameBtn.style.margin = '0 10px';
  gameBtn.addEventListener('click', initializeGame);
  
  const wowFactorBtn = document.createElement('button');
  wowFactorBtn.id = 'wowFactorBtn';
  wowFactorBtn.textContent = 'Enable Wow Factor!';
  wowFactorBtn.style.padding = '8px 16px';
  wowFactorBtn.style.backgroundColor = '#FF5722';
  wowFactorBtn.style.color = 'white';
  wowFactorBtn.style.border = 'none';
  wowFactorBtn.style.borderRadius = '4px';
  wowFactorBtn.style.cursor = 'pointer';
  wowFactorBtn.style.margin = '0 10px';
  wowFactorBtn.style.fontWeight = 'bold';
  wowFactorBtn.style.fontSize = '16px';
  wowFactorBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  wowFactorBtn.addEventListener('click', function() {
    toggleWowFactor();
    this.textContent = g_wowFactorEnabled ? 'Disable Wow Factor' : 'Enable Wow Factor!';
    this.style.backgroundColor = g_wowFactorEnabled ? '#4CAF50' : '#FF5722';
    
    if (g_wowFactorEnabled) {
      showStatusMessage('WOW! Birds, trees, walking giraffe and rain enabled!', false);
    } else {
      showStatusMessage('Wow Factor disabled.', false);
    }
  });
  
  const buttonContainer = document.querySelector('div[style*="display: flex; justify-content: center"]');
  buttonContainer.appendChild(gameBtn);
  buttonContainer.appendChild(wowFactorBtn);
  
  const infoPanel = document.createElement('div');
  infoPanel.style.marginTop = '10px';
  infoPanel.style.backgroundColor = '#f5f5f5';
  infoPanel.style.padding = '12px';
  infoPanel.style.borderRadius = '5px';
  infoPanel.style.textAlign = 'left';
  infoPanel.style.maxWidth = '600px';
  infoPanel.style.margin = '10px auto';
  infoPanel.innerHTML = `
    <div id="block-info" style="margin-bottom: 15px; padding: 8px; background-color: #e6f7ff; border-radius: 4px;">
      <strong style="font-size: 16px;">Target Block:</strong> None selected
    </div>
    <div style="margin-bottom: 15px; border-left: 4px solid #4CAF50; padding-left: 10px;">
      <p style="margin: 5px 0; font-size: 18px;"><strong>Block Controls:</strong></p>
      <ul style="margin-top: 5px; padding-left: 20px; font-size: 16px;">
        <li><strong style="font-size: 18px; color: #4CAF50;">SPACE</strong> - Add a block</li>
        <li><strong style="font-size: 18px; color: #f44336;">BACKSPACE</strong> - Delete a block</li>
      </ul>
    </div>
    <div style="margin-bottom: 15px;">
      <p style="margin: 5px 0;"><strong>Movement Controls:</strong></p>
      <ul style="margin-top: 5px; padding-left: 20px;">
        <li><strong>WASD</strong> - Move camera horizontally</li>
        <li><strong>R/T</strong> - Move camera up/down</li>
        <li><strong>Mouse</strong> - Look around (360° rotation)</li>
        <li><strong>Q/E</strong> - Rotate model</li>
      </ul>
    </div>
    <div style="margin-bottom: 15px;">
      <p style="margin: 5px 0;"><strong>Game Controls:</strong></p>
      <ul style="margin-top: 5px; padding-left: 20px;">
        <li><strong>G</strong> - Start gem hunt game</li>
        <li><strong>SPACE</strong> - Collect gem (when near)</li>
      </ul>
    </div>
    <div>
      <p style="margin: 5px 0;"><strong>Textures:</strong></p>
      <ul style="margin-top: 5px; padding-left: 20px;">
      <li>Sky (blue): Sky texture</li>
      <li>Ground (gray): Ground texture</li>
        <li>Blocks: White cubes with orange highlight for selected</li>
    </ul>
    </div>
  `;
  document.querySelector('canvas').parentNode.appendChild(infoPanel);

  document.getElementById('cameraAngleSlider').addEventListener('input', function() { 
    g_globalAngle = parseFloat(this.value); 
    document.getElementById('cameraAngleValue').textContent = this.value + '°';
  });
  
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
  if (ev.keyCode == 82) { // R key - move up
    g_camera.moveUp();
  }
  if (ev.keyCode == 84) { // T key - move down
    g_camera.moveDown();
  }
  if (ev.keyCode == 81) { // Q key - rotate model left
    g_globalAngle -= 5;
  }
  if (ev.keyCode == 69) { // E key - rotate model right
    g_globalAngle += 5;
  }
  if (ev.keyCode == 32) { // Space key - add block or collect gem
    ev.preventDefault(); 
    if (g_gameStarted) {
      collectGem(); 
    } else {
      addBlock(); 
    }
  }
  if (ev.keyCode == 8) { // Backspace key - delete block
    ev.preventDefault(); 
    deleteBlock();
  }
  if (ev.keyCode == 71) { // G key - start/restart game
    ev.preventDefault();
    if (g_gameStarted) {
      resetGame(); 
    } else {
      initializeGame(); 
    }
  }
  if (ev.keyCode == 27) { //  reset game
    ev.preventDefault();
    resetGame();
  }
  if (ev.keyCode == 86) {  
    ev.preventDefault();
    g_wallsVisible = !g_wallsVisible;
    showStatusMessage(g_wallsVisible ? "Walls visible" : "Walls hidden");
  }
  renderScene();
}
function initTextures(gl) {
  var skyImage = new Image();
  var skyTexture = gl.createTexture(); 
  if (!skyImage || !skyTexture) {
    console.log('Failed to create sky image or texture object');
    return false;
  }

  var groundImage = new Image();
  var groundTexture = gl.createTexture();
  if (!groundImage || !groundTexture) {
    console.log('Failed to create ground image or texture object');
    return false;
  }

  skyImage.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, skyTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, skyImage);
    gl.uniform1i(u_Sampler0, 0);
    console.log("Sky texture loaded (texture0 from sky.jpg)");
  };

  groundImage.onload = function() {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, groundImage);
    gl.uniform1i(u_Sampler1, 1);
    console.log("Ground texture loaded (texture1 from ground.jpg)");
  };

  skyImage.onerror = function() { 
    console.error("Failed to load sky.jpg"); 
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, skyTexture);
    var fallbackData = new Uint8Array([100, 150, 255, 255]); // Blue
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, fallbackData);
  };
  groundImage.onerror = function() { 
    console.error("Failed to load ground.jpg"); 
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    var fallbackData = new Uint8Array([150, 100, 50, 255]); // Brown
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, fallbackData);
  };

  skyImage.src = 'sky.jpg';
  groundImage.src = 'ground.jpg';

  return true;
}



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
  
  g_isDraggingCamera = true;
  g_lastX = ev.clientX;
  g_lastY = ev.clientY;
}

function mouseUp(ev) {
  g_isDraggingCamera = false;
}

function mouseMove(ev) {
  if (!g_isDraggingCamera) return;
  
  const dx = ev.clientX - g_lastX;
  const dy = ev.clientY - g_lastY;
  
  if (dx !== 0) {
  g_camera.pan(-dx * 0.2);  
  }
  
  if (dy !== 0) {
  g_camera.tilt(-dy * 0.2);
  }
  
  g_lastX = ev.clientX;
  g_lastY = ev.clientY;
  
  renderScene(); 
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
  
  if (textureNum !== undefined) {
    cube.textureNum = textureNum;
  } 
  else if (matrix.textureNum !== undefined) {
    cube.textureNum = matrix.textureNum;
  }
  
  if (g_useOptimizedRendering) {
    if (cube.textureNum >= 0) {
      cube.renderFastUV();
    } else {
      cube.renderFast();
    }
  } else {
    cube.render();
  }
}

var g_camera;

// Function to render the entire scene
function renderScene() {
  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.activeTexture(gl.TEXTURE1);
  
  // Set texture uniforms
  gl.uniform1i(u_Sampler0, 0);
  gl.uniform1i(u_Sampler1, 1);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalXAngle, 1, 0, 0); 
  globalRotMat.rotate(g_globalAngle * 4, 0, 1, 0); 
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  
  var modelMatrix = new Matrix4();  
  
  g_camera.updateProjectionMatrix(canvas.width / canvas.height);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMatrix.elements);

  var sky = new Cube();
  sky.color = [1.0, 1.0, 1.0, 1.0];
  sky.textureNum = 0;  
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  if (g_useOptimizedRendering) {
    sky.renderFastUV();
  } else {
    sky.render();
  }

  var floor = new Cube();
  floor.color = [1.0, 1.0, 1.0, 1.0];   
  floor.textureNum = 1;   
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(25, 0, 25); 
  floor.matrix.translate(-0.5, 0, -0.5);
  if (g_useOptimizedRendering) {
    floor.renderFastUV();
  } else {
    floor.render();
  }

  drawMap();
  
  drawNatureScene();
  
  if (g_gameStarted) {
    drawGems();
    updateGameUI();
  }
  
  if (g_wowFactorEnabled && g_giraffeWalking) {
    drawWalkingGiraffe();
  }
  else if (!g_gameStarted || g_gameComplete) {
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
    
    g_leftLegAnimAngle = Math.sin((g_time * speed) + Math.PI) * 15; 
    g_leftCalfAnimAngle = Math.sin((g_time * speed) + Math.PI + 0.5) * 10;
    g_leftFootAnimAngle = Math.sin((g_time * speed) + Math.PI + 1.0) * 5;
    
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
  
  if (g_gameStarted) {
    updateGems();
  }
  
  updateNatureScene();
  
  // Calculate FPS
  const now = performance.now();
  const delta = now - g_lastTime;
  g_lastTime = now;
  
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

function initializeGame() {
  g_gems = [];
  g_gemsCollected = 0;
  g_gameComplete = false;
  g_gameStarted = true;
  g_gameStartTime = performance.now();
  g_gameTimer = 0;
  
  // Hide walls during gem hunt
  g_wallsVisible = false;
  
  // Create gems at random positions around the map
  for (let i = 0; i < g_totalGems; i++) {
    let x = Math.floor(Math.random() * 60) - 30; 
    let z = Math.floor(Math.random() * 60) - 30; 
    
    // Make sure we don't place gems inside walls
    if (x >= -1 && x <= 1 && z >= -1 && z <= 1) {
      x += 5; // Move away from center
    }
    
    let colors = [
      [1.0, 0.2, 0.2, 1.0], // Red
      [0.2, 1.0, 0.2, 1.0], // Green
      [0.2, 0.2, 1.0, 1.0], // Blue
      [1.0, 1.0, 0.2, 1.0], // Yellow
      [1.0, 0.2, 1.0, 1.0]  // Magenta
    ];
    
    g_gems.push({
      x: x,
      z: z,
      y: 0.5, 
      color: colors[i % colors.length],
      collected: false,
      rotationSpeed: 0.5 + Math.random() * 1.5, 
      rotationAngle: 0,
      bounceOffset: 0,
      bounceSpeed: 0.02 + Math.random() * 0.03 
    });
  }
  
  showGameMessage("Find all 5 gems! Use WASD to move, Space to collect.", false);
}

function updateGems() {
  if (!g_gameStarted) return;
  
  if (!g_gameComplete) {
    g_gameTimer = (performance.now() - g_gameStartTime) / 1000;
  }
  
  for (let i = 0; i < g_gems.length; i++) {
    if (!g_gems[i].collected) {
      g_gems[i].rotationAngle += g_gems[i].rotationSpeed;
      
      g_gems[i].bounceOffset = Math.sin(g_time * g_gems[i].bounceSpeed) * 0.1;
      
      let playerX = g_camera.eye.elements[0];
      let playerZ = g_camera.eye.elements[2];
      
      let dx = playerX - ((g_gems[i].x - 16) * 0.22);
      let dz = playerZ - ((g_gems[i].z - 16) * 0.22);
      let distance = Math.sqrt(dx * dx + dz * dz);
      
      g_gems[i].isNear = distance < 0.8;
    }
  }
}

function drawGems() {
  if (!g_gameStarted) return;
  
  for (let i = 0; i < g_gems.length; i++) {
    if (!g_gems[i].collected) {
      let gem = g_gems[i];
      
      let gemMatrix = new Matrix4();
      
      gemMatrix.translate(
        (gem.x - 16) * 0.22, 
        gem.y + gem.bounceOffset, 
        (gem.z - 16) * 0.22
      );
      
      gemMatrix.rotate(gem.rotationAngle, 0, 1, 0);
      
      gemMatrix.scale(0.15, 0.25, 0.15);
      
      let gemCube = new Cube();
      gemCube.textureNum = -2; 
      
      let gemColor = gem.color.slice();
      if (gem.isNear) {
        let pulse = Math.sin(g_time * 0.2) * 0.5 + 0.5;
        gemColor = [
          gemColor[0], 
          gemColor[1], 
          gemColor[2], 
          gemColor[3] * (0.5 + pulse * 0.5) 
        ];
        
        showGameMessage("Press SPACE to collect the gem!", false);
      }
      
      gemCube.color = gemColor;
      gemCube.matrix = gemMatrix;
      
      if (g_useOptimizedRendering) {
        gemCube.renderFast();
      } else {
        gemCube.render();
      }
    }
  }
}

function collectGem() {
  if (!g_gameStarted || g_gameComplete) return;
  
  for (let i = 0; i < g_gems.length; i++) {
    if (!g_gems[i].collected && g_gems[i].isNear) {
      g_gems[i].collected = true;
      g_gemsCollected++;
      
      showGameMessage(`Gem collected! ${g_gemsCollected}/${g_totalGems}`, false);
      
      if (g_gemsCollected >= g_totalGems) {
        g_gameComplete = true;
        g_wallsVisible = true; 
        let timeString = g_gameTimer.toFixed(1);
        showGameMessage(`Congratulations! All gems collected in ${timeString} seconds!`, true);
      }
      
      return;
    }
  }
}

function showGameMessage(message, isComplete) {
  let messageElement = document.getElementById('game-message');
  
  if (!messageElement) {
    messageElement = document.createElement('div');
    messageElement.id = 'game-message';
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.padding = '15px 25px';
    messageElement.style.borderRadius = '8px';
    messageElement.style.zIndex = '1000';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.fontSize = '18px';
    messageElement.style.textAlign = 'center';
    messageElement.style.transition = 'opacity 0.5s ease-in-out';
    document.body.appendChild(messageElement);
  }
  
  if (isComplete) {
    messageElement.style.backgroundColor = '#4CAF50'; 
    messageElement.style.color = 'white';
    messageElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  } else {
    messageElement.style.backgroundColor = 'rgba(0,0,0,0.7)'; 
    messageElement.style.color = 'white';
  }
  
  messageElement.textContent = message;
  messageElement.style.opacity = '1';
  
  if (!isComplete) {
    setTimeout(() => {
      messageElement.style.opacity = '0';
    }, 4000);
  }
}


function updateGameUI() {
  if (!g_gameStarted) return;
  
  let gameUI = document.getElementById('game-ui');
  
  if (!gameUI) {
    gameUI = document.createElement('div');
    gameUI.id = 'game-ui';
    gameUI.style.position = 'fixed';
    gameUI.style.top = '20px';
    gameUI.style.left = '20px';
    gameUI.style.padding = '10px';
    gameUI.style.backgroundColor = 'rgba(0,0,0,0.6)';
    gameUI.style.color = 'white';
    gameUI.style.borderRadius = '5px';
    gameUI.style.fontWeight = 'bold';
    gameUI.style.zIndex = '1000';
    document.body.appendChild(gameUI);
  }
  
  gameUI.innerHTML = `
    <div>Gems: ${g_gemsCollected}/${g_totalGems}</div>
    <div>Time: ${g_gameTimer.toFixed(1)}s</div>
  `;
}

class Bird {
  constructor(x, y, z) {
    this.position = [x, y, z];
    this.wingAngle = Math.random() * Math.PI * 2;
    this.wingSpeed = 0.05 + Math.random() * 0.1;
    this.flySpeed = 0.01 + Math.random() * 0.02;
    this.direction = Math.random() * Math.PI * 2;
    this.circleRadius = 1 + Math.random() * 3;
    this.circleHeight = Math.random() * 0.5;
    this.baseY = y;
    this.color = [
      0.4 + Math.random() * 0.2,
      0.2 + Math.random() * 0.2,
      0.1 + Math.random() * 0.2,
      1.0
    ];
    this.scale = 0.15 + Math.random() * 0.1;
  }

  update() {
    this.direction += this.flySpeed;
    this.position[0] = Math.cos(this.direction) * this.circleRadius;
    this.position[2] = Math.sin(this.direction) * this.circleRadius;
    this.position[1] = this.baseY + Math.sin(this.direction * 3) * this.circleHeight;
    
    this.wingAngle += this.wingSpeed;
    if (this.wingAngle > Math.PI * 2) this.wingAngle -= Math.PI * 2;
  }

  render() {
    var birdMatrix = new Matrix4();
    
    birdMatrix.translate(this.position[0], this.position[1], this.position[2]);
    
    birdMatrix.rotate(-this.direction + Math.PI/2, 0, 1, 0);
    
    var bodyMatrix = new Matrix4(birdMatrix);
    bodyMatrix.scale(this.scale * 0.5, this.scale * 0.5, this.scale);
    drawCube(bodyMatrix, this.color, -2);
    
    var headMatrix = new Matrix4(birdMatrix);
    headMatrix.translate(0, this.scale * 0.3, this.scale * 0.6);
    headMatrix.scale(this.scale * 0.4, this.scale * 0.4, this.scale * 0.4);
    drawCube(headMatrix, this.color, -2);
    
    var beakMatrix = new Matrix4(birdMatrix);
    beakMatrix.translate(0, this.scale * 0.2, this.scale * 0.9);
    beakMatrix.scale(this.scale * 0.1, this.scale * 0.1, this.scale * 0.2);
    drawCube(beakMatrix, [1.0, 0.7, 0.0, 1.0], -2);
    
    var wingYOffset = Math.sin(this.wingAngle) * 0.2;
    
    var leftWingMatrix = new Matrix4(birdMatrix);
    leftWingMatrix.translate(this.scale * 0.5, this.scale * 0.1 + wingYOffset, 0);
    leftWingMatrix.rotate(Math.sin(this.wingAngle) * 30, 0, 0, 1);
    leftWingMatrix.scale(this.scale * 0.8, this.scale * 0.1, this.scale * 0.5);
    drawCube(leftWingMatrix, this.color, -2);
    
    var rightWingMatrix = new Matrix4(birdMatrix);
    rightWingMatrix.translate(-this.scale * 0.5, this.scale * 0.1 + wingYOffset, 0);
    rightWingMatrix.rotate(-Math.sin(this.wingAngle) * 30, 0, 0, 1);
    rightWingMatrix.scale(this.scale * 0.8, this.scale * 0.1, this.scale * 0.5);
    drawCube(rightWingMatrix, this.color, -2);
    
    var tailMatrix = new Matrix4(birdMatrix);
    tailMatrix.translate(0, this.scale * 0.1, -this.scale * 0.6);
    tailMatrix.scale(this.scale * 0.3, this.scale * 0.1, this.scale * 0.5);
    drawCube(tailMatrix, this.color, -2);
  }
}

  // Class for trees in the world
class Tree {
  constructor(x, z) {
    this.position = [x, 0, z]; 
    this.height = 0.8 + Math.random() * 1.0;
    this.trunkColor = [0.45, 0.25, 0.05, 1.0];
    this.leafColor = [
      0.1 + Math.random() * 0.2,
      0.4 + Math.random() * 0.3,
      0.1 + Math.random() * 0.1,
      1.0
    ];
    this.trunkWidth = 0.15 + Math.random() * 0.1;
    this.leafSize = 0.4 + Math.random() * 0.3;
    this.leafLayers = 2 + Math.floor(Math.random() * 2);
    this.swayAngle = 0;
    this.swaySpeed = 0.02 + Math.random() * 0.01;
  }

  update() {
    this.swayAngle += this.swaySpeed;
    if (this.swayAngle > Math.PI * 2) this.swayAngle -= Math.PI * 2;
  }

  render() {
    var treeMatrix = new Matrix4();
    
    treeMatrix.translate(this.position[0], -0.75, this.position[2]);
    
    var trunkMatrix = new Matrix4(treeMatrix);
    trunkMatrix.translate(0, this.height/2, 0);
    trunkMatrix.scale(this.trunkWidth, this.height, this.trunkWidth);
    drawCube(trunkMatrix, this.trunkColor, -2);
    
    for (var i = 0; i < this.leafLayers; i++) {
      var leafMatrix = new Matrix4(treeMatrix);
      var layerHeight = this.height + (i * 0.2);
      var sway = Math.sin(this.swayAngle) * 0.05 * (i + 1);
      
      leafMatrix.translate(sway, layerHeight, 0);
      
      leafMatrix.rotate(sway * 5, 0, 0, 1);
      
      var leafScale = this.leafSize * (1 - i * 0.2);
      leafMatrix.scale(leafScale, leafScale * 0.8, leafScale);
      
      drawCube(leafMatrix, this.leafColor, -2);
    }
  }
}

class Raindrop {
  constructor() {
    this.reset();
    this.position[1] = 3 + Math.random() * 4;
  }
  
  reset() {
    this.position = [
      Math.random() * 20 - 10,    
      7,                          
      Math.random() * 20 - 10     
    ];
    this.speed = 0.08 + Math.random() * 0.05;
    this.length = 0.2 + Math.random() * 0.1;
    this.alpha = 0.5 + Math.random() * 0.5;
  }
  
  update() {
    this.position[1] -= this.speed;
    
    if (this.position[1] < -0.7) {
      this.reset();
    }
  }
  
  render() {
    var dropMatrix = new Matrix4();
    dropMatrix.translate(this.position[0], this.position[1], this.position[2]);
    dropMatrix.rotate(75, 1, 0, 0); // Slight angle for rain
    
    dropMatrix.scale(0.01, this.length, 0.01);
    
    var raindropColor = [0.7, 0.8, 1.0, this.alpha];
    drawCube(dropMatrix, raindropColor, -2);
  }
}

function initializeNatureScene() {
  g_trees = [];
  
  initializeMap();
  
  for (var i = 0; i < g_numTrees; i++) {
    var mapX = Math.floor(Math.random() * 24) + 4;
    var mapZ = Math.floor(Math.random() * 24) + 4;
    
    var treeX = (mapX - 16) * 0.22;
    var treeZ = (mapZ - 16) * 0.22;
    
    if (Math.abs(treeX) < 1 && Math.abs(treeZ) < 1) {
      if (treeX < 0) treeX -= 1.5;
      else treeX += 1.5;
    }
    
    var tree = new Tree(treeX, treeZ);
    g_trees.push(tree);
  }
  
  g_birds = [];
  for (var i = 0; i < g_numBirds; i++) {
    var birdX = Math.random() * 10 - 5;
    var birdY = 0.5 + Math.random() * 2.5;
    var birdZ = Math.random() * 10 - 5;
    g_birds.push(new Bird(birdX, birdY, birdZ));
  }
  
  g_raindrops = [];
  for (var i = 0; i < g_numRaindrops; i++) {
    g_raindrops.push(new Raindrop());
  }
  
  g_giraffePath = [];
  var numPathPoints = 10;
  for (var i = 0; i < numPathPoints; i++) {
    var angle = (i / numPathPoints) * Math.PI * 2;
    var radius = 3 + Math.random();
    g_giraffePath.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius
    });
  }
}

function updateNatureScene() {
  if (!g_wowFactorEnabled) return;
  
  if (g_showBirds) {
    for (var i = 0; i < g_birds.length; i++) {
      g_birds[i].update();
    }
  }
  
  if (g_showTrees) {
    for (var i = 0; i < g_trees.length; i++) {
      g_trees[i].update();
    }
  }
  
  if (g_showRain) {
    for (var i = 0; i < g_raindrops.length; i++) {
      g_raindrops[i].update();
    }
  }
  
  if (g_giraffeWalking && g_giraffePath.length > 0) {
    var target = g_giraffePath[g_giraffePathIndex];
    
    var dx = target.x - g_giraffePosition[0];
    var dz = target.z - g_giraffePosition[2];
    var distance = Math.sqrt(dx*dx + dz*dz);
    
    g_giraffeDirection = Math.atan2(dz, dx);
    
    if (distance > 0.1) {
      g_giraffePosition[0] += (dx / distance) * g_giraffeWalkSpeed;
      g_giraffePosition[2] += (dz / distance) * g_giraffeWalkSpeed;
    } else {
      g_giraffePathIndex = (g_giraffePathIndex + 1) % g_giraffePath.length;
    }
  }
}

function drawNatureScene() {
  if (!g_wowFactorEnabled) return;
  
  // Draw trees
  if (g_showTrees) {
    for (var i = 0; i < g_trees.length; i++) {
      g_trees[i].render();
    }
  }
  
  if (g_showBirds) {
    for (var i = 0; i < g_birds.length; i++) {
      g_birds[i].render();
    }
  }
  
  if (g_showRain) {
    for (var i = 0; i < g_raindrops.length; i++) {
      g_raindrops[i].render();
    }
  }
}
function drawWalkingGiraffe() {
  if (!g_giraffeWalking) return;
  
  var giraffeMatrix = new Matrix4();
  
  giraffeMatrix.translate(g_giraffePosition[0], g_giraffePosition[1], g_giraffePosition[2]);
  
  giraffeMatrix.rotate(g_giraffeDirection * 180 / Math.PI, 0, 1, 0);
  
  var bodyY = 0.0;
  var bodyScale = 1.0;
  
  if (animationRunning) {
    bodyY = g_bodyAnimOffset; 
  }
  
  giraffeMatrix.translate(0.0, bodyY + 0.2, 0.0);
  giraffeMatrix.scale(bodyScale, bodyScale, bodyScale); 
  var bodyMatrix = new Matrix4(giraffeMatrix); 
  bodyMatrix.textureNum = -2;
  bodyMatrix.scale(0.25, 0.15, 0.4);       
  drawCube(bodyMatrix, [1.0, 0.8, 0.0, 1.0]);
  
  var backBodyMatrix = new Matrix4(giraffeMatrix);
  backBodyMatrix.translate(0.0, 0.0, -0.2);  
  backBodyMatrix.scale(0.25, 0.15, 0.22);    
  drawCube(backBodyMatrix, [1.0, 0.8, 0.0, 1.0]); 

  var neckMatrix = new Matrix4(giraffeMatrix);
  neckMatrix.translate(0.0, 0.15, 0.1);      
  
  var neckAngle = -20; 
  if (animationRunning) {
    neckAngle += g_neckAnimAngle; 
  }
  
  neckMatrix.rotate(neckAngle, 1, 0, 0);      
  
  var neckTransformMatrix = new Matrix4(neckMatrix); 
  neckMatrix.scale(0.08, 0.4, 0.08);         
  drawCube(neckMatrix, [1.0, 0.8, 0.0, 1.0]); 

  var headMatrix = new Matrix4(neckTransformMatrix);
  headMatrix.textureNum = -2;
  headMatrix.translate(0.0, 0.4, 0.0);         
  
  if (animationRunning) {
    headMatrix.rotate(g_headAnimAngle, 1, 0, 0); 
  }
  
  var headTransformMatrix = new Matrix4(headMatrix); 
  headMatrix.scale(0.12, 0.12, 0.2);          
  drawCube(headMatrix, [1.0, 0.8, 0.0, 1.0]);  
  
  // Eyes and face details
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
  
  // Tail
  var tailMatrix = new Matrix4(giraffeMatrix);
  tailMatrix.translate(0.0, 0.05, -0.32);      
  var tailAngle = -60; 
  if (animationRunning) {
    tailMatrix.rotate(g_tailAnimAngle, 0, 1, 0); 
    tailAngle += Math.abs(g_tailAnimAngle) * 0.2; 
  }
  
  tailMatrix.rotate(tailAngle, 1, 0, 0);
  
  var tailTransformMatrix = new Matrix4(tailMatrix); 
  tailMatrix.scale(0.03, 0.6, 0.03);          
  drawCube(tailMatrix, [0.8, 0.6, 0.0, 1.0]);  
  
  var tailTipMatrix = new Matrix4(tailTransformMatrix);
  tailTipMatrix.translate(0.0, -0.6, 0.0);     
  
  if (animationRunning) {
    tailTipMatrix.rotate(g_tailAnimAngle * 0.5, 0, 1, 0);
  }
  
  tailTipMatrix.scale(0.04, 0.15, 0.04);        
  drawCube(tailTipMatrix, [0.4, 0.3, 0.0, 1.0]); 

  // LEGS
  var legsBaseMatrix = new Matrix4(giraffeMatrix);
  var backLegsBaseMatrix = new Matrix4(giraffeMatrix);
  backLegsBaseMatrix.translate(0.0, 0.0, -0.2); 

  var frontRightLegMatrix = new Matrix4(legsBaseMatrix);
  frontRightLegMatrix.translate(0.1, -0.15, 0.18);    
  
  var totalRightLegAngle = parseFloat(g_frontRightLegAngle);
  
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

  // Draw giraffe spots
  drawGiraffeSpots(giraffeMatrix);
}

// Toggle all wow factor features
function toggleWowFactor() {
  g_wowFactorEnabled = !g_wowFactorEnabled;
  
  if (g_wowFactorEnabled) {
    g_showBirds = true;
    g_showTrees = true;
    g_giraffeWalking = true;
    g_showRain = true;
  } else {
    g_showBirds = false;
    g_showTrees = false;
    g_giraffeWalking = false;
    g_showRain = false;
  }
}

// Add a function to reset the game, showing walls again
function resetGame() {
  g_gameStarted = false;
  g_gameComplete = false;
  g_wallsVisible = true; // Show walls when game is reset
  
  // Clear any game messages
  let messageElement = document.getElementById('game-message');
  if (messageElement) {
    messageElement.style.opacity = '0';
  }
  
  // Hide game UI
  let gameUI = document.getElementById('game-ui');
  if (gameUI) {
    gameUI.style.display = 'none';
  }
}


