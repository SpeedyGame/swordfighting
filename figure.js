"use strict";

var canvas;
var gl;
var program;

var near = 1.0;
var far = 100.0;
var radius = 30.0;
var camTheta = 0.0;
var phi = Math.PI/90.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var eye;
// const at = vec3(0.0, 5.0, 0.0);
var at = vec3(0.0, 5.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var instanceMatrix;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )

    // vec4( -5.0, -0.5, -5.0, 1.0),
    // vec4( -5.0, 0.5, -5.0, 1.0),
    // vec4( 5.0, 0.5, -5.0, 1.0),
    // vec4( 5.0, -0.5, 5.0, 1.0)
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

var theta = [90, 0, -170, 0, 180, -45, 0, 0, 0, 180, 0, 180, 0, 0];
var theta2 = [-90, 0, 180, -45, -170, 0, 0, 0, 0, 180, 0, 180, 0, 0];

var stack = [];

var figure = [];
var figure2 = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);
for( var i=0; i<numNodes; i++) figure2[i] = createNode(null, null, null, null);

var vBuffer;
//var modelViewLoc;

var pointsArray = [];
var colors = [];
var colorLoc;

var fight = false;

var position1 = -6;
var position2 = 6 ;
var attacking1 = false;
var attacking2 = false;
var attackAngle1 = 0;
var attackAngle2 = 0;

var clashing1 = false;
var clashing2 = false;
var clashAngle1 = false;
var clashAngle2 = false;

var jumping1 = false;
var jumping2 = false;
var jumpingAngle1 = 0;
var jumpingAngle2 = 0;

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
    m = mult(m, rotate(theta[swordGuardId], vec3(1, 0, 0)));
    figure[swordGuardId] = createNode( m, swordGuard, null, swordBladeId );
    break;

    case swordBladeId:
       
    m = translate(0.0, swordGuardHeight, 0.0);
    m = mult(m, rotate(theta[swordBladeId], vec3(1, 0, 0)));
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
    figure2[leftLowerArmId] = createNode( m, leftLowerArm, null, swordGripId );
    break;

    // case rightLowerArmId:

    // m = translate(0.0, upperArmHeight, 0.0);
    // m = mult(m, rotate(theta2[rightLowerArmId], vec3(1, 0, 0)));
    // figure2[rightLowerArmId] = createNode( m, rightLowerArm, null, swordGripId);
    // break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta2[rightLowerArmId], vec3(1, 0, 0)));
    figure2[rightLowerArmId] = createNode( m, rightLowerArm, null, null);
    break;

    case swordGripId:
    
    m = translate(0.0, lowerArmHeight, 0.0);
    m = mult(m, rotate(theta2[swordGripId], vec3(1, 0, 0)));
    figure2[swordGripId] = createNode( m, swordGrip, null, swordGuardId);
    break;

    case swordGuardId:
       
    m = translate(0.0, swordGripHeight, 0.0);
    m = mult(m, rotate(theta2[swordGuardId], vec3(1, 0, 0)));
    figure2[swordGuardId] = createNode( m, swordGuard, null, swordBladeId );
    break;

    case swordBladeId:
       
    m = translate(0.0, swordGuardHeight, 0.0);
    m = mult(m, rotate(theta2[swordBladeId], vec3(1, 0, 0)));
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
    if(figure2[Id].child != null) traverse2(figure2[Id].child);
    modelViewMatrix = stack.pop();
    if(figure2[Id].sibling != null) traverse2(figure2[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 1 * headHeight, 0.0 ));
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

function reset() {
    fight = false;

    attackAngle1 = 0;
    attackAngle2 = 0;
    clashAngle1 = 0;
    clashAngle2 = 0;
    
    theta = [90, 0, -170, 0, 180, -45, 0, 0, 0, 180, 0, 180, 0, 0];
    theta2 = [-90, 0, 180, -45, -170, 0, 0, 0, 0, 180, 0, 180, 0, 0];
    for(i=0; i<numNodes; i++) initNodes(i);
    for(i=0; i<numNodes; i++) initNodes2(i);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    aspect =  canvas.width/canvas.height;

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    //eye = vec3(0.0, 5.0, 20.0);
    // eye = vec3(radius*Math.sin(camTheta)*Math.cos(phi),
    //     radius*Math.sin(camTheta)*Math.sin(phi), radius*Math.cos(camTheta));

    // console.log(radius*Math.sin(camTheta)*Math.cos(phi) + ", " +
    //     radius*Math.sin(camTheta)*Math.sin(phi) + ", " + radius*Math.cos(camTheta))

    // projectionMatrix = perspective(fovy, aspect, near, far);
    // modelViewMatrix = lookAt(eye, at , up);

    colorLoc = gl.getUniformLocation(program, "uColor");

    

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix")
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    // gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    // gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    cube();
    //quad( 8, 9, 10, 11);

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

    // document.getElementById("slider0").onchange = function(event) {
    //     theta[torsoId ] = event.target.value;
    //     initNodes(torsoId);
    // };
    // document.getElementById("slider1").onchange = function(event) {
    //     theta[head1Id] = event.target.value;
    //     initNodes(head1Id);
    // };

    // document.getElementById("slider2").onchange = function(event) {
    //      theta[leftUpperArmId] = event.target.value;
    //      initNodes(leftUpperArmId);
    // };
    // document.getElementById("slider3").onchange = function(event) {
    //      theta[leftLowerArmId] =  event.target.value;
    //      initNodes(leftLowerArmId);
    // };

    //     document.getElementById("slider4").onchange = function(event) {
    //     theta[rightUpperArmId] = event.target.value;
    //     initNodes(rightUpperArmId);

    //     console.log("θ1 upper arm", theta[rightUpperArmId]);
    //     console.log("θ2 upper arm", theta2[rightUpperArmId]);

    // };
    // document.getElementById("slider5").onchange = function(event) {
    //      theta[rightLowerArmId] =  event.target.value;
    //      initNodes(rightLowerArmId);
    // };
    //     document.getElementById("slider6").onchange = function(event) {
    //     theta[leftUpperLegId] = event.target.value;
    //     initNodes(leftUpperLegId);
    // };
    // document.getElementById("slider7").onchange = function(event) {
    //      theta[leftLowerLegId] = event.target.value;
    //      initNodes(leftLowerLegId);
    // };
    // document.getElementById("slider8").onchange = function(event) {
    //      theta[rightUpperLegId] =  event.target.value;
    //      initNodes(rightUpperLegId);
    // };
    //     document.getElementById("slider9").onchange = function(event) {
    //     theta[rightLowerLegId] = event.target.value;
    //     initNodes(rightLowerLegId);
    // };
    // document.getElementById("slider10").onchange = function(event) {
    //      theta[head2Id] = event.target.value;
    //      initNodes(head2Id);
    // };
    // document.getElementById("slider11").onchange = function(event) {
    //      theta[swordGripId] = event.target.value;
    //      initNodes(swordGripId);
    // };
    
    document.getElementById("Button1").onclick = function(){
        attacking1 = true;
        console.log("Red will swing.")
        document.getElementById('my-text-box').innerHTML = "Red will swing.";
    };
    document.getElementById("Button2").onclick = function(){
        attacking1 = false;
        console.log("Red will not swing.")
        document.getElementById('my-text-box').innerHTML = "Red will not swing.";
    };
    document.getElementById("Button3").onclick = function(){
        attacking2 = true;
        console.log("Blue will swing.")
        document.getElementById('my-text-box').innerHTML = "Blue will swing.";
    };
    document.getElementById("Button4").onclick = function(){
        attacking2 = false;
        console.log("Blue will not swing.")
        document.getElementById('my-text-box').innerHTML = "Blue will not swing.";
    };
    document.getElementById("Button5").onclick = function(){
        console.log("Fight!")
        document.getElementById('my-text-box').innerHTML = "Fight!";
        fight = true;
    };
    document.getElementById("Button6").onclick = function() {
        reset();
        console.log("Fight has been resetted.")
        document.getElementById('my-text-box').innerHTML = "Fight has been resetted.";
    }

    window.addEventListener('keydown', keyDown);

    function keyDown(e){
        switch (e.key) {
            case "w":
                radius *= 0.9;
        break;
            case "s":
                radius *= 1.1;
        break;
            case "d":
                camTheta += dr;
        break;
            case "a":
                camTheta -= dr;
        break;
        //     case "ArrowRight":
        //         //console.log(at);
        //         at[0] += 0.5;
        //         //at = mult(at[0], vec3(0.1, 0.0, 0.0));
        //         //console.log(at);
        // break;
        // case "ArrowLeft":
        //         //console.log(at);
        //         at[0] -= 0.5;
        //         //at = mult(at[0], vec3(0.1, 0.0, 0.0));
        //         //console.log(at);
        // break;
        case " ":
            //reset();
            fight = true;
        break;
        case "r":
            reset();
        break;
    }
            console.log(e.key);
            //camTheta += dr;
    }

    // document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    // document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    // document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    // document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    // document.getElementById("Button5").onclick = function(){theta += dr;};
    // document.getElementById("Button6").onclick = function(){theta -= dr;};
    // document.getElementById("Button7").onclick = function(){phi += dr;};
    // document.getElementById("Button8").onclick = function(){phi -= dr;};

    for(i=0; i<numNodes; i++) initNodes(i);
    for(i=0; i<numNodes; i++) initNodes2(i);

    render();
}


var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT );

        if (fight && (attacking1 || attacking2)) {
            if(attacking1) {
                attackAngle1 += 1;

                let angle = 130 * Math.sin(attackAngle1 * Math.PI / 180);

                theta[rightUpperArmId] = angle;

                initNodes(rightUpperArmId);

                if (attackAngle1 >= 90) {
                    if (attacking2) {
                        //attacking1 = false;
                        clashing1 = true;
                    }
                    else {
                        //attacking1 = false;
                        clashing2 = true;
                    }
                    //console.log(attackAngle1);
                }
            }

            if(attacking2) {
                attackAngle2 += 1;

                let angle = 130 * Math.sin(attackAngle2 * Math.PI / 180);

                theta2[leftUpperArmId] = angle;
                // theta[rightLowerArmId] = angle / 2;
                // theta[swordGripId] = -angle / 3;

                initNodes2(leftUpperArmId);

                if (attackAngle2 >= 90) {
                    console.log(attacking1);
                    if (attacking1) {
                        //attacking2 = false;
                        clashing2 = true;
                    }
                    else {
                        //attacking2 = false;
                        clashing1 = true;
                    }
                    //console.log(attackAngle1);
                }
            }

            if (clashing1) {
                clashAngle1 +=4;
                var leanBack = 0.0;
                leanBack += 15;

                let angle = 130 * Math.cos(clashAngle1 * Math.PI / 180);

                theta[rightUpperArmId] = angle;
                theta[head1Id] = -angle / 4;
                theta[head2Id] = -angle / 2;

                if (clashAngle1 >= 90) {
                    //theta[head1Id] = -angle / 2;
                    theta[torsoId] += leanBack;
                    clashing1 = false;
                    if (attacking1 == false && attacking2){
                        console.log("Blue wins!")
                        document.getElementById('my-text-box').innerHTML = "Blue wins!";
                    }
                    else if (attacking2) {
                        console.log("It's a draw (blue side).")
                        document.getElementById('my-text-box').innerHTML = "It's a draw.";
                    }
                    attacking1 = false;
                    attacking2 = false;
                }
                
                initNodes(rightUpperArmId);
                initNodes(torsoId);
                initNodes(headId);

            }

            if (clashing2) {
                clashAngle2 +=4;
                var leanBack = 0.0;
                leanBack += 15;

                let angle = 130 * Math.cos(clashAngle2 * Math.PI / 180);

                theta2[leftUpperArmId] = angle;
                theta2[head1Id] = -angle / 2;
                theta2[head2Id] = -angle / 2;

                if (clashAngle2 >= 90) {
                    //attacking1 = false;
                    theta2[torsoId] += leanBack;
                    clashing2 = false;
                    if (attacking1 && attacking2 == false){
                        console.log("Red wins!")
                        document.getElementById('my-text-box').innerHTML = "Red wins!";
                    }
                    else if (attacking1) {
                        console.log("It's a draw (red side).")
                        document.getElementById('my-text-box').innerHTML = "It's a draw.";
                    }
                    attacking2 = false;
                    attacking1 = false;
                }
                
                initNodes2(leftUpperArmId);
                initNodes2(torsoId);
                initNodes2(head1Id);
            }

            if (jumping1) {
                jumpingAngle1 +=1;

                let angle = 90 * Math.sin(jumpingAngle1 * Math.PI / 180);

                theta2[torsoId] += translate(0.0, angle, 0.0);

                initNodes(torsoId);
            }
        }
        else{
            fight = false;
        }

        eye = vec3(radius*Math.sin(camTheta)*Math.cos(phi),
        radius*Math.sin(camTheta)*Math.sin(phi), radius*Math.cos(camTheta));

        //console.log(at);

        projectionMatrix = perspective(fovy, aspect, near, far);
        modelViewMatrix = lookAt(eye, vec3(at) , up);
        modelViewMatrix = mult(modelViewMatrix, translate(position1, 0.0, 0.0));

        gl.uniform4fv(colorLoc, [1.0, 0.0, 0.0, 1.0]);
        traverse(torsoId);
        
        modelViewMatrix = lookAt(eye, vec3(at) , up);
        modelViewMatrix = mult(modelViewMatrix, translate(position2, 0.0, 0.0));
        gl.uniform4fv(colorLoc, [0.0, 0.0, 1.0, 1.0]);
        traverse2(torsoId);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        //gl.drawArrays(gl.TRIANGLES, 0, 11);
        requestAnimationFrame(render);
}
