import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// 摄像机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 100, 200);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 光源
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 50);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// 显示坐标轴
const axesHelper = new THREE.AxesHelper(50); // 数字越大线越长
scene.add(axesHelper);

// 模型加载器
const loader = new FBXLoader();
loader.load('./hurtmice.fbx', (model) => {
  model.scale.set(0.01, 0.01, 0.01);
  scene.add(model);

  // 动画支持（如果有）
  if (model.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(model.animations[0]);
    action.play();

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      mixer.update(clock.getDelta());
      renderer.render(scene, camera);
    }
    animate();
  } else {
    renderer.render(scene, camera);
  }
});

// 响应式
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
