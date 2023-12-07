import * as THREE from 'three'
 
// Scene 
const scene = new THREE.Scene()

// Box cube
const geometry = new THREE.BoxGeometry(1,1,1)
const material = new THREE.MeshBasicMaterial({ color: "#ff0000" })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)


const sizes = {
    width: 800,
    height: 600
}
// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
scene.add(camera)
camera.position.z = 3

const canvas = document.querySelector(".webgl")
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)