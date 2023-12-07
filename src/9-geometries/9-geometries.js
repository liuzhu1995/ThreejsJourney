import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// geometry 几何图形
const canvas = document.querySelector(".webgl")
/**
 * Cursor
 */

const cursor = {
    x: 0,
    y: 0,
}
canvas.addEventListener('mousemove', (event) => {
    const { clientX, clientY } = event
    cursor.x = clientX / sizes.width - 0.5
    cursor.y = -(clientY / sizes.height - 0.5)
})

/**
 * Scene
 */ 
const scene = new THREE.Scene()

/**
 * Mesh
 */
const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1,5,5,5),  new THREE.MeshBasicMaterial({ color: '#2c7ad2', wireframe: true }))
scene.add(mesh)

// BufferGeometry 
// 使用顶点数据渲染三角形几何体
const positionArray = new Float32Array([
    0, 0,  0,  // 顶点1位置 (x, y, z)
	0, -1, 0,  // 顶点2位置
	1, 0, 0,   // 顶点3位置

    // -10, 0, 0, // 0     
    // 10, 0, 0, // 1     
    // 0, 10, 0, // 2     
    // 0, 0, 5, // 3     
    // 0, 10, 5, // 4     
    // 0, 0, 15 
])
const positionAttribute = new THREE.BufferAttribute(positionArray, 3)

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', positionAttribute)
const mesh2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
scene.add(mesh2)
mesh2.position.z = 1.0

// 使用BufferGeometry渲染多个三角形
const count = 500
// 3 * 3 一个三角形的坐标 * 50 渲染50个三角形
const positionArray02 = new Float32Array(count * 3 * 3)

for (let i = 0; i < count * 3 * 3; i++) {
    positionArray02[i] = (Math.random() - 0.5) * 2
}
const positionAttribute02 = new THREE.BufferAttribute(positionArray02, 3)
const geometry02 = new THREE.BufferGeometry()
geometry02.setAttribute('position', positionAttribute02)
const mesh3 = new THREE.Mesh(geometry02, new THREE.MeshBasicMaterial({  color: 0xff0000, wireframe: true }))
scene.add(mesh3)
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

// 正交相机
// const aspectRation = sizes.width / sizes.height
// const camera = new THREE.OrthographicCamera(
//     -1 * aspectRation,
//     1 * aspectRation,
//     1,
//     -1,
//     1,
//     100
// );

// camera.position.x = 2
// camera.position.y = 2
camera.position.z = 3
camera.lookAt(mesh.position)
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
controls.enablePan = false
// 禁用摄像机的缩放
// controls.enableZoom = false
 

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

/**
 * Animation
 */
// const clock = new THREE.Clock()

const tick = () => {
    // const elapsedTime = clock.getElapsedTime()

    // 让物体y轴转圈
    // mesh.rotation.y = elapsedTime

    // Update camera
    camera.position.x = Math.sin(cursor.x * Math.PI) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI) * 3
    // camera.position.y = cursor.y * 5
    camera.lookAt(mesh.position)
    
    // 使用three自带控件替换 Update camera
    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 

 