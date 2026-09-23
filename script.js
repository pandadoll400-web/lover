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

// Screens
const screen1 = document.getElementById('screen1');
const screenMode = document.getElementById('screenMode');
const screen2 = document.getElementById('screen2');
const screen3 = document.getElementById('screen3');
const screenQuiz = document.getElementById('screenQuiz');
const screenQuizFail = document.getElementById('screenQuizFail');
const screenQuizSuccess = document.getElementById('screenQuizSuccess');
const screenHate = document.getElementById('screenHate');
const screenWish = document.getElementById('screenWish');
const screenWishResult = document.getElementById('screenWishResult');
const screenOnion = document.getElementById('screenOnion');
const screen4 = document.getElementById('screen4');

// Login & Easter Egg
const mainIcon = document.getElementById('mainIcon');
const mainTitle = document.getElementById('mainTitle');
const userNameInput = document.getElementById('userName');
const dummyPasswordInput = document.getElementById('dummyPassword');
const loginBtn = document.getElementById('loginBtn');

// Mode Selection
const modeSurveyBtn = document.getElementById('modeSurveyBtn');
const modeQuizBtn = document.getElementById('modeQuizBtn');
const modeHateBtn = document.getElementById('modeHateBtn');
const secretIconMode = document.getElementById('secretIconMode');

// Survey
const surveyTitle = document.getElementById('surveyTitle');
const surveyInput = document.getElementById('surveyInput');
const nextSurveyBtn = document.getElementById('nextSurveyBtn');

// Quiz
const quizTitle = document.getElementById('quizTitle');
const quizInput = document.getElementById('quizInput');
const nextQuizBtn = document.getElementById('nextQuizBtn');
const livesDisplay = document.getElementById('livesDisplay');
const retryQuizBtn = document.getElementById('retryQuizBtn');

// Hate Mode
const hateOpposite = document.getElementById('hateOpposite');
const hateSame = document.getElementById('hateSame');
const submitHateBtn = document.getElementById('submitHateBtn');

// Admin
const resultList = document.getElementById('resultList');
const backBtn = document.getElementById('backBtn');
const tabSurvey = document.getElementById('tabSurvey');
const tabQuiz = document.getElementById('tabQuiz');
const tabHate = document.getElementById('tabHate');
const tabWish = document.getElementById('tabWish');

// Wish Mode Variables
const modeWishBtn = document.getElementById('modeWishBtn');
const wishInput = document.getElementById('wishInput');
const submitWishBtn = document.getElementById('submitWishBtn');
const wishHomeBtn = document.getElementById('wishHomeBtn');

// Onion Mode Variables
const modeOnionBtn = document.getElementById('modeOnionBtn');
const onion1 = document.getElementById('onion1');
const onion1Visual = document.getElementById('onion1Visual');
const onion1Msg = document.getElementById('onion1Msg');
const onion2 = document.getElementById('onion2');
const onion2Visual = document.getElementById('onion2Visual');
const onion2Msg = document.getElementById('onion2Msg');
const onionOverlay = document.getElementById('onionOverlay');
const onionHomeBtn = document.getElementById('onionHomeBtn');

let currentUser = "";
let heartClickCount = 0;
let isHateModeActive = false;

// --- Survey Data ---
let surveyStep = 0;
const surveyData = { sport: "", hobby: "", song: "", crush: "" };
const surveyQuestions = [
    { key: "sport", title: "가장 관심 있는 운동이 무엇인가요? 🏃", placeholder: "예: 축구, 농구, 숨쉬기" },
    { key: "hobby", title: "요즘 즐겨하는 취미는 무엇인가요? 🎨", placeholder: "예: 게임, 독서, 유튜브 시청" },
    { key: "song", title: "가장 좋아하는 노래는? 🎵", placeholder: "노래 제목을 적어주세요" },
    { key: "crush", title: "마지막 질문!\n반에서 가장 좋아하는 이성 친구는? ❤️", placeholder: "솔직하게 적어주세요!" }
];

// --- Quiz Data ---
let quizStep = 0;
let quizLives = 3;
const quizAnswers = []; // 사용자가 입력한 정답들
const quizQuestions = [
    { title: "개발자(문주왕)이 다니는 학교는? 🏫", placeholder: "학교 이름", check: (ans) => ans.includes("강명중") },
    { title: "문주왕이 좋아하는 색깔은? 🎨", placeholder: "색깔", check: (ans) => ans.includes("주황") },
    { title: "문주왕이 좋아하는 사람은? ❤️", placeholder: "이름이나 별명", check: (ans) => ans.includes("너") },
    { title: "문주왕의 나이는? 🎂", placeholder: "숫자 또는 ~살", check: (ans) => ans.includes("14") },
    { title: "문주왕이 사는 곳은? 🏠", placeholder: "어디 살게?", check: (ans) => ans.replace(/\s/g, '').includes("리앤파크1단지") }
];

function showScreen(screen) {
    [screen1, screenMode, screen2, screen3, screenQuiz, screenQuizFail, screenQuizSuccess, screenHate, screenWish, screenWishResult, screenOnion, screen4].forEach(s => {
        if (s) s.style.display = 'none';
    });
    screen.style.display = 'flex';
}

// 0. Easter Egg
mainIcon.addEventListener('click', () => {
    heartClickCount++;
    if (heartClickCount === 3) {
        isHateModeActive = true;
        mainIcon.innerText = "💔";
        mainTitle.innerText = "헤잇헤잇";
        document.body.style.background = "none";
        document.body.style.backgroundColor = "#9b59b6"; // Purple background
        modeHateBtn.style.display = "inline-block";
        modeWishBtn.style.display = "none";
        modeOnionBtn.style.display = "inline-block";
    }
});

// 1. Login
loginBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert("이름을 입력해주세요!");
        return;
    }
    currentUser = name;
    showScreen(screenMode);
});

// 2. Mode Selection
modeSurveyBtn.addEventListener('click', () => {
    surveyStep = 0;
    updateSurveyUI();
    showScreen(screen2);
});

modeQuizBtn.addEventListener('click', () => {
    quizStep = 0;
    quizLives = 3;
    quizAnswers.length = 0;
    updateQuizUI();
    showScreen(screenQuiz);
});

modeHateBtn.addEventListener('click', () => {
    hateOpposite.value = "";
    hateSame.value = "";
    showScreen(screenHate);
});

modeWishBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert("먼저 이름을 입력해주세요!");
        return;
    }
    
    if (localStorage.getItem('wishSubmitted') === 'true') {
        alert("이미 소원을 빌었습니다! 달님이 소원을 들어줄 때까지 기다려보세요. 🌕");
        return;
    }

    currentUser = name;
    wishInput.value = "";
    showScreen(screenWish);
});

// 2.5 Wish Logic
submitWishBtn.addEventListener('click', async () => {
    const val = wishInput.value.trim();
    if (!val) {
        alert("소원을 입력해주세요!");
        return;
    }
    
    const originalText = submitWishBtn.innerText;
    submitWishBtn.innerText = "비는 중...";
    submitWishBtn.disabled = true;

    try {
        await db.collection("wishes").add({
            name: currentUser,
            wish: val,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        localStorage.setItem('wishSubmitted', 'true');
        showScreen(screenWishResult);
    } catch (e) {
        alert("소원 전달에 실패했습니다. 달님이 바쁘신가 봅니다.");
    } finally {
        submitWishBtn.innerText = originalText;
        submitWishBtn.disabled = false;
    }
});

wishHomeBtn.addEventListener('click', () => {
    userNameInput.value = '';
    dummyPasswordInput.value = '';
    showScreen(screen1);
});

// 2.6 Onion Logic
let badClickCount = 0;
const niceWords = ["예뻐!", "사랑해!", "넌 최고야!", "잘 자라라!", "고마워!"];
const badWords = ["짜증나!", "미워!", "넌 최악이야!", "못생겼어!", "사라져!"];

modeOnionBtn.addEventListener('click', () => {
    showScreen(screenOnion);
});

onion1.addEventListener('click', () => {
    onion1Visual.innerText = "🌱";
    onion1Visual.style.transform = "scale(1.2)";
    setTimeout(() => onion1Visual.style.transform = "scale(1)", 200);
    onion1Msg.innerText = niceWords[Math.floor(Math.random() * niceWords.length)];
});

onion2.addEventListener('click', () => {
    badClickCount++;
    onion2Visual.innerText = "🧄"; 
    
    let grayscale = Math.min(100, badClickCount * 1); // gradually turn gray
    onion2Visual.style.filter = `grayscale(${grayscale}%) sepia(${grayscale/2}%)`;
    onion2Visual.style.transform = "scale(0.9)";
    setTimeout(() => onion2Visual.style.transform = "scale(1)", 100);
    
    onion2Msg.innerText = badWords[Math.floor(Math.random() * badWords.length)];

    if (badClickCount >= 200) {
        onionOverlay.style.display = "flex";
    }
});

onionOverlay.addEventListener('click', () => {
    onionOverlay.style.display = "none";
    badClickCount = 0;
    onion2Visual.innerText = "🧅";
    onion2Visual.style.filter = "none";
    onion2Msg.innerText = "";
    onion1Visual.innerText = "🧅";
    onion1Msg.innerText = "";
    showScreen(screen1);
});

onionHomeBtn.addEventListener('click', () => {
    showScreen(screen1);
});

// 3. Survey Logic
function updateSurveyUI() {
    const q = surveyQuestions[surveyStep];
    surveyTitle.innerText = q.title;
    surveyInput.value = "";
    surveyInput.placeholder = q.placeholder;
    nextSurveyBtn.innerText = (surveyStep === surveyQuestions.length - 1) ? "제출하기" : "다음";
}

nextSurveyBtn.addEventListener('click', async () => {
    const val = surveyInput.value.trim();
    if (!val) {
        alert("답변을 입력해주세요!");
        return;
    }
    
    const currentKey = surveyQuestions[surveyStep].key;
    surveyData[currentKey] = val;
    
    if (surveyStep === surveyQuestions.length - 1) {
        const originalText = nextSurveyBtn.innerText;
        nextSurveyBtn.innerText = "저장 중...";
        nextSurveyBtn.disabled = true;

        try {
            await db.collection("crushes").add({
                type: "survey",
                name: currentUser,
                sport: surveyData.sport,
                hobby: surveyData.hobby,
                song: surveyData.song,
                crush: surveyData.crush,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showScreen(screen3);
        } catch (e) {
            alert("저장에 실패했습니다.");
        } finally {
            nextSurveyBtn.innerText = originalText;
            nextSurveyBtn.disabled = false;
        }
    } else {
        surveyStep++;
        updateSurveyUI();
    }
});

// 4. Quiz Logic
function updateQuizUI() {
    let hearts = "";
    for(let i=0; i<quizLives; i++) hearts += "❤️";
    livesDisplay.innerText = "남은 목숨: " + hearts;
    
    const q = quizQuestions[quizStep];
    quizTitle.innerText = q.title;
    quizInput.value = "";
    quizInput.placeholder = q.placeholder;
    nextQuizBtn.innerText = (quizStep === quizQuestions.length - 1) ? "제출하기" : "다음";
}

nextQuizBtn.addEventListener('click', async () => {
    const val = quizInput.value.trim();
    if (!val) {
        alert("정답을 입력해주세요!");
        return;
    }
    
    quizAnswers.push(val);
    
    if (quizStep === quizQuestions.length - 1) {
        // 채점
        let allCorrect = true;
        for (let i = 0; i < quizQuestions.length; i++) {
            if (!quizQuestions[i].check(quizAnswers[i])) {
                allCorrect = false;
                break;
            }
        }
        
        // 파이어베이스에 입력한 퀴즈 답변 저장 (관리자용)
        try {
            await db.collection("quiz_answers").add({
                name: currentUser,
                answers: quizAnswers,
                passed: allCorrect,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error(e);
        }

        if (allCorrect) {
            showScreen(screenQuizSuccess);
        } else {
            quizLives--;
            if (quizLives > 0) {
                showScreen(screenQuizFail);
            } else {
                alert("목숨이 모두 소진되었습니다! 처음으로 돌아갑니다.");
                showScreen(screenMode);
            }
        }
    } else {
        quizStep++;
        updateQuizUI();
    }
});

retryQuizBtn.addEventListener('click', () => {
    quizStep = 0;
    quizAnswers.length = 0; // 초기화
    updateQuizUI();
    showScreen(screenQuiz);
});

// 4.5 Hate Mode Logic
submitHateBtn.addEventListener('click', async () => {
    const opp = hateOpposite.value.trim();
    const same = hateSame.value.trim();
    if (!opp || !same) {
        alert("모든 항목을 입력해주세요!");
        return;
    }

    const originalText = submitHateBtn.innerText;
    submitHateBtn.innerText = "저장 중...";
    submitHateBtn.disabled = true;

    try {
        await db.collection("hates").add({
            name: currentUser,
            opposite: opp,
            same: same,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        showScreen(screen3);
    } catch (e) {
        alert("저장에 실패했습니다.");
    } finally {
        submitHateBtn.innerText = originalText;
        submitHateBtn.disabled = false;
    }
});

// 5. Admin Logic (Secret Button)
async function openAdmin() {
    const pwd = prompt("비밀번호를 입력하세요:");
    if (pwd === "112526!") {
        showScreen(screen4);
        tabSurvey.click(); // Load default
    } else if (pwd !== null) {
        alert("비밀번호가 틀렸습니다.");
    }
}

secretIconMode.addEventListener('click', openAdmin);

tabSurvey.addEventListener('click', () => {
    tabSurvey.style.backgroundColor = '#e74c3c';
    tabQuiz.style.backgroundColor = '#3498db';
    tabHate.style.backgroundColor = '#8e44ad';
    tabWish.style.backgroundColor = '#f1c40f';
    tabSurvey.style.opacity = '1';
    tabQuiz.style.opacity = '0.5';
    tabHate.style.opacity = '0.5';
    tabWish.style.opacity = '0.5';
    loadAdminData('survey');
});

tabQuiz.addEventListener('click', () => {
    tabSurvey.style.backgroundColor = '#e74c3c';
    tabQuiz.style.backgroundColor = '#3498db';
    tabHate.style.backgroundColor = '#8e44ad';
    tabWish.style.backgroundColor = '#f1c40f';
    tabSurvey.style.opacity = '0.5';
    tabQuiz.style.opacity = '1';
    tabHate.style.opacity = '0.5';
    tabWish.style.opacity = '0.5';
    loadAdminData('quiz');
});

tabHate.addEventListener('click', () => {
    tabSurvey.style.backgroundColor = '#e74c3c';
    tabQuiz.style.backgroundColor = '#3498db';
    tabHate.style.backgroundColor = '#8e44ad';
    tabWish.style.backgroundColor = '#f1c40f';
    tabSurvey.style.opacity = '0.5';
    tabQuiz.style.opacity = '0.5';
    tabHate.style.opacity = '1';
    tabWish.style.opacity = '0.5';
    loadAdminData('hate');
});

tabWish.addEventListener('click', () => {
    tabSurvey.style.backgroundColor = '#e74c3c';
    tabQuiz.style.backgroundColor = '#3498db';
    tabHate.style.backgroundColor = '#8e44ad';
    tabWish.style.backgroundColor = '#f1c40f';
    tabSurvey.style.opacity = '0.5';
    tabQuiz.style.opacity = '0.5';
    tabHate.style.opacity = '0.5';
    tabWish.style.opacity = '1';
    loadAdminData('wish');
});

async function loadAdminData(type) {
    resultList.innerHTML = '<li>데이터를 불러오는 중입니다...</li>';
    
    try {
        if (type === 'survey') {
            const querySnapshot = await db.collection("crushes").orderBy("timestamp", "desc").get();
            resultList.innerHTML = '';
            if (querySnapshot.empty) {
                resultList.innerHTML = '<li>아직 입력한 사람이 없습니다.</li>';
                return;
            }
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
        } else if (type === 'quiz') {
            // 퀴즈 결과 불러오기
            const querySnapshot = await db.collection("quiz_answers").orderBy("timestamp", "desc").get();
            resultList.innerHTML = '';
            if (querySnapshot.empty) {
                resultList.innerHTML = '<li>아직 퀴즈를 푼 사람이 없습니다.</li>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const li = document.createElement('li');
                const answersHtml = item.answers.map((a, i) => `${i+1}번답: ${a}`).join('<br>');
                li.innerHTML = `
                    <div style="color: #3498db; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${item.name} 님 (${item.passed ? '성공🎉' : '실패❌'})</div>
                    <div style="font-size: 13px; color: #ccc; line-height: 1.6;">
                        ${answersHtml}
                    </div>
                `;
                resultList.appendChild(li);
            });
        } else if (type === 'hate') {
            // 헤잇 결과 불러오기
            const querySnapshot = await db.collection("hates").orderBy("timestamp", "desc").get();
            resultList.innerHTML = '';
            if (querySnapshot.empty) {
                resultList.innerHTML = '<li>아직 증오(?)를 표출한 사람이 없습니다.</li>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    <div style="color: #9b59b6; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${item.name} 님</div>
                    <div style="font-size: 13px; color: #ccc; line-height: 1.6;">
                        💔 싫은 이성: ${item.opposite}<br>
                        💔 싫은 동성: ${item.same}
                    </div>
                `;
                resultList.appendChild(li);
            });
        } else if (type === 'wish') {
            // 소원 결과 불러오기
            const querySnapshot = await db.collection("wishes").orderBy("timestamp", "desc").get();
            resultList.innerHTML = '';
            if (querySnapshot.empty) {
                resultList.innerHTML = '<li>아직 소원을 빈 사람이 없습니다.</li>';
                return;
            }
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const li = document.createElement('li');
                li.innerHTML = `
                    <div style="color: #f1c40f; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${item.name} 님의 소원</div>
                    <div style="font-size: 14px; color: #fff; line-height: 1.6; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 5px;">
                        🌕 "${item.wish}"
                    </div>
                `;
                resultList.appendChild(li);
            });
        }
    } catch (e) {
        resultList.innerHTML = '<li>데이터를 불러오지 못했습니다.</li>';
    }
}

backBtn.addEventListener('click', () => {
    userNameInput.value = '';
    dummyPasswordInput.value = '';
    surveyInput.value = '';
    quizInput.value = '';
    showScreen(screen1);
});
