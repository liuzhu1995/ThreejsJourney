uniform float uWaveAmplitude;
uniform vec2 uWaveFrequency;
uniform float uTime;
uniform vec2 uSpeed;

varying float vElevation;
void main() {
    vec4 modelPosition =  modelMatrix * vec4(position, 1.0);
//    float elevation = sin(modelPosition.x * uWaveFrequency.x) * uWaveAmplitude;
//    float elevation = sin(modelPosition.x * uWaveFrequency.x + uTime) * sin(modelPosition.z * uWaveFrequency.y + uTime) * uWaveAmplitude;
    float elevation = sin(modelPosition.x * uWaveFrequency.x + uSpeed.x) * sin(modelPosition.z * uWaveFrequency.y + uSpeed.y) * uWaveAmplitude;
    modelPosition.y += elevation;

    vElevation = elevation;
    gl_Position = projectionMatrix  * viewMatrix * modelPosition;
}
