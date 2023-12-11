import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import CannonDebugger from 'cannon-es-debugger'
/**
 * ### Physics 物理引擎
 * 物体会产生物理效果，例如中立、弹性、加速度、摩擦力、碰撞等。有很多方式实现物理效果，如果只是简单的物理效果
 * 可以使用数学（三角函数）和 Raycaster 来实现。复杂效果建议使用物理引擎相关的库。
 * TreeJs创建了一个3D世界，通过物理引擎创建一个物理世界，在物理世界中存在着物理体系（牛顿力学、万有引力、胡可弹性定律等）
 * 然后将物理世界中的几何体运动每帧坐标映射到threejs 3D世界中，就可以实现物理效果的运动了。
 * 
 * ### 物理引擎库
 * 物理引擎库有很多，分为3D和2D库。如果要标下的物理场及只需要在二维平面展示（例如3d场景中有个电视在播放一些物理效果，桌球游戏）
 * 2D的物理引擎性能远好于3D物理引擎
 * 2D引擎和3D引擎代码非常相似，主要区别是缺少一个z轴
 * ### 3D物理引擎库
 * Ammo.js https://github.com/kripken/ammo.js/
 * Cannon-es.js  
 * 官网 https://pmndrs.github.io/cannon-es/docs/modules.html#BODY_TYPES
 * 掘金文档 https://juejin.cn/post/7259467953040293948
 * --  npm i cannon-es --registry=https://registry.npm.taobao.org
 * cannon-es-debugger 可以展示模型的物理世界的轮廓
 * Oimo.js  https://lo-th.github.io/Oimo.js/#basic
 * 
 * ### 2D物理引擎库
 * Matter.js   https://brm.io/matter-js/
 * P2.js       https://schteppe.github.io/p2.js/
 * Planck.js   https://piqnt.com/planck.js/
 * Box2d.js    http://kripken.github.io/box2d.js/demo/webgl/box2d.html
 */

const gui = new dat.GUI();
 
 
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
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 20, 20), new THREE.MeshStandardMaterial())
sphere.position.y = 2
sphere.castShadow = true
scene.add(sphere)

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial())
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -5
plane.receiveShadow = true
scene.add(plane)

/**
 * Cannon.js
 * https://blog.csdn.net/weixin_43990650/article/details/121815208
 * 为更新物理世界world，必须在动画中tick方法中使用时间步长.step()
 */
// 将球体添加到world中
// 实例化物理world
const world = new CANNON.World()

// 添加重力,哪个坐标重力大往哪个坐标下坠
world.gravity.set(0,-9.82, 0)
 /**
  * 物理世界材质
  * 默认材质小球下落地面后没有明显的反弹行为
  * 可以通过设置材质Material来更改摩擦和反弹行为
  */
const defaultMaterial = new CANNON.Material()
 // 混凝土材质
// const concreteMaterial = new CANNON.Material('concrete')
// 塑料材质
// const plasticMaterial = new CANNON.Material('plastic')
// 创建材质
// const contactMaterial = new CANNON.ContactMaterial(concreteMaterial, plasticMaterial, {
//     friction: 0.3,
//     restitution: 0.7
// })
// 前两个参数材质，第三个参数是一个包含碰撞属性的对象，如摩擦力、反弹力（默认值都是3.0）
// 和上面使用塑料材质和混凝土材质效果一样
const contactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
    friction: 0.3, 
    restitution: 0.7,
})
world.addContactMaterial(contactMaterial)
// Create a sphere
const radius = 2
// 在cannonjs中通过Body创建物体
const sphereBody = new CANNON.Body({
    mass: 1, // kg 质量，两个物体进行碰撞，质量小的更容易被撞开
    position: new CANNON.Vec3(0, 2, 0), // m
    shape: new CANNON.Sphere(radius), // 半径2，与threejs世界中的球体半径相同
    // material: concreteMaterial, // 给球体设置混凝土材质
    material: defaultMaterial, // 效果和上面一样
})
world.addBody(sphereBody)

// 创建平面plane
const groundShape = new CANNON.Plane()
const groundBody = new CANNON.Body({
    mass: 0, // mass === 0 使body 静止
    // material: plasticMaterial, // 给地面设置塑料材质,
    material: defaultMaterial, //效果和上面一样
})
groundBody.addShape(groundShape)
// 平面初始化是竖立的，需要和threejs的平面一样旋转
// 在connonjs中，只能使用四元数（Quaternion）的setFromAxisAngle方法来旋转
// setFromAxisAngle方法第一个参数是旋转轴，第二个参数是角度
groundBody.position.set(0, -5, 0)
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI * 0.5)
world.addBody(groundBody)
/**
 * Connon Debugger
 */
const cannonMeshes = []
const guiObj = {
    CannonDebugger: true,
    drop() {
        sphereBody.position = new CANNON.Vec3(0, 2, 0)
    },
}
const cannonDebugger = new CannonDebugger(scene, world, {
     onInit(body, mesh) {
        mesh.visible = guiObj.CannonDebugger
        cannonMeshes.push(mesh)
     }
})
gui.add(guiObj, 'CannonDebugger').name('CannonDebuggerMeshVisible').onChange(value => {
    console.log(cannonMeshes, 'connonMeshes');
    cannonMeshes.forEach(mesh => {
        mesh.visible = !!value
    })
})
gui.add(guiObj, 'drop')
/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 5, 3)
directionalLight.castShadow = true
scene.add(directionalLight)
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001)
gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.001).name('directionalLightX')
gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.001).name('directionalLightY')
gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.001).name('directionalLightZ')
/**
 * Camera Helper
 */
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

/**
 * Light Helper
 */
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2)
directionalLightHelper.visible = true
scene.add(directionalLightHelper)

/**
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 16
camera.position.y = 5
camera.position.z = 0
// 设置相机看向物体的中心位置
// camera.lookAt(group.position)
scene.add(camera)


gui.add(camera.position, 'x').min(0).max(20).name('cameraX')
gui.add(camera.position, 'y').min(0).max(20).name('cameraY')
gui.add(camera.position, 'z').min(0).max(20).name('cameraZ')

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

window.addEventListener('dblclick', () => {
    // 双击设置全屏
    // 兼容性
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement
 
    if (!fullscreenElement) {
        // 进入全屏
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        // 退出全屏
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
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
renderer.shadowMap.enabled = true
// 将输出canvas的大小调整为(width, height)
renderer.setSize(sizes.width, sizes.height)
// 性能优化在不同屏幕上像素比越大，渲染的次数越多
// 限制最大像素比为2
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

const clock = new THREE.Clock()
/**
 * 为更新物理世界world，必须在tick方法中使用时间步长.fixedStep()
 * step(dt, [timeSinceLastCalled], [maxSubSteps=10])
 * dt: 固定时间戳（要使用的固定时间步长）
 * [timeSinceLastCalled] 自上次调用函数以来经过的时间
 * [maxSubSteps=10] 每个函数调用可执行的最大固定步骤数
 * 
 * 我们希望以60fps的速度运行，所以第一个参数设置为1/60；第二个参数，我们需要计算自上一帧以来经过了多少时间，
 * 通过将前一帧的elapsedTime减去当前elapsedTime来获得，不要去使用Clock类中的getDelta()方法
 * 
 */

let oldElapsedTime = 0
const tick = () => {
    const elapseTime = clock.getElapsedTime()
    const deltaTime = elapseTime - oldElapsedTime

    oldElapsedTime = elapseTime
    world.fixedStep()
  
   
    // 更新threejs世界球体的坐标
    sphere.position.copy(sphereBody.position)
    controls.update()
    cannonDebugger.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
