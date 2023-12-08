import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16)

const sphere01 = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial())
sphere01.position.y = Math.PI * 0.5
const sphere02 = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial())
sphere02.position.x = -2
sphere02.position.y = Math.PI * 0.5
const sphere03 = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), new THREE.MeshBasicMaterial())
sphere03.position.set(0, 2, 2)
scene.add(sphere01, sphere02, sphere03)

/**
 * Raycaster 光线投射
 * https://threejs.org/docs/#api/zh/core/Raycaster
 * Raycaster( origin : Vector3, direction : Vector3, near : Float, far : Float )
 * origin —— 光线投射的原点向量
 * direction —— 向射线提供方向的方向向量，应当被标准化（单位向量化.normalize()）
 * near —— 返回的所有结果比near远。near不能为负值，其默认值为0
 * far —— 返回的所有结果都比far近。far不能小于near，其默认值为Infinity（正无穷）
 */
// 射线原点
const rayOrigin = new THREE.Vector3(-3, 0, 0)
// 射线方向
const rayDirection = new THREE.Vector3(6, 0, 0)
// // 将该向量转换为单位向量（unit vector）， 也就是说，将该向量的方向设置为和原向量相同，但是其长度（length）为1
rayDirection.normalize()
// const raycaster = new THREE.Raycaster(rayOrigin, rayDirection)

const raycaster = new THREE.Raycaster()
const testObjects = [sphere01, sphere02, sphere03]
// // 检查与射线相交的物体
// const intersect = raycaster.intersectObject(testObjects)
// console.log(intersect);
// // 检测和射线相交的一组物体
// const intersects = raycaster.intersectObjects(testObjects)
 

/**
 * Helper
 */
// 可视化射线
const rayHelper = new THREE.ArrowHelper(
    raycaster.ray.direction,
    raycaster.ray.origin,
    6,
    0xff0000,
    0.5, 
    0.2
)
scene.add(rayHelper)
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
camera.position.z = 5
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
 

const clock = new THREE.Clock()

/**
 * .setFromCamera ( coords : Vector2, camera : Camera ) : undefined
 * coords —— 在标准化设备坐标中鼠标的二维坐标 —— X分量与Y分量应当在-1到1之间
 * camera —— 射线所来源的摄像机
 * 使用一个新的原点和方向来更新射线
 */
let currentInsersect = null
const tick = () => {
    const elapseTime = clock.getElapsedTime()

    sphere01.position.y = Math.sin(elapseTime * Math.PI * 0.8)
    sphere02.position.y = Math.sin(elapseTime * Math.PI * 0.5)
    sphere03.position.y = Math.sin(elapseTime * Math.PI * 0.25)
 

    // 通过摄像机和鼠标位置更新射线
	raycaster.setFromCamera(pointer, camera);
   
    // 计算物体和射线的焦点
	const intersects = raycaster.intersectObjects(testObjects);
    scene.children.forEach(item => {
        if (item.type === 'Mesh') {
            item.material.color.set(0x6af7)
        }
    })

    intersects.forEach(item => {
        item.object.material.color.set(0xd22c97)
    })
 

    // 监听鼠标移入移出
    if (intersects.length > 0) {
        if (!currentInsersect) {
            console.log('mouseenter');
        }
        currentInsersect = intersects[0]
    } else {
        if (currentInsersect) {
            console.log('mouseleave');
        }
        currentInsersect = null
    }
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

/**
 * 使用鼠标光线投射。可以使用光线投射来测试是否再鼠标下面，为此我们需要的是鼠标的坐标，一个在水平轴和垂直轴上范围从-1到1的值。
 * 因为鼠标只在屏幕移动，所以使用Vector2来创建鼠标的变量，并监听鼠标移动事件，并获取鼠标位置
 * 因为需要水平方向向左往右和垂直方向由下往上的值范围始终在[-1,1]的区间内，因此需要对鼠标坐标位置进行标准化
 */
const pointer = new THREE.Vector2()
const onPointerMove = (event) => {
    // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    pointer.x = ( event.clientX / sizes.width ) * 2 - 1;
    pointer.y = - ( event.clientY / sizes.height ) * 2 + 1;
}
 
window.addEventListener('pointermove', onPointerMove)

window.addEventListener('click', (event) => {
    pointer.x = ( event.clientX / sizes.width ) * 2 - 1;
    pointer.y = - ( event.clientY / sizes.height ) * 2 + 1;
  
    console.log(currentInsersect, 'click');
    if (currentInsersect) {
        switch (currentInsersect.object) {
            case sphere01:
                console.log('sphere01');
                break;
            case sphere01:
                console.log('sphere02');
                break;
            case sphere01:
                console.log('sphere03');
                break;  
        }
    }
})


tick()
 
/**
 * DeBug
 * dat.gui
 */
//关联空间数据创建交互界面
const gui = new dat.GUI();
// const folder = gui.addFolder('菜单')
 
const parameters = {
    color: 0x2c7ad2,
    spin: () => {
        gsap.to(mesh.rotation, { duration: 5, y: mesh.rotation.y + Math.PI * 2})
    },
  
}

gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color)
}).name('材质颜色')
gui.add(parameters, 'spin')
 