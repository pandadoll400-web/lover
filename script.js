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
const sportInput = document.getElementById('sportInput');
const hobbyInput = document.getElementById('hobbyInput');
const songInput = document.getElementById('songInput');

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
    const sport = sportInput.value.trim();
    const hobby = hobbyInput.value.trim();
    const song = songInput.value.trim();

    if (!crush || !sport || !hobby || !song) {
        alert("모든 항목을 입력해주세요!");
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
            sport: sport,
            hobby: hobby,
            song: song,
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
                    li.innerHTML = `
                        <div style="color: #ffb6c1; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${item.name} 님</div>
                        <div style="font-size: 13px; color: #ccc; line-height: 1.6;">
                            🏃 운동: ${item.sport || '없음'}<br>
                            🎨 취미: ${item.hobby || '없음'}<br>
                            🎵 노래: ${item.song || '없음'}<br>
                            ❤️ <b>짝사랑: <span style="color: #fff;">${item.crush}</span></b>
                        </div>
                    `;
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
    sportInput.value = '';
    hobbyInput.value = '';
    songInput.value = '';
    showScreen(screen1);
});
