# 🤖 AI PR Summary GitHub Action

이 액션은 PR의 코드 변경 사항을 기반으로 GPT 모델을 이용해 자동 요약을 생성합니다.

## 사용법

```yaml
uses: your-org/ai-pr-summary-action@v1
with:
  openai_api_key: ${{ secrets.OPENAI_API_KEY }}
  prompt_template: |
    다음 형식에 맞춰 요약해주세요:
    - 주요 변경점
    - 변경 이유
    - 테스트 방법
```

### 🔐 OpenAI API 키 설정

1. OpenAI에 가입하고 [API 키](https://platform.openai.com/account/api-keys) 생성
2. GitHub 저장소의 Settings → Secrets → Actions → `OPENAI_API_KEY` 등록
3. 워크플로에서 아래처럼 사용:

```yaml
with:
  openai_api_key: ${{ secrets.OPENAI_API_KEY }}
```