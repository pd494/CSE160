# 3D Animal - WebGL Assignment

This project creates a 3D animal (dog) using WebGL with simple geometric shapes. The animal has hierarchical structure with joints that can be controlled via sliders and mouse rotation.

## Features

1. **3D Rendering**: Uses WebGL for 3D rendering with depth testing enabled.
2. **Hierarchical Structure**: The animal is built with a hierarchical structure (body → legs → paws, etc.).
3. **Joint Control**: Multiple joints can be controlled via sliders, including:
   - Head rotation
   - Front leg upper, lower, and paw joints
   - Back leg upper and lower joints
   - Tail rotation
4. **Global Rotation**: The entire animal can be rotated using sliders or mouse dragging.
5. **Animation**: Automatic animation that can be toggled on/off.
6. **Special Animation**: Shift+click to trigger a special "poke" animation.
7. **Performance Monitoring**: FPS counter to monitor rendering performance.
8. **Non-cube Primitive**: Uses cylinders for the tail in addition to cubes.

## Controls

- **Sliders**: Control individual joint rotations
- **Mouse Drag**: Rotate the entire animal
- **Animation Button**: Toggle automatic animation
- **Reset Button**: Reset all rotations to default positions
- **Shift+Click**: Trigger special poke animation

## Implementation Details

- Uses a custom Matrix4 class for 3D transformations
- Implements depth testing for proper 3D rendering
- Uses both cube and cylinder primitives
- Implements hierarchical transformations for joint movements
- Maintains consistent frame rate with performance monitoring

## Files

- `Animal3D.html`: Main HTML file with UI controls
- `Animal3D.js`: Main JavaScript file for rendering and animation
- `Cube.js`: Class for creating and rendering 3D cubes
- `Cylinder.js`: Class for creating and rendering 3D cylinders
- `Matrix.js`: Matrix utility functions for 3D transformations
- `lib/cuon-matrix.js`: Matrix library for WebGL programming
- `Point.js`, `Triangle.js`, `Circle.js`: Utility classes from Assignment 1
