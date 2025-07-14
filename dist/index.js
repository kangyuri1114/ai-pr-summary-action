// src/index.js
var fs = require("fs");
var core = require("@actions/core");
var { execSync } = require("child_process");
var { Configuration, OpenAIApi } = require("openai");
(async () => {
  try {
    const key = core.getInput("openai_api_key");
    const promptInput = core.getInput("prompt_template");
    const promptTemplate = detectTemplate(promptInput);
    const diff = execSync("git diff origin/main...HEAD").toString();
    const commits = execSync("git log --oneline origin/main..HEAD").toString();
    const finalPrompt = `${promptTemplate}

[diff]
${diff}

[commits]
${commits}`;
    const summary = await callOpenAI(finalPrompt, key);
    console.log("\u{1F4CC} AI Generated PR Summary:\n\n", summary);
  } catch (err) {
    core.setFailed(err.message);
  }
})();
function detectTemplate(userInput) {
  const defaultTemplate = `
\uB2E4\uC74C \uD615\uC2DD\uC5D0 \uB9DE\uCDB0 PR \uC124\uBA85\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694:
1. \uC8FC\uC694 \uBCC0\uACBD\uC0AC\uD56D
2. \uBCC0\uACBD \uC774\uC720
3. \uD14C\uC2A4\uD2B8 \uBC29\uBC95
4. \uCC38\uACE0\uC0AC\uD56D
`;
  if (fs.existsSync(".github/pull_request_template.md")) {
    return fs.readFileSync(".github/pull_request_template.md", "utf-8");
  }
  const multiTemplates = fs.readdirSync(".github/PULL_REQUEST_TEMPLATE", { withFileTypes: true }).filter((file) => file.isFile() && file.name.endsWith(".md"));
  if (multiTemplates.length > 0) {
    const path = `.github/PULL_REQUEST_TEMPLATE/${multiTemplates[0].name}`;
    return fs.readFileSync(path, "utf-8");
  }
  if (userInput) return userInput;
  return defaultTemplate;
}
async function callOpenAI(prompt, key) {
  const configuration = new Configuration({
    apiKey: key
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    // 또는 'gpt-3.5-turbo'
    messages: [
      { role: "system", content: "\uB2F9\uC2E0\uC740 \uCE5C\uC808\uD55C GitHub PR \uC694\uC57D \uBE44\uC11C\uC785\uB2C8\uB2E4." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });
  return response.data.choices[0].message.content.trim();
}
