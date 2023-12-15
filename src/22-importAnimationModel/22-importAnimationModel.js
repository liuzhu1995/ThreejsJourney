import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
/**
 * 3D 模型的各种格式
 * 3D模型有各种各样的格式，比如OBJ、FBX、STL、PLY、COLLADA、3DS、GLTF
 * GLTF已经逐渐变为标准，并且能应付绝大部分的场景
 * 
 * GLTF（图形语言传输格式）
 * GLTF是GL Transmission Format的缩写。由KHronos Group创建（他们还创造了 OpenGL, WebGL, Vulkan, Collada ）
 * GLTF支持各种数据集，可以在其格式中使用几何体和材质，同时也可以包含相机、光照、场景、动画、骨骼等。同时支持
 * 各种文件格式，例如json、二进制binary、嵌入纹理（embed texture）等
 * GLTF已经成为实时渲染的标准，也正在成为大部分3D软件、游戏引擎和库的标准。如果只需要一个几何体，最好使用另一种格式，比如OBJ、FBX、STL或PLY
 * 
 */

/**
 * DeBug
 * dat.gui
 */
const gui = new dat.GUI();
let surveyWeight = 0
let walkWeight = 0
let runWeight = 0

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
 

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial())
plane.rotation.x = -Math.PI * 0.5
// plane.position.y = -5
plane.receiveShadow = true
scene.add(plane)

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


const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
gui.add(directionalLightHelper, 'visible')
scene.add(directionalLightHelper)
/**
 * Import Animation Model
 * threejs动画系统 https://threejs.org/docs/#manual/zh/introduction/Animation-system
 * gltl对象中的 animations 属性由多个 AnimationClip 组成的数组，为此需要创建一个动画混合器 AnimationMixer,
 * AnimationMixer 类似于包含一个或多个 AnimationClip 对象的播放器
 * AnimationClip 
 *  https://threejs.org/docs/?q=AnimationClip#api/zh/animation/AnimationClip
 *  动画剪辑（AnimationClip）是一个可重用的关键帧轨道集，它代表动画
 * AnimationMixer 
 *  https://threejs.org/docs/?q=AnimationMixer#api/zh/animation/AnimationMixer
 *  动画混合器是用于场景中特定对象的动画的播放器。当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器
 * 
 */
const gltfLoader = new GLTFLoader()
let mixer = null
let actionSurvey, actionWalk, actionRun = null
gltfLoader.load(
    './static/models/Fox/glTF/Fox.gltf', 
    (gltf) => {
        console.log(gltf);
        // 新建一个AnimationMixer
        mixer = new THREE.AnimationMixer(gltf.scene)
        // AnimationClip实例列表
        const clips = gltf.animations
        // 播放一个特定的动画
        // const action  = mixer.clipAction(gltf.animations[0]);
        // actionRun.play()

        // 将狐狸从巡视状态转变为走路状态，再从走路变为奔跑状态。在模型载入时将所有的动画全部开启，并将
        // 不需要的动画的权重 weight 先降为0，在点击gui按钮的时候，在进行权重过度
        actionSurvey  = mixer.clipAction(gltf.animations[0]);
        actionWalk = mixer.clipAction(gltf.animations[1]);
        actionRun = mixer.clipAction(gltf.animations[2]);
        actionSurvey.setEffectiveWeight(0)
        actionRun.setEffectiveWeight(0)
        actionSurvey.play()
        actionWalk.play()
        actionRun.play()

        // 播放所有动画
        // clips.forEach( function ( clip ) { 
        //     mixer.clipAction( clip ).play()
        // })
        gltf.scene.scale.set(0.05, 0.05, 0.05)
        scene.add(gltf.scene)
    },
)

/**
 * three.js 方法
 *  https://threejs.org/docs/index.html#api/zh/animation/AnimationAction.setEffectiveTimeScale
 *  setEffectiveWeight()
 *  设置权重（weight）以及停止所有淡入淡出
 *  
 *  setEffectiveTimeScale(timeScale: number)
 *  设置时间比例（timeScale）以及停用所有的变形
 * 
 *  .crossFadeTo ( fadeInAction : AnimationAction, durationInSeconds : Number, warpBoolean : Boolean ) : this
 *  在传入的时间段内, 让此动作淡出（fade out），同时让另一个动作淡入
 */
function handleFadeAction  (fadeOutAction, fadeInAction, durationInSeconds = 3) {
     // enabled 值设为false会禁用动作, 也就是无效.默认值是true
     fadeInAction.enabled = true
     // 动作开始的时间点 (单位是秒, 从0开始计时).
     fadeInAction.time = 0
     // 设置时间比例因子为1，以及停用所有变形。时间(time)的比例因子. 值为0时会使动画暂停。值为负数时动画会反向执行。默认值是1。
     fadeInAction.setEffectiveTimeScale(1)
     // 设置动作权重，以及停止所有淡入淡出。动作的权重 (取值范围[0, 1]). 0 (无影响)到1（完全影响）之间的值可以用来混合多个动作。默认值是1
     fadeInAction.setEffectiveWeight(1)
     // 在指定内让 actionSurvey 动作淡出，actionWalk 动作淡入
     fadeOutAction.crossFadeTo(fadeInAction, durationInSeconds, true)
}
const modelsAnimation = {
    surveyToWalk() {
        handleFadeAction(actionSurvey, actionWalk)
    },
    walkToRun() {
        handleFadeAction(actionWalk, actionRun)
    },
    runToSurvery() {
        handleFadeAction(actionRun, actionSurvey)
    },
    runToWalk() {
        handleFadeAction(actionRun, actionWalk)
    }
}

gui.add(modelsAnimation, 'surveyToWalk', )
gui.add(modelsAnimation, 'walkToRun')
gui.add(modelsAnimation, 'runToSurvery')
gui.add(modelsAnimation, 'runToWalk')
/**
 * Three.js Editor
 *  https://threejs.org/editor/
 *  Three.js 在线编辑器，如果日常想载入一个新的模型时，为了方便预览，可以使用这个在线编辑器
 *  必须使用单个文件的模型，例如二进制或 embed 文件，直接将文件拖入编辑器，就可以看到了，再添加环境光和平行光
 */


/**
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 4
camera.position.z = 14
// 设置相机看向物体的中心位置
// camera.lookAt(group.position)
scene.add(camera)
gui.add(camera.position, 'x').min(-10).max(10)
gui.add(camera.position, 'y').min(-10).max(10)
gui.add(camera.position, 'z').min(-10).max(20)
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
controls.enablePan = true
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
let previousTime = 0
const tick = () => {
    const elapseTime = clock.getElapsedTime()
    const delta = elapseTime - previousTime
    previousTime = elapseTime
 

    if (mixer) {
        // 在每一帧中更新 mixer 
        mixer.update(delta)
        if (actionSurvey) {
            // 获取动作权重，从0 ~ 1，代表当前动画所占权重，权重为1的时候100%执行当前动画
            console.log(actionSurvey.getEffectiveWeight(), 'getEffectiveWeight');
        }
    }
 
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
