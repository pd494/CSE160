// Camera.js - Camera class for managing view and projection matrices

class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0.5, 3.75]);  
    this.at = new Vector3([0, 0, 0]);  
    this.up = new Vector3([0, 1, 0]);
    
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }
  
  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
    return this.viewMatrix;
  }
  
  updateProjectionMatrix(aspectRatio) {
    if (!aspectRatio) {
      aspectRatio = canvas.width / canvas.height;
    }
    this.projectionMatrix.setPerspective(this.fov, aspectRatio, 0.1, 100.0);
    return this.projectionMatrix;
  }
  
  // Move camera forward
  forward(speed = 0.2) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    f.elements[1] *= 0.1; 
    
    len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    f.mul(speed);
    this.at.add(f);
    this.eye.add(f);
    
    this.updateViewMatrix();
  }
  
  // Move camera backward
  back(speed = 0.2) {
    var f = new Vector3();
    f.set(this.eye);
    f.sub(this.at);
    
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    f.elements[1] *= 0.1; 
    
    len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    f.mul(speed);
    this.at.add(f);
    this.eye.add(f);
    
    this.updateViewMatrix();
  }
  
  // Move camera left
  left(speed = 0.2) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    var s = Vector3.cross(f, this.up);
    
    len = Math.sqrt(
      s.elements[0] * s.elements[0] + 
      s.elements[1] * s.elements[1] + 
      s.elements[2] * s.elements[2]
    );
    s.div(len);
    
    s.mul(speed);
    this.at.sub(s);
    this.eye.sub(s);
    
    this.updateViewMatrix();
  }
  
  // Move camera right
  right(speed = 0.2) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var len = Math.sqrt(
      f.elements[0] * f.elements[0] + 
      f.elements[1] * f.elements[1] + 
      f.elements[2] * f.elements[2]
    );
    f.div(len);
    
    var s = Vector3.cross(f, this.up);
    
    len = Math.sqrt(
      s.elements[0] * s.elements[0] + 
      s.elements[1] * s.elements[1] + 
      s.elements[2] * s.elements[2]
    );
    s.div(len);
    
    s.mul(speed);
    this.at.add(s);
    this.eye.add(s);
    
    this.updateViewMatrix();
  }
  
  // Move camera up vertically
  moveUp(speed = 0.2) {
    var upVector = new Vector3([0, 1, 0]);
    
    upVector.mul(speed);
    
    this.eye.add(upVector);
    this.at.add(upVector);
    
    this.updateViewMatrix();
  }
  
  // Move camera down vertically
  moveDown(speed = 0.2) {
    var downVector = new Vector3([0, -1, 0]);
    
    downVector.mul(speed);
    
    this.eye.add(downVector);
    this.at.add(downVector);
    
    this.updateViewMatrix();
  }
  
  // Pan camera left
  panLeft(alpha = 5) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
    var rotatedF = rotationMatrix.multiplyVector3(f);
    
    this.at.set(this.eye);
    this.at.add(rotatedF);
    
    this.updateViewMatrix();
  }
  
  // Pan camera right
  panRight(alpha = 5) {
    this.panLeft(-alpha);
  }
  
  // Pan camera horizontally for mouse control (more general implementation)
  pan(angleInDegrees) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(angleInDegrees, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    
    var rotatedF = rotationMatrix.multiplyVector3(f);
    
    this.at.set(this.eye);
    this.at.add(rotatedF);
    
    this.updateViewMatrix();
  }
  
  // Tilt camera vertically for mouse control
  tilt(angleInDegrees) {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    
    var right = Vector3.cross(f, this.up);
    right.normalize();
    
    var rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(angleInDegrees, right.elements[0], right.elements[1], right.elements[2]);
    
    var rotatedF = rotationMatrix.multiplyVector3(f);
    
    this.at.set(this.eye);
    this.at.add(rotatedF);
    
    this.updateViewMatrix();
  }
  
  getVerticalAngle() {
    var f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    
    return Math.asin(f.elements[1]) * 180 / Math.PI;
  }
}
