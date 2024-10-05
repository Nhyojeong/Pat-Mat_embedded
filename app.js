
async function fetchAIResponse(prompt) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o",  // GPT 모델
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

        // API에서 반환된 전체 객체를 확인
        console.log('전체 응답:', data);

        // choices 배열의 첫 번째 요소를 확인하여 메시지 또는 텍스트가 있는지 확인
        if (data.choices && data.choices.length > 0) {
            console.log('Choices 배열:', data.choices);  // Choices 배열 확인
            return data.choices[0].message ? data.choices[0].message.content : data.choices[0].text;
        } else {
            console.error('Choices 배열이 비어 있습니다.');
            return null;
        }
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
