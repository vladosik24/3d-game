// Налаштування сцени
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

// Камера
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// Освітлення
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Підлога
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Персонаж
const playerGroup = new THREE.Group();

const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1;
body.castShadow = true;
playerGroup.add(body);

const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const head = new THREE.Mesh(headGeometry, headMaterial);
head.position.y = 2;
head.castShadow = true;
playerGroup.add(head);

const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.15, 2.1, 0.35);
playerGroup.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.15, 2.1, 0.35);
playerGroup.add(rightEye);

playerGroup.position.y = 0.5;
scene.add(playerGroup);

// Монети
const coins = [];
const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
const coinMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFD700,
    metalness: 0.8,
    roughness: 0.2
});

for (let i = 0; i < 10; i++) {
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.position.set(
        (Math.random() - 0.5) * 20,
        0.5,
        (Math.random() - 0.5) * 20
    );
    coin.castShadow = true;
    coin.userData = { collected: false };
    scene.add(coin);
    coins.push(coin);
}

// Перешкоди
const obstacles = [];
const obstacleGeometry = new THREE.BoxGeometry(1, 2, 1);
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c });

for (let i = 0; i < 8; i++) {
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(
        (Math.random() - 0.5) * 20,
        1,
        (Math.random() - 0.5) * 20
    );
    obstacle.castShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Керування
const keys = {};
let showInstructions = true;

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true;
    if (showInstructions) {
        document.getElementById('instructions').style.display = 'none';
        showInstructions = false;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    keys[e.key] = false;
});

// Анімація
const playerSpeed = 0.15;
let collectedCoins = 0;

function animate() {
    requestAnimationFrame(animate);

    const prevX = playerGroup.position.x;
    const prevZ = playerGroup.position.z;

    if (keys.w || keys.ArrowUp) {
        playerGroup.position.z -= playerSpeed;
        playerGroup.rotation.y = 0;
    }
    if (keys.s || keys.ArrowDown) {
        playerGroup.position.z += playerSpeed;
        playerGroup.rotation.y = Math.PI;
    }
    if (keys.a || keys.ArrowLeft) {
        playerGroup.position.x -= playerSpeed;
        playerGroup.rotation.y = Math.PI / 2;
    }
    if (keys.d || keys.ArrowRight) {
        playerGroup.position.x += playerSpeed;
        playerGroup.rotation.y = -Math.PI / 2;
    }

    playerGroup.position.x = Math.max(-24, Math.min(24, playerGroup.position.x));
    playerGroup.position.z = Math.max(-24, Math.min(24, playerGroup.position.z));

    // Перевірка зіткнень
    let collision = false;
    obstacles.forEach(obstacle => {
        const distance = playerGroup.position.distanceTo(obstacle.position);
        if (distance < 1) collision = true;
    });

    if (collision) {
        playerGroup.position.x = prevX;
        playerGroup.position.z = prevZ;
    }

    // Збір монет
    coins.forEach(coin => {
        if (!coin.userData.collected) {
            const distance = playerGroup.position.distanceTo(coin.position);
            if (distance < 1) {
                coin.userData.collected = true;
                coin.visible = false;
                collectedCoins++;
                document.getElementById('score').textContent = `Рахунок: ${collectedCoins}/10`;
                
                if (collectedCoins === 10) {
                    document.getElementById('win-screen').style.display = 'block';
                }
            }
            coin.rotation.y += 0.05;
        }
    });

    camera.position.x = playerGroup.position.x;
    camera.position.z = playerGroup.position.z + 10;
    camera.lookAt(playerGroup.position);

    renderer.render(scene, camera);
}

animate();

// Обробка зміни розміру
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
