import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'

/**
 * DeBug
 * dat.gui
 */
//关联空间数据创建交互界面
const gui = new dat.GUI();
// const folder = gui.addFolder('菜单')
 
 
 /**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
 


/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()

/**
 * Loading
 */
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => {
    console.log('loadingStart');
}
loadingManager.onLoad = () => {
    console.log('loadingLoad');
    const loading = document.querySelector('#loading')
    loading.computedStyleMap.opacity = 0
    setTimeout(() => {
        loading.style.display = 'none'
    }, 300)

}
loadingManager.onProgress = () => {
    console.log('loadingProgress');
}
loadingManager.onError = () => {
    console.log('loadingError');
}
/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader(loadingManager)
const gradientTexture = textureLoader.load('/static/textures/gradients/5.jpg')
gradientTexture.magFilter = THREE.NearestFilter
 
/**
 * Objects
 */

const objectDistance = -4

const material = new THREE.MeshToonMaterial({ color: 0xc0c0c0, gradientMap: gradientTexture })
const torus = new THREE.Mesh( new THREE.TorusGeometry(0.5, 0.2, 12, 48), material)
torus.position.set(1, 0, 0)
const terahedron = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), material)
terahedron.position.set(-2, 1 * objectDistance, 0)
const trousKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.2, 64, 16), material)
trousKnot.position.set(1, 2 * objectDistance, 0)
scene.add(torus, terahedron, trousKnot)

// 设置几何体在y轴上的位置
// torus.scale.set(0.2,0.2, 0.2)
// terahedron.scale.set(0.2, 0.2, 0.2)
// trousKnot.scale.set(0.2, 0.2, 0.2)
// torus.position.y = 2
// terahedron.position.y = 0
// trousKnot.position.y = -2

/**
 * Points
 */
 
const particlesTexture01 = textureLoader.load('/static/textures/particles/1.png')
const particlesTexture02 = textureLoader.load('/static/textures/particles/2.png')
const particlesTexture03 = textureLoader.load('/static/textures/particles/3.png')
const particlesTexture04 = textureLoader.load('/static/textures/particles/4.png')
const particlesTexture05 = textureLoader.load('/static/textures/particles/5.png')
const particlesTexture06 = textureLoader.load('/static/textures/particles/6.png')
const particlesTexture07 = textureLoader.load('/static/textures/particles/7.png')
const particlesTexture08 = textureLoader.load('/static/textures/particles/8.png')
const particlesTexture09 = textureLoader.load('/static/textures/particles/9.png')
const particlesTexture10 = textureLoader.load('/static/textures/particles/10.png')
const particlesTexture11 = textureLoader.load('/static/textures/particles/11.png')
const particlesTexture12 = textureLoader.load('/static/textures/particles/12.png')
const particlesTexture13 = textureLoader.load('/static/textures/particles/13.png')
const vertices = []

for (let i = 0; i < 200; i++) {
    const x = THREE.MathUtils.randFloatSpread(10)
    const y = THREE.MathUtils.randFloat(objectDistance * 3, 2.5)
    const z = THREE.MathUtils.randFloatSpread(10)

    vertices.push(x, y, z)
}
const pointGeometryBuffer = new THREE.BufferGeometry()
pointGeometryBuffer.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
const pointMaterial = new THREE.PointsMaterial({ size: 0.05, transparent: true, depthWrite: false, alphaMap: particlesTexture06, opacity: 4,})
const points = new THREE.Points(pointGeometryBuffer, pointMaterial)
scene.add(points)
/**
 * Lights
 */
const parameters = {
    directionColor: 0xffffff
}
const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // 柔和的白光
const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(1.5, 1, 1)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 2
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
scene.add(ambientLight)
scene.add(directionalLight)
scene.add(directionalLight.target)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.00001).name('平行光强度')
gui.addColor(parameters, 'directionColor').name('平行光').onChange(() => {
    directionalLight.color.set(parameters.directionColor)
})
gui.add(directionalLight.position, 'x').min(-10).max(10).step(0.00001)
gui.add(directionalLight.position, 'y').min(-10).max(10).step(0.00001)
gui.add(directionalLight.position, 'z').min(-10).max(10).step(0.00001)
 

/**
 * Camera Helper
 */
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

/**
 * Light Helper
 */
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
directionalLightHelper.visible = false
scene.add(directionalLightHelper)



/**
 * Camera
 */
//之前已经设置过了滚动时移动相机位移，不能覆盖这个位移，所以可以用一个取巧的方式，给相机增加一个 group，移动 group 达到再增加一个位移的效果
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
// 透视相机
// 参数2aspect-> 摄像机视锥体长宽比
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
// 设置相机看向物体的中心位置
// camera.lookAt(group.position)
scene.add(camera)
cameraGroup.add(camera)

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
renderer.setClearColor('#263238')
 
/**
 * https://www.showapi.com/book/view/2136/20
 * 缓动公式：
 *  1.为运动确定一个小于1且大于0的小数作为比例系数(easing)
 *  2.确定目标点
 *  3.计算物体与目标点的距离
 *  4.计算速度，速度 = 距离 * 比例系数
 *  5.用当前位置加上速度来计算新的位置
 *  6.不断重复第3步到第5步，直到物体到达目标点
 * 缓动的整个过程并不复杂，需要知道距离（物体与目标点（target）之间，变化值）、比例系数（easing，速度除以距离）
 * vx：x轴速度，vy：y轴速度
 * dx：x轴距离，dy：y轴距离
 * dx = targetX - ball.x;
 * dy = targetY - ball.y;
 * easing = vx / dx;  =>   vx = dx * easing;
 * easing = vy / dy;  =>   vy = dy * easing;
 * ball.x += vx => ball.x += dx * easing; => ball.x += (targetX - ball.x) * easing;
 * ball.y += vy => ball.y += dy * easing; => ball.y += (targetY - ball.y) * easing;
 * 最终缓动公式为：
 * ball.x += (targetX - ball.x) * easing;
 * ball.y += (targetY - ball.y) * easing;
 */
const clock = new THREE.Clock()
let previousTime = 0
const objectList = [torus, terahedron, trousKnot]
const tick = () => {
    // 获取自时钟启动后的秒数，同时将 .oldTime 设置为当前时间
    const elapsedTime = clock.getElapsedTime();
 
    // deltaTime 为比例系数 easing
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    console.log(elapsedTime, previousTime);

    objectList.forEach(mesh => {
        mesh.rotation.x = elapsedTime * Math.PI * 0.1
        mesh.rotation.y = elapsedTime * Math.PI * 0.12
    })
   
    // 滚动页面设置相机位移
    camera.position.setY(-window.scrollY / sizes.height * 4)
 
    if (pointer.x && pointer.y) {
        // 增加缓动效果，实现弹性阻尼物理效果
        // 通过 deltaTime 来进行增量位移。需要特别注意的是不能在同一个 requestAnimationFrame 里同时使用 getElapsedTime 和 getDelta。因为 getElapsedTime 里也调用了 getDelta
        cameraGroup.position.x +=  (pointer.x  * 0.5 - cameraGroup.position.x) * deltaTime * 5
        cameraGroup.position.y +=  (pointer.y * 0.5  - cameraGroup.position.y) * deltaTime * 5
    }
    

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}
const pointer = {
    x: 0, y: 0,
}
window.addEventListener('mousemove', (event) => {
     // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
     pointer.x = (event.clientX / sizes.width) * 2 - 1;
     pointer.y = -(event.clientY / sizes.height) * 2 + 1;
})
let currentSection = 0
window.addEventListener('scroll', (event) => {
     // 滚动到区域时触发的动画
     const newSection = Math.round(window.scrollY / sizes.height)
     console.log(newSection);

     if (currentSection !== newSection) {
        currentSection = newSection
        // // 要生效要注释掉tick()中几何体的自传方法
        // gsap.to(objectList[currentSection].rotation, {
        //     duration: 1,
        //     ease: 'power1.inOut',
        //     x: '+=6',
        //     y: '+=3'
        // })
     }
})
tick()
