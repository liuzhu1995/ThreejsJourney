/**
 * 相关资料
 * https://blog.51cto.com/u_15707179/5931902
 * https://blog.csdn.net/weixin_43990650/article/details/122026569
 * https://learnopengl.com/Getting-started/Coordinate-Systems
 */

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
// 将 modelMatrix和viewMatrix组合
uniform mat4 modelViewMatrix;
// 声明在js中传递值的同名变量
uniform vec2 uPosition;
uniform float uTime;


// attribute声明顶点位置变量
attribute vec3 position;
// attribute声明顶点颜色变量
attribute vec4 a_color;
// attribute声明顶点法向量
attribute vec4 normal;
// 与顶点相关的浮点数
attribute float scale;
attribute vec2 uv;
// 声明自定义属性变量
attribute float aRandom;


varying float vRandom;
varying vec2 vUv;
varying float vElevation;
void main() {


    vec4 modelPositin = modelMatrix * vec4(position, 1.0);

    // modelPositin.z += sin(modelPositin.x * 10.0) * 1.0;
    // 使用自定义属性，设置z轴坐标点位置

    float elevation = sin(modelPositin.x + uPosition.x - uTime) * 0.1;
    elevation += sin(modelPositin.y * uPosition.y * uTime) * 0.1;

    modelPositin.z += elevation;

    modelPositin.z += sin(modelPositin.x * uTime);

    vec4 viewPosition = viewMatrix * modelPositin;

    vec4 projectedPosition = projectionMatrix * viewPosition;

    vRandom = aRandom;
    vUv = uv;
    vElevation = elevation;

    gl_Position = projectedPosition;
}
