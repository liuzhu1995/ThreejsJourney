import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import VertexShader from './shaders/vertex.glsl?raw';
import FragmentShader from './shaders/fragment.glsl?raw';

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

/**
 *  ShaderMaterial和 RawShaderMaterial的工作原理是一样的
 *  只不过有内置的 attributes 和 uniforms，精度也会自动设置
 */
const uniformObject = {
    blue: 1.0,
    alpha: 1.0,
    waveAmplitude: 0.2,
    time: 0.1,

}
const waveFrequency =  {
    x: 4,
    y: 1.5,
}
const speedObject =  {
    x: 1.0,
    y: 1.0,
}

const material = new THREE.ShaderMaterial({
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uWaveAmplitude: { value: uniformObject.waveAmplitude },
        uWaveFrequency: { value: new THREE.Vector2(waveFrequency.x, waveFrequency.y), },
        uSpeed: { value: new THREE.Vector2(speedObject.x, speedObject.y) }
    },
    side: THREE.DoubleSide,
    wireframe: false,
})

gui.add(material, 'wireframe')
gui.add(uniformObject, 'blue').min(0).max(1).step(0.01).name('RGB-B')
gui.add(uniformObject, 'waveAmplitude').min(0).max(1).step(0.01).name('波浪振幅')
gui.add(waveFrequency, 'x').min(0).max(10).step(0.01).name('frequency-X')
gui.add(waveFrequency, 'y').min(0).max(10).step(0.01).name('frequency-Y')
gui.add(uniformObject, 'time').min(0).max(5).step(0.01)
// gui.add(uniformObject, 'alpha').min(0).max(1).step(0.01)
gui.add(speedObject, 'x').min(0).max(10).step(0.01).name('speed-X')
gui.add(speedObject, 'y').min(0).max(10).step(0.01).name('speed-Y')


const geometry = new THREE.PlaneGeometry(20,20, 128, 128)
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = Math.PI / 2
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

    // material.uniforms.uBlue.value = uniformObject.blue
    // material.uniforms.uAlpha.value = uniformObject.alpha
    material.uniforms.uWaveAmplitude.value = uniformObject.waveAmplitude;

    material.uniforms.uWaveFrequency.value = new THREE.Vector2(waveFrequency.x, waveFrequency.y);

    // material.uniforms.uTime.value = elapseTime;
    // material.uniforms.uTime.value = uniformObject.time * elapseTime;
    material.uniforms.uSpeed.value = new THREE.Vector2(speedObject.x * elapseTime, speedObject.y * elapseTime);
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
