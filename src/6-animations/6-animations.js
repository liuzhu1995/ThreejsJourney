import * as THREE from 'three'
import gsap from 'gsap'



// Scene 
const scene = new THREE.Scene()

// Objects

const group = new THREE.Group()
 
// Box cube
 
const cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),  new THREE.MeshBasicMaterial({ color: '#ff0000' }))
 
group.add(cube)
 
 

scene.add(group)

// AxesHelper
const axesHelper = new THREE.AxesHelper( 3 );
scene.add( axesHelper );

const sizes = {
    width: 800,
    height: 600
}
// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 5
scene.add(camera)
// 设置相机看向物体的中心位置
camera.lookAt(group.position)


// camera.position.y = 1
// camera.position.x = 1
 
const canvas = document.querySelector(".webgl")
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)


const clock = new THREE.Clock()

const tick = () => {

    // 无论多少帧 运行速度都是一致
    // const currentTime = Date.now()
    // const deltaTime = currentTime - time
    // requestAnimationFrame(() => tick(currentTime))
 
    // three内置的帧率自适应
    const elapsedTime = clock.getElapsedTime()
 
    // 每秒转一圈
    // cube.rotation.y = elapsedTime * Math.PI * 2

    // cube.rotation.y = elapsedTime * Math.PI

    // x->cos y->sin 结合使用会使物体像是在做圆形运动
    // 在y轴上下移动
    // cube.position.y = Math.sin(elapsedTime)
    // 在x轴上下移动
    // cube.position.x = Math.cos(elapsedTime)

    // 物体不动 相机一直运动
    camera.position.y = Math.sin(elapsedTime)
    camera.position.x = Math.cos(elapsedTime)
    camera.lookAt(cube.position)
    
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

// tick()

// 使用gsap动画库移动物体

// duration 持续时间 delay 延迟几秒执行 x轴
gsap.to(cube.position, { duration: 1, delay: 1, x: 2 })
gsap.to(cube.position, { duration: 1, delay: 2, x: 0 })

const tick02 = () => {

    renderer.render(scene, camera)
    requestAnimationFrame(tick02)
}

tick02()
