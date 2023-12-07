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
 

/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()
 

 
 
const parameters = {
    count: 10000,
    radius: 5,
    size: 0.01,
    branches: 3,
    spin: 1, // 螺旋
    clear: false,
    color: 0xffb400,
    randomess: 0.2, // 随机性
    randomessPower: 3, //随机性幂参数
    insideColor: 0x4bff00 , // 外颜色
    outsideColor: 0xffb400, // 内颜色
}
let points = null
let material = null
let bufferGeometry = null

/**
 * https://blog.csdn.net/weixin_43990650/article/details/121747713
 * 分支角度：先确定分支角度，因为只有三条分支，所以分支的角度就是0°、120°、240°。借助i%3不断循环得到0、1、2三个值
 * 然后将之除以3，再乘2n，便可得到三分之一的所需要的角度。在之后通过三角函数设置每个顶点的x和z坐标，再乘以半径
 */

const generatorGalaxy = () => {
   
    if (points) {
        bufferGeometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    const vertices = []
    const colors = []
    bufferGeometry = new THREE.BufferGeometry()
    material = new THREE.PointsMaterial({ size: parameters.size, depthWrite: false, color: parameters.color, vertexColors: true })
 
    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        // 粒子半径，在区间0~radius内随机一个浮点数
        const radius = THREE.MathUtils.randFloat(0, parameters.radius)
        // 分支角度
        //  Math.PI * 2 等于360°的弧度值
        // 0 / 3 * 360° = 0
        // 1 / 3 * 360° = 120°
        // 2 / 3 * 360° = 240°
        const branchesAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2
        //螺旋角度
        const spinAngle  = radius * parameters.spin 
 
        // 线性增长曲线的分布形态
        // const randomessX = (Math.random() - 0.5) * parameters.randomess
        // const randomessY =(Math.random() - 0.5) * parameters.randomess
        // const randomessZ = (Math.random() - 0.5) * parameters.randomess

        // 指数增长曲线的分布形态
        const randomessX = Math.pow(Math.random(), parameters.randomessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomessY = Math.pow(Math.random(), parameters.randomessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomessZ = Math.pow(Math.random(), parameters.randomessPower) * (Math.random() < 0.5 ? 1 : -1)
        
        const x = Math.cos(branchesAngle + spinAngle) * radius  + randomessX
        const y = 0 + randomessY
        const z = Math.sin(branchesAngle + spinAngle) * radius + randomessZ

        vertices.push(x, y, z)

        // 拷贝外部颜色，防止lerp改变原有的颜色
        const mixedColor = insideColor.clone()
        console.log(mixedColor, 'mixedColor');

        // 将该颜色的RGB值线性插值到传入参数的RGB值。alpha参数可以被认为是两种颜色之间的比例值，其中0是当前颜色和1.0是第一个参数的颜色
        // radius / parameters.radius。越趋于星系中心颜色越趋于insideColor，越远离星系中心，粒子颜色越趋近于outsideColor。
        // 粒子半径/星系半径，比例越小越趋于0，颜色趋于内颜色。比例越大越趋于1，颜色越趋于外颜色
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        // 将该颜色设置为线性插值颜色 color1 和 color2 - 在此 alpha 是连接两种颜色的直线百分比距离 alpha = 0 时为 color1， alpha = 1 时为 color2
        // mixedColor.lerpColors(insideColor, outsideColor, radius / parameters.radius)
      
       
        colors.push(mixedColor.r, mixedColor.g, mixedColor.b)
    }
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    points = new THREE.Points(bufferGeometry, material)
    scene.add(points)
}

generatorGalaxy()
gui.addColor(parameters, 'color').onChange(generatorGalaxy)
gui.add(parameters, 'size').min(0.01).max(0.1).step(0.00001).onChange(generatorGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generatorGalaxy).name('星系分支')
gui.add(parameters, 'spin').min(1).max(5).step(1).step(0.0001).onFinishChange(generatorGalaxy).name('螺旋')
gui.add(parameters, 'radius').min(0).max(5).step(0.001).onFinishChange(generatorGalaxy).name('半径')
gui.add(parameters, 'randomess').min(0).max(5).onFinishChange(generatorGalaxy).name('随机性')
gui.add(parameters, 'randomessPower').min(0).max(5).onFinishChange(generatorGalaxy).name('随机性幂')
gui.addColor(parameters, 'insideColor').onChange(generatorGalaxy)
gui.addColor(parameters, 'outsideColor').onChange(generatorGalaxy)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
 


/**
 * Camera
 */
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
// 设置相机看向物体的中心位置
// camera.lookAt(group.position)
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
 
gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed').min(1).max(100).step(1)
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

const clock = new THREE.Clock()
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
