"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )

    // vec4( -0.5, -0.5,  0.5, 1.0 ),
    // vec4( -0.5,  0.5,  0.5, 1.0 ),
    // vec4( 0.5,  0.5,  0.5, 1.0 ),
    // vec4( 0.5, -0.5,  0.5, 1.0 ),
    // vec4( -0.5, -0.5, -0.5, 1.0 ),
    // vec4( -0.5,  0.5, -0.5, 1.0 ),
    // vec4( 0.5,  0.5, -0.5, 1.0 ),
    // vec4( 0.5, -0.5, -0.5, 1.0 )
];


var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 13;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;

var swordGripId = 6;
var swordGuardId = 7;
var swordBladeId = 8;

var leftUpperLegId = 9;
var leftLowerLegId = 10;
var rightUpperLegId = 11;
var rightLowerLegId = 12;


var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;

var swordGripHeight = 1;
var swordGuardHeight = 0.1;
var swordBladeHeight = 6.0;
var swordGripWidth = 0.5;
var swordGuardWidth = 2.0;
var swordBladeWidth = 0.7;

var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 14;
var numAngles = 12;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 180, 0, 0];
var theta2 = [0, 0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 180, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];
var figure2 = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
for( var i=0; i<numNodes; i++) figure2[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var colors = [];
var colorLoc;

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:

    m = rotate(theta[torsoId], vec3(0, 1, 0) );
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	  m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
	  m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, swordGripId);
    break;

    case swordGripId:
    
    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta[swordGripId], vec3(1, 0, 0)));
    figure[swordGripId] = createNode( m, swordGrip, null, swordGuardId);
    break;

    case swordGuardId:
       
    m = translate(0.0, swordGripHeight, 0.0);
    //m = mult(m, rotate(theta[swordGuardId], vec3(1, 0, 0)));
    figure[swordGuardId] = createNode( m, swordGuard, null, swordBladeId );
    break;

    case swordBladeId:
       
    m = translate(0.0, swordGuardHeight, 0.0);
    //m = mult(m, rotate(theta[swordBladeId], vec3(1, 0, 0)));
    figure[swordBladeId] = createNode( m, swordBlade, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    }

}

function initNodes2(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:

    m = rotate(theta2[torsoId], vec3(0, 1, 0) );
    figure2[torsoId] = createNode( m, torso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:


    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	  m = mult(m, rotate(theta2[head1Id], vec3(1, 0, 0)))
	  m = mult(m, rotate(theta2[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure2[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth), 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta2[leftUpperArmId], vec3(1, 0, 0)));
    figure2[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(torsoWidth+upperArmWidth, 0.9*torsoHeight, 0.0);
	  m = mult(m, rotate(theta2[rightUpperArmId], vec3(1, 0, 0)));
    figure2[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth), 0.1*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta2[leftUpperLegId], vec3(1, 0, 0)));
    figure2[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(torsoWidth+upperLegWidth, 0.1*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta2[rightUpperLegId], vec3(1, 0, 0)));
    figure2[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta2[leftLowerArmId], vec3(1, 0, 0)));
    figure2[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta2[rightLowerArmId], vec3(1, 0, 0)));
    figure2[rightLowerArmId] = createNode( m, rightLowerArm, null, swordGripId);
    break;

    case swordGripId:
    
    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta2[swordGripId], vec3(1, 0, 0)));
    figure2[swordGripId] = createNode( m, swordGrip, null, swordGuardId);
    break;

    case swordGuardId:
       
    m = translate(0.0, swordGripHeight, 0.0);
    //m = mult(m, rotate(theta2[swordGuardId], vec3(1, 0, 0)));
    figure2[swordGuardId] = createNode( m, swordGuard, null, swordBladeId );
    break;

    case swordBladeId:
       
    m = translate(0.0, swordGuardHeight, 0.0);
    //m = mult(m, rotate(theta2[swordBladeId], vec3(1, 0, 0)));
    figure2[swordBladeId] = createNode( m, swordBlade, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta2[leftLowerLegId],vec3(1, 0, 0)));
    figure2[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta2[rightLowerLegId], vec3(1, 0, 0)));
    figure2[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    }

}

function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function traverse2(Id) {

    if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure2[Id].transform);
   figure2[Id].render();
   if(figure2[Id].child != null) traverse(figure2[Id].child);
    modelViewMatrix = stack.pop();
   if(figure2[Id].sibling != null) traverse(figure2[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function swordGrip() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * swordGripHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(swordGripWidth, swordGripHeight, swordGripWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function swordGuard() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * swordGuardHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(swordGuardWidth, swordGuardHeight, swordGuardWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function swordBlade() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * swordBladeHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(swordBladeWidth, swordBladeHeight, swordBladeWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function quad(a, b, c, d) {
    // var baseColors = [
    //     vec3(1.0, 0.0, 0.0),
    //     vec3(0.0, 0.0, 1.0)
    // ];
    //colors.push(baseColors[color]);
    pointsArray.push(vertices[a]);
    //colors.push(baseColors[color]);
    pointsArray.push(vertices[b]);
    //colors.push(baseColors[color]);
    pointsArray.push(vertices[c]);
    //colors.push(baseColors[color]);
    pointsArray.push(vertices[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7, );
    quad( 6, 5, 1, 2, );
    quad( 4, 5, 6, 7, );
    quad( 5, 4, 0, 1, );
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-5.0,15.0,-5.0, 15.0,-5.0,10.0);
    modelViewMatrix = mat4();

    colorLoc = gl.getUniformLocation(program, "uColor");

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // var colorLoc = gl.getAttribLocation(program, "aColor");
    // gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(colorLoc);

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

        document.getElementById("slider0").onchange = function(event) {
        theta[torsoId ] = event.target.value;
        initNodes(torsoId);
    };
        document.getElementById("slider1").onchange = function(event) {
        theta[head1Id] = event.target.value;
        initNodes(head1Id);
    };

    document.getElementById("slider2").onchange = function(event) {
         theta[leftUpperArmId] = event.target.value;
         initNodes(leftUpperArmId);
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[leftLowerArmId] =  event.target.value;
         initNodes(leftLowerArmId);
    };

        document.getElementById("slider4").onchange = function(event) {
        theta[rightUpperArmId] = event.target.value;
        initNodes(rightUpperArmId);
    };
    document.getElementById("slider5").onchange = function(event) {
         theta[rightLowerArmId] =  event.target.value;
         initNodes(rightLowerArmId);
    };
        document.getElementById("slider6").onchange = function(event) {
        theta[leftUpperLegId] = event.target.value;
        initNodes(leftUpperLegId);
    };
    document.getElementById("slider7").onchange = function(event) {
         theta[leftLowerLegId] = event.target.value;
         initNodes(leftLowerLegId);
    };
    document.getElementById("slider8").onchange = function(event) {
         theta[rightUpperLegId] =  event.target.value;
         initNodes(rightUpperLegId);
    };
        document.getElementById("slider9").onchange = function(event) {
        theta[rightLowerLegId] = event.target.value;
        initNodes(rightLowerLegId);
    };
    document.getElementById("slider10").onchange = function(event) {
         theta[head2Id] = event.target.value;
         initNodes(head2Id);
    };
    document.getElementById("slider11").onchange = function(event) {
         theta[swordGripId] = event.target.value;
         initNodes(swordGripId);
    };

    for(i=0; i<numNodes; i++) initNodes(i);
    for(i=0; i<numNodes; i++) initNodes2(i);

    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        
        gl.uniform4fv(colorLoc, [1.0, 0.0, 0.0, 1.0]);
        modelViewMatrix = mat4();
        traverse(torsoId);

        gl.uniform4fv(colorLoc, [0.0, 0.0, 1.0, 1.0]);
        modelViewMatrix = translate(10.0, 0.0, 0.0);
        traverse2(torsoId);

        requestAnimationFrame(render);
}
