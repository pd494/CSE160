// Camera.js - Camera class for managing view and projection matrices

class Camera {
  constructor() {
    // Initialize camera properties
    this.fov = 60;
    this.eye = new Vector3([0, 0.5, 3.75]);  // Zoomed out by 25% for better visibility
    this.at = new Vector3([0, 0, 0]);  // Looking at the origin where the animal is
    this.up = new Vector3([0, 1, 0]);
    
    // Initialize matrices
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    
    // Update the view and projection matrices
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }
  
  // Update view matrix based on eye, at, and up vectors
  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
    return this.viewMatrix;
  }
  
  // Update projection matrix based on fov and aspect ratio
  updateProjectionMatrix(aspectRatio) {
    if (!aspectRatio) {
      aspectRatio = canvas.width / canvas.height;
    }
    this.projectionMatrix.setPerspective(this.fov, aspectRatio, 0.1, 100.0);
    return this.projectionMatrix;
  }
  
  // Move camera forward
  forward(speed = 0.2) {
    // Create a new vector for the direction
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    // Normalize the vector
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    // Multiply by speed and add to positions
    f.mul(speed);
    this.at.add(f);
    this.eye.add(f);
    
    // Update view matrix after moving
    this.updateViewMatrix();
  }
  
  // Move camera backward
  back(speed = 0.2) {
    // Create a new vector for the backward direction
    var f = new Vector3();
    f.set(this.eye);
    f.sub(this.at);
    
    // Normalize the vector
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    // Multiply by speed and add to positions
    f.mul(speed);
    this.at.add(f);
    this.eye.add(f);
    
    // Update view matrix after moving
    this.updateViewMatrix();
  }
  
  // Move camera left
  left(speed = 0.2) {
    // Create a new vector for the direction
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    // Normalize the vector
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    // Get the side vector using cross product
    var s = Vector3.cross(f, this.up);
    
    // Normalize the side vector
    len = Math.sqrt(
      s.elements[0] * s.elements[0] + 
      s.elements[1] * s.elements[1] + 
      s.elements[2] * s.elements[2]
    );
    s.div(len);
    
    // Multiply by speed and add to positions
    s.mul(speed);
    this.at.add(s);
    this.eye.add(s);
    
    // Update view matrix after moving
    this.updateViewMatrix();
  }
  
  // Move camera right
  right(speed = 0.2) {
    // Create a new vector for the direction
    var f = new Vector3();
    f.set(this.eye);
    f.sub(this.at);
    
    // Normalize the vector
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    // Get the side vector using cross product
    var s = Vector3.cross(f, this.up);
    
    // Normalize the side vector
    len = Math.sqrt(
      s.elements[0] * s.elements[0] + 
      s.elements[1] * s.elements[1] + 
      s.elements[2] * s.elements[2]
    );
    s.div(len);
    
    // Multiply by speed and add to positions
    s.mul(speed);
    this.at.add(s);
    this.eye.add(s);
    
    // Update view matrix after moving
    this.updateViewMatrix();
  }
  
  // Pan camera left
  panLeft(alpha = 5) {
    // Compute forward vector (at - eye)
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    // Create rotation matrix
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
    // Multiply forward by rotation matrix to get rotated forward
    var rotatedF = rotationMatrix.multiplyVector3(f);
    
    // Update at = eye + rotatedForward
    this.at.set(this.eye);
    this.at.add(rotatedF);
    
    // Update view matrix after panning
    this.updateViewMatrix();
  }
  
  // Pan camera right
  panRight(alpha = 5) {
    // Call panLeft with negative alpha to pan right
    this.panLeft(-alpha);
  }
}
