import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * 真实渲染
 *  在默认情况下，threejs的灯光强度是基于任意比例单位的，不能反应真实世界的数值。有的软件使用比例值，有的软件使用物理值。
 *  为了使得光强更趋于真实值，应该把渲染器的 physicallyCorrectLights 属性设为 true
 * 例如，如果从Blender导出模型，并在导出的模型中加入灯光，那么blender和threejs中将获得相同的灯光效果
 * 
 */
/**
 * DeBug
 * dat.gui
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
 

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20,20), new THREE.MeshStandardMaterial())
plane.rotation.x = -Math.PI * 0.5
plane.receiveShadow = true
// scene.add(plane)

/**
 * Textures
 * 将贴图环境作为背景并照亮整个模型
 */
const debugeObj = {
    envMapIntensity: 5,
}
const updateAllMaterial = () => {
    // 更新所有材质，遍历场景的每个子场景，以及每个子场景的子场景，将获得每个对象，无论在场景中有多深
    // 模型是由多个网格Mesh组成，可以使用 traverse 方法来获取场景scene中所有三维物体Object3D类对象

    scene.traverse(child => {
        console.log(child);
        // 判断是否是网格标准材质的网格
        if (child.type === 'Mesh' && child.material.type === 'MeshStandardMaterial') {
             // 将环境贴图设置给每个mesh的material的envMap属性，最简单的办法是 scene.environment = environmentMap
            // child.material.envMap = environmentMap
            // 通过乘以环境贴图的颜色来缩放环境贴图的效果,给每个材质设置强度
            child.material.envMapIntensity = debugeObj.envMapIntensity
        }
    })
}

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMap = cubeTextureLoader.setPath('./static/textures/environmentMaps/2/').load(
    [
        'px.jpg',
        'nx.jpg',
        'py.jpg',
        'ny.jpg',
        'pz.jpg',
        'nz.jpg',
    ]
)
// THREE.SRGBColorSpace 默认
environmentMap.colorSpace = THREE.SRGBColorSpace 
 
// 将场景环境等同于环境贴图，将环境贴图应用到所有对象上，就不必给单个material.envMap 属性设置环境贴图
scene.environment = environmentMap
// 将环境贴图作为scene背景
scene.background = environmentMap

gui.add(environmentMap, 'colorSpace', {
    'NoColorSpace': THREE.NoColorSpace,
    'SRGBColorSpace': THREE.SRGBColorSpace,
    'LinearSRGBColorSpace': THREE.LinearSRGBColorSpace ,
    'DisplayP3ColorSpace': THREE.DisplayP3ColorSpace,
    'LinearDisplayP3ColorSpace': THREE.LinearDisplayP3ColorSpace,
}).onFinishChange(updateAllMaterial)


gui.add(debugeObj, 'envMapIntensity').min(0).max(20).step(0.01).onChange(updateAllMaterial)
/**
 * Models
 */
const gltfLLoader = new GLTFLoader()
gltfLLoader.load(
    './static/models/FlightHelmet/glTF/FlightHelmet.gltf', 
    (gltf) => {
        gltf.scene.scale.set(10, 10, 10)
        scene.add(gltf.scene)
        updateAllMaterial()
        gui.add(gltf.scene.rotation, 'y').min(-Math.PI * 0.5).max(Math.PI).step(0.001).name('rotation')
        
    }
)

/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
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
scene.add(camera)
gui.add(camera.position, 'x').min(-20).max(20).name('cameraX')
gui.add(camera.position, 'y').min(-10).max(20).name('cameraY')
gui.add(camera.position, 'z').min(-10).max(20).name('cameraZ')
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
controls.enableZoom = true
 


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
// 默认情况下threejs的光照强度数值不真实，为了使光强更趋于真实值，设置physicallyCorrectLights为true。默认开启
// renderer.physicallyCorrectLights = true
/**
 * outputColorSpace 值
 *   NoColorSpace   
 *   SRGBColorSpace 
 *   LinearSRGBColorSpace（默认）
 *   DisplayP3ColorSpace
 *   LinearDisplayP3ColorSpace
 */
// renderer.outputColorSpace = THREE.SRGBColorSpace
// renderer.toneMappingExposure = 2.5
 
/**
 * toneMapping 色调银蛇质在将超高的动态范围HDR转换到我们日常显示的屏幕上的低动态范围LDR的过程
 */
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.render(scene, camera)

gui.add(renderer, 'physicallyCorrectLights')
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Liner: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
}).onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterial()
})

gui.add(renderer, 'outputColorSpace', {
    no: THREE.NoColorSpace,
    SRGB: THREE.SRGBColorSpace,
    linearSRGB: THREE.LinearSRGBColorSpace,
    dis: THREE.DisplayP3ColorSpace,
    LinearDis: THREE.LinearDisplayP3ColorSpace,
})

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
