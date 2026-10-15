/**
 * SandRose 3D Interactive Unboxing Experience
 * Features:
 * - 3D Handcrafted Wooden Gift Box (Sandalwood & Rosewood)
 * - On Click: Box performs a 360° rotation as the lid gracefully opens
 * - Expanding 3D Fog & Sandalwood Mist spreading outwards
 * - Burst of 3D Miniature Wooden Gift Boxes with Gold Ribbons floating into space
 * - Shimmering 3D Glitters & Star Dust explosion
 * - Free 360° drag-to-rotate active at all times
 */

(function () {
    const canvasContainer = document.getElementById('three-canvas-container');
    if (!canvasContainer || typeof THREE === 'undefined') return;

    let scene, camera, renderer;
    let boxGroup, boxBase, boxLid, ribbonGroup, medallionMesh;
    let rosewoodMat, sandalwoodMat, goldMat;
    let miniGiftBoxes = [];
    let glitterParticles, glitterGeo;
    let smokeParticles = [];
    let petals = [], embers, emberGeo;
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let dragDistance = 0;
    let targetRotation = { x: 0.2, y: -0.4 };
    let currentRotation = { x: 0.2, y: -0.4 };
    let isBoxOpened = false;
    let lidTargetY = 0;
    let lidTargetRotX = 0;
    let lightAmber, lightRose, internalLight;

    // Helper: Procedural wood texture
    function createWoodTexture(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        let baseColor1, baseColor2, grainColor, ringCount;
        if (type === 'sandalwood') {
            baseColor1 = '#d8a758';
            baseColor2 = '#c08736';
            grainColor = 'rgba(120, 70, 18, 0.16)';
            ringCount = 35;
        } else {
            baseColor1 = '#4e1715';
            baseColor2 = '#2a0b09';
            grainColor = 'rgba(12, 2, 2, 0.38)';
            ringCount = 55;
        }

        const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
        grad.addColorStop(0, baseColor1);
        grad.addColorStop(0.5, baseColor2);
        grad.addColorStop(1, baseColor1);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.lineWidth = 1.5;
        for (let i = 0; i < 400; i++) {
            const y = Math.random() * 1024;
            ctx.beginPath();
            ctx.strokeStyle = grainColor;
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                256, y + (Math.random() - 0.5) * 40,
                768, y + (Math.random() - 0.5) * 40,
                1024, y + (Math.random() - 0.5) * 20
            );
            ctx.stroke();
        }

        const cx = 512 + (Math.random() - 0.5) * 200;
        const cy = 512 + (Math.random() - 0.5) * 200;
        for (let r = 20; r < 900; r += 1024 / ringCount) {
            ctx.beginPath();
            ctx.strokeStyle = grainColor;
            ctx.lineWidth = Math.random() * 2.5 + 0.5;
            for (let a = 0; a <= Math.PI * 2; a += 0.05) {
                const dist = r + Math.sin(a * 7) * 8 + Math.cos(a * 3) * 12;
                const px = cx + Math.cos(a) * dist;
                const py = cy + Math.sin(a) * dist * 0.7;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }

        if (type === 'sandalwood') {
            ctx.fillStyle = 'rgba(255, 235, 175, 0.28)';
            for (let j = 0; j < 320; j++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 1024, Math.random() * 1024, Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    // Helper: Fog puff texture
    function createFogTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(245, 230, 205, 0.85)');
        grad.addColorStop(0.35, 'rgba(215, 185, 140, 0.4)');
        grad.addColorStop(0.7, 'rgba(160, 110, 80, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(canvas);
    }

    // Helper: Shimmering Glitter Star Texture
    function createGlitterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw 4-point diamond star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(32, 4);
        ctx.quadraticCurveTo(32, 32, 60, 32);
        ctx.quadraticCurveTo(32, 32, 32, 60);
        ctx.quadraticCurveTo(32, 32, 4, 32);
        ctx.quadraticCurveTo(32, 32, 32, 4);
        ctx.fill();

        // Glow halo
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grad.addColorStop(0, 'rgba(255, 235, 175, 0.9)');
        grad.addColorStop(0.5, 'rgba(229, 184, 105, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        return new THREE.CanvasTexture(canvas);
    }

    function init() {
        const width = canvasContainer.clientWidth || window.innerWidth;
        const height = canvasContainer.clientHeight || window.innerHeight;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0705, 0.038);

        camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 1.15, 5.4);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        canvasContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffeedb, 0.95);
        scene.add(ambientLight);

        lightAmber = new THREE.PointLight(0xffbe5c, 3.2, 14);
        lightAmber.position.set(3.5, 4.5, 3.5);
        scene.add(lightAmber);

        lightRose = new THREE.PointLight(0xd94b4b, 2.5, 12);
        lightRose.position.set(-3.5, -1.5, 2.8);
        scene.add(lightRose);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
        rimLight.position.set(0, 6, -2);
        scene.add(rimLight);

        // Shared Materials
        const sandalwoodTex = createWoodTexture('sandalwood');
        const rosewoodTex = createWoodTexture('rosewood');

        rosewoodMat = new THREE.MeshStandardMaterial({
            map: rosewoodTex,
            roughness: 0.28,
            metalness: 0.08
        });

        sandalwoodMat = new THREE.MeshStandardMaterial({
            map: sandalwoodTex,
            roughness: 0.32,
            metalness: 0.12
        });

        goldMat = new THREE.MeshStandardMaterial({
            color: 0xe6b85c,
            metalness: 0.9,
            roughness: 0.18,
            emissive: 0x4a3410,
            emissiveIntensity: 0.25
        });

        // Build 3D Entities
        buildGiftBox();
        buildMiniGiftBoxes();
        buildGlitterParticles();
        buildSpreadingFog();
        buildFragranceEmbers();
        buildFloatingPetals();

        window.addEventListener('resize', onWindowResize);
        setupInteractionEvents();

        animate();
    }

    // Build the Main Masterpiece Box
    function buildGiftBox() {
        boxGroup = new THREE.Group();
        boxGroup.position.set(0, 0, 0);

        const baseWidth = 2.4;
        const baseHeight = 1.35;
        const baseDepth = 2.4;
        const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
        boxBase = new THREE.Mesh(baseGeo, rosewoodMat);
        boxBase.position.y = -baseHeight / 2;
        boxBase.castShadow = true;
        boxBase.receiveShadow = true;
        boxGroup.add(boxBase);

        // Velvet Interior
        const interiorGeo = new THREE.BoxGeometry(baseWidth * 0.94, baseHeight * 0.9, baseDepth * 0.94);
        const velvetMat = new THREE.MeshStandardMaterial({
            color: 0x3d0a0b,
            roughness: 0.92
        });
        const interior = new THREE.Mesh(interiorGeo, velvetMat);
        interior.position.y = -baseHeight / 2 + 0.1;
        boxGroup.add(interior);

        // Gold Corner Brackets
        const cornerGeo = new THREE.BoxGeometry(0.12, baseHeight * 0.92, 0.12);
        const offsets = [
            [-baseWidth / 2, -baseDepth / 2],
            [baseWidth / 2, -baseDepth / 2],
            [-baseWidth / 2, baseDepth / 2],
            [baseWidth / 2, baseDepth / 2]
        ];
        offsets.forEach(([cx, cz]) => {
            const bracket = new THREE.Mesh(cornerGeo, goldMat);
            bracket.position.set(cx, -baseHeight / 2, cz);
            boxGroup.add(bracket);
        });

        // 2. Box Lid
        boxLid = new THREE.Group();
        boxLid.position.set(0, 0.05, 0);

        const lidHeight = 0.38;
        const lidGeo = new THREE.BoxGeometry(baseWidth * 1.035, lidHeight, baseDepth * 1.035);
        const lidMesh = new THREE.Mesh(lidGeo, sandalwoodMat);
        lidMesh.position.y = lidHeight / 2;
        lidMesh.castShadow = true;
        lidMesh.receiveShadow = true;
        boxLid.add(lidMesh);

        // Inlay Torus
        const borderGeo = new THREE.TorusGeometry(0.85, 0.02, 16, 64);
        borderGeo.rotateX(Math.PI / 2);
        const inlayBorder = new THREE.Mesh(borderGeo, goldMat);
        inlayBorder.position.y = lidHeight + 0.005;
        boxLid.add(inlayBorder);

        // Gold Ribbons
        const ribLid1 = new THREE.Mesh(new THREE.BoxGeometry(baseWidth * 1.04, 0.03, 0.28), goldMat);
        ribLid1.position.y = lidHeight + 0.01;
        boxLid.add(ribLid1);

        const ribLid2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, baseDepth * 1.04), goldMat);
        ribLid2.position.y = lidHeight + 0.01;
        boxLid.add(ribLid2);

        // Rose Medallion
        const medallionGeo = new THREE.CylinderGeometry(0.34, 0.36, 0.08, 32);
        medallionMesh = new THREE.Mesh(medallionGeo, goldMat);
        medallionMesh.position.y = lidHeight + 0.05;
        boxLid.add(medallionMesh);

        for (let p = 0; p < 7; p++) {
            const petalGeo = new THREE.SphereGeometry(0.12, 12, 12);
            petalGeo.scale(1.2, 0.3, 0.7);
            const petalMesh = new THREE.Mesh(petalGeo, goldMat);
            const angle = (p / 7) * Math.PI * 2;
            petalMesh.position.set(Math.cos(angle) * 0.14, lidHeight + 0.08, Math.sin(angle) * 0.14);
            petalMesh.rotation.y = -angle;
            petalMesh.rotation.z = 0.25;
            boxLid.add(petalMesh);
        }

        const rubyMat = new THREE.MeshStandardMaterial({
            color: 0x991122,
            metalness: 0.3,
            roughness: 0.1,
            emissive: 0x660814,
            emissiveIntensity: 0.45
        });
        const roseCore = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), rubyMat);
        roseCore.position.y = lidHeight + 0.1;
        boxLid.add(roseCore);

        boxGroup.add(boxLid);

        // Internal Golden Glow
        internalLight = new THREE.PointLight(0xffea9f, 0, 7);
        internalLight.position.set(0, 0.3, 0);
        boxGroup.add(internalLight);

        scene.add(boxGroup);
    }

    // Build Miniature 3D Wooden Gift Boxes that burst out when opened
    function buildMiniGiftBoxes() {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const miniGroup = new THREE.Group();
            const size = 0.28 + Math.random() * 0.14;
            const isRosewood = i % 2 === 0;
            const boxMaterial = isRosewood ? rosewoodMat : sandalwoodMat;

            // Cube body
            const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), boxMaterial);
            miniGroup.add(cube);

            // Gold ribbons
            const rib1 = new THREE.Mesh(new THREE.BoxGeometry(size * 1.03, size * 1.03, size * 0.22), goldMat);
            const rib2 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.22, size * 1.03, size * 1.03), goldMat);
            miniGroup.add(rib1);
            miniGroup.add(rib2);

            // Mini bow
            const bow = new THREE.Mesh(new THREE.SphereGeometry(size * 0.14, 8, 8), goldMat);
            bow.position.y = size * 0.52;
            miniGroup.add(bow);

            // Initially hidden at center with zero scale
            miniGroup.scale.set(0, 0, 0);
            miniGroup.position.set(0, 0, 0);

            // Calculate burst target position in a spiral sphere around the box
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const radius = 2.4 + Math.random() * 1.4;
            const targetX = Math.cos(angle) * radius;
            const targetY = (Math.random() - 0.3) * 2.2 + 0.5;
            const targetZ = Math.sin(angle) * radius;

            miniGiftBoxes.push({
                group: miniGroup,
                targetPos: new THREE.Vector3(targetX, targetY, targetZ),
                startPos: new THREE.Vector3(0, 0.2, 0),
                rotSpeedX: (Math.random() - 0.5) * 0.03,
                rotSpeedY: (Math.random() - 0.5) * 0.03,
                rotSpeedZ: (Math.random() - 0.5) * 0.02,
                bobFreq: Math.random() * 2 + 1.2,
                bobAmp: Math.random() * 0.08 + 0.04,
                active: false
            });

            scene.add(miniGroup);
        }
    }

    // Build Shimmering 3D Glitters & Star Dust
    function buildGlitterParticles() {
        const count = 220;
        glitterGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            scales[i] = Math.random() * 0.35 + 0.15;

            // Outward velocity vector
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const speed = Math.random() * 0.04 + 0.015;
            velocities.push({
                vx: Math.sin(theta) * Math.cos(phi) * speed,
                vy: Math.abs(Math.cos(theta)) * speed * 1.5 + 0.01,
                vz: Math.sin(theta) * Math.sin(phi) * speed,
                ox: 0,
                oy: 0,
                oz: 0,
                active: false
            });
        }

        glitterGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        glitterGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        const glitterMat = new THREE.PointsMaterial({
            size: 0.25,
            map: createGlitterTexture(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0
        });

        glitterParticles = new THREE.Points(glitterGeo, glitterMat);
        glitterParticles.userData = { velocities: velocities };
        scene.add(glitterParticles);
    }

    // Build Expanding 3D Fog Puffs
    function buildSpreadingFog() {
        const fogTex = createFogTexture();
        const puffCount = 35;

        for (let i = 0; i < puffCount; i++) {
            const mat = new THREE.SpriteMaterial({
                map: fogTex,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(mat);
            sprite.scale.set(1.5, 1.5, 1);
            sprite.position.set(0, 0.1, 0);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 3.5 + 1.0;

            smokeParticles.push({
                sprite: sprite,
                targetPos: new THREE.Vector3(Math.cos(angle) * distance, (Math.random() - 0.2) * 2.0, Math.sin(angle) * distance),
                currentScale: 1.5,
                maxScale: Math.random() * 3.5 + 2.5,
                speedY: Math.random() * 0.008 + 0.003,
                maxOpacity: Math.random() * 0.45 + 0.2,
                currentOpacity: 0
            });
            scene.add(sprite);
        }
    }

    function buildFragranceEmbers() {
        const count = 160;
        emberGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
        }
        emberGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const sparkCanvas = document.createElement('canvas');
        sparkCanvas.width = 64;
        sparkCanvas.height = 64;
        const sctx = sparkCanvas.getContext('2d');
        const sgrad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        sgrad.addColorStop(0, 'rgba(255, 235, 175, 1)');
        sgrad.addColorStop(0.3, 'rgba(230, 175, 70, 0.8)');
        sgrad.addColorStop(0.7, 'rgba(180, 85, 25, 0.2)');
        sgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sctx.fillStyle = sgrad;
        sctx.fillRect(0, 0, 64, 64);

        const emberTexture = new THREE.CanvasTexture(sparkCanvas);
        const emberMat = new THREE.PointsMaterial({
            size: 0.18,
            map: emberTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.85
        });

        embers = new THREE.Points(emberGeo, emberMat);
        scene.add(embers);
    }

    function buildFloatingPetals() {
        const petalCount = 36;
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.bezierCurveTo(0.15, 0.2, 0.25, 0.45, 0, 0.65);
        petalShape.bezierCurveTo(-0.25, 0.45, -0.15, 0.2, 0, 0);

        const petalGeo = new THREE.ShapeGeometry(petalShape, 12);
        const pos = petalGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            pos.setZ(i, Math.sin(y * Math.PI) * 0.06 - (x * x) * 0.15);
        }
        petalGeo.computeVertexNormals();

        const petalMat = new THREE.MeshStandardMaterial({
            color: 0x8a2323,
            roughness: 0.35,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < petalCount; i++) {
            const mesh = new THREE.Mesh(petalGeo, petalMat);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 7,
                (Math.random() - 0.5) * 6
            );
            const scale = Math.random() * 0.7 + 0.4;
            mesh.scale.set(scale, scale, scale);
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            petals.push({
                mesh: mesh,
                speedY: Math.random() * 0.006 + 0.003,
                rotSpeedX: (Math.random() - 0.5) * 0.015,
                rotSpeedY: (Math.random() - 0.5) * 0.018,
                rotSpeedZ: (Math.random() - 0.5) * 0.01,
                swayFreq: Math.random() * 2 + 1,
                swayAmp: Math.random() * 0.006 + 0.002
            });
            scene.add(mesh);
        }
    }

    // Interaction Events: Dragging active at all times!
    function setupInteractionEvents() {
        window.addEventListener('pointermove', (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            mouse.targetX = nx * 0.45;
            mouse.targetY = ny * 0.3;

            if (isDragging) {
                const deltaX = e.clientX - prevMousePos.x;
                const deltaY = e.clientY - prevMousePos.y;
                dragDistance += Math.abs(deltaX) + Math.abs(deltaY);
                targetRotation.y += deltaX * 0.009;
                targetRotation.x += deltaY * 0.009;
                prevMousePos = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('pointerdown', (e) => {
            if (e.target.closest('button, input, select, a, .clickable')) return;
            isDragging = true;
            dragDistance = 0;
            prevMousePos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('pointerup', (e) => {
            if (isDragging && dragDistance < 8) {
                if (!isBoxOpened && !e.target.closest('button, input, select, a')) {
                    openVault();
                }
            }
            isDragging = false;
        });

        window.sandroseOpenVault = openVault;
        window.sandroseCloseVault = closeVault;
    }

    // Grand Open Ceremony: Box rotates 360°, opens, fog spreads, glitters & mini gift boxes emerge!
    function openVault() {
        if (isBoxOpened) return;
        isBoxOpened = true;

        // 1. Box performs a full 360° rotation spin while opening
        if (typeof gsap !== 'undefined') {
            gsap.to(targetRotation, {
                y: targetRotation.y + Math.PI * 2,
                duration: 1.5,
                ease: 'power2.inOut'
            });
        } else {
            targetRotation.y += Math.PI * 2;
        }

        // 2. Lid smoothly glides up and tilts back
        lidTargetY = 1.1;
        lidTargetRotX = -0.52;

        // 3. Warm golden light emanates from inside
        if (internalLight) {
            if (typeof gsap !== 'undefined') {
                gsap.to(internalLight, { intensity: 6.5, duration: 1.2, ease: 'power2.out' });
            } else {
                internalLight.intensity = 6.0;
            }
        }

        // 4. Spread Fog outwards in a 3D radial wave
        if (typeof gsap !== 'undefined') {
            gsap.to(scene.fog, { density: 0.075, duration: 1.5 });
        }
        smokeParticles.forEach((p, idx) => {
            p.currentOpacity = p.maxOpacity;
            if (typeof gsap !== 'undefined') {
                gsap.to(p.sprite.position, {
                    x: p.targetPos.x,
                    y: p.targetPos.y,
                    z: p.targetPos.z,
                    duration: 1.6 + idx * 0.03,
                    ease: 'power2.out'
                });
                gsap.to(p.sprite.scale, {
                    x: p.maxScale,
                    y: p.maxScale,
                    duration: 2.0,
                    ease: 'power2.out'
                });
            }
        });

        // 5. Burst of Miniature 3D Gift Boxes into space!
        miniGiftBoxes.forEach((m, idx) => {
            m.active = true;
            m.group.position.set(0, 0.2, 0);
            if (typeof gsap !== 'undefined') {
                gsap.to(m.group.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.9,
                    delay: 0.2 + idx * 0.04,
                    ease: 'back.out(1.8)'
                });
                gsap.to(m.group.position, {
                    x: m.targetPos.x,
                    y: m.targetPos.y,
                    z: m.targetPos.z,
                    duration: 1.4,
                    delay: 0.2 + idx * 0.04,
                    ease: 'power2.out'
                });
            } else {
                m.group.scale.set(1, 1, 1);
                m.group.position.copy(m.targetPos);
            }
        });

        // 6. Explode 3D Glitters & Fairy Dust
        if (glitterParticles) {
            glitterParticles.material.opacity = 0.95;
            const posAttr = glitterGeo.attributes.position;
            const arr = posAttr.array;
            const vels = glitterParticles.userData.velocities;

            vels.forEach((v, i) => {
                arr[i * 3] = (Math.random() - 0.5) * 0.5;
                arr[i * 3 + 1] = 0.3;
                arr[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
                v.active = true;
            });
            posAttr.needsUpdate = true;
        }

        // 7. Confetti celebration
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 80,
                spread: 100,
                origin: { y: 0.5 },
                colors: ['#e6b85c', '#d6a354', '#8a2323', '#fff3d1']
            });
        }

        // Notify app to orchestrate fog and delayed details reveal
        if (typeof window.onSandRoseBoxOpened === 'function') {
            window.onSandRoseBoxOpened();
        }
    }

    // Close ceremony: returns mini gift boxes and reseals the main box
    function closeVault() {
        if (!isBoxOpened) return;
        isBoxOpened = false;

        lidTargetY = 0;
        lidTargetRotX = 0;

        if (internalLight) {
            if (typeof gsap !== 'undefined') {
                gsap.to(internalLight, { intensity: 0, duration: 0.6 });
            } else {
                internalLight.intensity = 0;
            }
        }

        if (typeof gsap !== 'undefined') {
            gsap.to(scene.fog, { density: 0.038, duration: 1.0 });
        }

        // Return mini gift boxes back inside
        miniGiftBoxes.forEach(m => {
            m.active = false;
            if (typeof gsap !== 'undefined') {
                gsap.to(m.group.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
                gsap.to(m.group.position, { x: 0, y: 0.2, z: 0, duration: 0.5 });
            } else {
                m.group.scale.set(0, 0, 0);
            }
        });

        // Hide glitters & fog
        if (glitterParticles) {
            glitterParticles.material.opacity = 0;
        }

        smokeParticles.forEach(p => {
            p.currentOpacity = 0;
            p.sprite.position.set(0, 0.1, 0);
        });

        if (typeof window.onSandRoseBoxClosed === 'function') {
            window.onSandRoseBoxClosed();
        }
    }

    function onWindowResize() {
        if (!canvasContainer || !renderer || !camera) return;
        const w = canvasContainer.clientWidth || window.innerWidth;
        const h = canvasContainer.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        if (!isDragging && !isBoxOpened) {
            targetRotation.y += 0.0018;
        }

        currentRotation.x += (targetRotation.x + mouse.y * 0.35 - currentRotation.x) * 0.08;
        currentRotation.y += (targetRotation.y + mouse.x * 0.5 - currentRotation.y) * 0.08;

        if (boxGroup) {
            boxGroup.rotation.x = currentRotation.x;
            boxGroup.rotation.y = currentRotation.y;
            boxGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
        }

        if (boxLid) {
            boxLid.position.y += (lidTargetY - boxLid.position.y) * 0.12;
            boxLid.rotation.x += (lidTargetRotX - boxLid.rotation.x) * 0.12;
            boxLid.position.z += ((-lidTargetY * 0.35) - boxLid.position.z) * 0.12;
        }

        if (medallionMesh) {
            medallionMesh.rotation.y = elapsedTime * 0.4;
        }

        // Animate Miniature Gift Boxes (tumble and gently bob in 3D orbit)
        miniGiftBoxes.forEach((m, idx) => {
            if (m.active) {
                m.group.rotation.x += m.rotSpeedX;
                m.group.rotation.y += m.rotSpeedY;
                m.group.rotation.z += m.rotSpeedZ;
                m.group.position.y += Math.sin(elapsedTime * m.bobFreq + idx) * 0.003;
            }
        });

        // Animate Glitters (twinkling and swirling outward)
        if (glitterParticles && isBoxOpened) {
            const posAttr = glitterGeo.attributes.position;
            const arr = posAttr.array;
            const vels = glitterParticles.userData.velocities;

            for (let i = 0; i < vels.length; i++) {
                const v = vels[i];
                if (v.active) {
                    arr[i * 3] += v.vx;
                    arr[i * 3 + 1] += v.vy;
                    arr[i * 3 + 2] += v.vz;

                    v.vy -= 0.0003; // subtle gravity

                    // Swirl gently
                    arr[i * 3] += Math.sin(elapsedTime * 2 + i) * 0.005;
                    arr[i * 3 + 2] += Math.cos(elapsedTime * 2 + i) * 0.005;
                }
            }
            posAttr.needsUpdate = true;
            glitterParticles.rotation.y = elapsedTime * 0.1;
        }

        // Spreading Fog
        smokeParticles.forEach((p, idx) => {
            if (isBoxOpened) {
                p.sprite.position.y += p.speedY;
                p.sprite.material.opacity += (p.currentOpacity - p.sprite.material.opacity) * 0.08;
            } else {
                p.sprite.material.opacity += (0 - p.sprite.material.opacity) * 0.1;
            }
        });

        // Ambient fragrance embers
        if (embers && emberGeo) {
            const posAttr = emberGeo.attributes.position;
            const positions = posAttr.array;
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] += Math.sin(elapsedTime + i) * 0.003 + 0.0025;
                positions[i * 3] += Math.cos(elapsedTime * 0.5 + i) * 0.002;

                if (positions[i * 3 + 1] > 4.5) {
                    positions[i * 3 + 1] = -4.5;
                    positions[i * 3] = (Math.random() - 0.5) * 10;
                }
            }
            posAttr.needsUpdate = true;
            embers.rotation.y = elapsedTime * 0.02;
        }

        // Drifting petals
        petals.forEach((p, idx) => {
            p.mesh.position.y -= p.speedY;
            p.mesh.position.x += Math.sin(elapsedTime * p.swayFreq + idx) * p.swayAmp;
            p.mesh.rotation.x += p.rotSpeedX;
            p.mesh.rotation.y += p.rotSpeedY;
            p.mesh.rotation.z += p.rotSpeedZ;

            if (p.mesh.position.y < -4.5) {
                p.mesh.position.y = 4.5;
                p.mesh.position.x = (Math.random() - 0.5) * 8;
                p.mesh.position.z = (Math.random() - 0.5) * 6;
            }
        });

        if (lightAmber) {
            lightAmber.position.x = Math.sin(elapsedTime * 0.8) * 4;
            lightAmber.position.z = Math.cos(elapsedTime * 0.8) * 4 + 1;
        }
        if (lightRose) {
            lightRose.position.x = Math.cos(elapsedTime * 0.6) * 4;
            lightRose.position.y = Math.sin(elapsedTime * 0.5) * 2 - 1;
        }

        renderer.render(scene, camera);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
