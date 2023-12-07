import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
 import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

const canvas = document.querySelector(".webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()

const gui = new dat.GUI();

/**
 * Lights
 * 尽量使用最低成本的环境光和半球光，其次使用成本适中的平行光和点光源
 * 聚光灯和矩形光光源对性能影响较大，不能添加太多最多几个
 * 当真正需要大量灯光和光反射的时候，可以使用名叫“烘焙”的解决方案
 * 烘焙是将3D网格的几何特征保存到纹理文件的过程的名称。英文名叫Bake，从3D物体属性上（
 * 环境光遮蔽、法线、顶点颜色、方向、曲率、位置等）把多种组合的特性（包括材质、纹理和照明）进行
 * 烘焙为单个纹理，然后又可以使用对象UV坐标将图像纹理重新映射到模型对象
 */

const parameters = {
    ambientColor: 0xffffff,
    directionColor: 0x00fffc,
    skyColor: 0xff0000,
    groundColor: 0x0000ff,
    pointColor: 0xff0000,
    rectAreaColor: 0x4e00ff
}

// 环境光 环境光会均匀的照亮场景中的所有物体, 该灯光不能用于投射阴影
const ambientLight = new THREE.AmbientLight(parameters.ambientColor, 0.5); // 柔和的白光
scene.add( ambientLight );

gui.add(ambientLight, 'intensity').min(0).max(1).step(0.00001).name('环境光强度')
gui.addColor(parameters, 'ambientColor').name('环境光').onChange(() => {
    ambientLight.color.set(parameters.ambientColor)
})
// 平行光 平行光是向特定方向发射的光。这种光的行为就好像它是无限遥远的，并且从它产生的光线都是平行的。
// 常见用例是模拟日光；太阳离得足够远，它的位置可以被认为是无限的，所有来自它的光线都是平行的
const directionLight = new THREE.DirectionalLight(parameters.directionColor, 0.3)
scene.add(directionLight)


gui.add(directionLight, 'intensity').min(0).max(1).step(0.00001).name('平行光强度')
gui.addColor(parameters, 'directionColor').name('平行光').onChange(() => {
    directionLight.color.set(parameters.directionColor)
})
gui.add(directionLight.position, 'x').min(-10).max(10).step(0.00001)
gui.add(directionLight.position, 'y').min(-10).max(10).step(0.00001)
gui.add(directionLight.position, 'z').min(-10).max(10).step(0.00001)

// 半球光 光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。此灯光不能用于投射阴影
// skyColor 天空发出的颜色
// groundColor 地面发出的颜色
const hemisphereLLight = new THREE.HemisphereLight( parameters.skyColor, parameters.groundColor, 1 );
scene.add(hemisphereLLight)

gui.add(hemisphereLLight, 'intensity').min(0).max(1).step(0.00001).name('半球光强度')
gui.addColor(parameters, 'skyColor').onChange(() => {
    hemisphereLLight.color.set(parameters.skyColor)
})
gui.addColor(parameters, 'groundColor').onChange(() => {
    hemisphereLLight.groundColor.set(parameters.groundColor)
})
gui.add(hemisphereLLight.position, 'x').min(-1).max(1).step(0.00001)
gui.add(hemisphereLLight.position, 'y').min(-1).max(1).step(0.00001)
gui.add(hemisphereLLight.position, 'z').min(-1).max(1).step(0.00001)

// 点光源 从一个点向各个方向发射的光源，常见用例是灯泡发出的光。此灯光可以投射阴影
const pointLight = new THREE.PointLight(0xff9000, 0.5, 1)
pointLight.position.set(1, -0.5, 1)
scene.add(pointLight)

gui.addColor(parameters, 'pointColor').onChange(() => {
    pointLight.color.set(parameters.pointColor)
})
gui.add(pointLight, 'intensity').min(0).max(10).step(0.00001).name('点光源强度')
gui.add(pointLight, 'distance').min(0).max(10).step(0.00001).name('照射距离')
gui.add(pointLight.position, 'x').min(-1).max(1).step(0.00001)
gui.add(pointLight.position, 'y').min(-1).max(1).step(0.00001)
gui.add(pointLight.position, 'z').min(-1).max(1).step(0.00001)

// 平面光光源（矩形光光源）从一个矩形平面上均匀地发射光线。这种光源可以用来模拟像明亮的窗户或者条状灯光光源
const rectLight = new THREE.RectAreaLight(parameters.rectAreaColor, 2, 1, 1)
// 调整光源方向
rectLight.position.set(-1.5, 0, 1.5)
// 光源照向场景中心
rectLight.lookAt(new THREE.Vector3(0, 0, 0))
scene.add(rectLight)

gui.add(rectLight, 'intensity').min(0).max(10).step(0.00001).name("平面光源强度")
gui.add(rectLight, 'width').min(-10).max(50).step(0.00001).name("平面光宽度")
gui.add(rectLight, 'height').min(-10).max(50).step(0.00001).name("平面光高度")
gui.addColor(parameters, 'rectAreaColor').onChange(() => {
    rectLight.color.set(parameters.rectAreaColor)
})

gui.add(rectLight.position, 'x').min(-1).max(1).step(0.00001)
gui.add(rectLight.position, 'y').min(-1).max(1).step(0.00001)
gui.add(rectLight.position, 'z').min(-1).max(1).step(0.00001)


// 聚光灯 光线从一个点沿一个方向射出，随着光线照射的变远，光线圆锥体的尺寸也逐渐增大
const spotLight = new THREE.SpotLight(0x78ff00, 3, 0, Math.PI * 0.1, 0.2, 0.1)
spotLight.position.set(0, 2, 3)
scene.add(spotLight)
// 调整聚光灯位置
spotLight.target.position.set(1.5, 0, 0)
scene.add(spotLight.target)

gui.add(spotLight, 'intensity').min(0).max(10).step(0.00001).name("聚光灯光源强度")
gui.add(spotLight, 'angle').min(0).max(10).step(0.00001).name("范围")
gui.add(spotLight.position, 'x').min(-10).max(10).step(0.00001)
gui.add(spotLight.position, 'y').min(-10).max(10).step(0.00001)
gui.add(spotLight.position, 'z').min(-10).max(10).step(0.00001)


/**
 * Texture
 */

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
 
/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
 

/**
 * Geometry
 */
 const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75,0.75,0.75), material)
 

 const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
 sphere.position.x = -1.5

 const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material)
 
 torus.position.x = 1.5
 sphere.position.y = 0.1

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.65

 scene.add(cube, sphere, torus, plane)
/**
 * AxesHelper
 */
const axesHelper = new THREE.AxesHelper( 3 );
scene.add( axesHelper );

/**
 * Light Helper
 */
 
const hemisphereLightHelper = new THREE.HemisphereLightHelper( hemisphereLLight, 0.2 );
scene.add( hemisphereLightHelper );

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2 );
scene.add( pointLightHelper );

const directionalLightHelper = new THREE.DirectionalLightHelper(directionLight, 0.2)
directionalLightHelper.visible = true
scene.add(directionalLightHelper)

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );

const rectLightHelper = new RectAreaLightHelper(rectLight)
scene.add(rectLightHelper)

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

const clock = new THREE.Clock()

const tick = () => {
    // 使用three自带控件替换 Update camera
    controls.update()

    const elapsedTime = clock.getElapsedTime()
 
    cube.rotation.x = elapsedTime * Math.PI * 0.1
    cube.rotation.y = elapsedTime * Math.PI * 0.1

    sphere.rotation.x = elapsedTime * Math.PI * 0.1
    sphere.rotation.y = elapsedTime * Math.PI * 0.1

    torus.rotation.x = elapsedTime * Math.PI * 0.1
    torus.rotation.y = elapsedTime * Math.PI * 0.1
    

    renderer.render(scene, camera)
   
    requestAnimationFrame(tick)
}


tick()
 

 