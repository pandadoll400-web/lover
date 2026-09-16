try {
window.addEventListener('error', function(e) { console.error(e); });
// --- ?占쏀깭 蹂??---
let heldEggs = [null, null, null, null, null]; // ?占쎈깽?占쎈━ ?占쎈’
let hotbarIndex = 0; 
let carryingEgg = null; // ?占쎌퀜???占쎌쭚?占쎈줈 留ㅺ퀬 ?占쎈뒗 ??媛앹껜
let coins = 0;
let speedLevel = 1;
let speed경험치 = 0;
let baseSpeed = 0.6;

let refillTimer = 240; // 4 minutes

let hasTreadmill = false; let isTraining = false;
let treadmillTier = 0;
const treadmills = [
    { name: "나무 런닝머신", cost: 50, mult: 1, color: 0x8b4513, emissive: 0x000000 },
    { name: "돌 런닝머신", cost: 200, mult: 2, color: 0x888888, emissive: 0x000000 },
    { name: "탄소 런닝머신", cost: 1000, mult: 5, color: 0x222222, emissive: 0x000000 },
    { name: "네온 런닝머신", cost: 5000, mult: 10, color: 0x111111, emissive: 0x00ff00 },
    { name: "합금 런닝머신", cost: 20000, mult: 25, color: 0x5555ff, emissive: 0x0000ff },
    { name: "황금 런닝머신", cost: 80000, mult: 50, color: 0xffd700, emissive: 0xffaa00 },
    { name: "다이아몬드 런닝머신", cost: 200000, mult: 100, color: 0xaaffff, emissive: 0x00ffff },
    { name: "플라즈마 런닝머신", cost: 500000, mult: 250, color: 0xff00ff, emissive: 0xff00ff },
    { name: "초합금 런닝머신", cost: 800000, mult: 500, color: 0x000000, emissive: 0xffffff },
    { name: "우주 런닝머신 갓", cost: 1000000, mult: 1000, color: 0xffffff, emissive: 0xffffff }
];
let bossCamTimer = 0; let activeBoss = null;


let allPets = []; 
let totalCoinRate = 0;
let petIdCounter = 0;
const levelReqs = [ 0, 36000, 108000, 216000, 648000, 1728000, 3240000, 5184000, 10368000, 15552000, 25920000, 36288000 ];

const petRarities = [
    { name: '일반', prob: 0.50, mult: 1, scale: 1.0, colorTint: 0xffffff },
    { name: '레어', prob: 0.30, mult: 2, scale: 1.2, colorTint: 0x88ccff },
    { name: '에픽', prob: 0.15, mult: 5, scale: 1.5, colorTint: 0xffaa00 },
    { name: '전설', prob: 0.05, mult: 20, scale: 2.0, colorTint: 0xff00ff }
];

function rollRarity() {
    const r = Math.random();
    if (r < 0.05) return 3;
    if (r < 0.20) return 2;
    if (r < 0.50) return 1;
    return 0;
}

// --- Three.js ?占쎌뾽 ---
const clock = new THREE.Clock();
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x88ccff);
scene.fog = new THREE.Fog(0x88ccff, 50, 600);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x666666, 0.6); scene.add(hemiLight); // 遺?占쎈윭??議곕챸
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(-100, 200, 100); dirLight.castShadow = true;
dirLight.shadow.camera.top = 200; dirLight.shadow.camera.bottom = -200;
dirLight.shadow.camera.left = -200; dirLight.shadow.camera.right = 200;
dirLight.shadow.camera.far = 1000;
scene.add(dirLight);

const SAFE_ZONE_Z = 15;

const biomeLength = 250;
const biomes = [
    { name: '초원', color: 0x228B22, mob: 'chicken', speed: 0.2 }, { name: '사막', color: 0xDAA520, mob: 'scorpion', speed: 0.35 },
    { name: '설원', color: 0xFFFAFA, mob: 'wolf', speed: 0.5 }, { name: '정글', color: 0x006400, mob: 'yeti', speed: 0.65 },
    { name: '화산', color: 0x8B0000, mob: 'golem', speed: 0.8 }, { name: '심연', color: 0x00008B, mob: 'slime', speed: 1.0 },
    { name: '수정 동굴', color: 0x8a2be2, mob: 'crystal', speed: 1.15 }, { name: '기계 도시', color: 0xaaaaaa, mob: 'robot', speed: 1.35 },
    { name: '창공', color: 0x87CEEB, mob: 'gryphon', speed: 1.5 }, { name: '심해', color: 0x000080, mob: 'angler', speed: 1.6 },
    { name: '방사능 지대', color: 0x556b2f, mob: 'mutant', speed: 1.8 }, { name: '용의 둥지', color: 0x111111, mob: 'dragon', speed: 2.0 }, { name: '천사', color: 0xffffff, mob: 'half_angel_demon', speed: 2.3 }, { name: '악마', color: 0x8b0000, mob: 'half_angel_demon', speed: 2.6 }
];

function getPlayerSpeed() { return baseSpeed + ((speedLevel - 1) * 0.3); }

const particles = [];
function spawnParticle(x, y, z, color, spread=1, lifeDecay=0.05) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshBasicMaterial({color: color, transparent: true, opacity: 0.8}));
    p.position.set(x + (Math.random()-0.5)*spread, y + (Math.random()-0.5)*spread, z + (Math.random()-0.5)*spread);
    p.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    const vel = new THREE.Vector3((Math.random()-0.5)*spread*0.3, Math.random()*spread*0.5 + 0.1, (Math.random()-0.5)*spread*0.3);
    scene.add(p); particles.push({ mesh: p, life: 1.0, vel: vel, decay: lifeDecay });
}

// ?占쎌뒪占??占쎌꽦占?(諛붾몣???占쏀꽩?占쎈줈 寃뚯엫 占??占쎈━????
function createGridTexture(c1, c2) {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = c1; ctx.fillRect(0,0,512,512);
    ctx.fillStyle = c2;
    for(let i=0; i<512; i+=64) { ctx.fillRect(i, 0, 2, 512); ctx.fillRect(0, i, 512, 2); }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, biomeLength/40);
    return tex;
}

const addPart = (grp, w, h, d, col, x, y, z, rx=0, ry=0, rz=0, matArgs={}) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({color:col, roughness:0.7, ...matArgs}));
    m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow = true; grp.add(m); return m;
};

// 紐ъ뒪???占쎌꽦 (variant???占쎈씪 4媛吏 罹먮┃?占쎌꽦 遺??
function createMonsterMesh(type, variant = 0) {
    const group = new THREE.Group();
    if (type === 'unicorn') {
        // ?占쎈땲占?(占??占쏀깭 + 占?+ 臾댐옙?占??占쎌긽)
    addPart(group, 5,5,10, 0xffffff, 0,6,0); // 紐명넻
    addPart(group, 3,4,4, 0xffffff, 0,9,5); // 癒몃━
    addPart(group, 1,3,1, 0xffd700, 0,11,6, Math.PI/4, 0, 0); // ?占쎄툑 占?
    addPart(group, 2,5,2, 0xffffff, -2,2.5,3); addPart(group, 2,5,2, 0xffffff, 2,2.5,3); // ?占쎈떎占?
    addPart(group, 2,5,2, 0xffffff, -2,2.5,-3); addPart(group, 2,5,2, 0xffffff, 2,2.5,-3); // ?占쎈떎占?
    addPart(group, 1,6,2, 0xffaaff, 0,6,-6, -Math.PI/6, 0, 0); // 瑗щ━
    const wrapper = new THREE.Group(); wrapper.add(group); return wrapper;    } else if (type === 'half_angel_demon') {
        // High quality half angel half demon
        addPart(group, 2,4,2, 0xffffff, -1, 2, 0); // left leg
        addPart(group, 2,4,2, 0x550000, 1, 2, 0);  // right leg
        addPart(group, 4,5,3, 0xffffff, -2, 6.5, 0); // left body
        addPart(group, 4,5,3, 0x550000, 2, 6.5, 0);  // right body
        addPart(group, 3,4,3, 0xffffff, -1.5, 11, 0); // left head
        addPart(group, 3,4,3, 0x220000, 1.5, 11, 0);  // right head
        addPart(group, 1,1.5,1, 0x000000, 2, 13, 0); // right horn
        addPart(group, 3,0.5,3, 0xffff00, -1.5, 13.5, 0); // left halo
        addPart(group, 6,2,1, 0xffffff, -6, 7, 1.5); // left wing 1
        addPart(group, 4,2,1, 0xeeeeee, -8, 9, 1.5); // left wing 2
        addPart(group, 6,2,1, 0x111111, 6, 7, 1.5); // right wing 1
        addPart(group, 1,4,1, 0x000000, 9, 9, 1.5); // right wing tip
        
        const wrapper = new THREE.Group(); wrapper.add(group); return wrapper;
    } else if (type === 'chicken') {
        addPart(group, 7,6,8, 0xffffff, 0,4,0); addPart(group, 3,5,3, 0xffffff, 0,8,3); addPart(group, 4,4,4, 0xffffff, 0,10,4);
        addPart(group, 0.5,0.5,0.5, 0x000000, -1.8,10.5,5.8); addPart(group, 0.5,0.5,0.5, 0x000000, 1.8,10.5,5.8);
        addPart(group, 2,1,3, 0xffa500, 0,9.5,6); addPart(group, 1,2,1, 0xff0000, 0,8,5.5);
        addPart(group, 1,2,3, 0xff0000, 0,12,4); addPart(group, 1,1.5,1, 0xff0000, 0,12,2.5);
        addPart(group, 1.5,4,6, 0xeeeeee, -4,4,0, 0,0,Math.PI/8); addPart(group, 1.5,4,6, 0xeeeeee, 4,4,0, 0,0,-Math.PI/8);
        addPart(group, 5,4,2, 0xdddddd, 0,6,-4.5, -Math.PI/4,0,0);
        addPart(group, 0.5,3,0.5, 0xffa500, -2,1.5,0); addPart(group, 0.5,3,0.5, 0xffa500, 2,1.5,0);
        addPart(group, 2,0.5,2, 0xffa500, -2,0.25,0.5); addPart(group, 2,0.5,2, 0xffa500, 2,0.25,0.5);
    } else if (type === 'scorpion') {
        addPart(group, 6,3,10, 0x8b4513, 0,2,0);
        let ty=3, tz=-6; for(let i=0; i<5; i++) { addPart(group, 2,2,3, 0x8b4513, 0,ty+=1.5,tz-=1.5, Math.PI/8,0,0); }
        addPart(group, 1,3,1, 0xff0000, 0,ty+2,tz, Math.PI/4,0,0);
        for(let i=-1; i<=2; i++) { addPart(group, 4,0.5,0.5, 0x654321, -4,2,i*2, 0,0,Math.PI/6); addPart(group, 4,0.5,0.5, 0x654321, 4,2,i*2, 0,0,-Math.PI/6); }
        addPart(group, 2,1,4, 0x654321, -4,2,6, 0,-Math.PI/6,0); addPart(group, 3,2,4, 0x8b4513, -5,2,9);
        addPart(group, 2,1,4, 0x654321, 4,2,6, 0,Math.PI/6,0); addPart(group, 3,2,4, 0x8b4513, 5,2,9);
    } else if (type === 'wolf') {
        addPart(group, 5,4,9, 0x888888, 0,5,0); addPart(group, 4,5,5, 0xaaaaaa, 0,6,4); addPart(group, 4,4,4, 0x777777, 0,9,6);
        addPart(group, 2,2,4, 0x555555, 0,8,9); addPart(group, 1,1,1, 0x111111, 0,8.5,11);
        addPart(group, 1.5,2,1, 0x444444, -1.5,11,5, Math.PI/8,0,0); addPart(group, 1.5,2,1, 0x444444, 1.5,11,5, Math.PI/8,0,0);
        addPart(group, 2,2,6, 0x666666, 0,5,-7, -Math.PI/4,0,0);
        addPart(group, 1.5,4,1.5, 0x666666, -2,2,3); addPart(group, 1.5,4,1.5, 0x666666, 2,2,3);
        addPart(group, 1.5,4,1.5, 0x666666, -2,2,-3); addPart(group, 1.5,4,1.5, 0x666666, 2,2,-3);
    } else if (type === 'yeti') {
        addPart(group, 10,12,8, 0xffffff, 0,10,0); addPart(group, 8,6,2, 0xdddddd, 0,12,4); addPart(group, 6,6,6, 0xffffff, 0,18,2);
        addPart(group, 4,4,1, 0xadd8e6, 0,18,5.5); addPart(group, 4,12,4, 0xeeeeee, -7,10,0); addPart(group, 4,12,4, 0xeeeeee, 7,10,0);
        addPart(group, 4,8,4, 0xdddddd, -3,4,0); addPart(group, 4,8,4, 0xdddddd, 3,4,0);
    } else if (type === 'golem') {
        addPart(group, 6,8,6, 0xff4500, 0,8,0); addPart(group, 10,10,10, 0x222222, 0,8,0, 0,0,0, {transparent:true, opacity:0.9});
        addPart(group, 5,5,5, 0xff4500, 0,16,0); addPart(group, 6,6,6, 0x331111, 0,16,0);
        addPart(group, 4,10,4, 0x331111, -8,8,0); addPart(group, 4,10,4, 0x331111, 8,8,0);
        addPart(group, 3,3,3, 0xffa500, -5,15,5); addPart(group, 3,3,3, 0xffa500, 5,4,-5);
    } else if (type === 'slime') {
        addPart(group, 12,10,12, 0x32cd32, 0,5,0, 0,0,0, {transparent: true, opacity: 0.6}); addPart(group, 6,6,6, 0x006400, 0,5,0);
        addPart(group, 1.5,1.5,1.5, 0xffffff, -3,7,6); addPart(group, 1.5,1.5,1.5, 0xffffff, 3,7,6);
        addPart(group, 0.5,0.5,0.5, 0x000000, -3,7,6.6); addPart(group, 0.5,0.5,0.5, 0x000000, 3,7,6.6);
        addPart(group, 3,3,3, 0x32cd32, -5,2,-5); addPart(group, 4,4,4, 0x32cd32, 6,3,4);
    } else if (type === 'crystal') {
        addPart(group, 6,12,6, 0x8a2be2, 0,6,0); addPart(group, 4,6,4, 0xdda0dd, 0,15,0, Math.PI/4,Math.PI/4,0);
        const c1 = addPart(group, 3,10,3, 0xda70d6, -5,8,0); c1.lookAt(new THREE.Vector3(-10,15,0));
        const c2 = addPart(group, 3,10,3, 0xda70d6, 5,8,0); c2.lookAt(new THREE.Vector3(10,15,0));
        const c3 = addPart(group, 3,10,3, 0xba55d3, 0,8,-5); c3.lookAt(new THREE.Vector3(0,15,-10));
        addPart(group, 2,8,2, 0xff00ff, 0,20,0, 0,Math.PI/4,0);
    } else if (type === 'robot') {
        addPart(group, 8,10,6, 0xaaaaaa, 0,8,0); addPart(group, 6,5,6, 0x888888, 0,15.5,0); addPart(group, 5,1.5,1.5, 0x00ffff, 0,15.5,3.1);
        addPart(group, 1,5,1, 0x555555, -2,19,0); addPart(group, 1,5,1, 0x555555, 2,19,0);
        addPart(group, 4,8,4, 0x999999, -6,8,0); addPart(group, 4,8,4, 0x999999, 6,8,0);
        addPart(group, 10,4,10, 0x333333, 0,2,0); addPart(group, 12,3,3, 0x111111, 0,1.5,-4); addPart(group, 12,3,3, 0x111111, 0,1.5,4);
    } else if (type === 'gryphon') {
        addPart(group, 7,6,12, 0xffd700, 0,8,0); addPart(group, 5,5,6, 0xffffff, 0,13,7); addPart(group, 2,3,4, 0xffaa00, 0,12,11);
        for(let i=0; i<3; i++) { addPart(group, 14,0.5,3, 0xffffff, -7-i*2,12-i,2-i, 0,-Math.PI/8,-Math.PI/6); addPart(group, 14,0.5,3, 0xffffff, 7+i*2,12-i,2-i, 0,Math.PI/8,Math.PI/6); }
        addPart(group, 2,5,2, 0xffd700, -2,2.5,-4); addPart(group, 2,5,2, 0xffd700, 2,2.5,-4);
        addPart(group, 2,5,2, 0xdddddd, -2,2.5,4); addPart(group, 2,5,2, 0xdddddd, 2,2.5,4);
    } else if (type === 'angler') {
        addPart(group, 12,12,14, 0x000080, 0,7,0); addPart(group, 14,2,16, 0x000055, 0,2,2);
        for(let x=-5; x<=5; x+=2) { addPart(group, 0.5,2,0.5, 0xffffff, x,4,9, Math.PI/8,0,0); addPart(group, 0.5,2,0.5, 0xffffff, x,11,7, -Math.PI/8,0,0); }
        addPart(group, 1,6,1, 0x111111, 0,15,6, Math.PI/4,0,0); addPart(group, 3,3,3, 0x00ffff, 0,17,10, 0,0,0, {emissive: 0x00ffff});
    } else if (type === 'mutant') {
        addPart(group, 8,12,8, 0x556b2f, 0,6,0); addPart(group, 5,5,5, 0x8b008b, -2,14,0); addPart(group, 4,4,4, 0x483d8b, 3,13,2);
        addPart(group, 10,16,10, 0x2e8b57, -9,8,0); addPart(group, 2,6,2, 0x8b008b, 5,6,0);
        addPart(group, 1.5,1.5,1.5, 0xff0000, -3,15,2.6); addPart(group, 1,1,1, 0xffff00, 3,14,4); addPart(group, 2,2,2, 0x8b008b, -10,12,5);
    } else if (type === 'dragon') {
        addPart(group, 8,8,16, 0x111111, 0,12,0); addPart(group, 4,6,6, 0x222222, 0,15,10); addPart(group, 6,6,8, 0x222222, 0,18,14);
        addPart(group, 1.5,4,1.5, 0x00ff00, -2,21,15, -Math.PI/4,0,0); addPart(group, 1.5,4,1.5, 0x00ff00, 2,21,15, -Math.PI/4,0,0);
        for(let z=-6; z<=6; z+=4) addPart(group, 2,4,2, 0x00ff00, 0,17,z, -Math.PI/6,0,0);
        addPart(group, 5,5,10, 0x111111, 0,10,-10); addPart(group, 3,3,8, 0x111111, 0,8,-18); addPart(group, 4,1,6, 0x00ff00, 0,8,-23);
        addPart(group, 20,1,10, 0x222222, -14,14,2, 0,0,-Math.PI/6); addPart(group, 20,1,10, 0x222222, 14,14,2, 0,0,Math.PI/6);
        addPart(group, 15,1,8, 0x00ff00, -28,18,0, 0,0,-Math.PI/8); addPart(group, 15,1,8, 0x00ff00, 28,18,0, 0,0,Math.PI/8);
    } else { addPart(group, 6,6,6, 0xff0000, 0,3,0); }

    const wrapper = new THREE.Group(); wrapper.add(group);
    
    // ?占쎄툒 ?占쎌슜 (?占쎌긽 ?占쏀듃 占?占?異뷂옙?)
    if (variant > 0) {
        const rData = petRarities[variant];
        wrapper.scale.setScalar(rData.scale);
        wrapper.traverse(c => {
            if (c.isMesh) {
                c.material = c.material.clone();
                c.material.color.multiplyHex(rData.colorTint);
                if(variant === 3) { c.material.emissive.setHex(0x330033); c.material.metalness = 1.0; }
            }
        });
        if (variant >= 2) {
            const haloGeo = new THREE.TorusGeometry(8, 0.5, 16, 32);
            const haloMat = new THREE.MeshBasicMaterial({color: 0xffff00});
            const halo = new THREE.Mesh(haloGeo, haloMat);
            halo.rotation.x = Math.PI/2; halo.position.y = 20;
            wrapper.add(halo);
        }
    }
    return wrapper;
}


function createEggMesh(biomeIndex, isRainbow = false) {
    const group = new THREE.Group();
    let mat;
    if (isRainbow) {
        mat = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0xffaaff, emissiveIntensity: 0.5,
            roughness: 0, metalness: 1.0, wireframe: true 
        }); // 臾댐옙?占??占쎌쓣 ?占쎈낫?占쎄쾶 ?占쎈뒗 ?占쎌닔 ?占쎌쭏 (?占쎌떆占?鍮쏅굹???占?占쎌뼱?占쎈젅??
    } else {
        mat = new THREE.MeshStandardMaterial({color: biomes[biomeIndex].color, roughness: 0.2, metalness: 0.2});
    }
    
    let mesh;
    switch(biomeIndex) {
        case 0: mesh = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), mat); mesh.scale.set(1,1.3,1); break;
        case 1: mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4, 16), mat); break;
        case 2: mesh = new THREE.Mesh(new THREE.ConeGeometry(2.5, 5, 16), mat); break;
        case 3: mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5), mat); break;
        case 4: mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5), mat); break;
        case 5: mesh = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), mat); break;
        case 6: mesh = new THREE.Mesh(new THREE.OctahedronGeometry(2.5), mat); break;
        case 7: mesh = new THREE.Mesh(new THREE.TorusGeometry(2, 1, 16, 32), mat); mesh.rotation.x = Math.PI/2; break;
        case 8: 
            mesh = new THREE.Group();
            const s1 = new THREE.Mesh(new THREE.SphereGeometry(1.5), mat); s1.position.set(-1.5,0,0); mesh.add(s1);
            const s2 = new THREE.Mesh(new THREE.SphereGeometry(2), mat); s2.position.set(0,1,0); mesh.add(s2);
            const s3 = new THREE.Mesh(new THREE.SphereGeometry(1.5), mat); s3.position.set(1.5,0,0); mesh.add(s3);
            break;
        case 9: 
            mesh = new THREE.Group();
            const shell = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16, 0, Math.PI*2, 0, Math.PI/2), mat);
            shell.rotation.x = Math.PI; shell.position.y = -0.5; mesh.add(shell);
            const pearl = new THREE.Mesh(new THREE.SphereGeometry(1.2), new THREE.MeshStandardMaterial({color:0xffffff}));
            pearl.position.y = 0.5; mesh.add(pearl);
            break;
        case 10: mesh = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4, 16), mat); break;
                case 11: mesh = new THREE.Mesh(new THREE.TetrahedronGeometry(3.5), mat); break;
        case 12: 
            mesh = new THREE.Group();
            const angelEgg = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0.5, roughness: 0.1})); angelEgg.scale.set(1,1.3,1); mesh.add(angelEgg);
            const angelHalo = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 16, 32), new THREE.MeshStandardMaterial({color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5})); angelHalo.rotation.x = Math.PI/2; angelHalo.position.y = 3; mesh.add(angelHalo);
            const leftAWing = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 16), new THREE.MeshStandardMaterial({color: 0xffffff})); leftAWing.rotation.z = Math.PI/4; leftAWing.position.set(-2, 1, 0); mesh.add(leftAWing);
            const rightAWing = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 16), new THREE.MeshStandardMaterial({color: 0xffffff})); rightAWing.rotation.z = -Math.PI/4; rightAWing.position.set(2, 1, 0); mesh.add(rightAWing);
            break;
        case 13: 
            mesh = new THREE.Group();
            const demonEgg = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshStandardMaterial({color: 0x8b0000, metalness: 0.8, roughness: 0.2})); demonEgg.scale.set(1,1.3,1); mesh.add(demonEgg);
            const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2, 16), new THREE.MeshStandardMaterial({color: 0x000000})); leftHorn.rotation.z = -Math.PI/6; leftHorn.position.set(-1, 2.5, 0); mesh.add(leftHorn);
            const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2, 16), new THREE.MeshStandardMaterial({color: 0x000000})); rightHorn.rotation.z = Math.PI/6; rightHorn.position.set(1, 2.5, 0); mesh.add(rightHorn);
            const demonRing = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.3, 16, 32), new THREE.MeshStandardMaterial({color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8})); demonRing.rotation.x = Math.PI/2; demonRing.position.y = 0; mesh.add(demonRing);
            break;
        default: mesh = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), mat); mesh.scale.set(1,1.3,1); break;
    }
    
    if (mesh.isMesh) { mesh.position.y = 2; mesh.castShadow = true; }
    else { mesh.position.y = 2; mesh.traverse(c => { if(c.isMesh) c.castShadow = true; }); }
    group.add(mesh);
    
    // ?占쎈퀎???占쎌씠??異뷂옙?
    group.traverse(c => { if(c.isMesh) { c.userData.isEgg = true; c.userData.biomeIndex = biomeIndex; } });
    return group;
}

const monstersList = [];
let sceneEggs = [];

// ??????(?臾? 諛붿쐞 ??
function createDeco(biomeIndex, x, z) {
    const grp = new THREE.Group();
    if (biomeIndex % 2 === 0) { 
        addPart(grp, 2, 8, 2, 0x5c4033, 0, 4, 0); 
        addPart(grp, 8, 8, 8, biomes[biomeIndex].color, 0, 10, 0); 
    } else { 
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random()*4 + 2), new THREE.MeshStandardMaterial({color: biomes[biomeIndex].color, roughness: 0.9}));
        rock.position.y = 2; rock.castShadow = true; grp.add(rock);
    }
    grp.position.set(x, 0, z);
    scene.add(grp);
}


function createMountain(x, z, length, height, color) {
    const geo = new THREE.PlaneGeometry(length, height, 32, 16);
    geo.rotateY(Math.PI/2);
    const pos = geo.attributes.position;
    for(let j=0; j<pos.count; j++) {
        const vy = pos.getY(j);
        if (vy > -height/2 + 10) { 
            pos.setX(j, pos.getX(j) + (Math.random()-0.5)*35);
            pos.setZ(j, pos.getZ(j) + (Math.random()-0.5)*35);
        }
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({color: color, roughness: 1.0, flatShading: true});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2 - 10, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
}

function createWorld() {
    for (let i = 0; i < biomes.length; i++) {
        const biome = biomes[i];
        const centerZ = -(i * biomeLength) - (biomeLength / 2);
        
        // 怨좏꾨━??泥댄겕蹂대뱶 諛붾떏
    const tex = createGridTexture(biome.color, 0x222222);
        const planeMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(400, biomeLength), planeMat);
        plane.rotation.x = -Math.PI/2; plane.position.z = centerZ; plane.receiveShadow = true; scene.add(plane);

        
const leftWall = createMountain(-160, centerZ, biomeLength, 150, biome.color); scene.add(leftWall);
        const rightWall = createMountain(160, centerZ, biomeLength, 150, biome.color); rightWall.rotation.y = Math.PI; scene.add(rightWall);

        // ?占쎌떇占?諛곗튂
    for(let d=0; d<15; d++) {
            const dx = (Math.random()-0.5)*280; const dz = centerZ + (Math.random()-0.5)*biomeLength;
            if (dx > -70 && dx < 70) continue; // 以묒븰 湲몌옙? ?占쎄쾶 鍮꾩썙??
    createDeco(i, dx, dz);
        }

        const bossScale = 1.0 + (biome.speed * 1.5); // 湲곕낯 ?占쎄린(1.0)?占쎌꽌 蹂댁뒪媛 鍮좑옙??占쎈줉(?占쎈컲 諛붿씠?占쎌씪?占쎈줉) 而ㅼ쭚
    const monsterMesh = createMonsterMesh(biome.mob, 0);
        monsterMesh.scale.setScalar(bossScale);
        monsterMesh.position.set(0, 0, centerZ - 35); 
scene.add(monsterMesh);
        monstersList.push({ mesh: monsterMesh, innerGroup: monsterMesh.children[0], biomeIndex: i, speed: biome.speed, isAggro: false, spawnX: 0, spawnZ: centerZ - 35 });

    }
}

function respawnAllEggs() {
    // 湲곗〈 ?占쎌깮 ??占??占쏙옙? ?占쎄굅
    for (let i = sceneEggs.length - 1; i >= 0; i--) {
        const eg = sceneEggs[i];
        if (eg.isWild) {
            scene.remove(eg.mesh);
            if (eg.nest) scene.remove(eg.nest);
            sceneEggs.splice(i, 1);
        }
    }
    
    // ??由ъ뀑
    for (let i = 0; i < biomes.length; i++) {
        const centerZ = -(i * 250) - 125;
        const spawnCount = (biomes[i].name === '천사' || biomes[i].name === '악마') ? 3 : 6;
        for (let e = 0; e < spawnCount; e++) {
            const isRainbow = Math.random() < 0.01;
            const sizeScale = 0.5 + Math.random() * 1.5; // 0.5x ~ 2.0x ?占쎈뜡 ?占쎄린
    const angle = (e / spawnCount) * Math.PI * 2;
            const ex = Math.cos(angle) * 18; const ez = centerZ + Math.sin(angle) * 18;
            
            const eggGroup = createEggMesh(i, isRainbow);
            eggGroup.scale.setScalar(sizeScale);
            eggGroup.position.set(ex, 0, ez); scene.add(eggGroup);
            eggGroup.traverse(c => { if(c.isMesh) c.userData.eggObj = eggGroup; });
            
            const nest = new THREE.Mesh(new THREE.BoxGeometry(4 * sizeScale, 0.5, 4 * sizeScale), new THREE.MeshStandardMaterial({color: 0x5c4033}));
            nest.position.set(ex, 0.25, ez); scene.add(nest);

            sceneEggs.push({ mesh: eggGroup, biomeIndex: i, active: true, isWild: true, isRainbow: isRainbow, sizeScale: sizeScale, nest: nest });
        }
    }
}

createWorld();
respawnAllEggs();

// --- ?占쎌쟾 援ъ뿭 占?遺?占쎌옣 ---
const safeZone = new THREE.Group();
scene.add(safeZone);
safeZone.position.set(0, 0, SAFE_ZONE_Z + (100 - SAFE_ZONE_Z)/2);
const safeTex = createGridTexture(0x88cc88, 0x558855);
const safePlane = new THREE.Mesh(new THREE.PlaneGeometry(400, 100), new THREE.MeshStandardMaterial({map: safeTex}));
safePlane.rotation.x = -Math.PI/2; safePlane.receiveShadow = true; safeZone.add(safePlane);

const penGroup = new THREE.Group();
safeZone.add(penGroup);
penGroup.position.set(20, 0, -10); 
for(let x=-30; x<=30; x+=10) { addPart(penGroup, 1,5,1, 0x8b4513, x, 2.5, 20); addPart(penGroup, 1,5,1, 0x8b4513, x, 2.5, -20); }
for(let z=-20; z<=20; z+=10) { addPart(penGroup, 1,5,1, 0x8b4513, -30, 2.5, z); addPart(penGroup, 1,5,1, 0x8b4513, 30, 2.5, z); }
addPart(penGroup, 60, 0.5, 0.5, 0x8b4513, 0, 3, 20); addPart(penGroup, 60, 0.5, 0.5, 0x8b4513, 0, 3, -20);
addPart(penGroup, 0.5, 0.5, 40, 0x8b4513, -30, 3, 0); addPart(penGroup, 0.5, 0.5, 40, 0x8b4513, 30, 3, 0);

// --- ?占쎌젏 ---
const shopBuilding = new THREE.Group();
safeZone.add(shopBuilding);
shopBuilding.position.set(-40, 0, -10);
addPart(shopBuilding, 30, 1, 20, 0x333333, 0, 0.5, 0); addPart(shopBuilding, 30, 15, 2, 0x8b0000, 0, 8, -9);
addPart(shopBuilding, 2, 15, 20, 0x8b0000, -14, 8, 0); addPart(shopBuilding, 2, 15, 20, 0x8b0000, 14, 8, 0);
addPart(shopBuilding, 32, 2, 24, 0x111111, 0, 16, 0); addPart(shopBuilding, 30, 1, 10, 0x0000aa, 0, 14, 12, Math.PI/6, 0, 0);
addPart(shopBuilding, 16, 4, 2, 0xffff00, 0, 18, 10);
const treadmillGroup = new THREE.Group();
scene.add(treadmillGroup);
treadmillGroup.position.set(20, 0, 5); // 펜스 앞 고정 위치
treadmillGroup.rotation.y = Math.PI; // 플레이어를 향하게 회전

let displayTM = null;

function rebuildTreadmill() {
    while(treadmillGroup.children.length > 0) treadmillGroup.remove(treadmillGroup.children[0]);
    if (displayTM) {
        shopBuilding.remove(displayTM);
        displayTM = null;
    }
    
    // 안전 장치
    if (treadmillTier >= treadmills.length) treadmillTier = treadmills.length - 1;
    const tier = hasTreadmill ? treadmillTier : 0; 
    const t = treadmills[tier];
    if (!t) return;
    
    const baseMat = new THREE.MeshStandardMaterial({ 
        color: t.color, emissive: t.emissive, 
        roughness: (tier >= 6) ? 0.1 : 0.8, metalness: (tier >= 3) ? 0.8 : 0.1,
        transparent: t.transparent || false, opacity: t.opacity || 1.0 
    });
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: t.emissive });

    const base = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 12), baseMat);
    base.position.y = 0.5; treadmillGroup.add(base);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 1), panelMat);
    panel.position.set(0, 3, -5.5); panel.rotation.x = -Math.PI/6; treadmillGroup.add(panel);

    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 6), handleMat);
    p1.position.set(-3, 4, -2); treadmillGroup.add(p1);
    
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4, 6), handleMat);
    p2.position.set(3, 4, -2); treadmillGroup.add(p2);

    if (tier >= 5) {
        const glow = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.2, 12.5), new THREE.MeshBasicMaterial({ color: t.emissive, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
        glow.position.y = 0.25; treadmillGroup.add(glow);
    }
    if (tier >= 10) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.2, 16, 100), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        ring.rotation.x = Math.PI / 2; ring.position.y = 7;
        treadmillGroup.add(ring);
        treadmillGroup.userData.ring = ring;
    } else {
        treadmillGroup.userData.ring = null;
    }

    displayTM = treadmillGroup.clone(); 
    displayTM.position.set(0, 1, 0); displayTM.rotation.y = Math.PI/4; 
    displayTM.scale.set(0.6, 0.6, 0.6); // ?占쎌젏??留욊쾶 ?占쎄컙 異뺤냼
    shopBuilding.add(displayTM);
}
rebuildTreadmill();

// --- ?占쎈젅?占쎌뼱 ---
const player = new THREE.Group(); scene.add(player);
const torso = addPart(player, 4, 5, 2, 0xff0000, 0, 5.5, 0); const head = addPart(player, 3, 3, 3, 0xffccaa, 0, 9.5, 0);
const leftArm = addPart(player, 1.5, 5, 1.5, 0xff0000, -3, 5.5, 0); const rightArm = addPart(player, 1.5, 5, 1.5, 0xff0000, 3, 5.5, 0);
const leftLeg = addPart(player, 1.8, 5, 1.8, 0x0000ff, -1, 2.5, 0); const rightLeg = addPart(player, 1.8, 5, 1.8, 0x0000ff, 1, 2.5, 0);

// ?占쎈깽?占쎈━?占쎌꽌 ?占쎄퀬 ?占쎈뒗 ??鍮꾩＜??(??
const heldEggVis = new THREE.Group(); heldEggVis.position.set(0, 4, 3); player.add(heldEggVis); 
// ?占쎌퀜??吏딆뼱吏占??占쎈뒗 ??鍮꾩＜??(??癒몃━ ??
const carriedEggVis = new THREE.Group(); carriedEggVis.position.set(0, 14, 0); player.add(carriedEggVis); 

player.position.set(0, 0, 80);
let velocityY = 0; const gravity = -0.03; const jumpForce = 0.8; // ?占쏀봽 蹂??
// --- 議곗옉 ---
const keys = { w: false, a: false, s: false, d: false, f: false, e: false, ' ': false };
let camAngleX = 0; let camAngleY = Math.PI / 6;

window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if(keys.hasOwnProperty(k)) keys[k] = true;
    
    if (k === ' ' && player.position.y <= 0.1) velocityY = jumpForce; // ?占쏀럹?占쎌뒪占??占쏀봽
    if (k >= '1' && k <= '5') { hotbarIndex = parseInt(k) - 1; updateHotbarUI(); }
    
    if (k === 'e') {
        if (hasTreadmill && player.position.distanceTo(treadmillGroup.position) < 8) {
            toggleTraining(); return;
        } 
        
        if (player.position.z > SAFE_ZONE_Z) {
            const shopPos = new THREE.Vector3(); shopBuilding.getWorldPosition(shopPos);
            if (player.position.distanceTo(shopPos) < 25) {
                updateShopUI();
                document.getElementById('shopUi').style.display = 'block'; document.exitPointerLock();
            }
        } else {
            
if (carryingEgg !== null) {
                showAlert("?占쏙옙? ?占쎌쓣 ?占쎄퀬 ?占쎌뒿?占쎈떎! 癒쇽옙? ?占쎌쟾 援ъ뿭?占쎈줈 媛?占쏙옙??占쎌슂.", "#ffaa00"); return;
            }
            let closestEgg = null; let minDist = 35; // ?占쎌젙 踰붿쐞 ?占??利앾옙?
    sceneEggs.forEach(eg => {
                if (eg.isWild && eg.active) {
                    const dist = player.position.distanceTo(eg.mesh.position);
                    if (dist < minDist) { minDist = dist; closestEgg = eg; }
                }
            });
            if (closestEgg) stealEgg(closestEgg);
        }
    }
    
});
window.addEventListener('keyup', (e) => { const k = e.key.toLowerCase(); if(keys.hasOwnProperty(k)) keys[k] = false; });
document.body.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('#shopUi') || e.target.closest('#petModal')) return;
    document.body.requestPointerLock();
});
window.addEventListener('mousemove', e => {
    if (document.pointerLockElement === document.body) {
        camAngleX -= e.movementX * 0.005; camAngleY += e.movementY * 0.005;
        camAngleY = Math.max(0.1, Math.min(Math.PI/2 - 0.1, camAngleY));
    }
});

function updateShopUI() {
    const btn = document.getElementById('btnBuyTreadmill');
    let nextIndex = hasTreadmill ? treadmillTier + 1 : 0;
    if (nextIndex >= treadmills.length) {
        btn.innerText = "최고 등급 달성!";
        btn.disabled = true;
        btn.style.background = "#555";
        btn.style.color = "#aaa";
    } else {
        const nextT = treadmills[nextIndex];
        btn.innerText = `${nextT.name} 구매 (${nextT.cost.toLocaleString()} 코인) - 경험치 x${nextT.mult}`;
        btn.disabled = false;
        btn.style.background = "gold";
        btn.style.color = "#000";
    }
}

// ???占쎌튂占?占??占쎌튂
const raycaster = new THREE.Raycaster();
window.addEventListener('mousedown', (e) => {
    if (document.pointerLockElement !== document.body) return;
    if (e.button === 0) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        
        
const intersects = raycaster.intersectObjects(scene.children, true);
        for(let i=0; i<intersects.length; i++) {
            const obj = intersects[i].object;
            if (obj.userData && obj.userData.isEgg && obj.userData.eggObj) {
                const group = obj.userData.eggObj;
                const eggData = sceneEggs.find(eg => eg.mesh === group);
                if (eggData && eggData.isWild) {
                    if (carryingEgg !== null) {
                        showAlert("?占쏙옙? ?占쎌쓣 ?占쎄퀬 ?占쎌뒿?占쎈떎! 癒쇽옙? ?占쎌쟾 援ъ뿭?占쎈줈 媛?占쏙옙??占쎌슂.", "#ffaa00");
                    } else if (player.position.distanceTo(group.position) < 25) {
                        stealEgg(eggData);
                    } else {
                        showAlert("?占쎌씠 ?占쎈Т 硫됰땲??", "#ffaa00");
                    }
                    return; 
}
            }
        }

        // 2. 遺?占쎌옣 ???占쎌튂
    if (heldEggs[hotbarIndex] !== null && player.position.z > SAFE_ZONE_Z) {
            const hit = raycaster.intersectObject(safePlane);
            if (hit.length > 0) {
                const pt = hit[0].point;
                const localX = pt.x - penGroup.position.x; const localZ = (pt.z - safeZone.position.z) - penGroup.position.z;
                if (localX > -30 && localX < 30 && localZ > -20 && localZ < 20) { placeEgg(pt, heldEggs[hotbarIndex]); } 
                else { showAlert("遺?占쎌옣 ?占쎈━ ?占쎌뿉 ?占쎌튂?占쎌빞 ?占쎈땲??", "#ffaa00"); }
            }
        }
    }
});

function stealEgg(eggData) {
    carryingEgg = { biomeIndex: eggData.biomeIndex, sizeScale: eggData.sizeScale, isRainbow: eggData.isRainbow };
    eggData.active = false;
    scene.remove(eggData.mesh);
    if(eggData.nest) scene.remove(eggData.nest);
    showAlert(`알을 훔쳤습니다! 무사히 도망가세요! ${biomes[eggData.biomeIndex].name} 보스가 쫓아옵니다!`, "#ffff00");
    velocityY = 0.6; 
}

function placeEgg(pos, eggObj, loadedTime = null) {
    if (loadedTime === null) { heldEggs[hotbarIndex] = null; updateHotbarUI(); }
    const eggGroup = createEggMesh(eggObj.biomeIndex, eggObj.isRainbow); 
    eggGroup.scale.setScalar(eggObj.sizeScale);
    eggGroup.position.copy(pos); scene.add(eggGroup);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(4 * eggObj.sizeScale, 0.5), new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide}));
    bar.position.copy(pos); bar.position.y += (4 * eggObj.sizeScale); scene.add(bar);
    
    const maxTime = (eggObj.biomeIndex + 1) * 5;
    let t = loadedTime !== null ? loadedTime : maxTime;
    if (isNaN(t) || t === null) t = maxTime; 
    
    sceneEggs.push({ mesh: eggGroup, biomeIndex: eggObj.biomeIndex, active: true, isWild: false, timeLeft: t, maxTime: maxTime, bar: bar, sizeScale: eggObj.sizeScale, isRainbow: eggObj.isRainbow });
}

function spawnPet(eggObj, pos, variant, isLoad = false) {
    let rData = petRarities[variant];
    const actualVariant = eggObj.isRainbow ? 99 : variant; // 臾댐옙?占??占쏙옙? ?占쎈땲占?99)
    let rate = 0;
    
    const mesh = createMonsterMesh(eggObj.isRainbow ? 'unicorn' : biomes[eggObj.biomeIndex].mob, actualVariant);
    
    if (eggObj.isRainbow) {
        mesh.scale.setScalar(0.25 * eggObj.sizeScale); 
        rate = Math.floor(1000 * eggObj.sizeScale);
        rData = { name: "무지개 유니콘", colorTint: 0xffaaff, scale: 1, mult: 1 };
    } else {
        mesh.scale.setScalar(0.2 * rData.scale * eggObj.sizeScale); 
        rate = Math.floor((eggObj.biomeIndex + 1) * 5 * rData.mult * eggObj.sizeScale);
    }
    
    mesh.position.copy(pos); scene.add(mesh);

    const pet = { id: petIdCounter++, biomeIndex: eggObj.biomeIndex, variant: actualVariant, mesh: mesh, isEquipped: false, rate: rate, targetPos: new THREE.Vector3().copy(pos), isRainbow: eggObj.isRainbow, sizeScale: eggObj.sizeScale };
    
    if (!isLoad) {
        const eqCount = allPets.filter(p => p.isEquipped).length;
        if (eqCount < 3) pet.isEquipped = true;
    }

    allPets.push(pet);
    
    const lbl = document.createElement('div'); lbl.className = 'pet-label'; lbl.innerText = `+${rate} 코인/s`;
    document.getElementById('petLabelsContainer').appendChild(lbl); pet.label = lbl;

    recalculateCoinRate(); updatePetModal();
    if (!isLoad) showAlert(`부화 성공! [${rData.name}] 펫 획득! (+${rate}/s)`, `#${rData.colorTint.toString(16).padStart(6,'0')}`);
    return pet;
}

function recalculateCoinRate() {
    let rate = 0;
    allPets.forEach(p => {
        if (p.isEquipped) {
            if (isNaN(p.rate)) p.rate = 1;
            rate += p.rate;
        }
    });
    totalCoinRate = rate;
    const rateEl = document.getElementById('coinRate');
    if (rateEl) rateEl.innerText = totalCoinRate;
}
setInterval(() => { if(totalCoinRate > 0) { coins += totalCoinRate; updateUI(); } }, 1000);

function updateHotbarUI() {
    for(let i=0; i<5; i++) {
        const slot = document.getElementById("slot" + (i+1));
        if(i === hotbarIndex) slot.classList.add('active'); else slot.classList.remove('active');
        const itemDiv = slot.querySelector('.item');
        const eggObj = heldEggs[i];
        if (eggObj !== null) {
            itemDiv.innerText = eggObj.isRainbow ? String.fromCodePoint(0x1F308) : String.fromCharCode(50508) + (eggObj.biomeIndex+1);
            itemDiv.style.fontSize = eggObj.isRainbow ? '24px' : '14px';
        } else {
            itemDiv.innerText = "";
        }
    }
}

function showAlert(msg, color) {
    const box = document.getElementById('alertBox');
    if (!box) return;
    const el = document.createElement('div');
    el.innerText = msg;
    el.style.color = color;
    el.style.fontWeight = 'bold';
    el.style.textShadow = '1px 1px 2px black';
    el.style.marginBottom = '5px';
    box.appendChild(el);
    setTimeout(() => {
        if (el.parentNode === box) box.removeChild(el);
    }, 3000);
}

function updateUI() {
    if (isNaN(coins)) coins = 0;
    if (isNaN(speed경험치)) speed경험치 = 0;
    if (isNaN(speedLevel)) speedLevel = 1;
    document.getElementById('coinCount').innerText = Math.floor(coins); 
    document.getElementById('speedLevel').innerText = speedLevel;
    if (speedLevel < 12) {
        const prev = levelReqs[speedLevel - 1] || 0; const next = levelReqs[speedLevel] || 1;
        const percent = Math.min(100, Math.max(0, ((speed경험치 - prev) / (next - prev)) * 100));
        document.getElementById('xpBar').style.width = (isNaN(percent) ? 0 : percent) + '%'; 
        document.getElementById('xpText').innerText = `${Math.floor(speed경험치).toLocaleString()} / ${next.toLocaleString()} 경험치`;
    }
}

document.getElementById('btnCloseShop').addEventListener('click', () => document.getElementById('shopUi').style.display = 'none');
document.getElementById('btnBuyTreadmill').addEventListener('click', () => {
    let nextIndex = hasTreadmill ? treadmillTier + 1 : 0;
    if (nextIndex >= treadmills.length) return;
    const nextT = treadmills[nextIndex];
    if (coins >= nextT.cost) {
        coins -= nextT.cost; 
        treadmillTier = nextIndex;
        hasTreadmill = true;
        showAlert(nextT.name + " 구매 완료! (초당 경험치 x" + nextT.mult + ")", "#55ff55");
        rebuildTreadmill();
        updateShopUI();
        updateUI();
        saveGame();
    } else {
        showAlert("코인이 부족합니다!", "#ff0000");
    }
});

document.getElementById('btnPetMenu').addEventListener('click', () => { document.getElementById('petModal').style.display = 'flex'; document.exitPointerLock(); updatePetModal(); });
document.getElementById('btnClosePet').addEventListener('click', () => document.getElementById('petModal').style.display = 'none');
document.getElementById('btnEquipBest').addEventListener('click', () => {
    allPets.forEach(p => p.isEquipped = false);
    const sorted = [...allPets].sort((a,b) => b.rate - a.rate);
    for(let i=0; i<Math.min(3, sorted.length); i++) sorted[i].isEquipped = true;
    updatePetModal();
    recalculateCoinRate();
});

function updatePetModal() {
    const list = document.getElementById('petList'); list.innerHTML = ''; let eqCount = 0;
    allPets.forEach(pet => {
        if(pet.isEquipped) eqCount++;
        const card = document.createElement('div'); card.className = `pet-card ${pet.isEquipped ? 'equipped' : ''}`;
        
        let rData;
        if (pet.variant === 99 || pet.isRainbow) {
            rData = { name: "유니콘", colorTint: 0xffaaff };
        } else {
            rData = petRarities[pet.variant];
        }
        
        card.innerHTML = `
            <div style="font-weight:bold; color:#${rData.colorTint.toString(16).padStart(6,'0')}">[${rData.name}]</div>
            <div style="font-size:20px;">${biomes[pet.biomeIndex] ? biomes[pet.biomeIndex].name : '알 수 없음'}</div>
            <div>+${pet.rate} 💰/s</div>
        `;
        const btn = document.createElement('button'); btn.className = pet.isEquipped ? 'btn-unequip' : 'btn-equip'; btn.innerText = pet.isEquipped ? '해제' : '장착';
        btn.onclick = () => { 
            if (!pet.isEquipped && allPets.filter(p=>p.isEquipped).length >= 3) { 
                showAlert("최대 3마리까지만 장착 가능합니다!", "#ff0000"); return; 
            } 
            pet.isEquipped = !pet.isEquipped; 
            updatePetModal(); 
            recalculateCoinRate(); 
        };
        card.appendChild(btn); list.appendChild(card);
    });
    const eq = document.getElementById('equippedCount'); if (eq) eq.innerText = eqCount;
}

function toggleTraining() {
    isTraining = !isTraining; 
    const tUi = document.getElementById('trainingUi');
    if (tUi) tUi.style.display = 'none';
    if (isTraining) { 
        player.position.copy(treadmillGroup.position); 
        player.position.y = 1; 
        player.rotation.copy(treadmillGroup.rotation); 
        if (tUi) tUi.style.display = 'block';
    } 
    else { 
        player.position.z += 5; 
        player.position.y = 0; 
    }
}

function killPlayer() {
    showAlert("앗! 야생의 알이 부화했습니다! 당신은 잡아먹혔습니다!", "#ff0000");
    carryingEgg = null; player.position.set(0, 0, 80);
    if (isTraining) toggleTraining();
}

function saveGame() {
    const saveData = {
        coins, speedLevel, speed경험치,
        hasTreadmill, treadmillTier,
        heldEggs, petIdCounter,
        
        pets: allPets.map(p => ({ id: p.id, biomeIndex: p.biomeIndex, variant: p.variant, isEquipped: p.isEquipped, isRainbow: p.isRainbow, sizeScale: p.sizeScale })),
        hatchingEggs: sceneEggs.filter(eg => !eg.isWild).map(eg => ({ biomeIndex: eg.biomeIndex, timeLeft: eg.timeLeft, x: eg.mesh.position.x, z: eg.mesh.position.z, isRainbow: eg.isRainbow, sizeScale: eg.sizeScale }))
    };
    localStorage.setItem('game5_save', JSON.stringify(saveData));
}

function loadGame() {
    const saveStr = localStorage.getItem('game5_save');
    if (saveStr) {
        try {
            const data = JSON.parse(saveStr);
            coins = data.coins || 0; speedLevel = data.speedLevel || 1; speed경험치 = data.speed경험치 || 0;
            hasTreadmill = data.hasTreadmill || false;
            treadmillTier = data.treadmillTier || (hasTreadmill ? 1 : 0);
            if (hasTreadmill) rebuildTreadmill();
            
            if (data.heldEggs) {
                heldEggs = data.heldEggs.map(e => typeof e === 'number' ? { biomeIndex: e, sizeScale: 1, isRainbow: false } : e);
            }
            if (data.petIdCounter) petIdCounter = data.petIdCounter;
            
            if (data.pets) {
                data.pets.forEach(pData => {
                    const cx = penGroup.position.x + (Math.random()-0.5)*20;
                    const cz = safeZone.position.z + penGroup.position.z + (Math.random()-0.5)*20;
                    try {
                        let v = pData.variant; if (v === undefined || v === null) v = 0;
                        const pet = spawnPet({ biomeIndex: pData.biomeIndex, isRainbow: pData.isRainbow || false, sizeScale: pData.sizeScale || 1 }, new THREE.Vector3(cx, 0.5, cz), v, true);
                        if(pet) { pet.id = pData.id; pet.isEquipped = pData.isEquipped || false; }
                    } catch(err) { console.error("Pet load error", err); }
                });
            }
            if (data.hatchingEggs) {
                data.hatchingEggs.forEach(eg => {
                    placeEgg(new THREE.Vector3(eg.x, 0, eg.z), { biomeIndex: eg.biomeIndex, isRainbow: eg.isRainbow || false, sizeScale: eg.sizeScale || 1 }, eg.timeLeft);
                });
            }
            
            recalculateCoinRate(); updatePetModal();
        } catch (e) { console.error("Save load failed", e); }
    }
}

function animate() { 
    try {
        requestAnimationFrame(animate); 
        const delta = Math.min(clock.getDelta(), 0.1);

        refillTimer -= delta;
        if (refillTimer <= 0) {
            refillTimer = 240;
            respawnAllEggs();
            showAlert("야생의 알이 모두 리필되었습니다!", "#ffff00");
        }

        player.position.y += velocityY;
        if (player.position.y > 0) velocityY += gravity;
        else { player.position.y = 0; velocityY = 0; }

        let moveZ = 0; let moveX = 0;
        if (keys.w) moveZ -= 1; if (keys.s) moveZ += 1; if (keys.a) moveX -= 1; if (keys.d) moveX += 1;
        const isMoving = (moveX !== 0 || moveZ !== 0);

        if (isTraining) {
            const mult = (hasTreadmill && treadmills[treadmillTier]) ? treadmills[treadmillTier].mult : 1;
            speed경험치 += (2 * mult); 
            walkTime += 0.5; 
            
            if (treadmillGroup && treadmillGroup.userData.ring) {
                treadmillGroup.userData.ring.rotation.z += 0.05;
            }

            if (speedLevel < 12) {
                if (speed경험치 >= levelReqs[speedLevel]) { 
                    speedLevel++; 
                    updateUI(); 
                } else {
                    const prev = levelReqs[speedLevel - 1];
                    const next = levelReqs[speedLevel];
                    const percent = Math.min(100, Math.max(0, ((speed경험치 - prev) / (next - prev)) * 100));
                    document.getElementById('xpBar').style.width = percent + '%';
                    document.getElementById('xpText').innerText = `${Math.floor(speed경험치).toLocaleString()} / ${next.toLocaleString()} 경험치`;
                }
            }
            const tXp = document.getElementById('trainingXp');
            if (tXp) tXp.innerText = `+${Math.floor(2 * mult)} 경험치/초`;
        } else {
            if (isMoving) {
                const forwardX = -Math.sin(camAngleX); const forwardZ = -Math.cos(camAngleX);
                const rightX = Math.cos(camAngleX); const rightZ = -Math.sin(camAngleX);
                const moveVec = new THREE.Vector3((forwardX * -moveZ) + (rightX * moveX), 0, (forwardZ * -moveZ) + (rightZ * moveX)).normalize();
                player.position.addScaledVector(moveVec, getPlayerSpeed()); player.rotation.y = Math.atan2(moveVec.x, moveVec.z);
                walkTime += 0.2 + (speedLevel * 0.05);
                /* speed경험치 += (delta * 5 * (speedLevel * 0.5 + 1)); removed */
                if(walkTime % 0.4 < 0.1) spawnParticle(player.position.x, 0.5, player.position.z, 0xdddddd, 1.5, 0.1);
            } else { walkTime = 0; }
        }

        if (walkTime > 0) {
            leftLeg.rotation.x = Math.sin(walkTime) * 0.6; rightLeg.rotation.x = -Math.sin(walkTime) * 0.6;
            if (heldEggs[hotbarIndex] === null && carryingEgg === null) { leftArm.rotation.x = -Math.sin(walkTime) * 0.6; rightArm.rotation.x = Math.sin(walkTime) * 0.6; }
        } else {
            leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
            if (heldEggs[hotbarIndex] === null && carryingEgg === null) { leftArm.rotation.x = 0; rightArm.rotation.x = 0; }
        }

        const holdingEgg = heldEggs[hotbarIndex];
        if (holdingEgg !== null && carryingEgg === null) {
            if (heldEggVis.userData.eggId !== holdingEgg) {
                heldEggVis.clear(); 
                const miniEgg = createEggMesh(holdingEgg.biomeIndex, holdingEgg.isRainbow); 
                miniEgg.scale.setScalar(0.25 * holdingEgg.sizeScale); 
                miniEgg.position.set(0, -0.5, 0);
                heldEggVis.add(miniEgg); heldEggVis.userData.eggId = holdingEgg;
            }
            heldEggVis.visible = true; leftArm.rotation.x = -Math.PI / 2; rightArm.rotation.x = -Math.PI / 2;
        } else { heldEggVis.visible = false; heldEggVis.userData.eggId = null; }

        if (carryingEgg !== null) {
            if (carriedEggVis.userData.eggId !== carryingEgg) {
                carriedEggVis.clear(); 
                const hugeEgg = createEggMesh(carryingEgg.biomeIndex, carryingEgg.isRainbow); 
                hugeEgg.scale.setScalar(0.7 * carryingEgg.sizeScale); 
                hugeEgg.position.set(0,0,0);
                carriedEggVis.add(hugeEgg); carriedEggVis.userData.eggId = carryingEgg;
            }
            carriedEggVis.visible = true; leftArm.rotation.x = Math.PI; rightArm.rotation.x = Math.PI;
        } else { carriedEggVis.visible = false; carriedEggVis.userData.eggId = null; }

        if (carryingEgg !== null && player.position.z > SAFE_ZONE_Z) {
            const emptySlot = heldEggs.findIndex(e => e === null);
            if (emptySlot !== -1) {
                heldEggs[emptySlot] = carryingEgg; carryingEgg = null; updateHotbarUI();
                showAlert("안전 구역 도착! 알이 인벤토리에 보관되었습니다.", "#55ff55");
            } else {
                showAlert("인벤토리가 꽉 찼습니다! 알을 먼저 부화시키세요.", "#ff0000");
                player.position.z -= 2; 
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]; p.life -= p.decay;
            if (p.life <= 0) { scene.remove(p.mesh); particles.splice(i, 1); } 
            else { p.mesh.position.add(p.vel); p.mesh.scale.setScalar(p.life); p.mesh.material.opacity = p.life; }
        }

        if (!isTraining) {
            if (player.position.x < -155) player.position.x = -155; if (player.position.x > 155) player.position.x = 155;
            if (player.position.z > 85) player.position.z = 85; 
            const maxZ = -(biomes.length * biomeLength) + 50; if (player.position.z < maxZ) player.position.z = maxZ;
        }

        const camDist = 35;
        const cx = player.position.x + Math.sin(camAngleX) * Math.cos(camAngleY) * camDist;
        const cy = player.position.y + Math.sin(camAngleY) * camDist;
        const cz = player.position.z + Math.cos(camAngleX) * Math.cos(camAngleY) * camDist;
        camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.3);
        camera.lookAt(player.position.x, player.position.y + 5, player.position.z);

        const targetColor = new THREE.Color(player.position.z > SAFE_ZONE_Z ? 0x88ccff : biomes[Math.max(0, Math.min(biomes.length - 1, Math.floor((-player.position.z) / biomeLength)))].color);
        scene.background.lerp(targetColor, 0.05);
        scene.fog.color.lerp(targetColor, 0.05);

        const shopPos = new THREE.Vector3(); shopBuilding.getWorldPosition(shopPos);
                const prompt = document.getElementById('interactionPrompt');
        if (player.position.z > SAFE_ZONE_Z) {
            if (player.position.distanceTo(shopPos) < 25 && !hasTreadmill) { prompt.style.display = 'block'; prompt.innerText = '[E] 상점 열기'; } 
            else if (hasTreadmill && player.position.distanceTo(treadmillGroup.position) < 15 && !isTraining) { prompt.style.display = 'block'; prompt.innerText = '[E] 런닝머신 탑승'; }
            else if (isTraining) { prompt.style.display = 'block'; prompt.innerText = '[E] 런닝머신 내리기'; }
            else { prompt.style.display = 'none'; }
        } else {
            if (carryingEgg === null) {
                let nearWild = false;
                for(let i=0; i<sceneEggs.length; i++) {
                    if(sceneEggs[i].isWild && sceneEggs[i].active && player.position.distanceTo(sceneEggs[i].mesh.position) < 20) { nearWild = true; break; }
                }
                if (nearWild) { prompt.style.display = 'block'; prompt.innerText = '[E] 알 훔치기'; } 
                else { prompt.style.display = 'none'; }
            } else { prompt.style.display = 'none'; }
        }

        for (let i = sceneEggs.length - 1; i >= 0; i--) {
            const eg = sceneEggs[i];
            if (eg.active) {
                eg.mesh.rotation.y += 0.02;
                if (!eg.isWild) {
                    if (isNaN(eg.timeLeft) || eg.timeLeft === null) eg.timeLeft = 0; 
                    eg.timeLeft -= delta;
                    if(eg.bar) { eg.bar.scale.x = Math.max(0, eg.timeLeft / eg.maxTime); eg.bar.rotation.y = camAngleX; }
                    if(eg.timeLeft <= 0) {
                        scene.remove(eg.mesh); scene.remove(eg.bar); sceneEggs.splice(i, 1);
                        try { spawnPet({biomeIndex: eg.biomeIndex, isRainbow: eg.isRainbow, sizeScale: eg.sizeScale}, eg.mesh.position.clone(), rollRarity()); } catch(err) { console.error("Pet spawn failed", err); }
                    }
                } else { eg.mesh.position.y = 2 + Math.sin(Date.now() * 0.003 + eg.mesh.position.x) * 0.5; }
            }
        }

        let equippedIdx = 0;
        allPets.forEach(pet => {
            if(pet.label) {
                const pos = pet.mesh.position.clone(); pos.y += 4; pos.project(camera);
                const x = (pos.x * .5 + .5) * window.innerWidth; const y = (pos.y * -.5 + .5) * window.innerHeight;
                if(pos.z < 1) { pet.label.style.left = `${x}px`; pet.label.style.top = `${y}px`; pet.label.style.display = 'block'; } 
                else { pet.label.style.display = 'none'; }
            }
            const cx = penGroup.position.x; const cz = safeZone.position.z + penGroup.position.z;
            if(pet.mesh.position.distanceTo(pet.targetPos) < 2) pet.targetPos.set(cx + (Math.random()-0.5)*50, 0.5, cz + (Math.random()-0.5)*30);
            const dx = pet.targetPos.x - pet.mesh.position.x; const dz = pet.targetPos.z - pet.mesh.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if(dist > 0.1) { pet.mesh.position.x += (dx/dist) * 0.1; pet.mesh.position.z += (dz/dist) * 0.1; pet.mesh.rotation.y = Math.atan2(dx, dz); }
            pet.mesh.children[0].position.y = Math.abs(Math.sin(Date.now()*0.01)) * 1;
        });

        monstersList.forEach(m => {
            if ((carryingEgg !== null && carryingEgg.biomeIndex === m.biomeIndex)) {
                m.innerGroup.position.y = Math.abs(Math.sin(Date.now()*0.01)) * 6; 
                const dir = new THREE.Vector3().subVectors(player.position, m.mesh.position);
                dir.y = 0;
                const dist = dir.length();
                if (dist > 0.1) { 
                    dir.normalize();
                    const chaseSpeed = m.speed * 2.0; 
                    const currentSpeed = (dist < 30) ? chaseSpeed * 1.5 : chaseSpeed;
                    m.mesh.position.addScaledVector(dir, currentSpeed);
                    m.mesh.lookAt(player.position.x, m.mesh.position.y, player.position.z);
                }
                if (dist < 8) killPlayer(); 
            } else {
                const dx = m.spawnX - m.mesh.position.x;
                const dz = m.spawnZ - m.mesh.position.z;
                const dist = Math.sqrt(dx*dx + dz*dz);
                if (dist > 1.0) {
                    const walkSpeed = m.speed; 
                    m.mesh.position.x += (dx/dist) * walkSpeed;
                    m.mesh.position.z += (dz/dist) * walkSpeed;
                    m.mesh.rotation.y = Math.atan2(dx, dz); 
                } else {
                    m.mesh.position.x = m.spawnX;
                    m.mesh.position.z = m.spawnZ;
                    m.mesh.rotation.y = 0; 
                }
                m.innerGroup.position.y = Math.abs(Math.sin(Date.now()*0.005)) * 1.5; 
            }
        });

        renderer.render(scene, camera); 
    } catch (err) { 
        console.error(err); 
    }
}

window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });

updateHotbarUI(); updateUI(); loadGame(); animate();
} catch (e) { console.error(e); }













