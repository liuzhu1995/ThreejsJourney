import * as THREE from 'three'
import * as dat  from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

const fogColor = '#262837'
const gui = new dat.GUI();

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const fogParams = {
    near: 1,
    far: 15
}
scene.fog = new THREE.Fog(fogColor, fogParams.near, fogParams.far );

// gui.add(fogParams, 'near').min(1).max(5).step(0.0001).onChange(() => {
//     scene.fog =  new THREE.Fog( 0xcccccc, fogParams.near, fogParams.far );
// })
// gui.add(fogParams, 'far').min(1).max(20).step(0.0001).onChange(() => {
//     scene.fog =  new THREE.Fog( 0xcccccc, fogParams.near, fogParams.far );
// })
/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()
const doorColorTexture = textureLoader.load('/static/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/static/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/static/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/static/textures/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('/static/textures/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('/static/textures/door/normal.jpg')
const doorRoughnessTexture = textureLoader.load('/static/textures/door/roughness.jpg')
const grassColor = textureLoader.load('/static/textures/grass/color.jpg')
const grassAmbientOcclusion = textureLoader.load('/static/textures/grass/ambientOcclusion.jpg')
const grassNormal = textureLoader.load('/static/textures/grass/normal.jpg')
const grassRoughness = textureLoader.load('/static/textures/grass/roughness.jpg')
/**
 * Materials
 */
// const material = new THREE.MeshBasicMaterial()
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
/**
 * Geometry
 */

const house = new THREE.Group()
 

// 房子主主体
const wall  = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 4), new THREE.MeshStandardMaterial({ color: '#ac8e82' }))
wall.position.y = 1.25

wall.castShadow = true
house.add(wall)

// 屋顶
const roof = new THREE.Mesh(new THREE.ConeGeometry(3.25, 1, 4), new THREE.MeshStandardMaterial({ color: '#b35f45' }))
roof.position.y = 3
roof.rotation.y = -Math.PI * 0.25
house.add(roof)

const doorMaterial = new THREE.MeshStandardMaterial({ 
    map: doorColorTexture, 
    alphaMap: doorAlphaTexture, 
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.05,
    normalMap: doorNormalTexture,
    roughnessMap: doorRoughnessTexture,
    metalnessMap: doorMetalnessTexture,

 })
doorMaterial.transparent = true
 
const door = new THREE.Mesh(new THREE.PlaneGeometry(2,2 ), doorMaterial)
door.position.set(0, 1, 2.001)
// aoMap 需要第二组UV，为door的几何体PlaneGeometry添加第二组uv属性
door.geometry.setAttribute('uv2', new THREE.BufferAttribute(door.geometry.attributes.uv.array, 2))
house.add(door)

gui.add(doorMaterial, 'opacity').min(0).max(10).step(0.0001)




scene.add(house)
// 灌木丛

const bushs = new THREE.Group()
 
const bushGeometry = new THREE.SphereGeometry(1, 32, 6, 0, Math.PI * 2, 0, Math.PI * 0.5)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })
const bush01 = new THREE.Mesh(bushGeometry, bushMaterial)
bush01.position.set(-3,0, 3)
bush01.scale.set(0.5, 0.5, 0.5)
bushs.add(bush01)

const bush02 = new THREE.Mesh(bushGeometry, bushMaterial)
bush02.position.set(-2, 0, 3)
bush02.scale.set(0.2, 0.2, 0.2)
bushs.add(bush02)

const bush03 = new THREE.Mesh(bushGeometry, bushMaterial)
bush03.position.set(-3, 0, 3.5)
bush03.scale.set(0.2, 0.2, 0.2)
bushs.add(bush03)

scene.add(bushs)

 

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({
     map: grassColor, 
     normalMap: grassNormal, 
     roughnessMap: grassRoughness, 
     aoMap: grassAmbientOcclusion,
     roughness: 0.7,
    }))
 
plane.rotation.x = -Math.PI * 0.5
 
plane.receiveShadow = true
scene.add(plane)

// 坟墓
const graveGemoetry = new THREE.BoxGeometry(0.6, 1, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1'})
/**
 * https://www.showapi.com/book/view/2136/16
 * 生成[n, m]范围内的随机数（大于n，小于m）
 * n + Math.random() * (m-n)
 * 正弦波也就是正弦曲线
 * Math.sin(angle)正弦曲线
 */
for (let i = 0; i < 50; i++) {
    const grave = new THREE.Mesh(graveGemoetry, graveMaterial)
    grave.castShadow = true
    //  Math.PI * 2 等于360°的弧度值
    // 生成0~360°范围内的弧度值
    const angle = Math.random() * Math.PI * 2
    // 随机生成3 ~ 9范围内的数
    const radius = 3 + Math.random() * 6.5
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
  
    grave.position.set(x, 0.4, z)

    grave.rotation.z = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
 
    scene.add(grave)
}


gui.add(bush03.position, 'x').min(-5).max(5).step(0.00001)
gui.add(bush03.position, 'y').min(-10).max(5).step(0.00001)
gui.add(bush03.position, 'z').min(-5).max(5).step(0.00001)
 
/**
 * Lights
 */

const params = {
    ambientLight: {
        color: '#b9d5ff'
    },
    directionalLight: {
        color: '#b9d5ff'
    },
    pointLight: {
        color: '#ff7d46'
    }
}
const ambientLight = new THREE.AmbientLight(params.ambientLight.color, 1)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity').min(-5).max(10).step(0.0001).name('ambientLight')
gui.addColor(params.ambientLight, 'color').onChange(() => {
    ambientLight.color.set(params.ambientLight.color)
})



const directionalLight = new THREE.DirectionalLight(params.directionalLight.color, 0.1)
 
directionalLight.position.set(7, 10, 0)
 // https://zhuanlan.zhihu.com/p/634152559
directionalLight.castShadow = false
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20
directionalLight.shadow.camera.top = 10
directionalLight.shadow.camera.right = 10
directionalLight.shadow.camera.bottom = -10
directionalLight.shadow.camera.left = -10
 

scene.add(directionalLight)

gui.add(directionalLight.position, 'x').min(-5).max(20).step(0.0001)
gui.add(directionalLight.position, 'y').min(-5).max(20).step(0.0001)
gui.add(directionalLight.position, 'z').min(-5).max(20).step(0.0001)
 
gui.add(directionalLight, 'intensity').min(-5).max(10).step(0.0001).name('directionalLight')
gui.addColor(params.directionalLight, 'color').onChange(() => {
    directionalLight.color.set(params.directionalLight.color)
})
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.00001)
gui.add(directionalLight.position, 'y').min(-10).max(5).step(0.00001)
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.00001)

const pointLight = new THREE.PointLight(params.pointLight.color, 1, 7)
pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 5
pointLight.position.x = 0
pointLight.position.y = 3
pointLight.position.z = 3
scene.add(pointLight)
gui.add(pointLight, 'intensity').min(-5).max(30).step(0.0001).name('pointLight')
gui.add(pointLight, 'distance').min(-5).max(10).step(0.00001)
gui.add(pointLight.position, 'x').min(-5).max(10).step(0.00001)
gui.add(pointLight.position, 'y').min(-10).max(10).step(0.00001)
gui.add(pointLight.position, 'z').min(-5).max(10).step(0.00001)
gui.add(pointLight.shadow.camera, 'near').min(0).max(1).step(0.00001)
gui.add(pointLight.shadow.camera, 'far').min(0).max(20).step(0.00001)

/**
 * CameraHelper
 */
const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightHelper.visible = false
scene.add(directionalLightHelper)

const pointLightHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightHelper.visible = true
scene.add(pointLightHelper)
 

/**
 * Camera
 */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 5
camera.position.y = 3
camera.position.z = 5
 
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
renderer.shadowMap.enabled = true
// 设置renderer背景色和雾的颜色一致
renderer.setClearColor(fogColor)


const tick = () => {
    controls.update()

    renderer.render(scene, camera)

    requestAnimationFrame(tick)
}

tick()
