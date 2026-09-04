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
const surveyTitle = document.getElementById('surveyTitle');
const surveyInput = document.getElementById('surveyInput');
const nextSurveyBtn = document.getElementById('nextSurveyBtn');

const secretBtn = document.getElementById('secretBtn');

const resultList = document.getElementById('resultList');
const backBtn = document.getElementById('backBtn');

let currentUser = "";
let surveyStep = 0;
const surveyData = { sport: "", hobby: "", song: "", crush: "" };
const surveyQuestions = [
    { key: "sport", title: "가장 관심 있는 운동이 무엇인가요? 🏃", placeholder: "예: 축구, 농구, 숨쉬기" },
    { key: "hobby", title: "요즘 즐겨하는 취미는 무엇인가요? 🎨", placeholder: "예: 게임, 독서, 유튜브 시청" },
    { key: "song", title: "가장 좋아하는 노래는? 🎵", placeholder: "노래 제목을 적어주세요" },
    { key: "crush", title: "마지막 질문!\n반에서 가장 좋아하는 이성 친구는? ❤️", placeholder: "솔직하게 적어주세요!" }
];

function showScreen(screen) {
    screen1.style.display = 'none';
    screen2.style.display = 'none';
    screen3.style.display = 'none';
    screen4.style.display = 'none';
    screen.style.display = 'flex';
}

function updateSurveyUI() {
    const q = surveyQuestions[surveyStep];
    surveyTitle.innerText = q.title;
    surveyInput.value = "";
    surveyInput.placeholder = q.placeholder;
    if (surveyStep === surveyQuestions.length - 1) {
        nextSurveyBtn.innerText = "제출하기";
    } else {
        nextSurveyBtn.innerText = "다음";
    }
}

loginBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert("이름을 입력해주세요!");
        return;
    }
    currentUser = name;
    surveyStep = 0;
    updateSurveyUI();
    showScreen(screen2);
});

signupBtn.addEventListener('click', () => {
    alert("현재 회원가입이 불가능합니다. 이름만 입력하고 로그인하세요.");
});

nextSurveyBtn.addEventListener('click', async () => {
    const val = surveyInput.value.trim();
    if (!val) {
        alert("답변을 입력해주세요!");
        return;
    }
    
    // 현재 답변 저장
    const currentKey = surveyQuestions[surveyStep].key;
    surveyData[currentKey] = val;
    
    // 마지막 질문인지 확인
    if (surveyStep === surveyQuestions.length - 1) {
        // 파이어베이스에 데이터 저장
        const originalText = nextSurveyBtn.innerText;
        nextSurveyBtn.innerText = "저장 중...";
        nextSurveyBtn.disabled = true;

        try {
            await db.collection("crushes").add({
                name: currentUser,
                sport: surveyData.sport,
                hobby: surveyData.hobby,
                song: surveyData.song,
                crush: surveyData.crush,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showScreen(screen3);
        } catch (e) {
            console.error("데이터 저장 실패:", e);
            alert("저장에 실패했습니다. 파이어베이스 데이터베이스가 생성되었는지 확인해주세요!");
        } finally {
            nextSurveyBtn.innerText = originalText;
            nextSurveyBtn.disabled = false;
        }
    } else {
        // 다음 질문으로 넘어가기
        surveyStep++;
        updateSurveyUI();
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
                    
                    let extraInfo = "";
                    if (item.sport !== undefined) {
                        extraInfo = `
                            🏃 운동: ${item.sport || '없음'}<br>
                            🎨 취미: ${item.hobby || '없음'}<br>
                            🎵 노래: ${item.song || '없음'}<br>
                        `;
                    }

                    li.innerHTML = `
                        <div style="color: #ffb6c1; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${item.name} 님</div>
                        <div style="font-size: 13px; color: #ccc; line-height: 1.6;">
                            ${extraInfo}
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
    surveyInput.value = '';
    surveyStep = 0;
    surveyData.sport = "";
    surveyData.hobby = "";
    surveyData.song = "";
    surveyData.crush = "";
    showScreen(screen1);
});
