precision mediump float;
precision mediump int;
uniform float time;

varying vec3 vPosition;
varying vec4 vColor;

void main() {

vec4 color = vec4(vColor);
color.r += 0.3 * sin(vPosition.y * 10.0 + time);
gl_FragColor = color; 
}


