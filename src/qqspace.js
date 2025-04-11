
// qqspace.js
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// 初始化 Three.js 场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const animateMixers = [];
const clock = new THREE.Clock();

// 坐标轴
const axesHelper = new THREE.AxesHelper(100); // 参数表示长度，可调
scene.add(axesHelper);

// 修改所有轴的颜色为红色
axesHelper.material.vertexColors = false;
axesHelper.material.color.set(0xff0000); // 红色

// 添加光照
//scene.add(new THREE.AmbientLight(0xffffff, 1));
//const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
//directionalLight.position.set(50, 0, 70);
//scene.add(directionalLight);

const pivot = new THREE.Group();
scene.add(pivot);

const loader = new FBXLoader(); // ✅ 正确
loader.load('./models/hurtmicee.fbx', function (model) {
    model.scale.set(0.1, 0.1, 0.1);  // 根据FBX模型大小调整
    pivot.add(model);
    console.log("✅ 模型加载成功");

    // 设置相机位置（你也可以根据模型的包围盒动态设置）
    camera.position.set(0, 20, 200);

    // ✅ 如果FBX有动画
    const mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(model.animations[0]);
    action.play();

    animateMixers.push(mixer); // 记录下来用于动画更新

    console.log("✅ FBX Loaded:", model);
    animate();
}, undefined, function (error) {
    console.error("❌ FBX 加载失败:", error);
});



// 动画循环
/*function animate() {
    requestAnimationFrame(animate);
    pivot.rotation.y += 0.01; // 旋转模型
    renderer.render(scene, camera);
}*/

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    animateMixers.forEach(mixer => mixer.update(delta));

    pivot.rotation.y += 0.01;
    renderer.render(scene, camera);
}


  
// 监听窗口变化
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
