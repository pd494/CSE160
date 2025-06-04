// Claude helped me get the collision detection of the basketball and the hoop working in Copilot.
// I asked claude in copilot to help me design a mini game, I gave it the idea of holding the spacebar to charge the shot and release
//  the spacebar to shoot the ball, if the bal collides with the hoop your score goes up, and it helped me with the physics of the ball, loading,
// the UI, detection, and increasing the score. 

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

    class ColorGUIHelper {
      constructor(object, prop) {
        this.object = object;
        this.prop = prop;
      }
      get value() {
        return `#${this.object[this.prop].getHexString()}`;
      }
      set value(hexString) {
        this.object[this.prop].set(hexString);
      }
    }

    class DegRadHelper {
      constructor(obj, prop) {
        this.obj = obj;
        this.prop = prop;
      }
      get value() {
        return THREE.MathUtils.radToDeg(this.obj[this.prop]);
      }
      set value(v) {
        this.obj[this.prop] = THREE.MathUtils.degToRad(v);
      }
    }

    function main() {
      const canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
      const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      
      RectAreaLightUniformsLib.init();

      const fov = 75;
      const aspect = 2; 
      const near = 0.1;
      const far = 1000;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 15, 30);

      const controls = new OrbitControls(camera, canvas);
      controls.target.set(0, 0, 0);
      controls.update();

      const scene = new THREE.Scene();
      
      const skyboxScene = new THREE.Scene();
      const skyboxCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      
      {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('arena.jpg');
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        const skyboxGeo = new THREE.SphereGeometry(500, 60, 40);
        const skyboxMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(skyboxGeo, skyboxMat);
        skyboxScene.add(skybox);
      }
      
      let isDragging = false;
      let previousMousePosition = {
        x: 0,
        y: 0
      };
      
      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = {
          x: e.clientX,
          y: e.clientY
        };
      }, false);
      
      canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
          };
          
         
          skyboxCamera.rotation.y += deltaMove.x * 0.005;
          skyboxCamera.rotation.x += deltaMove.y * 0.005;
          
          skyboxCamera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, skyboxCamera.rotation.x));
          
          previousMousePosition = {
            x: e.clientX,
            y: e.clientY
          };
        }
      }, false);
      
      canvas.addEventListener('mouseup', () => {
        isDragging = false;
      }, false);
      
      
      
      

      const animatedObjects = [];
      
      const playerObjects = [];

      {
        const courtLength = 28; 
        const courtWidth = 15;  
        
        const planeGeo = new THREE.PlaneGeometry(courtLength, courtWidth);
        const planeMat = new THREE.MeshStandardMaterial({
          color: 0xFF8800, 
          side: THREE.DoubleSide,
          roughness: 0.8,
          metalness: 0.2
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -.5;
        mesh.receiveShadow = true;
        scene.add(mesh);
        
        window.courtLength = courtLength;
        window.courtWidth = courtWidth;
      }
      
      {
        const circleGeo = new THREE.RingGeometry(1.8, 1.9, 32);
        const circleMat = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          side: THREE.DoubleSide
        });
        const centerCircle = new THREE.Mesh(circleGeo, circleMat);
        centerCircle.rotation.x = Math.PI * -.5;
        centerCircle.position.y = 0.01; 
        scene.add(centerCircle);
        
        const centerLineGeo = new THREE.PlaneGeometry(0.1, window.courtWidth);
        const lineMat = new THREE.MeshBasicMaterial({
          color: 0xFFFFFF,
          side: THREE.DoubleSide
        });
        const centerLine = new THREE.Mesh(centerLineGeo, lineMat);
        centerLine.rotation.x = Math.PI * -.5;
        centerLine.position.y = 0.01; 
        scene.add(centerLine);
        
       
        for (let i = 0; i < 2; i++) {
          const sidePos = (window.courtWidth / 2) * (i === 0 ? -1 : 1);
          const sideLineGeo = new THREE.PlaneGeometry(window.courtLength + 0.1, 0.1);
          const sideLine = new THREE.Mesh(sideLineGeo, lineMat);
          sideLine.rotation.x = Math.PI * -.5;
          sideLine.position.set(0, 0.01, sidePos);
          scene.add(sideLine);
        }
        
        
        for (let i = 0; i < 2; i++) {
          const endPos = (window.courtLength / 2) * (i === 0 ? -1 : 1);
          const endLineGeo = new THREE.PlaneGeometry(0.1, window.courtWidth + 0.1);
          const endLine = new THREE.Mesh(endLineGeo, lineMat);
          endLine.rotation.x = Math.PI * -.5;
          endLine.position.set(endPos, 0.01, 0);
          scene.add(endLine);
        }
        
        
        for (let end = 0; end < 2; end++) {
          const endFactor = end === 0 ? -1 : 1;
          const keyWidth = 6;
          const keyLength = 5.8;
          const ftLinePos = (window.courtLength / 2 - keyLength) * endFactor;
          
          
          const ftLineGeo = new THREE.PlaneGeometry(keyWidth, 0.1);
          const ftLine = new THREE.Mesh(ftLineGeo, lineMat);
          ftLine.rotation.x = Math.PI * -.5;
          ftLine.position.set(ftLinePos, 0.01, 0);
          scene.add(ftLine);
          
          
          for (let side = 0; side < 2; side++) {
            const sideFactor = side === 0 ? -1 : 1;
            const keyLineGeo = new THREE.PlaneGeometry(0.1, keyLength);
            const keyLine = new THREE.Mesh(keyLineGeo, lineMat);
            keyLine.rotation.x = Math.PI * -.5;
            keyLine.position.set(
              (window.courtLength / 2 - keyLength/2) * endFactor, 
              0.01, 
              (keyWidth / 2) * sideFactor
            );
            scene.add(keyLine);
          }
          
          
          const ftCircleGeo = new THREE.RingGeometry(1.8, 1.9, 32, 1, 0, Math.PI);
          const ftCircle = new THREE.Mesh(ftCircleGeo, lineMat);
          ftCircle.rotation.x = Math.PI * -.5;
          ftCircle.rotation.z = end === 0 ? Math.PI : 0;
          ftCircle.position.set(ftLinePos, 0.01, 0);
          scene.add(ftCircle);
          
          
          
          const threePointRadius = 6.75;
          const threePointGeo = new THREE.RingGeometry(
            threePointRadius, 
            threePointRadius + 0.1, 
            32, 1, 
            Math.PI * 0.25, 
            Math.PI * 0.5
          );
          const threePointArc = new THREE.Mesh(threePointGeo, lineMat);
          threePointArc.rotation.x = Math.PI * -.5;
          threePointArc.rotation.z = end === 0 ? Math.PI : 0;
          threePointArc.position.set((window.courtLength / 2 - 1.25) * endFactor, 0.01, 0);
          scene.add(threePointArc);
          
          
          for (let side = 0; side < 2; side++) {
            const sideFactor = side === 0 ? -1 : 1;
            const straightLineGeo = new THREE.PlaneGeometry(0.1, window.courtLength / 2 - 4);
            const straightLine = new THREE.Mesh(straightLineGeo, lineMat);
            straightLine.rotation.x = Math.PI * -.5;
            straightLine.position.set(
              (window.courtLength / 4) * endFactor, 
              0.01, 
              (threePointRadius - 0.05) * sideFactor
            );
            scene.add(straightLine);
          }
        }
      }

      // Add basketball hoops
      function createBasketballHoop(endFactor) {
        const hoopGroup = new THREE.Group();
        
        const objLoader = new OBJLoader();
        objLoader.load('bballhoop.obj', (root) => {
          console.log('Hoop loaded successfully');
          
          
          root.traverse((node) => {
            if (node.isMesh) {
              
              node.material = new THREE.MeshStandardMaterial({
                color: 0xff4500, 
                roughness: 0.5,
                metalness: 0.7
              });
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          
          
          root.scale.set(0.4, 0.4, 0.8);
          
          
          root.position.y = 0;
          
          
          hoopGroup.add(root);
          console.log('Hoop added to group');
          
          
          if (endFactor === 1) {
            const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
            const boxMaterial = new THREE.MeshBasicMaterial({
              color: 0xff0000,
              transparent: true,
              opacity: 0.0 
            });
            const hoopBox = new THREE.Mesh(boxGeometry, boxMaterial);
            hoopBox.position.y = 5; 
            hoopGroup.add(hoopBox);
            hoopGroup.userData.hoopBox = hoopBox;
          }
        });
        
        
        const xPos = (window.courtLength / 2 - 2) * endFactor;
        hoopGroup.position.set(xPos, 0, 0);
        
        
        hoopGroup.rotation.y = endFactor > 0 ? Math.PI : 0;
        
        return hoopGroup;
      }
      
      
      const hoop1 = createBasketballHoop(-1);
      scene.add(hoop1);
      
      const hoop2 = createBasketballHoop(1); 
      scene.add(hoop2);


      {
        const radius = 0.5; 
        const widthDivisions = 32;
        const heightDivisions = 32;
        const ballGeo = new THREE.SphereGeometry(radius, widthDivisions, heightDivisions);
        
        const loader = new THREE.TextureLoader();
        const texture = loader.load('bballtexture.jpeg');
        texture.anisotropy = 16; 
        
        const ballMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.6,
          metalness: 0.2,
          envMap: scene.background
        });
        
        const centerBall = new THREE.Mesh(ballGeo, ballMat);
        
        
        centerBall.position.set(0, radius, 0);
        centerBall.castShadow = true;
        centerBall.receiveShadow = true;
        scene.add(centerBall);
        
        
        animatedObjects.push({
          obj: centerBall,
          rotationAxis: 'y',
          rotationSpeed: 0.5,
          fullRotation: true
        });
        animatedObjects.push({
          obj: centerBall,
          update: (time) => {
            const speed = 1.5;
            const xRadius = 8;
            const zRadius = 5;
            const height = 2.5;
            const x = Math.sin(time * speed) * xRadius;
            const z = Math.cos(time * speed * 0.7) * zRadius;
            const y = radius + Math.abs(Math.sin(time * speed * 1.2)) * height;
            centerBall.position.set(x, y, z);
          }
        });
      }
      
      
      let score = 0;
      let spacebarPressed = false;
      let powerLevel = 0;
      let shootBall = false;
      let ballVelocity = new THREE.Vector3();
      let minigameActive = true;
      
      const gameBallRadius = 0.5;
      const gameBallGeo = new THREE.SphereGeometry(gameBallRadius, 32, 32);
      
      const gameBallLoader = new THREE.TextureLoader();
      const gameBallTexture = gameBallLoader.load('bballtexture.jpeg');
      gameBallTexture.anisotropy = 16;
      
      const gameBallMat = new THREE.MeshStandardMaterial({
        map: gameBallTexture,
        roughness: 0.6,
        metalness: 0.2
      });
      
      const gameBall = new THREE.Mesh(gameBallGeo, gameBallMat);
      gameBall.castShadow = true;
      gameBall.receiveShadow = true;
      
      gameBall.position.set(0, gameBallRadius + 0.1, 0);
      scene.add(gameBall);
      
      playerObjects.forEach(player => {
        player.visible = false;
      });
      
      function updateScoreDisplay() {
        document.getElementById('score').textContent = `Score: ${score}`;
      }
      
      const powerBarContainer = document.getElementById('powerBarContainer');
      const powerBar = document.getElementById('powerBar');
      const powerLabel = document.getElementById('powerLabel');

      function resetBall() {
        gameBall.position.set(0, gameBallRadius + 0.1, 0);
        shootBall = false;
        powerLevel = 0;
        ballVelocity.set(0, 0, 0);
        powerBarContainer.style.display = 'none';
        powerBar.style.width = '0%';
      }
      
      
      function checkHoopCollision() {
        if (hoop2.userData.hoopBox) {
          const ballBox = new THREE.Box3().setFromObject(gameBall);
          const hoopBox = new THREE.Box3().setFromObject(hoop2.userData.hoopBox);
          return ballBox.intersectsBox(hoopBox);
        }
        return false;
      }
      
      document.addEventListener('keydown', (event) => {
        if (event.code === 'Space' && !shootBall) {
          spacebarPressed = true;
          powerBarContainer.style.display = 'block';
        }
      });
      

      document.addEventListener('keyup', (event) => {
        if (event.code === 'Space' && spacebarPressed) {
          spacebarPressed = false;
          powerBarContainer.style.display = 'none';
          
          
          const maxPower = 1.2;
          const power = Math.min(powerLevel / 100, 1) * maxPower;
          
            
          ballVelocity.set(
            (window.courtLength / 2 - 2) - gameBall.position.x,
            7 * power,
            0
          );
          
          
          ballVelocity.normalize().multiplyScalar(power * 0.8);
          
          shootBall = true;
        }
      });

      for (let i = 0; i < 10; i++) {
        const playerGroup = new THREE.Group();
        
        
        const bodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.2, 8);
        const colors = [0xFF0000, 0x0000FF, 0xFF0000, 0x0000FF, 0xFF0000, 0x0000FF]; // Two teams
        
        
        const jerseyLoader = new THREE.TextureLoader();
        const jerseyTexture = jerseyLoader.load('jerseytexture.png');
        jerseyTexture.anisotropy = 16; // Improve texture quality
        jerseyTexture.wrapS = THREE.RepeatWrapping;
        jerseyTexture.wrapT = THREE.RepeatWrapping;
        jerseyTexture.repeat.set(1, 1); 
        
        const bodyMat = new THREE.MeshStandardMaterial({
          map: jerseyTexture, 
          roughness: 0.7,
          metalness: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        playerGroup.add(body);
        
        const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({
          color: 0xFFD6C0, 
          roughness: 0.7,
          metalness: 0.1
        });
        
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.6;
        head.castShadow = true;
        playerGroup.add(head);
        
        
        const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const legMat = new THREE.MeshStandardMaterial({
          color: 0x222222, 
          roughness: 0.8,
          metalness: 0.2
        });
        
        
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.set(-0.15, 0, 0);
        leftLeg.castShadow = true;
        playerGroup.add(leftLeg);
        
        
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.set(0.15, 0, 0);
        rightLeg.castShadow = true;
        playerGroup.add(rightLeg);
        
        
        const teamOffset = (i < 3) ? -1 : 1; 
        const x = (Math.random() - 0.5) * 6 + teamOffset * 3;
        const z = (Math.random() - 0.5) * (courtWidth - 4);
        playerGroup.position.set(x, 0.4, z);
        playerGroup.rotation.y = Math.random() * Math.PI * 2;
        scene.add(playerGroup);
        
        
        playerObjects.push(playerGroup);
        
        
        animatedObjects.push({
          obj: playerGroup,
          initialPosition: playerGroup.position.clone(),
          positionAxis: 'y',
          positionSpeed: 0.5 + Math.random() * 0.9,
          positionRange: 0.1
        });
      }

    
      
      
      for (let side = 0; side < 2; side++) {
        const sideMultiplier = side === 0 ? -1 : 1;
        
        for (let row = 0; row < 3; row++) {
            
          const rowWidth = courtLength;
          const rowDepth = 1;
          const rowHeight = 0.4;
          
          const bleacherGeo = new THREE.BoxGeometry(rowWidth, rowHeight, rowDepth);
          const bleacherMat = new THREE.MeshStandardMaterial({
            color: 0x999999, 
            roughness: 0.8,
            metalness: 0.2
          });
          
          const bleacher = new THREE.Mesh(bleacherGeo, bleacherMat);
          bleacher.position.set(0, rowHeight/2 + row * rowHeight, sideMultiplier * (courtWidth/2 + 1 + row * rowDepth));
          bleacher.castShadow = true;
          bleacher.receiveShadow = true;
          scene.add(bleacher);
          
          
          for (let i = 0; i < 10; i++) {
            if (Math.random() > 0.3) { 
              const personGeo = new THREE.BoxGeometry(0.4, 0.6, 0.4);
              const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFAA00];
              const personMat = new THREE.MeshStandardMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                roughness: 0.8,
                metalness: 0.1
              });
              
              const person = new THREE.Mesh(personGeo, personMat);
              const xPos = -rowWidth/2 + 1 + i * (rowWidth/10);
              person.position.set(xPos, rowHeight + row * rowHeight + 0.3, sideMultiplier * (courtWidth/2 + 1 + row * rowDepth));
              person.castShadow = true;
              person.receiveShadow = true;
              scene.add(person);
              
              
              const animationType = Math.floor(Math.random() * 3); 
              
              
              const initialPosition = person.position.clone();
              
              
              animatedObjects.push({
                obj: person,
                initialPosition: initialPosition.clone(),
                positionAxis: 'y',
                positionSpeed: 1 + Math.random() * 2,
                positionRange: 0.1 + Math.random() * 0.1 
              });
              
              
              animatedObjects.push({
                obj: person,
                initialPosition: initialPosition.clone(),
                positionAxis: 'x',
                positionSpeed: 2 + Math.random() * 3, 
                positionRange: 0.15 + Math.random() * 0.2 
              });
              
              
              if (animationType === 2) {
                animatedObjects.push({
                  obj: person,
                  initialPosition: initialPosition.clone(),
                  positionAxis: 'z',
                  positionSpeed: 0.7 + Math.random() * 1.5,
                  positionRange: 0.1
                });
              }
              
              
              if (animationType === 1 || animationType === 2) {
                animatedObjects.push({
                  obj: person,
                  rotationAxis: 'y',
                  initialRotation: person.rotation.clone(),
                  rotationSpeed: 1 + Math.random() * 2,
                  rotationRange: 0.2 + Math.random() * 0.3
                });
              }
            }
          }
        }
      }

     


      
      
      const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
      scene.add(ambientLight);
      
      
      const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
      directionalLight.position.set(50, 50, 50);
      directionalLight.target.position.set(0, 0, 0);
      scene.add(directionalLight);
      scene.add(directionalLight.target);
      
      
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      
      const d = 50;
      directionalLight.shadow.camera.left = -d;
      directionalLight.shadow.camera.right = d;
      directionalLight.shadow.camera.top = d;
      directionalLight.shadow.camera.bottom = -d;
      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 150;
      
      
      const hemisphereLight = new THREE.HemisphereLight(0x0088FF, 0x00FF88, 0.5);
      scene.add(hemisphereLight);
      
      
      const pointLight = new THREE.PointLight(0x00FFFF, 1, 50);
      pointLight.position.set(0, 6, 0);
      pointLight.castShadow = true;
      scene.add(pointLight);
      
      
      const spotLight = new THREE.SpotLight(0xFFFFFF, 1);
      spotLight.position.set(-15, 15, -15);
      spotLight.angle = Math.PI / 8;
      spotLight.penumbra = 0.2;
      spotLight.decay = 1;
      spotLight.distance = 100;
      spotLight.target.position.set(0, 0, 0);
      spotLight.castShadow = true;
      scene.add(spotLight);
      scene.add(spotLight.target);
      
      
      const rectLight = new THREE.RectAreaLight(0xFFFFFF, 5, 4, 2);
      rectLight.position.set(-5, 8, 10);
      rectLight.lookAt(0, 0, 0);
      scene.add(rectLight);
      
      
      const rectLightHelper = new RectAreaLightHelper(rectLight);
      rectLight.add(rectLightHelper);
      
      
      animatedObjects.push({
        obj: pointLight,
        property: 'intensity',
        initialValue: 1,
        valueSpeed: 0.5,
        valueRange: 0.5
      });
      
      
      function updateLights() {
        directionalLight.target.updateMatrixWorld();
        spotLight.target.updateMatrixWorld();
      }
      updateLights();

      
      function makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, 'x', -50, 50).onChange(onChangeFn);
        folder.add(vector3, 'y', 0, 50).onChange(onChangeFn);
        folder.add(vector3, 'z', -50, 50).onChange(onChangeFn);
        folder.open();
      }

      
      const gui = new GUI();
      
      
      gui.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('sun color');
      gui.add(directionalLight, 'intensity', 0, 2, 0.01).name('sun intensity');
      

      makeXYZGUI(gui, directionalLight.position, 'sun position', updateLights);
      
      
      gui.addColor(new ColorGUIHelper(pointLight, 'color'), 'value').name('point color');
      gui.add(pointLight, 'intensity', 0, 2, 0.01).name('point intensity');
      
      
      gui.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('ambient color');
      gui.add(ambientLight, 'intensity', 0, 1, 0.01).name('ambient intensity');

      
      function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
        return needResize;
      }

      
      function render(time) {
        time *= 0.001;  

        
        resizeRendererToDisplaySize(renderer);

        
        updateLights();
        
        
        if (minigameActive) {
          
          if (spacebarPressed && !shootBall) {
            powerLevel = (powerLevel + 1.5) % 150; 
            
            
            const bounceHeight = Math.sin(powerLevel * 0.1) * 0.3;
            gameBall.position.y = gameBallRadius + 0.1 + bounceHeight;
            
            const percent = Math.min(powerLevel / 100, 1) * 100;
            powerBar.style.width = percent + '%';
            if (percent < 33) {
              powerBar.style.background = 'linear-gradient(90deg, #ffb347, #ff7700)';
            } else if (percent < 66) {
              powerBar.style.background = 'linear-gradient(90deg, #ffe259, #ffa751)';
            } else {
              powerBar.style.background = 'linear-gradient(90deg, #ff5858, #f09819)';
            }
            powerLabel.textContent = `Power: ${Math.round(percent)}%`;
          }
          
          
          if (shootBall) {
            
            ballVelocity.y -= 0.015;
            
            
            gameBall.position.x += ballVelocity.x;
            gameBall.position.y += ballVelocity.y;
            gameBall.position.z += ballVelocity.z;
            

            gameBall.rotation.z -= ballVelocity.x * 3;
            
            
            if (checkHoopCollision()) {
              score++;
              updateScoreDisplay();
              resetBall();
            }
            
            
            if (gameBall.position.y < gameBallRadius) {
              resetBall();
            }
            
            
            if (Math.abs(gameBall.position.x) > window.courtLength / 2 + 5) {
              resetBall();
            }
          }
        }
        
        
        animatedObjects.forEach(obj => {
          
          if (playerObjects.includes(obj.obj)) return;
          
          
          if (obj.update) {
            obj.update(time);
            return;
          }
          
          
          if (obj.rotationAxis) {
            if (obj.fullRotation) {
              
              obj.obj.rotation[obj.rotationAxis] = time * obj.rotationSpeed;
            } else {
              
              const rotationOffset = Math.sin(time * obj.rotationSpeed) * obj.rotationRange;
              obj.obj.rotation[obj.rotationAxis] = obj.initialRotation[obj.rotationAxis] + rotationOffset;
            }
          }
          
          
          if (obj.positionAxis) {
            const positionOffset = Math.sin(time * obj.positionSpeed) * obj.positionRange;
            obj.obj.position[obj.positionAxis] = obj.initialPosition[obj.positionAxis] + positionOffset;
          }
          
          if (obj.property) {
            const valueOffset = Math.sin(time * obj.valueSpeed) * obj.valueRange;
            obj.obj[obj.property] = obj.initialValue + valueOffset;
          }
        });

       
        skyboxCamera.position.copy(camera.position);
        
     
        skyboxCamera.aspect = camera.aspect;
        skyboxCamera.fov = camera.fov;
        skyboxCamera.near = camera.near;
        skyboxCamera.far = camera.far;
        skyboxCamera.updateProjectionMatrix();
        
        renderer.autoClear = true;
        renderer.render(skyboxScene, skyboxCamera);
        
        renderer.autoClear = false;
        renderer.render(scene, camera);
        
        requestAnimationFrame(render);
      }
      
      requestAnimationFrame(render);
    }

    main();
