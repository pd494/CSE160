// DrawTriangle.js (c) 2012 matsuda

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  
  var centerX = 200;
  var centerY = 200;
  
  var endX = centerX + v.elements[0] * 20;
  var endY = centerY - v.elements[1] * 20; 
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function copyVector(v) {
  return new Vector3([v.elements[0], v.elements[1], v.elements[2]]);
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  var v1x = parseFloat(document.getElementById('v1-x').value);
  var v1y = parseFloat(document.getElementById('v1-y').value);
  var v1 = new Vector3([v1x, v1y, 0]);

  var v2x = parseFloat(document.getElementById('v2-x').value);
  var v2y = parseFloat(document.getElementById('v2-y').value);
  var v2 = new Vector3([v2x, v2y, 0]);

  // Draw both vectors
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);

  var v1x = parseFloat(document.getElementById('v1-x').value);
  var v1y = parseFloat(document.getElementById('v1-y').value);
  var v1 = new Vector3([v1x, v1y, 0]);

  var v2x = parseFloat(document.getElementById('v2-x').value);
  var v2y = parseFloat(document.getElementById('v2-y').value);
  var v2 = new Vector3([v2x, v2y, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  var operation = document.getElementById('operation').value;
  var scalar = parseFloat(document.getElementById('scalar').value);

  function angleBetween(v1, v2) {
    const dotProduct = Vector3.dot(v1, v2);
    const mag1 = v1.magnitude();
    const mag2 = v2.magnitude();
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    const cosTheta = dotProduct / (mag1 * mag2);
    const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
    return theta * (180 / Math.PI); // Convert to degrees
  }

  function areaTriangle(v1, v2) {
    const crossProduct = Vector3.cross(v1, v2);
    return crossProduct.magnitude() / 2;
  }

  if (operation === 'area') {
    const area = areaTriangle(v1, v2);
    console.log('Triangle area:', area.toFixed(2), 'square units');
  } else if (operation === 'angle') {
    const angle = angleBetween(v1, v2);
    console.log('Angle between vectors:', angle.toFixed(2), 'degrees');
  } else if (operation === 'magnitude') {
    const mag1 = v1.magnitude();
    const mag2 = v2.magnitude();
    console.log('Vector 1 magnitude:', mag1.toFixed(2));
    console.log('Vector 2 magnitude:', mag2.toFixed(2));
  } else if (operation === 'normalize') {
    var v3 = copyVector(v1);
    var v4 = copyVector(v2);
    
    v3.normalize();
    v4.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
    
    console.log('Normalized v1 magnitude:', v3.magnitude().toFixed(2));
    console.log('Normalized v2 magnitude:', v4.magnitude().toFixed(2));
  } else if (operation === 'add' || operation === 'sub') {
    var v3 = copyVector(v1);
    if (operation === 'add') {
      v3.add(v2);
    } else {
      v3.sub(v2);
    }
    drawVector(v3, "green");
  } else {
    var v3 = copyVector(v1);
    var v4 = copyVector(v2);
    if (operation === 'mul') {
      v3.mul(scalar);
      v4.mul(scalar);
    } else if (scalar !== 0) {
      v3.div(scalar);
      v4.div(scalar);
    }
    drawVector(v3, "green");
    drawVector(v4, "green");
  }
}

function main() {  
  var canvas = document.getElementById('example');  
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);
}
