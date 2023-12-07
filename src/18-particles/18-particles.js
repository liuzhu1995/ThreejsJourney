import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

 

const gui = new dat.GUI();
 const parameters = {
    color: 0xe3c8
 }


/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()


const textureLoader = new THREE.TextureLoader()
const particlesTexture01 = textureLoader.load('/static/textures/particles/1.png')
const particlesTexture02 = textureLoader.load('/static/textures/particles/2.png')
const particlesTexture03 = textureLoader.load('/static/textures/particles/3.png')
const particlesTexture04 = textureLoader.load('/static/textures/particles/4.png')
const particlesTexture05 = textureLoader.load('/static/textures/particles/5.png')
const particlesTexture06 = textureLoader.load('/static/textures/particles/6.png')
const particlesTexture07 = textureLoader.load('/static/textures/particles/7.png')
const particlesTexture08 = textureLoader.load('/static/textures/particles/8.png')
const particlesTexture09 = textureLoader.load('/static/textures/particles/9.png')
const particlesTexture10 = textureLoader.load('/static/textures/particles/10.png')
const particlesTexture11 = textureLoader.load('/static/textures/particles/11.png')
const particlesTexture12 = textureLoader.load('/static/textures/particles/12.png')
const particlesTexture13 = textureLoader.load('/static/textures/particles/13.png')
/**
 * 自定义几何体
 */
const vertices = []
const colors = []
const count = 20000
for (let i = 0; i < count; i++) {
    const x = THREE.MathUtils.randFloatSpread(20)
    const y = THREE.MathUtils.randFloatSpread(20)
    const z = THREE.MathUtils.randFloatSpread(20)
 
    vertices.push(x, y, z)
    colors.push(Math.random())
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
// 自定义颜色
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
const material = new THREE.PointsMaterial({
    // color: parameters.color, 
    alphaMap: particlesTexture04, 
    size: 0.1,
    opacity: 4,
})
// 指定点的大小是否因相机深度而衰减。（仅限透视摄像头。）默认为true
material.sizeAttenuation = true
// 使用顶点着色,此引擎支持RGB或者RGBA两种顶点颜色，取决于缓冲 attribute 使用的是三分量（RGB）还是四分量（RGBA）
material.vertexColors = true 
// 设置粒子透明，否则近处粒子会遮挡住远处粒子
material.transparent = true
// 透明度测试，如果材质的不透明度（alpha通道）低于预设的透明测试的值就会被抛弃。0总是渲染
// 不是很完美，能看到毛边
// material.alphaTest = 0.7

// 是否在渲染此材质时启用深度测试。默认为 true
// 遮挡的背景问题正是因为开启了 depthTest，WebGL 不知道哪个在前哪个在后导致的，关掉这个深度测试
// 关闭了深度测试，会导致另一个bug，如果创建一个几何体，那么这个几何体就会总是在这些粒子之后了
// material.depthTest = false


//渲染此材质是否对深度缓冲区有任何影响。默认为 true
// WebGL 在渲染是会检测当前渲染的深度和之前已经渲染的物体深度的对比，已渲染的深度会被缓存在 depth buffer 中。
// 这是我们设置 depthWrite 为 false 相当于告知发现更近的粒子时 WebGL 不要在将其写入 depth buffer 中
material.depthWrite = false
// 材料混合是组合多种材料的特性，即BRDF参数的过程。在使用此材质显示对象时要使用何种混合
// 可以用这个效果制作烟火、火焰等
material.blending = THREE.AdditiveBlending

const points = new THREE.Points(geometry, material)
scene.add(points)

gui.add(material, 'size').min(0.01).max(10).step(0.00001)
gui.add(material, 'opacity').min(0.01).max(10).step(0.00001)
gui.add(material, 'alphaTest').min(0.01).max(10).step(0.00001)
gui.add(material, 'sizeAttenuation')
gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color)
})

 

/**
 * Geometry
 */
 
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)

const pointMaterial = new THREE.PointsMaterial({
    color: parameters.color,
    size: 0.01,
    sizeAttenuation: true,
})

const points02 = new THREE.Points(sphereGeometry, pointMaterial)
// scene.add(points02)

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5), new THREE.MeshBasicMaterial())
// scene.add(cube)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
 


/**
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
// 设置相机看向物体的中心位置
// camera.lookAt(group.position)
scene.add(camera)

 

/**
 * Control 控件
 */
const controls = new OrbitControls(camera, canvas)
// controls.target.y = 2
// 启用自动旋转
controls.autoRotate = false
// 设置自动旋转速度 默认2.0
controls.autoRotateSpeed = 1
// 启用阻尼
controls.enableDamping = true
// 设置阻尼惯性 默认0.05 值越小惯性越大
controls.dampingFactor = 0.03
// 禁用摄像机平移
controls.enablePan = false
// 禁用摄像机的缩放
// controls.enableZoom = false
 
gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed').min(1).max(50).step(0.0001)

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

// window.addEventListener('dblclick', () => {
//     // 双击设置全屏
//     // 兼容性
//     const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
 
//     if (!fullscreenElement) {
//         // 进入全屏
//         if (canvas.requestFullscreen) {
//             canvas.requestFullscreen()
//         } else if (canvas.webkitRequestFullscreen) {
//             canvas.webkitRequestFullscreen()
//         }
//     } else {
//         // 退出全屏
//         if (document.exitFullscreen) {
//             document.exitFullscreen()
//         } else if (document.webkitExitFullscreen) {
//             document.webkitExitFullscreen()
//         }
//     }
// })

 

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
// 将输出canvas的大小调整为(width, height)
renderer.setSize(sizes.width, sizes.height)
// 性能优化在不同屏幕上像素比越大，渲染的次数越多
// 限制最大像素比为2
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    controls.update()
    // points.position.x = Math.sin(elapseTime) * Math.PI

    // 波浪
    // for (let i = 0; i < count; i++) {
    //     const x = geometry.attributes.position.getX(i)
         
    //     geometry.attributes.position.setY(i, Math.sin(elapseTime + x))
    // }
    // geometry.attributes.position.needsUpdate = true
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
