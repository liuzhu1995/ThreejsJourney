import * as THREE from 'three'
import * as dat  from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls'



const canvas = document.querySelector('canvas.webgl')

const gui = new dat.GUI();


/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
// 烘焙投影, shadow 被集成在纹理中，直接贴图到材质中使用
// 缺点是投影的固定的，不能随着物体或光照的移动而实时渲染
const bakedShadowTexture = textureLoader.load('/static/textures/bakedShadow.jpg')
const simpleShadowTexture = textureLoader.load('/static/textures/simpleShadow.jpg')


/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
// material.side = THREE.DoubleSide
 


/**
 * Geometry
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), material)
// 投射阴影
sphere.castShadow = true
 
// plane
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material)
// 使用烘焙投影要设置 renderer.shadowMap.enabled = false
// const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshStandardMaterial({ map: bakedShadowTexture }))

plane.rotation.x = -Math.PI * 0.5
plane.position.y = -0.5
// 接收阴影
plane.receiveShadow = true
scene.add(sphere, plane)

// alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）。 默认值为null
const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({
    color: '0xa2d724',
    transparent: true, // 定义此材质是否透明
    alphaMap: simpleShadowTexture
}))
shadowPlane.rotation.x = -Math.PI * 0.5
shadowPlane.position.y = plane.position.y + 0.01
scene.add(shadowPlane)

 
/**
 * Lights
 */

/**
 * 当你进行一次渲染时，threejs将为每个支持阴影的灯光进行渲染，DirectionalLight 可以投射阴影，假如场景中有可以投射阴影的光，
 * 在渲染的时候threejs还将为此灯光进行一次渲染，那些光渲染将模拟光所看到的一切。在这些光纤渲染过程中，这些材质将被网格深度材质替换（MeshDepthMaterial）
 * 然后将灯光渲染存储在纹理中，我们称之为阴影贴图，阴影贴图只是光可以看到的纹理。然后将这些阴影贴图用于可以接收阴影的每种几何体材质上
 * 
 * threejs中只有 PointLight 、DirectionalLight、spotLight这三种灯光能激活阴影
 */

const parameters = {
    ambientLightColor: 0xffffff,
    directionalLightColor: 0xffffff,
    spotLightColor: 0xffffff
}

// AmbientLight
const ambientLight = new THREE.AmbientLight(parameters.ambientLightColor, 0.3)

scene.add(ambientLight)
 
// DirectionalLight
const directionalLight = new THREE.DirectionalLight(parameters.directionalLightColor, 0.3)
directionalLight.position.x = 1.5
directionalLight.castShadow = true
// 设置灯光的阴影属性
// 使用 shadow.mapSize 设置更大尺寸，可以让投影贴图清晰度更高，看起来投影效果更好
directionalLight.shadow.mapSize.width = 1024 / 4 // 默认值512 必须使用2的幂值
directionalLight.shadow.mapSize.height = 1024 / 4  // 默认值512 // 必须使用2的幂值
// 减小振幅 设置相机范围
directionalLight.shadow.camera.top = 0.5
directionalLight.shadow.camera.right = 0.5
directionalLight.shadow.camera.bottom = -0.5
directionalLight.shadow.camera.left = -0.5
// 设置near和far属性,虽然不能提高渲染的效果或性能，但它能修复看不到阴影或阴影突然被裁剪的错误
directionalLight.shadow.camera.near = 1;   
directionalLight.shadow.camera.far = 4;  
// 设置摄像机的缩放倍数，其默认值为1
// directionalLight.shadow.camera.zoom = 10
scene.add(directionalLight)
scene.add(directionalLight.target)
 

// SpotLight 聚光灯-光线从一个点沿一个方向射出，随着光线照射的变远，光线圆锥体的尺寸也逐渐增大
const spotLight = new THREE.SpotLight(parameters.spotLightColor)
// 光照强度
spotLight.intensity = 0.3
// 如果非零，那么光强度将会从最大值当前灯光位置处按照距离线性衰减到0. 默认为0.0
spotLight.distance = 10
// 光线散射角度, 最大为Math.PI/2
spotLight.angle = Math.PI * 0.3
// 聚光锥的半影衰减百分比。在0和1之间的值。 默认值 0.0
spotLight.penumbra = 0
// 沿着光照距离的衰减量 设置为等于2将实现现实世界的光衰减 默认1
spotLight.decay = 1

// 此属性设置为 true 聚光灯将投射阴影。
// 警告: 这样做的代价比较高而且需要一直调整到阴影看起来正确。
// 不是所有的光源都可以投射阴影,这里使用聚点光源可以产生阴影
spotLight.castShadow = true
// 优化点光源阴影
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.fov = 30
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 5
spotLight.position.set(0,2,2)
scene.add(spotLight)
scene.add(spotLight.target)

gui.addColor(parameters, 'spotLightColor').onChange(() => {
    spotLight.color.set(parameters.spotLightColor)
})

// PointLight 点光源
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
 
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5
pointLight.position.set(-1, 1, 0)
scene.add(pointLight)

 

/**
 * CameraHelper
 * 灯光激活阴影后，使用正交相机进行投影
 * 给阴影对象的正交相机添加相机视椎体辅助对象
 */

const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
directionalLightHelper.visible = false
scene.add(directionalLightHelper);

const spotLightHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightHelper.visible = false
scene.add(spotLightHelper)

const pointLightHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightHelper.visible = true
scene.add(pointLightHelper)
 
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


const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
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
 

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// 表示渲染器支持阴影
renderer.shadowMap.enabled = false
/**
 * 投影算法
 * BasicShadowMap 能够给出没有经过过滤的阴影映射 —— 速度最快，但质量最差
 * PCFShadowMap 为默认值，使用Percentage-Closer Filtering (PCF)算法来过滤阴影映射
 * PCFSoftShadowMap 和PCFShadowMap一样使用 Percentage-Closer Filtering (PCF) 算法过滤阴影映射，但在使用低分辨率阴影图时具有更好的软阴影
 * VSMShadowMap 使用Variance Shadow Map (VSM)算法来过滤阴影映射。当使用VSMShadowMap时，所有阴影接收者也将会投射阴影
 */
renderer.shadowMap.type = THREE.PCFSoftShadowMap



const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // 旋转
    // sphere.rotation.x = elapsedTime * Math.PI * 0.2
    // sphere.rotation.y = elapsedTime * Math.PI * 0.2

     // x->cos y->sin 结合使用会使物体像是在做圆形运动
    // 在z轴前后移动
    sphere.position.z = Math.sin(elapsedTime)  * 1.5
    // 在x轴前后移动
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    // 在y轴上下移动
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 2))

    // 设置球体阴影贴图位置，阴影贴图跟随球体
    shadowPlane.position.x = sphere.position.x
    shadowPlane.position.z = sphere.position.z
    // 阴影根据球体高度变化，贴图的透明度也有所改变
    // 球体距离平面越高，阴影越透明
    shadowPlane.material.opacity = (1 - Math.abs(sphere.position.y)) * 0.3

    controls.update()
    renderer.render(scene, camera)


    requestAnimationFrame(tick)
}

tick()