import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import CannonDebugger from 'cannon-es-debugger'
/**
 * ### Physics 物理引擎
 * http://www.webgl3d.cn/pages/e80014/
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
const sphereRadius = 1
const cubeRadius = 1
const material = new THREE.MeshStandardMaterial()

const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 20, 20)
const sphere = new THREE.Mesh(sphereGeometry, material)
sphere.position.y = 2
sphere.castShadow = true
scene.add(sphere)

const cubeGeomatery = new THREE.BoxGeometry(cubeRadius, cubeRadius, cubeRadius)
const cube = new THREE.Mesh(cubeGeomatery, material)
scene.add(cube) 

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20,20), material)
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

/**
 * 碰撞检测性能优化
 * 1. 粗测
 * cannonjs会一直检测物体之间是否有发生碰撞，这非常消耗cpu性能。这一步称为 BroadPhase ，我们可以选择不同的 BroadPhase 来提升性能
 * .NaiveBroadphase() 默认算法，检测物体碰撞时，一个基础的方式是检测每个物体是否与其他每个物体发生了碰撞
 * .GridBroadphase() 网格检测，使用四边形栅格覆盖world，仅针对同一栅格或相邻栅格中的其他物体进行碰撞测试
 * .SAPBroadphase() 扫描-剪枝算法， 在多个步骤的任意轴上测试碰撞
 * 默认为NaiveBroadphase 建议替换为 SAPBroadphase
 * 2. 睡眠Sleep
 * 虽然使用改进的 BroadPhase 算法，但所有物体还是要经过测试，即使那些不再移动的物体。可以使用一个叫 Sleep 的特性，当物体的速度非常慢的时候，
 * 以至于看不出有在移动，我们称这个物体进入睡眠，不参与碰撞测试，知道有被外力击中或其他物体碰撞到它
 * 可以通过.Body的 sleepSpeedLimit 和 sleepTimeLimit 属性来设置物体进入睡眠模式的条件
 *  sleepSpeedLimit: number,如果速度小于此值，则物体被视为进入睡眠状态
 *  sleepTimeLimit: number, 如果物体在这几秒内一直处于睡眠，则视为睡眠状态
 */
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

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
    friction: 0.3, // 摩擦力
    restitution: 0.7, // 弹性，1为回弹到原始位置
    
})
world.addContactMaterial(contactMaterial)
// Create a sphere

const sphereShape =  new CANNON.Sphere(sphereRadius)

// 在cannonjs中通过Body创建物体
const sphereBody = new CANNON.Body({
    mass: 5, // kg 重力，两个物体进行碰撞，质量小的更容易被撞开
    position: new CANNON.Vec3(0, 2, 0), // m
    shape: sphereShape, // 半径2，与threejs世界中的球体半径相同
    // material: concreteMaterial, // 给球体设置混凝土材质
    material: defaultMaterial, // 效果和上面一样
})
/**
 * 施加外力 Applyforces
 * applyForce(force, worldPoint) 施加作用力，可以用作风吹动树叶，或推倒多米诺骨牌或愤怒的小鸟的受力
 *      force -- 力的大小（Vec3）
 *      worldPoint -- 施加力的世界点(Vec3)
 * applyImpulse 施加冲量。这个冲量是瞬间的，例如射出去的子弹
 * applyLocalForce 同applyForce，不过是在物体的内部施力，对刚体的局部点施力
 * applyLocalImpulse 同applyImpulse，不过是在物体的内部施加冲量，对刚体的局部点施加冲量
 */
sphereBody.applyForce(new CANNON.Vec3(50, 0, 0), new CANNON.Vec3(0, 0, 0))
world.addBody(sphereBody)



const cubeShape = new CANNON.Box(new CANNON.Vec3(cubeRadius/2, cubeRadius/2, cubeRadius/2))
const cubeBody = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(0, 3, 0),
    shape: cubeShape,
    material: defaultMaterial,
})

world.addBody(cubeBody)

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
 * 事件
 * 我们可以监听Body上的事件，比如碰撞 collide 、睡眠 slepp、唤醒 wakeup
 * 可以利用碰撞事件添加音效
 */
const objectsToUpdate = []
const hitSound = new Audio('/static/sounds/hit.mp3')
const handleCollide = (collision) => {
    // 获取碰撞强度，较小的碰撞忽略其声音
    const impactStrength  = collision.contact.getImpactVelocityAlongNormal()
    // console.log(impactStrength, 'impactStrength');
    if (impactStrength > 2) {
        // 当audio已经播放的时候，再次执行play无效，设置 currentTime = 0 从头开始播放
        hitSound.currentTime = 0
        hitSound.play()
    }
}
function createSphere(radius, position) {
    const mesh = new THREE.Mesh(sphereGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }))
    mesh.position.y = 2
    mesh.castShadow = true
    mesh.scale.set(radius, radius, radius)
    scene.add(mesh)

    const body = new CANNON.Body({
        mass: 5,
        shape: sphereShape,
        material: defaultMaterial,
        position,
    })

    body.addEventListener('collide', handleCollide)
    
    world.addBody(body)
    objectsToUpdate.push({
        mesh, body
    })
}
 
function createCube(width, height, depth, position) {
      
    const mesh = new THREE.Mesh(cubeGeomatery, new THREE.MeshStandardMaterial())
    cube.scale.set(width, height, depth)
    scene.add(mesh)

    const body = new CANNON.Body({
        mass: 5,
        position,
        shape: cubeShape,
        material: defaultMaterial,
    })
    body.addEventListener('collide', handleCollide)
 
    world.addBody(body)
    objectsToUpdate.push({
        mesh, body
    })
}
/**
 * Connon Debugger 展示模型的物理世界的轮廓
 */
const cannonMeshes = []
const guiObj = {
    CannonDebugger: false,
    drop() {
        // 重置小球高度
        sphereBody.position = new CANNON.Vec3(0, 2, 0)
    },
    addSphere() {
        createSphere(Math.random(), new CANNON.Vec3(THREE.MathUtils.randFloatSpread(10), 2, THREE.MathUtils.randFloatSpread(10)))
    },
    addCube() {
        createCube(Math.random()*2, Math.random()*2, Math.random()*2,  new CANNON.Vec3(THREE.MathUtils.randFloatSpread(5), 2, THREE.MathUtils.randFloatSpread(5)))
    },
    reset () {
        objectsToUpdate.forEach(item => {
            const { mesh, body } = item
            body.removeEventListener('collide', handleCollide)
            world.removeBody(body)
            scene.remove(mesh)
        })
    }
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
gui.add(guiObj, 'addSphere')
gui.add(guiObj, 'addCube')
gui.add(guiObj, 'reset')


 

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-5, 5, 0)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 20
directionalLight.shadow.camera.top = 10
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.bottom = -12
directionalLight.shadow.camera.left = -10
scene.add(directionalLight)
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001)
gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.001).name('directionalLightX')
gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.001).name('directionalLightY')
gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.001).name('directionalLightZ')
/**
 * Camera Helper
 */
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)
gui.add(directionalLightCameraHelper, 'visible')
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
camera.position.x = 0
camera.position.y = 20
camera.position.z = 10
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
gui.add(controls, 'autoRotate')


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
   
    // const deltaTime = elapseTime - oldElapsedTime

    // oldElapsedTime = elapseTime
    // world.step(1 / 60, deltaTime, 3)
    // 使用cannon-es的fixedStep方法和上面效果一样
    world.fixedStep()
  

    // 更新物理引擎的球体的坐标同步给threejs中的球体
    sphere.position.copy(sphereBody.position)
    // quaternion
    cube.position.copy(cubeBody.position)
    // quaternion 用以表示对象局部旋转。将cannonjs中立方体倒下更新给threejs立方体
    cube.quaternion.copy(cubeBody.quaternion)
 
    objectsToUpdate.forEach(item => {
        const { mesh, body } = item
        mesh.position.copy(body.position)
        mesh.quaternion.copy(body.quaternion)
    })
    
    controls.update()
    cannonDebugger.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
