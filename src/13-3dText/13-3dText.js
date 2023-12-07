import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
 
// https://www.ilithya.rocks/
const canvas = document.querySelector(".webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()

const gui = new dat.GUI();


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/static/textures/matcaps/3.png')
/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load('/static/fonts/helvetiker_regular.typeface.json', (font) => {
    console.log(font);
    const bevelThickness = 0.03
    const bevelSize = 0.02
    const textGeometry  = new TextGeometry('Hello three.js', {
        font: font,
		size: 0.5,
		height: 0.2,
		curveSegments: 1,
		bevelEnabled: true,
		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelSegments: 1,
        bevelOffset: 0,
    })

    // Three.js 会选择使用球形边界包裹物体，我们需要手动将其转换为盒型边界
    // textGeometry.computeBoundingBox()
    
    // 通过 textGeometry.boundingBox 属性，我们可以获得物体在 x，y，z 轴上的长度
    // 这三个长度挂载在 min 和 max 属性上
    // textGeometry.translate(
    //     -(textGeometry.boundingBox.max.x - bevelSize) * 0.5,
    //     -(textGeometry.boundingBox.max.y - bevelSize) * 0.5,
    //     -(textGeometry.boundingBox.max.z - bevelThickness) * 0.5,
    //     // bevelSize,
    //     // bevelSize,
    //     // bevelThickness
    // )
    // 作用和上面一样 居中
    textGeometry.center()

    const parameters = {
        color: 0xff00f0
    }
    const material = new THREE.MeshMatcapMaterial()
    material.wireframe = false
    material.matcap = matcapTexture
    material.color.set(parameters.color)
    const text = new THREE.Mesh(textGeometry, material)
    scene.add(text)

    console.time('donuts')
  
    // 添加圆环几何体
    const donutsGeometry = new THREE.TorusGeometry(0.2, 0.05, 20, 48)
    // 添加立方体
    const cubeGeometry = new THREE.BoxGeometry(0.2,0.2,0.2)
   
    
    for (let i = 0; i < 200; i++) {
        const donuts = new THREE.Mesh(donutsGeometry, material)
        createGeometry(scene, donuts)

        // const cube = new THREE.Mesh(cubeGeometry, material)
        // createGeometry(scene, cube)
    }

    console.timeEnd('donuts')


   
   
    gui.add(material, 'bumpScale').min(0).max(1).step(0.0001)
    gui.addColor(parameters, 'color').onChange(() => {
        material.color.set(parameters.color)
    })
})

function createGeometry(scene, geometry) {
    geometry.position.x = (Math.random() - 0.5) * 10
    geometry.position.y = (Math.random() - 0.5) * 10
    geometry.position.z = (Math.random() - 0.5) * 10

    const scale = Math.random()
    geometry.scale.set(scale, scale, scale)
    scene.add(geometry)
}
 

/**
 * AxesHelper
 */
const axesHelper = new THREE.AxesHelper( 3 );
scene.add( axesHelper );

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)
// 设置相机看向物体的中心位置



// camera.position.y = 1
// camera.position.x = 1

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
controls.enableDamping = true


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


/**
 * Animation
 */

const tick = () => {
    // 使用three自带控件替换 Update camera
    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 

 