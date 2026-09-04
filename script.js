// 파이어베이스 초기화
const firebaseConfig = {
  apiKey: "AIzaSyAjisAnivSTPKdpvLBvfWWZ9PePETBcaD4",
  authDomain: "lovelove1125.firebaseapp.com",
  projectId: "lovelove1125",
  storageBucket: "lovelove1125.firebasestorage.app",
  messagingSenderId: "723972641350",
  appId: "1:723972641350:web:15aa82b066e57099883047"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const screen1 = document.getElementById('screen1');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const screen4 = document.getElementById('screen4');

const userNameInput = document.getElementById('userName');
const dummyPasswordInput = document.getElementById('dummyPassword');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

const crushNameInput = document.getElementById('crushName');
const submitCrushBtn = document.getElementById('submitCrushBtn');

const secretBtn = document.getElementById('secretBtn');

const resultList = document.getElementById('resultList');
const backBtn = document.getElementById('backBtn');

let currentUser = "";

function showScreen(screen) {
    screen1.style.display = 'none';
    screen2.style.display = 'none';
    screen3.style.display = 'none';
    screen4.style.display = 'none';
    screen.style.display = 'flex';
}

loginBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert("이름을 입력해주세요!");
        return;
    }
    currentUser = name;
    showScreen(screen2);
});

signupBtn.addEventListener('click', () => {
    alert("현재 회원가입이 불가능합니다. 이름만 입력하고 로그인하세요.");
});

submitCrushBtn.addEventListener('click', async () => {
    const crush = crushNameInput.value.trim();
    if (!crush) {
        alert("좋아하는 친구의 이름을 입력해주세요!");
        return;
    }
    
    // 로딩 상태 표시
    const originalText = submitCrushBtn.innerText;
    submitCrushBtn.innerText = "저장 중...";
    submitCrushBtn.disabled = true;

    // 파이어베이스에 데이터 저장
    try {
        await db.collection("crushes").add({
            name: currentUser,
            crush: crush,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        showScreen(screen3);
    } catch (e) {
        console.error("데이터 저장 실패:", e);
        alert("저장에 실패했습니다. 파이어베이스 데이터베이스가 생성되었는지 확인해주세요!");
    } finally {
        submitCrushBtn.innerText = originalText;
        submitCrushBtn.disabled = false;
    }
});

secretBtn.addEventListener('click', async () => {
    const pwd = prompt("비밀번호를 입력하세요:");
    if (pwd === "112526!") {
        resultList.innerHTML = '<li>데이터를 불러오는 중입니다...</li>';
        showScreen(screen4);
        
        try {
            // 파이어베이스에서 데이터 불러오기
            const querySnapshot = await db.collection("crushes").orderBy("timestamp", "desc").get();
            resultList.innerHTML = '';
            
            if (querySnapshot.empty) {
                resultList.innerHTML = '<li>아직 입력한 사람이 없습니다.</li>';
            } else {
                querySnapshot.forEach((doc) => {
                    const item = doc.data();
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="name">${item.name}</span> 님이 좋아하는 사람: <b>${item.crush}</b>`;
                    resultList.appendChild(li);
                });
            }
        } catch (e) {
            console.error("데이터 불러오기 실패:", e);
            resultList.innerHTML = '<li>데이터를 불러오지 못했습니다. 파이어베이스 Firestore 데이터베이스가 활성화(테스트 모드)되어 있는지 확인해주세요!</li>';
        }
    } else if (pwd !== null) {
        alert("비밀번호가 틀렸습니다.");
    }
});

backBtn.addEventListener('click', () => {
    userNameInput.value = '';
    dummyPasswordInput.value = '';
    crushNameInput.value = '';
    showScreen(screen1);
});
