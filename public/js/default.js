var camera, scene, renderer;

function init() {

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 1, 10 );

  camera.position.z = 2;

  scene = new THREE.Scene();

  // geometry

  var triangles = 100;

  var geometry = new THREE.BufferGeometry();

  var vertices = new THREE.BufferAttribute( new Float32Array(triangles * 3 * 3), 3);

  for( var i = 0; i < vertices.length; i++ ) {
    vertices.setXYZ(i, Math.random() - 0.5, Math.random() - 0.5, Math.random() -0.5);
  }

  geometry.addAttribute('position', vertices);

  var colors = new THREE.BufferAttribute( new Float32Array(triangles * 3 * 4), 4);
  for( i = 0; i < colors.length; i++ ) {
    colors.setXYZW(i, Math.random(), Math.random(), Math.random(), Math.random() );
  }

  geometry.addAttribute('color', colors);

  // material

  var material = new THREE.RawShaderMaterial({
    uniforms: {
      time: { type: 'f', value: 1.0 }
    },
    vertexShader: webGL.getShader('vertex'),
    fragmentShader: webGL.getShader("fragment"),
    side: THREE.DoubleSide,
    transparent: true
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(0x101010);
  document.body.appendChild(renderer.domElement);

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}


var frame;
function animate() {
  frame = requestAnimationFrame(animate);

  render();
}

function render() {
  var time = performance.now();

  var object = scene.children[0];

  object.rotation.y = time * 0.0005;
  object.rotation.z = time * 0.0003;

  object.material.uniforms.time.value = time * 0.005;

  renderer.render(scene, camera);
}

