# Climate Video Exhibition

모둠별 영상 제출 + 전시용 GitHub Pages 프로토타입입니다.

## 제출 항목
1. 조 번호 / 모둠명
2. 모둠원 이름 - 역할
3. 영상 업로드
4. 작품명
5. 설명

전시관에는 모둠명 / 영상 / 작품명 / 설명만 표시됩니다.

## 구성
- `index.html` 영상 제출
- `gallery.html` 영상 전시관
- `styles.css` 디자인
- `config.js` Apps Script 웹앱 URL
- `apps-script/Code.gs` Google Drive/Sheets 저장 및 목록 제공

## 권장 영상
- MP4 권장
- 약 1분 내외
- 25MB 이하 권장
- 큰 영상은 브라우저/Apps Script 제한으로 업로드 실패 가능성이 있습니다.

## 설정
1. Google Drive에 영상 저장 폴더 생성 → 폴더 ID 확인
2. Google Sheets 생성 → Sheet ID 확인
3. Apps Script 새 프로젝트에 `apps-script/Code.gs` 붙여넣기
4. `SHEET_ID`, `FOLDER_ID` 수정
5. 웹 앱으로 배포
6. 배포 URL을 `config.js`의 `WEB_APP_URL`에 입력
7. GitHub에 `index.html`, `gallery.html`, `styles.css`, `config.js` 업로드
8. Settings → Pages → Deploy from a branch → main / root

※ Drive 조직 정책이 외부 공유를 막는 경우 전시관 재생 범위도 그 정책을 따릅니다.
