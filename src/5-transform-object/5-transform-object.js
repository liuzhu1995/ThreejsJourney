import * as THREE from 'three'
 
// Scene 
const scene = new THREE.Scene()

// Objects

const group = new THREE.Group()
group.position.y = 1
group.scale.x = 1
group.rotation.reorder('YXZ')
group.rotation.x = 0.1
group.rotation.y = 1.1

// Box cube
 
const cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),  new THREE.MeshBasicMaterial({ color: '#ff0000' }))
cube.position.set(0.7, -0.5, 1)
cube.scale.set(2, 0.5, 0.5)

// 设置旋转角度顺序 先旋转y轴
cube.rotation.reorder('YXZ')
cube.rotation.y = 0.8
cube.rotation.x = 1
cube.rotation.z = 3.14
// group.add(cube)


const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),  new THREE.MeshBasicMaterial({ color: '#0000ff' }))
group.add(cube2)

 
const cube3 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),  new THREE.MeshBasicMaterial({ color: '#abdbe3' }))
cube3.position.x = 2
group.add(cube3)

 
const cube4 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),  new THREE.MeshBasicMaterial({ color: '#a59344' }))
cube4.position.x = -2
group.add(cube4)

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
camera.position.z = 3
scene.add(camera)
// 设置相机看向物体的中心位置
camera.lookAt(group.position)


// camera.position.y = 1
// camera.position.x = 1
// 物体到相机之间的距离
console.log(cube.position.distanceTo(camera.position), 22);

const canvas = document.querySelector(".webgl")
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)


 