# 📰 CardNews Studio

AI로 **인스타그램 카드뉴스**와 **유튜브 숏츠 영상**을 자동 생성하는 웹앱.
브라우저에서 모든 처리가 이루어지며, 서버가 필요 없습니다.

## ✨ 기능

- 🔍 **키워드**로 카드뉴스 자동 생성 (Gemini)
- 📝 **블로그 URL** 분석 → 카드뉴스 변환
- ✏️ **직접 텍스트** 입력
- 🎨 **프리셋 12종** (스타일 6 + 업종 6) + 커스텀 저장
- 🖼 **Cloudflare Workers AI**로 슬라이드 이미지 생성 (선택)
- 📦 **PNG 카드뉴스 ZIP** 다운로드 (1080×1350)
- 🔊 **한국어 TTS** 나레이션 (Microsoft Edge TTS, 무료)
- 🎬 **숏츠 영상** WebM 생성 (1080×1920)
  - 뉴스형 (상단 카드 + 하단 자막) / 전체 화면
  - 자동 자막 + 켄번즈 효과 + 페이드 전환

## 🚀 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## 🔑 API 키 발급 (둘 다 무료)

### 1. Gemini API Key (필수)
1. https://aistudio.google.com/apikey 접속
2. "Create API key" 클릭
3. 복사 → 앱의 ⚙️ 설정 패널에 입력

### 2. Cloudflare Workers AI (선택)
1. https://dash.cloudflare.com 가입
2. Workers & Pages → AI → 사용 시작
3. Account ID 확인 (대시보드 우측)
4. My Profile → API Tokens → Create Token → "Workers AI" 권한
5. 앱 설정 패널에 입력

## 🌐 GitHub Pages 배포

### 1. 이 코드를 저장소에 push

### 2. GitHub Pages 활성화
- Settings → Pages → Source: **GitHub Actions**

### 3. main 브랜치에 push하면 자동 배포
- URL: `https://{아이디}.github.io/{레포명}/`

### ⚠️ 하위 경로 배포 시 주의
저장소 이름이 `cardnews-studio`가 아니면 `next.config.js`에서 아래 주석을 해제하세요:

```js
basePath: '/당신의-레포명',
assetPrefix: '/당신의-레포명/',
```

## ⚠️ 사용 시 주의

- API 키는 **브라우저 localStorage**에만 저장됩니다 (서버 전송 X)
- 공용 PC에서는 사용 후 설정을 초기화하세요
- MediaRecorder는 **WebM만** 지원 → MP4 필요 시 [CloudConvert](https://cloudconvert.com) 등에서 변환
- iOS Safari는 MediaRecorder 제약이 있습니다 (Chrome 권장)
- Gemini 무료 티어는 **입력 데이터가 학습에 사용될 수 있습니다**
- 정부지원금 등 정보성 콘텐츠는 **팩트 체크 필수**

## 📱 사용 흐름

1. 앱 접속 → ⚙️ API 키 입력
2. 키워드 / 블로그 URL / 텍스트 입력
3. "카드뉴스 생성" 클릭
4. 프리셋 선택 (스타일/업종)
5. 슬라이드 편집 + 이미지 생성
6. TTS 음성 선택 + 영상 레이아웃 선택
7. "PNG ZIP 다운로드" 또는 "숏츠 영상 생성"
8. 인스타/유튜브 업로드