import "./main.scss";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { getProject, types as t } from "@theatre/core";
import studio from "@theatre/studio";
import { CustomPass } from "./shader/CustomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { MouseEffectPass } from "./shader/MouseEffectPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { textures, bgTexture } from "./shader/textures";
import state from "./animations/state.json";
import gsap from "gsap";

let camera, scene, renderer;
let geometry,
  material,
  mesh,
  effect1,
  effect2,
  effect3,
  composer,
  distortion,
  sheet;
let showedPortfolio = false;
let meshes = [];

let mouse = new THREE.Vector2();

let time = 1;
let value = 0;

init();
initPost();
addObjects();
animate();

window.addEventListener("wheel", animationFluid);
window.addEventListener("resize", onWindowResize, false);
window.addEventListener(
  "mousemove",
  (e) => {
    mouse.x = [(e.clientX / window.innerWidth) * 2] - 1;
    mouse.y = -[(e.clientY / window.innerHeight) * 2] + 1;
  },
  false
);

function createAnimation(i, proj) {
  // create a sheet
  sheet = proj.sheet(
    // Our sheet is identified as "Scene"
    "Scene",
    i
  );

  // create an object
  distortion = sheet.object(
    // The object's key is "Fist object"
    "Distortion",
    // These are the object's default values (and as we'll later learn, its props types)
    {
      // we pick our first props's name to be "foo". It's default value is 0.
      // Theatre will determine that the type of this prop is a number
      progress: t.number(0, { range: [0, 1] }),
      zoomCamera: t.number(1, { range: [1, 2.5] }),
      distanceMesh: t.number(2, { range: [2, 5] }),
      heightMesh: t.number(4, { range: [1, 4] }),
      // Second prop is a boolean called "bar", and it defaults to true.
      // Last prop is a string
    }
  );
}

function init() {
  // create a project
  const proj = getProject("First Project", { state });

  createAnimation("1", proj);

  // studio.initialize();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // scene.background = bgTexture;
  scene.background = new THREE.Color(0x000000);

  // const planeBg = new THREE.PlaneGeometry(1.9 * 1.5, 1.2 * 1.5);
  // const meshBasicBg = new THREE.MeshBasicMaterial({ map: bgTexture });
  // const meshBg = new THREE.Mesh(planeBg, meshBasicBg);

  // scene.add(meshBg);

  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableZoom = false;
  controls.enablePan = false;
  controls.panSpeed = 1.3;

  controls.update();
}

function animate() {
  time += 0.01;
  effect1.uniforms["time"].value = time;
  // effect2.uniforms["mouse"].value = mouse;
  distortion.onValuesChange((newValue) => {
    camera.position.z = newValue.zoomCamera;
    meshes.forEach((m, i) => {
      m.scale.set(1, newValue.heightMesh);
      m.position.x = i - i * newValue.distanceMesh + 4.2;
    });
    effect1.uniforms["progress"].value = newValue.progress;
  });
  // required if controls.enableDamping or controls.autoRotate are set to true
  // renderer.render(scene, camera);
  requestAnimationFrame(animate);
  composer.render();
}

function addObjects() {
  material = new THREE.ShaderMaterial({
    extensions: {
      derivatives: "#extension GL_OES_standard_derivatives: enable",
    },
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      tDiffuse: { value: 0 },
      resolution: { value: new THREE.Vector4() },
    },
    vertexShader: CustomPass.vertexShader,
    fragmentShader: CustomPass.fragmentShader,
  });

  geometry = new THREE.PlaneGeometry(1.9 / 2, 1 / 2, 1, 1);

  textures.forEach((t, i) => {
    let m = material.clone();
    m.uniforms.tDiffuse.value = t;
    mesh = new THREE.Mesh(geometry, m);
    scene.add(mesh);
    meshes.push(mesh);
  });
}

function initPost() {
  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  effect1 = new ShaderPass(CustomPass);
  composer.addPass(effect1);

  // effect2 = new ShaderPass(MouseEffectPass);
  // composer.addPass(effect2);
}

function animationFluid(e) {
  if (e.wheelDelta <= -15 && showedPortfolio === false) {
    sheet.sequence.play();
    setTimeout(() => {
      sheet.sequence.pause();
      showedPortfolio = true;
    }, 4000);
  } else if (
    e.wheelDelta >= 15 &&
    showedPortfolio === true &&
    camera.position.x <= 0
  ) {
    sheet.sequence.position = 3;
    showedPortfolio = false;
    sheet.sequence.play({
      direction: "reverse",
    });
  } else if (showedPortfolio === true) {
    if (e.wheelDelta <= 0 && camera.position.x <= meshes.length * 0.55) {
      camera.position.x -= e.wheelDelta / 10000;
    } else if (e.wheelDelta > 0 && camera.position.x >= 0) {
      camera.position.x += -e.wheelDelta / 10000;
    } else if (camera.position.x <= 0 && e.wheelDelta > 0) {
      showedPortfolio = false;
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
