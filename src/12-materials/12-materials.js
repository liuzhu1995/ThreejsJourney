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
 
const parameters = {
    color: 0x2c7ad2,
    spin: () => {
        console.log('spin');
     
        gsap.to(mesh.rotation, { duration: 5, y: mesh.rotation.y + Math.PI * 2})
    },
  
}

gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color)
}).name('材质颜色')
gui.add(parameters, 'spin')
 

/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl")

/**
 * Scene
 */ 
const scene = new THREE.Scene()
/**
 * Texture
 */
// TextureLoader 加载静态图像纹理
const textureLoader = new THREE.TextureLoader()
// CubeTextureLoader 用于加载立方体贴图纹理
const cubeTextureLoader = new THREE.CubeTextureLoader()
const doorColorTxture = textureLoader.load('/static/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/static/textures/door/alpha.jpg')
const doorMetalnessTexture = textureLoader.load('/static/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/static/textures/door/roughness.jpg')
const doorNormalTexture = textureLoader.load('/static/textures/door/normal.jpg')

// 在minFilter（最小滤波器）上使用NearestFilter（最近滤波器）时， 不需要MIP映射
// 关闭MIP映射提高性能
doorColorTxture.generateMipmaps = false
doorColorTxture.minFilter = THREE.NearestFilter
doorColorTxture.magFilter = THREE.NearestFilter

const environmentMapTexture = cubeTextureLoader.setPath('/static/textures/environmentMaps/').load([
    // '0/px.jpg',
    // '0/nx.jpg',
    // '0/py.jpg',
    // '0/ny.jpg',
    // '0/pz.jpg',
    // '0/nz.jpg',
    
    '1/px.jpg',
    '1/nx.jpg',
    '1/py.jpg',
    '1/ny.jpg',
    '1/pz.jpg',
    '1/nz.jpg',
])
const matcaps1 = textureLoader.load('/static/textures/matcaps/1.png')
const matcaps2 = textureLoader.load('/static/textures/matcaps/2.png')
const matcaps3 = textureLoader.load('/static/textures/matcaps/3.png')
const matcaps4 = textureLoader.load('/static/textures/matcaps/4.png')
const matcaps5 = textureLoader.load('/static/textures/matcaps/5.png')
const matcaps6 = textureLoader.load('/static/textures/matcaps/6.png')
const matcaps7 = textureLoader.load('/static/textures/matcaps/7.png')
const matcaps8 = textureLoader.load('/static/textures/matcaps/8.png')

const simpleShadowTexture = textureLoader.load('/static/textures/simpleShadow.jpg')
const gradientTexture = textureLoader.load('/static/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter
/**
 * Objects
 */

/**
 * https://zhuanlan.zhihu.com/p/617236478?utm_id=0
 * material 属性
 *  .map 颜色贴图，用于添加纹理贴图。非常常用，用于添加「颜色纹理（Color Texture）」（也称为反照率纹理（Albedo Texture）），给物体表面添加图案，细节或者其他颜色纹理
 * .color 材质的颜色（Color），默认值为白色（0xffffff）
 * .wireframe: boolean 线框
 * .opacity: Float。值为0.0 ~ 1.0 的范围内的浮点数，表明材质的透明度。值0.0表示完全透明，1.0表示完全不透明
 *          transparet 如果值设置为false，则材质将保持完全不透明，此值仅影响其颜色。默认值为1.0
 * .transparent: Boolean。定义材质是否透明。这对渲染有影响，因为透明对象需要特殊处理，并在非透明对象之后渲染。
 *          设置为true时，通过设置材质的 opacity 属性来控制材质透明的程序。默认值为false
 * .alphaMap: Texture。alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）默认null。alphaMap（比较常用）用于添加「透明度纹理（Alpha Texture）」实现透明效果
 * .specularMap（比较常用）用于添加「镜面高光纹理（Specular Texture）」，调整物体的反射和高光效果，增强物体的光照效果
 * .normalMap（比较常用）用于添加「法线纹理（Normal Texture）」，给物体表面添加细节和深度感
 * .displacementMap（_不常用_）用于添加「高度纹理（Height Texture）」，使物体表面产生凸起或凹陷的效果
 */
// MeshBasicMaterial 基础材质是最简单的材质类型，它不受光照影响。适用于创建不需要光照效果的物体，例如背景、2D 图形等。它的参数包括颜色、透明度、贴图等。
// const material = new THREE.MeshBasicMaterial()

// material.color.set('red')
// material.map = doorColorTxture
// 当使用Alpha和opacity不透明度时，transparent必须为true
// material.transparent = true
// material.opacity = 0.5
// material.alphaMap = doorAlphaTexture

/**
 * 定义将要渲染哪一面 - 正面，背面或两者。 默认为 THREE.FrontSide
 * THREE.BackSide 侧面。如果要将相机放在一个立方体内，看其内部，如现在比较流行的3d看房，那么就需要将其设置为 THREE.BackSide
 * THREE.DoubleSide 双面(避免使用会增加GPU和计算机的计算量)
 */
// material.side = THREE.DoubleSide

/**
 * MeshNormalMaterial 法线材质
 * 会将顶点法线向量映射到 RGB 颜色空间中，通过将 X、Y、Z 分量映射到 R、G、B 通道中来表示法线方向。换句话说，它会根据物体表面的法向量信息，
 * 将每个像素的法向量转换为颜色值，然后将这个颜色值作为像素的最终颜色
 * 法向量（normal vector）是指垂直于曲面或几何体表面的向量。在三维图形学中，法向量通常用于表示几何体表面的朝向和曲面的方向，是渲染器计算阴影、反射、光照等高级渲染效果的重要基础
 * 法线材质通常用于调试和可视化几何模型的法线信息，例如调试模型的表面是否正常、判断模型是否对光源反射正确等，也可以用于创建一些抽象的艺术效果，例如模拟海洋、云彩等场景。
 * 可以在这个网站浏览更多使用法线网格材质创建的数字艺术图像(https://www.ilithya.rocks/anydayshaders/)
 * .flatShading: boolean。它用于控制材质的平滑程度。
 * 当 flatShading 属性值为 true 时，表示使用平面着色（flat shading）；为 false 时，表示使用光滑着色（smooth shading）
 */
// const material = new THREE.MeshNormalMaterial()
// material.flatShading = false

/**
 * MeshMatcapMaterial 是 Three.js 中的一种特殊材质，它的渲染效果基于预先计算好的 Matcap（Material Capture）纹理，
 * 纹理中包含了表面的光照和颜色信息。它可以实现高效、轻量级的渲染效果，因为它不依赖于实时计算光照（这意味它不响应灯光，
 * 但它将在接收阴影的对象上投射阴影（并且阴影剪切有效），但它不会自我遮挡或接收阴影）
 * Matcap 纹理通常是一个球形的图像，其中每个像素代表了一个特定的表面法线方向和对应的颜色。在渲染过程中，物体表面的法线信息被用于从 Matcap 纹理中查找对应的颜色
 */
// const material= new THREE.MeshMatcapMaterial()
// material.matcap = matcaps8
 

/**
 * 深度网格材质 MeshDepthMaterial
 * 用于渲染模型的深度信息。它的特点是不考虑光照和颜色等因素，仅仅根据模型的深度信息进行渲染。我们通常将其用于深度测试，深度图像渲染等场景，
 * 也可以使用它创建一些特殊效果，例如 3D 深度图像渲染，水下效果，立体显示效果等
 * 为什么我们的球体变得黑乎乎的？这是因为深度网格材质会根据对象距离摄影机的距离判断物体的明亮程度。当物体的位置接近摄影机的「近值」时，
 * 物体会被用白色着色，当物体接近摄影机的「远值」时，则使用黑色着色
 * 把摄影机近值从 0.1 调整为 1，物体变得更亮
 */

// const material = new THREE.MeshDepthMaterial()
 

/**
 * MeshLambertMaterial 兰伯特材质是一个可以响应光线的材质（这意味着当您使用该材质时，如果场景中没有光源，您将无法看到物体），一种用于非光亮表面的材料，因为它不存在镜面高光。
 * Lambertian 模型基于表面法向量和光线方向的角度来计算光照效果。它是一种简化的光照模型，不涉及镜面反射，因此更加高效且易于计算
 * 兰伯特材质经常用于性能有限的设备上，模拟磨砂表面的物体
 */
// const material = new THREE.MeshLambertMaterial()
 
/**
 * MeshPhongMaterial 冯氏材质和之前介绍的兰伯特材质十分相似，但却支持了兰伯特材质所缺失的镜面反光效果。基于冯氏光照模型进行渲染的冯氏材质结合了漫反射、
 * 镜面反射和环境光三种光照效果，可以实现更真实的光照表现。但这一方面也意味着更大的性能开销
 * .shininess 高亮的程度，越高的值越闪亮。默认值为 30
 * .specular 材质的高光颜色。默认值为0x111111（深灰色）的颜色Color
 */
// const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
// material.shininess = 1000
// material.specular = new THREE.Color('yellow')

/**
 * MeshToonMaterial 卡通材质是一种具有卡通风格材质类型，在渲染效果上，它类似于兰伯特材质的渲染效果。默认情况下，他只会对「阴影」和「光照」两个部分着色。
 * 它支持的纹理与标准材质基本相同，只是不支持 envMap 纹理
 * gradientMap， 卡通着色的渐变贴图。使用此类纹理时，需要将Texture.minFilterTexture.minFilter 和 Texture.magFilterTexture.magFilter设置为THREE.NearestFilter。默认为空。
 */
const material = new THREE.MeshToonMaterial()
material.gradientMap = gradientTexture
 
/**
 * MeshStandardMaterial 标准材质
 */
// const material = new THREE.MeshStandardMaterial()
 
// // 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0
// material.metalness = 0.45
// // 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0
// material.roughness = 0.65
// material.map = doorColorTxture 
// // ao贴图
// material.aoMap = texture08
// // ao贴图强度
// material.aoMapIntensity = 1
// // 移动定点位置 设置贴图高度
// material.displacementMap = doorMetalnessTexture
// material.displacementScale = 0.05
// // material.wireframe = true
// material.metalnessMap = doorMetalnessTexture 
// material.roughnessMap = doorRoughnessTexture 
// // 创建法线贴图的纹理（尽量使用法线贴图）
// material.normalMap = doorNormalTexture
// // 法线贴图对材质的影响程度
// material.normalScale.set(0.5,0.5)

// // 阿尔法贴图
// material.transparent = true
// material.alphaMap = doorAlphaTexture

// MeshStandardMaterial 标准材质是一种具有真实感的材质类型,它考虑了光照、漫反射、镜面反射等效果。适用于创建具有现实感的物体。常用参数包括颜色、金属度、粗糙度等
// const material = new THREE.MeshStandardMaterial()
 
// 材质与金属的相似度。非金属材质，如木材或石材，使用0.0，金属使用1.0
// material.metalness = 0.7
// 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0
// material.roughness = 0.2
// 环境贴图
// material.envMap = environmentMapTexture 

// gui.add(material, 'metalness').min(0).max(1).step(0.0001)
// gui.add(material, 'roughness').min(0).max(1).step(0.0001)
// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
// gui.add(material, 'displacementScale').min(0).max(10).step(0.0001)
// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material)
 
console.log(sphere.geometry.attributes);
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
sphere.position.x = -1.5


const plane = new THREE.Mesh(new THREE.PlaneGeometry(1,1, 100,100), material)
console.log(plane.geometry.attributes.uv);
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))


const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 64, 128), material)
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))
torus.position.x = 1.5
scene.add(sphere, plane, torus)

 
/**
 * Lights
 */
const lights = {
    color: 0xFFFFFF
}
 
const intensity = 0.2;
const ambientLight = new THREE.AmbientLight(lights.color, intensity)
scene.add(ambientLight)

gui.add(ambientLight, 'intensity').min(0).max(100).step(0.0001).name('环境光')
gui.addColor(lights, 'color').onChange(() => {
    ambientLight.color = new THREE.Color(lights.color)
    pointLight.color = new THREE.Color(lights.color)
 
}).name('环境光颜色')

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
scene.add(directionalLight)

const pointLight = new THREE.PointLight(lights.color, 1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)
 
gui.add(pointLight, 'intensity').min(0).max(100).step(0.0001).name('点光源')
 
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

    // sphere.rotation.y = 0.1 * elapseTime
    // plane.rotation.y = 0.1 * elapseTime
    // torus.rotation.y = 0.1 * elapseTime

    // sphere.rotation.x = 0.15 * elapseTime
    // plane.rotation.x = 0.15 * elapseTime
    // torus.rotation.x = 0.15 * elapseTime

    controls.update()
 
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}


tick()
 
