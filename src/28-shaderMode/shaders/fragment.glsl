precision mediump float;
#define PI 3.14159265359
varying vec2 vUv;
uniform float uBlue;
uniform float uAlpha;

float random(vec2 strength) {
    return fract(sin(dot(strength.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
void main() {
//    gl_FragColor = vec4(vUv, uBlue, uAlpha);
//    gl_FragColor = vec4(vUv.x, vUv.x, uBlue, uAlpha);


    float x = mod(vUv.x * 10.0, 1.0);
    float y = mod(vUv.y * 10.0, 1.0);

    float strengthX = step(0.8,  mod(vUv.x * 10.0, 1.0)) * step(0.4,  mod(vUv.y * 10.0, 1.0));
    float strengthY = step(0.8,  mod(vUv.y * 10.0, 1.0)) * step(0.4,  mod(vUv.x * 10.0, 1.0));
//    float strength = abs(vUv.x - 0.5) + abs(vUv.y - 0.5);
//    float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

//    float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
//    strength *= 1.0 -  step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

//    float strength = floor(vUv.x * 10.0) / 10.0;
//    float strength = floor(vUv.x * 10.0) / 10.0 * floor(vUv.y * 10.0) / 10.0;

//    float strength = random(vUv);

    float strength = 0.0015 / distance(vUv, vec2(0.5));
    gl_FragColor = vec4(vec3(strength), uAlpha);
}
