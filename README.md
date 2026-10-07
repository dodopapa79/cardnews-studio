# 📰 CardNews Studio

AI로 **인스타그램 카드뉴스**와 **유튜브 숏츠 영상**을 자동 생성하는 웹앱.

## ✨ 기능

- 🔍 **키워드**로 카드뉴스 자동 생성 (Gemini)
- 📝 **블로그 URL** 분석 → 카드뉴스 변환
- ✏️ **직접 텍스트** 입력
- 🎨 **프리셋 12종** + 커스텀 저장
- 🖼 **Cloudflare Workers AI** 이미지 생성 (Worker 프록시 경유)
- 📦 **PNG 카드뉴스 ZIP** 다운로드 (1080×1350)
- 🎬 **숏츠 영상** WebM 생성 (1080×1920)
- 🟣 **보라색 SaaS 대시보드 UI**

## 🚀 로컬 실행

\`\`\`bash
npm install
npm run dev
# http://localhost:3000
\`\`\`

## 🔑 API 키 발급

### Gemini (필수)
https://aistudio.google.com/apikey

### Cloudflare (이미지 생성, 선택)
1. https://dash.cloudflare.com 가입
2. Workers AI 활성화
3. Account ID + API Token 발급
4. 앱 설정에 입력

### Worker 프록시
이미 Worker URL이 앱에 내장되어 있습니다:
\`https://tight-unit-99da.whyno2617.workers.dev\`

## 🌐 GitHub Pages 배포

1. 저장소 Settings → Pages → Source: **GitHub Actions**
2. main 브랜치 push → 자동 배포
3. URL: `https://{아이디}.github.io/{레포명}/`

## ⚠️ 주의

- API 키는 브라우저 localStorage에만 저장됩니다
- WebM은 MP4 변환 후 인스타 업로드 권장
- 정부지원금 정보는 팩트 체크 필수
\`\`\`