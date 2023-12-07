/*
 * @Author: liuzhu liuzhu@synland.com
 * @Date: 2023-10-30 09:42:47
 * @LastEditors: liuzhu liuzhu@synland.com
 * @LastEditTime: 2023-10-30 11:40:11
 * @FilePath: \exercise\src\10-debugUi.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


/**
 * DeBug
 * dat.gui
 */
//关联空间数据创建交互界面
const gui = new dat.GUI();
// const folder = gui.addFolder('菜单')
const clock = new THREE.Clock()
const parameters = {
    color: 0x2c7ad2,
    spin: () => {
        console.log('spin');
        // gsap.to(mesh.position,  { duration: 1, delay: 1, x: 2 })
        // gsap.to(mesh.position, { duration: 1, delay: 2, x: 0 })
        // const elapsedTime = clock.getElapsedTime()
        gsap.to(mesh.rotation, { duration: 5, y: mesh.rotation.y + Math.PI * 2})
    },
  
}

gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color)
})
gui.add(parameters, 'spin')
 


/**
 * Base
 */
const canvas = document.querySelector(".webgl")


/**
 * Scene
 */ 
const scene = new THREE.Scene()

/**
 * Mesh
 */
const geometry = new THREE.BoxGeometry(1,1,1,5,5,5)
const material = new THREE.MeshBasicMaterial({ color: parameters.color, wireframe: false })
const mesh = new THREE.Mesh(geometry,  material)
scene.add(mesh)

// Debug
// add(object. property, min, max, step)
gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('Y轴')
gui.add(mesh.position, 'x').min(-3).max(3).step(0.01).name('X轴')
gui.add(mesh.position, 'z').min(-3).max(3).step(0.01).name('Z轴')
gui.add(mesh, 'visible')
gui.add(material, 'wireframe')

 
 
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
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
// 设置相机看向物体的中心位置
camera.lookAt(mesh.position)
scene.add(camera)

 

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


const tick = () => {
    
    // 使用three自带控件替换 Update camera
    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 

 