import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

/**
 * 真实渲染
 *  在默认情况下，threejs的光强数值不真实，为了使得光强更趋于真实值，应该把渲染器的 physicallyCorrectLights 属性设为 true
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
    envMapIntensity: 3,
}
const updateAllMaterial = () => {
    // 模型是由多个网格Mesh组成，可以使用 traverse 方法来获取场景scene中所有三维物体Object3D类对象
   
    scene.traverse(child => {
        if (child.type === 'Mesh' && child.material.type === 'MeshStandardMaterial') {
             // 模型是由多个mesh组成, 获取模型所有mesh，将环境贴图设置给模型的material的envMap属性
            child.material.envMap = envMaps
            // 通过乘以环境贴图的颜色来缩放环境贴图的效果，提高亮度
            child.material.envMapIntensity = debugeObj.envMapIntensity
        }
    })
}

const cubeTextureLoader = new THREE.CubeTextureLoader()
const envMaps = cubeTextureLoader.setPath('./static/textures/environmentMaps/3/').load(
    [
        'px.jpg',
        'nx.jpg',
        'py.jpg',
        'ny.jpg',
        'pz.jpg',
        'nz.jpg',
    ]
)
// 将环境贴图应用到所有对象上，就不必给单个 material.envMap 属性设置环境贴图
// scene.environment = envMaps
// 将环境贴图作为scene背景
scene.background = envMaps


gui.add(debugeObj, 'envMapIntensity').min(0).max(10).step(0.01).onChange(updateAllMaterial)
/**
 * Models
 */
const gltfLLoader = new GLTFLoader()
gltfLLoader.load(
    './static/models/FlightHelmet/glTF/FlightHelmet.gltf', 
    (gltf) => {
        console.log(gltf);
        // gltf.scene.scale.set(8, 8, 8)
        const children = [...gltf.scene.children]
 
        for (const child of children) {
            child.scale.set(8, 8, 8)
            scene.add(child)
        }
        // scene.add(gltf.scene)
        updateAllMaterial()
        
    },
    (process) => {
        console.log(process);
        console.log(`loaded: ${process.loaded / process.total * 100}%`);
    },
    (err) => {
        console.log(err, 'An error happened');
    }
)

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
// scene.add(directionalLight)


const spotLight = new THREE.SpotLight(0xffffff, 10)
spotLight.position.y = 10
 
// 如果非零，那么光强度将会从最大值当前灯光位置处按照距离线性衰减到0. 默认为0.0
spotLight.distance = 14
// 光线散射角度, 最大为Math.PI/2
spotLight.angle = Math.PI * 0.2
// 聚光锥的半影衰减百分比。在0和1之间的值。 默认值 0.0
spotLight.penumbra = 1
// 沿着光照距离的衰减量 设置为等于2将实现现实世界的光衰减 默认1
spotLight.decay = 0.3

spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.near = 0.1
spotLight.shadow.camera.far = 3
 

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
gui.add(camera.position, 'x').min(-10).max(10).name('cameraX')
gui.add(camera.position, 'y').min(-10).max(10).name('cameraY')
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
// 默认情况下threejs的光照强度数值不真实，为了使光强更趋于真实值，设置physicallyCorrectLights为true
renderer.physicallyCorrectLights = true
// typeof NoColorSpace
// typeof SRGBColorSpace
// typeof LinearSRGBColorSpace
// typeof DisplayP3ColorSpace
// typeof LinearDisplayP3ColorSpace;
renderer.outputColorSpace = THREE.SRGBColorSpace
// renderer.outputEncoding = THREE.sRGBEncoding
renderer.render(scene, camera)

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
