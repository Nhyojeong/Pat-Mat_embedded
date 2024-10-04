// OpenAI API 정보
const apiKey = 'keynum';  // 여기에 발급받은 API 키를 사용
const apiEndpoint = '주소';


async function fetchAIResponse(prompt) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4",  // GPT 모델
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 150,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0.5
        })
    };

    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI API 호출 오류:', error);
        return null;
    }
}

// 메시지 수신 이벤트 처리
window.addEventListener('message', async (event) => {
    if (event.data.type === 'getRelatedQuestion') {
        const userQuestion = event.data.question;
        const aiPrompt = `사용자가 제출한 문제와 관련된 새로운 문제를 생성하세요: "${userQuestion}"`;
        const relatedQuestion = await fetchAIResponse(aiPrompt);

        if (relatedQuestion) {
            askRelatedQuestion(relatedQuestion);
        }
    }
});

// GPT에서 제공한 새로운 문제를 표시
function askRelatedQuestion(question) {
    const userAnswer = prompt(`GPT가 제안한 문제입니다: ${question}\n답을 입력하세요:`);

    // 사용자 답이 틀린 경우, 저장할지 물어보는 창 표시
    if (userAnswer !== '정답') {
        const saveQuestion = confirm('문제를 틀렸습니다. 이 문제를 저장하시겠습니까?');
        if (saveQuestion) {
            const timestamp = new Date().getTime();
            const record = { question, answer: userAnswer };
            localStorage.setItem(timestamp, JSON.stringify(record));
            alert('문제가 저장되었습니다.');
        }
    }

    // 원래 문제 기록 페이지로 돌아가기
    window.location.href = 'record.html';
}
