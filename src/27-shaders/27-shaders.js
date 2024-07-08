import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import VertexShader from './shaders/vertex.glsl?raw';
import FragmentShader from './shaders/fragment.glsl?raw';
import geometries from "three/addons/renderers/common/Geometries.js";



const gui = new dat.GUI()
/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()
 
 
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('/static/textures/bricks/color.jpg')

/**
 * Objects
 */
const timeObject = { uTime: 1 }

const material = new THREE.RawShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    uniforms: {
        // 通过uniform将js中的值传递给着色器，uFrequency为自定义名称，u开头是和着色器内置变量区分
        uPosition: { value:  new THREE.Vector2(10, 5) },
        uTime: { value: timeObject.uTime },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: colorTexture }
    },
    wireframe: false,
})

gui.add(material, 'wireframe')
gui.add(timeObject, 'uTime').min(0.1).max(1).step(0.001)

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20,20, 30, 30), material)
plane.scale.y = 2 / 3;
console.log(plane.geometry)
// 根据定点数量增加随机值，将随机值应用在顶点着色器的z轴坐标
const count = plane.geometry.attributes.position.count;
const random = new Float32Array(count);
for (let i = 0; i < count; i++) {
    random[i] = Math.random()
}
// 给几何体添加自定义属性 aRandom
plane.geometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1));
// plane.rotation.x = -Math.PI * 0.5
scene.add(plane)

/**
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 4
camera.position.z = 20
// 设置相机看向物体的中心位置
// camera.lookAt(group.position)
 
/**
 * Control 控件
 */
const controls = new OrbitControls(camera, canvas)
// controls.target.y = 2
// 启用自动旋转
controls.autoRotate = false
// 设置自动旋转速度 默认2.0
controls.autoRotateSpeed = 7
// 启用阻尼
controls.enableDamping = true
// 设置阻尼惯性 默认0.05 值越小惯性越大
controls.dampingFactor = 0.03
// 禁用摄像机平移
controls.enablePan = false
// 禁用摄像机的缩放
// controls.enableZoom = false
 


/**
 * Handler
 */
window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // Update camera
    camera.aspect = sizes.width / sizes.height
    // 更新摄像机投影矩阵。在任何参数被改变以后必须被调用
    camera.updateProjectionMatrix()

    // 更新renderer
    renderer.setSize(sizes.width, sizes.height)
    // 性能优化在不同屏幕上像素比越大，渲染的次数越多
    // 限制最大像素比为2
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})


/**
 * Renderer
 * precision 着色器精度(highp | mediump |lowp)，它的含义是选择着色器精度
 * alpha 透明度（true | false）是否可以将背景色设置为透明
 * antialias 抗锯齿（true | false）默认false
 * premultipliedAlpha（true | false）表示是否可以设置像素的深度（用来度量图像的分辨率）
 * preserveDrawingBuffer （true | false）如果设置为true，则可以提取canvas绘图的缓冲
 * stencil（true | false） 是否要用模板字体或图案
 * maxLights（值为数值int）最大灯光数 代表最大灯光数，即场景中组多能够添加多少个灯光
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
// 将输出canvas的大小调整为(width, height)
renderer.setSize(sizes.width, sizes.height)
// 性能优化在不同屏幕上像素比越大，渲染的次数越多
// 限制最大像素比为2
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.render(scene, camera)

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    controls.update()

    material.uniforms.uTime.value = Math.sin( elapseTime * Math.PI * 0.25)
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()