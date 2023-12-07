import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 纹理

/**
 * DeBug
 * dat.gui
 */
//关联空间数据创建交互界面
const gui = new dat.GUI();
// const folder = gui.addFolder('菜单')
const clock = new THREE.Clock()
const parameters = {
    color: 0xff0000,
    spin: () => {
        gsap.to(mesh.rotation, { duration: 5, y: mesh.rotation.y + Math.PI * 2})
    },
  
}

gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color)
})
gui.add(parameters, 'spin')
 

/**
 * Textures
 * https://juejin.cn/post/7053621679762702343
 * 查找材质网站
 * poliigon.com
 * 3dtextures.me
 * arroway-textures.ch
 * substance designer 自己创建纹理
 * https://helpx.adobe.com/substance-3d-designer/home.html
 * 
 */
const manager = new THREE.LoadingManager();
// manager.onStart = (url, itemsLoaded, itemsTotal) => {
//     console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
// }
// manager.onLoad = () => {
//     console.log('loading complete');
// }

// manager.onProgress = (url, itemsLoaded, itemsTotal) => {
//     console.log( 'onProgress' );
// }
// manager.onError = (url) => {
//     console.log( 'There was an error loading ' + url );
// }
/**
 * 纹理的格式优缺点
 * jpg较大的失真压缩，但体积更小
 * png较小的失真压缩，但体积更大。支持透明通道，如果向拥有1个纹理包含颜色和透明度，使用png
 */
const textureLoader = new THREE.TextureLoader(manager)
// const texture = textureLoader.load('/static/textures/door/color.jpg')
// const texture = textureLoader.load('/static/textures/checkerboard-1024x1024.png')
// const texture = textureLoader.load('/static/textures/checkerboard-8x8.png')
const texture = textureLoader.load('/static/textures/minecraft.png')

const materials = [
    new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/textures/door/alpha.jpg')}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/textures/door/ambientOcclusion.jpg')}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/textures/door/color.jpg')}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/textures/door/height.jpg')}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/textures/door/metalness.jpg')}),
    new THREE.MeshBasicMaterial({ map: textureLoader.load('/static/textures/door/normal.jpg')}),
]

// texture.repeat.x = 3
// texture.repeat.y = 3
 
/**
 * https://threejs.org/docs/index.html#api/zh/textures/Texture
 * .wrapS: number 这个值定义了纹理贴图在水平方向上将如何包裹，在UV映射中对应于U
 * .wrapT: number 这个值定义了纹理贴图在垂直方向上将如何包裹，在UV映射中对应于V
 * THREE.RepeatWrapping  纹理将简单地重复到无穷大
 * THREE.ClampToEdgeWrapping  默认值，纹理中的最后一个像素将延伸到网格的边缘
 * THREE.MirroredRepeatWrapping  纹理将重复到无穷大，在每次重复时将进行镜像
 */
// texture.wrapS = THREE.RepeatWrapping
// texture.wrapT = THREE.RepeatWrapping

// texture.offset.x = 0.5
// texture.offset.y = 0.5

// 一个矩形平面有从左上开始四个顶点abcd, 旋转纹理贴图以d点为支点向左旋转，会使贴图偏移
// 使用center使旋转的顶点居中在平面中心，贴图就会在当前平面旋转不会偏移
// texture.rotation = Math.PI * 0.25
// texture.center.x = 0.5
// texture.center.y = 0.5
// texture.center = new THREE.Vector2(0.5, 0.5)

/**
 * https://threejs.org/docs/index.html#api/zh/constants/Textures
 * 放大滤镜（Magnification Filters） 
 * 这些常量用于纹理的magFilter
 * THREE.NearestFilter  返回与指定纹理坐标（在曼哈顿距离之内）最接近的纹理元素的值
 * THREE.LinearFilter 是默认值，返回距离指定的纹理坐标最近的四个纹理元素的加权平均值
 * 
 * 缩小滤镜（Minification Filters）
 * 除了NearestFilter和LinearFilter，还有其他四个
 * 
 * 在三维计算机图形的贴图渲染中有一个常用的技术被称为 Mipmapping。为了加快渲染速度和减少图像锯齿，
 * 贴图被处理成由一系列被预先计算和优化过的图片组成的文件, 这样的贴图被称为 MIP map 或者 mipmap。这个技术在三维游戏中被非常广泛的使用。
 * “MIP”来自于拉丁语 multum in parvo 的首字母，意思是“放置很多东西的小空间”。Mipmap 需要占用一定的内存空间，同时也遵循小波压缩规则 （wavelet compression）
 * 简单来说就是Mipmapping 会预先生成一系列图片，在物体旋转时，不同的角度看到不同的图片，用于提高性能，空间换时间
 * 纹理会被存入GPU缓存中，同时mipmapping的时候，会生成近两倍的图片，因此尽可能让图片小
 * mipmapping的操作是不断将图片缩小一倍（不停除以2）建议使用2的n次幂的宽高尺寸图片，如512,1024
 */
// 在minFilter（最小滤波器）上使用NearestFilter（最近滤波器）时， 不需要MIP映射关闭MIP映射提高性能
texture.generateMipmaps = false
texture.minFilter = THREE.NearestFilter
texture.magFilter = THREE.NearestFilter  

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
const group = new THREE.Group()

const geometry = new THREE.BoxGeometry(1,1,1,200,200,200)
console.log(geometry.attributes.uv);
// const material = new THREE.MeshBasicMaterial({ color: parameters.color, wireframe: false })
const material = new THREE.MeshBasicMaterial({  map: texture, wireframe: false, sizeAttenuation: false })
const mesh = new THREE.Mesh(geometry,  material)
group.add(mesh)

const cube = new THREE.Mesh(geometry, materials)

cube.position.x = 1.5
group.add(cube)

scene.add(group)
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
camera.lookAt(group.position)
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
 

 