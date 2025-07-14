// 핵심 로직 (src/index.js)
    // PR diff 가져오기

    // PR 템플릿 탐지 (.github/pull_request_template.md)

    // OpenAI API 호출하여 요약 생성

    // gh pr edit 또는 콘솔 출력
const fs = require('fs');
const core = require('@actions/core');
const { execSync } = require('child_process');
const { Configuration, OpenAIApi } = require('openai');

(async () => {
  try {
    const key = core.getInput('openai_api_key');
    const promptInput = core.getInput('prompt_template');

    const promptTemplate = detectTemplate(promptInput);
    const diff = execSync('git diff origin/main...HEAD').toString();

    const commits = execSync('git log --oneline origin/main..HEAD').toString();

    const finalPrompt = `${promptTemplate}\n\n[diff]\n${diff}\n\n[commits]\n${commits}`;
    const summary = await callOpenAI(finalPrompt, key);

    console.log('📌 AI Generated PR Summary:\n\n', summary);

    // TODO: 자동 PR 수정 (gh pr edit 등)
  } catch (err) {
    core.setFailed(err.message);
  }
})();

function detectTemplate(userInput) {
  const defaultTemplate = `
다음 형식에 맞춰 PR 설명을 작성해주세요:
1. 주요 변경사항
2. 변경 이유
3. 테스트 방법
4. 참고사항
`;

  if (fs.existsSync('.github/pull_request_template.md')) {
    return fs.readFileSync('.github/pull_request_template.md', 'utf-8');
  }

  const multiTemplates = fs.readdirSync('.github/PULL_REQUEST_TEMPLATE', { withFileTypes: true })
    .filter(file => file.isFile() && file.name.endsWith('.md'));

  if (multiTemplates.length > 0) {
    const path = `.github/PULL_REQUEST_TEMPLATE/${multiTemplates[0].name}`;
    return fs.readFileSync(path, 'utf-8');
  }

  if (userInput) return userInput;

  return defaultTemplate;
}

async function callOpenAI(prompt, key) {
  const configuration = new Configuration({
    apiKey: key,
  });

  const openai = new OpenAIApi(configuration);
  const response = await openai.createChatCompletion({
    model: 'gpt-4', // 또는 'gpt-3.5-turbo'
    messages: [
      { role: 'system', content: '당신은 친절한 GitHub PR 요약 비서입니다.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  return response.data.choices[0].message.content.trim();
}
