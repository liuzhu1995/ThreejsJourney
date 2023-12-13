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
plane.position.y = -5
plane.receiveShadow = true
scene.add(plane)

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

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
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001)
gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.001).name('directionalLightX')
gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.001).name('directionalLightY')
gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.001).name('directionalLightZ')

/**
 * Models
 * https://blog.csdn.net/weixin_43990650/article/details/121909277
 * GLTFLoader https://threejs.org/docs/?q=GLTFLoader#examples/zh/loaders/GLTFLoader
 * * GLTF格式
 * 虽然GLTF本身是一种格式，但它有不同的文件版本格式
 * 打开./static/models/Duck文件夹，有4个不同的文件夹。虽然每个都包含duck，但都采用不同的GLTf格式：
 * glTF
 *  默认格式，Duck.gltf文件是可以在编辑器中打开的json文件。它包含各种信息，如相机、灯光、场景、材质、对象变换，
 *  但即不包含几何体geometry，也不包含纹理material。Duck0.bin是一个二进制文件，不能像下面那样去读。它通常包含几何体等
 *  数据以及顶点相关的信息，如UV坐标、发现、顶点颜色等。DuckCM.png是鸭子的纹理
 *  加载这种格式时，只加载Duck.gltf。其中包含对随后将自动加载的其它文件的引用
 * 
 * glTF-Binary
 *  此格式仅由一个glb文件组成。它包含我们在上面讨论的gltf默认文件格式中的所有数据。这是一个二进制文件，不能再编辑器中打开查看它的内容
 *  由于只有一个文件，这种格式可能会更轻一些，加载起来更快，但无法轻松更改其数据。例如要调整纹理大小或压缩纹理，则无法将其与其它纹理合并，
 *  因为它位于该二进制文件中
 * 
 * glTF-Draco
 *  此格式类似于gltf默认格式，但缓冲区数据（通常是几何体）使用Draco算法进行压缩。和.bin文件大小相比，要小得多
 * 
 * glTF-Embedded
 *  此格式类似于gltf-Binary格式，因为它只有一个文件，此文件实际上是一个json，因此可以再编辑器中打开，这种格式的唯一好处是
 *  有一个易于编辑的文件，通常不会使用，因为文件大小太大
 * 
 * GLTF格式的选择
 * 如果希望能够在导出格式文件后还能更改纹理或灯光的坐标，最好使用默认的glTF格式
 * 如果只想一个模型对应一个文件，并且不关心去修改资源内容，那么最好选择 glTF-Binary 二进制格式文件
 * 这两种情况下，还得决定是否要使用Draco压缩
 * 
 */

const gltfLoader = new GLTFLoader()
gltfLoader.load(
    './static/models/Duck/gltf/Duck.gltf',
    (gltf) => {
        /*  gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        */
        console.log(gltf);
        gltf.scene.position.y = -3
 
        scene.add(gltf.scene)
        // scene.add(gltf.scene.children[0])
    },
    (xhr) => {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    (err) => {
        console.log(err, 'An error happened');
    }
)

 

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
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
