import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1,5,5,5),  new THREE.MeshBasicMaterial({ color: '#ff0000' }))
scene.add(mesh)

/**
 * AxesHelper
 */
const axesHelper = new THREE.AxesHelper( 3 );
scene.add( axesHelper );

const sizes = {
    width: 800,
    height: 600
}
/**
 * Camera
 */
// 透视相机
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
console.log(camera.position.length());
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
controls.autoRotate = true
// 设置自动旋转速度 默认2.0
controls.autoRotateSpeed = 7
// 启用阻尼
controls.enableDamping = true
// 设置阻尼惯性 默认0.05 值越小惯性越大
controls.dampingFactor = 0.03
// 禁用摄像机平移
controls.enablePan = false
// 禁用摄像机的缩放
controls.enableZoom = false


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)


/**
 * Animation
 */
const clock = new THREE.Clock()

const tick = () => {
    // const elapsedTime = clock.getElapsedTime()

    // 让物体y轴转圈
    // mesh.rotation.y = elapsedTime

    // Update camera
    camera.position.x = Math.sin(cursor.x * Math.PI) * 3
    camera.position.z = Math.cos(cursor.x * Math.PI) * 3
    camera.position.y = cursor.y * 5
    camera.lookAt(mesh.position)
    
    // 使用three自带控件替换 Update camera
    controls.update()
 

 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 

 