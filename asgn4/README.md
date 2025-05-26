# Assignment 4: Blocky Animal with Camera Rotation

This assignment features a 3D blocky giraffe animal with full camera rotation capabilities. All wall/block building functionality has been removed to focus solely on the animal and camera controls.

## Features

- **3D Blocky Giraffe**: A detailed giraffe made of cubes with hierarchical animation
- **Camera Rotation**: Full mouse-controlled camera rotation with pointer lock
- **Walking Animation**: Realistic walking animation with alternating leg movement
- **Interactive Controls**: Keyboard movement and special animations

## Controls

### Movement
- **W/A/S/D**: Move camera horizontally
- **R/T**: Move camera up/down

### Camera
- **Click Canvas**: Activate mouse camera control (pointer lock)
- **Mouse Movement**: Rotate camera view (when pointer locked)
- **ESC**: Exit mouse camera control

### Animation
- **Animation Toggle Button**: Turn walking animation on/off
- **SPACE**: Trigger poke animation (makes giraffe react)
- **Camera Angle Slider**: Rotate the global view

## Files

- `World.html`: Main HTML file with UI
- `World.js`: Main JavaScript file with rendering and animation logic
- `Camera.js`: Camera class for view and movement controls
- `Cube.js`: Cube rendering class
- `Point.js`, `Triangle.js`, `Circle.js`: Basic shape classes
- `lib/`: WebGL utility libraries
- `sky.jpg`, `ground.jpg`: Texture files for environment

## How to Run

1. Open `World.html` in a web browser
2. Click on the canvas to activate camera controls
3. Use WASD to move around and mouse to look around
4. Toggle animation and try the poke feature with SPACE

## Technical Details

- Uses WebGL for 3D rendering
- Hierarchical animation system for realistic movement
- Pointer lock API for smooth camera control
- Matrix transformations for 3D positioning and rotation
