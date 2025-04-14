
let fallingTriangles = [];
const NUM_TRIANGLES = 15;

function createTriangle() {
    return {
        x: Math.random() * 1.8 - 0.9,  
        y: Math.random() * 2,  
        size: Math.random() * 0.03 + 0.02,  
        speed: Math.random() * 0.008 + 0.005,  
        wobble: Math.random() * 0.002 + 0.001,  
        wobbleSpeed: Math.random() * 4 + 3  
    };
}

function initSnowflakes() {
    fallingTriangles = [];
    for (let i = 0; i < NUM_TRIANGLES; i++) {
        fallingTriangles.push(createTriangle());
    }
}

function updateSnowflakes() {
    for (let triangle of fallingTriangles) {
        triangle.y -= triangle.speed;
        triangle.x += Math.sin(triangle.y * triangle.wobbleSpeed) * triangle.wobble;
        
        if (triangle.y < -1) {
            triangle.y = 1;
            triangle.x = Math.random() * 1.8 - 0.9;
        }
    }
}

function animate() {
    animationRunning = true;
    
    updateSnowflakes();
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    shapesList = [];  
    
    renderMyDrawing();
    
    animationId = requestAnimationFrame(animate);
}

function renderMyDrawing() {
    const green = [0.0, 0.8, 0.0, 1.0];
    const brown = [0.6, 0.3, 0.0, 1.0];
    const white = [1.0, 1.0, 1.0, 1.0];
    const black = [0.0, 0.0, 0.0, 1.0];
    const orange = [1.0, 0.5, 0.0, 1.0];

    addCustomTriangle([-0.7, 0.7], [-0.9, 0.3], [-0.5, 0.3], green);
    addCustomTriangle([-0.7, 0.5], [-1.0, 0.0], [-0.4, 0.0], green);
    addCustomTriangle([-0.7, 0.3], [-1.1, -0.3], [-0.3, -0.3], green);
    addCustomTriangle([-0.7, -0.3], [-0.8, -0.5], [-0.6, -0.5], brown);

    addCustomTriangle([0.7, 0.7], [0.5, 0.3], [0.9, 0.3], green);
    addCustomTriangle([0.7, 0.5], [0.4, 0.0], [1.0, 0.0], green);
    addCustomTriangle([0.7, 0.3], [0.3, -0.3], [1.1, -0.3], green);
    addCustomTriangle([0.7, -0.3], [0.6, -0.5], [0.8, -0.5], brown);

    addCustomTriangle([0.0, -0.5], [-0.3, -0.3], [0.3, -0.3], white);
    addCustomTriangle([0.0, -0.7], [-0.3, -0.3], [0.3, -0.3], white);

    addCustomTriangle([0.0, 0.0], [-0.25, 0.2], [0.25, 0.2], white);
    addCustomTriangle([0.0, -0.2], [-0.25, 0.2], [0.25, 0.2], white);

    addCustomTriangle([0.0, 0.4], [-0.2, 0.6], [0.2, 0.6], white);
    addCustomTriangle([0.0, 0.3], [-0.2, 0.6], [0.2, 0.6], white);

    addCustomTriangle([-0.08, 0.5], [-0.13, 0.45], [-0.03, 0.45], black);
    addCustomTriangle([0.08, 0.5], [0.03, 0.45], [0.13, 0.45], black);

    addCustomTriangle([0.0, 0.4], [-0.02, 0.35], [0.15, 0.38], orange);

    addCustomTriangle([-0.15, 0.35], [-0.2, 0.31], [-0.1, 0.31], black);
    addCustomTriangle([-0.09, 0.35], [-0.14, 0.31], [-0.04, 0.31], black);
    addCustomTriangle([-0.03, 0.35], [-0.08, 0.31], [0.02, 0.31], black);
    addCustomTriangle([0.03, 0.35], [-0.02, 0.31], [0.08, 0.31], black);
    addCustomTriangle([0.09, 0.35], [0.04, 0.31], [0.14, 0.31], black);
    addCustomTriangle([0.15, 0.35], [0.1, 0.31], [0.2, 0.31], black);

    addCustomTriangle([0.0, 0.15], [-0.05, 0.1], [0.05, 0.1], black);
    addCustomTriangle([0.0, 0.05], [-0.05, 0.0], [0.05, 0.0], black);
    addCustomTriangle([0.0, -0.05], [-0.05, -0.1], [0.05, -0.1], black);
    addCustomTriangle([0.0, -0.25], [-0.05, -0.3], [0.05, -0.3], black);
    addCustomTriangle([0.0, -0.35], [-0.05, -0.4], [0.05, -0.4], black);
    addCustomTriangle([0.0, -0.45], [-0.05, -0.5], [0.05, -0.5], black);

    for (let triangle of fallingTriangles) {
        addCustomTriangle(
            [triangle.x, triangle.y + triangle.size],
            [triangle.x - triangle.size, triangle.y - triangle.size],
            [triangle.x + triangle.size, triangle.y - triangle.size],
            white
        );
    }

    renderAllShapes();
}

function addCustomTriangle(v1, v2, v3, color) {
    var customTriangle = {
        type: 'custom_triangle',
        vertices: [v1, v2, v3],
        color: color,
        vertexBuffer: null,
        
        initVertexBuffer: function() {
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
                console.log('Failed to create the buffer object for custom triangle');
                return;
            }
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            
            var verticesArray = [];
            for (var i = 0; i < 3; i++) {
                verticesArray.push(this.vertices[i][0]);
                verticesArray.push(this.vertices[i][1]);
            }
            var vertices = new Float32Array(verticesArray);
            
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        },
        
        render: function() {
            if (!this.vertexBuffer) {
                this.initVertexBuffer();
            }
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            
            gl.enableVertexAttribArray(a_Position);
            
            gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
            
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    };
    
    shapesList.push(customTriangle);
    
    return customTriangle;
}

function createCircleFromTriangles(center, radius, color, segments) {
    for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * 2 * Math.PI;
        const angle2 = ((i + 1) / segments) * 2 * Math.PI;
        
        const x1 = center[0] + radius * Math.cos(angle1);
        const y1 = center[1] + radius * Math.sin(angle1);
        
        const x2 = center[0] + radius * Math.cos(angle2);
        const y2 = center[1] + radius * Math.sin(angle2);
        
        addCustomTriangle([center[0], center[1]], [x1, y1], [x2, y2], color);
    }
}

initSnowflakes();
animate();
