
const FEEDBACK_API_URL =
  'https://script.google.com/macros/s/AKfycbyjI2DdPLl_rsLcFXM5o4XUbLsMcbBVRh0hJKZ46CxQgMFiwZdBB1JgNHu6RAJ-kvE/exec';

(function () {
  const style = document.createElement('style');
  style.textContent = `
    .feedback-panel {
      margin-top: 22px;
      padding: 20px;
      background: #f7faf9;
      border: 1px solid #dce9e5;
      border-radius: 16px;
      font-family: inherit;
    }
    .feedback-panel h3 {
      margin: 0 0 16px;
      font-size: 18px;
      color: #214e43;
    }
    .feedback-list {
      display: grid;
      gap: 10px;
      margin-bottom: 18px;
    }
    .feedback-comment {
      padding: 13px;
      background: white;
      border: 1px solid #e1e9e6;
      border-radius: 10px;
      overflow-wrap: anywhere;
    }
    .feedback-comment strong {
      font-size: 14px;
      color: #24564a;
    }
    .feedback-comment time {
      margin-left: 9px;
      color: #888;
      font-size: 12px;
    }
    .feedback-comment p {
      margin: 8px 0 0;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.6;
    }
    .feedback-form {
      display: grid;
      gap: 10px;
    }
    .feedback-fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .feedback-form input,
    .feedback-form textarea {
      box-sizing: border-box;
      width: 100%;
      padding: 11px;
      border: 1px solid #cedbd5;
      border-radius: 9px;
      background: white;
      color: #222;
      font: inherit;
      font-size: 14px;
    }
    .feedback-form textarea {
      min-height: 94px;
      resize: vertical;
    }
    .feedback-form button {
      padding: 12px;
      background: #286b56;
      color: white;
      border: none;
      border-radius: 9px;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .feedback-form button:disabled {
      opacity: .55;
      cursor: wait;
    }
    .feedback-status {
      min-height: 18px;
      color: #53665e;
      font-size: 13px;
    }
    @media(max-width: 500px) {
      .feedback-fields { grid-template-columns: 1fr; }
      .feedback-panel { padding: 14px; }
    }
  `;
  document.head.appendChild(style);

  // JSONP: GitHub Pages에서 댓글 목록 조회
  function loadComments(workId) {
    return new Promise((resolve, reject) => {
      const callback = 'feedbackCallback_' +
        Math.random().toString(36).slice(2);

      const script = document.createElement('script');
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('조회 시간 초과'));
      }, 15000);

      function cleanup() {
        clearTimeout(timer);
        delete window[callback];
        script.remove();
      }

      window[callback] = data => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('댓글 조회 실패'));
      };

      const params = new URLSearchParams({
        action: 'list_feedback',
        workId,
        callback
      });

      script.src = FEEDBACK_API_URL + '?' + params;
      document.body.appendChild(script);
    });
  }

  // 댓글창 생성: 작품마다 고유 workId 사용
  window.mountFeedback = function (container, workId) {
    if (!container || container.dataset.feedbackMounted) return;
    if (!/^[A-Za-z0-9_-]{1,120}$/.test(workId)) return;

    container.dataset.feedbackMounted = 'true';

    const panel = document.createElement('section');
    panel.className = 'feedback-panel';

    const heading = document.createElement('h3');
    heading.textContent = '💬 작품 피드백';

    const list = document.createElement('div');
    list.className = 'feedback-list';

    const form = document.createElement('form');
    form.className = 'feedback-form';
    form.method = 'POST';
    form.action = FEEDBACK_API_URL;

    // 교차 출처 문제를 피하는 일반 폼 제출
    const frame = document.createElement('iframe');
    frame.style.display = 'none';
    frame.name = 'feedback_sink_' +
      Math.random().toString(36).slice(2);
    form.target = frame.name;

    const hidden = (name, value) => {
      const el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      el.value = value;
      return el;
    };

    form.append(
      hidden('action', 'add_feedback'),
      hidden('workId', workId)
    );

    const fields = document.createElement('div');
    fields.className = 'feedback-fields';

    const studentId = document.createElement('input');
    studentId.name = 'studentId';
    studentId.placeholder = '학번 (예: 20315)';
    studentId.pattern = '[0-9]{4,10}';
    studentId.required = true;
    studentId.maxLength = 10;

    const name = document.createElement('input');
    name.name = 'name';
    name.placeholder = '이름';
    name.required = true;
    name.maxLength = 20;

    fields.append(studentId, name);

    const message = document.createElement('textarea');
    message.name = 'message';
    message.placeholder =
      '작품을 보고 느낀 점이나 궁금한 점을 작성하세요.';
    message.minLength = 5;
    message.maxLength = 500;
    message.required = true;

    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = '피드백 제출하기';

    const status = document.createElement('div');
    status.className = 'feedback-status';
    status.setAttribute('role', 'status');

    form.append(fields, message, button, status);
    panel.append(heading, list, form, frame);
    container.appendChild(panel);

    async function refresh() {
      list.textContent = '피드백 불러오는 중...';

      try {
        const data = await loadComments(workId);
        if (!data.ok) throw new Error('조회 오류');

        list.replaceChildren();

        if (!data.comments.length) {
          list.textContent =
            '아직 피드백이 없어요. 첫 피드백을 남겨 주세요!';
          return;
        }

        data.comments.forEach(c => {
          const item = document.createElement('article');
          item.className = 'feedback-comment';

          const author = document.createElement('strong');
          author.textContent = c.studentId + ' ' + c.name;

          const date = document.createElement('time');
          date.textContent = c.date;

          const body = document.createElement('p');
          body.textContent = c.message;

          item.append(author, date, body);
          list.appendChild(item);
        });
      } catch (error) {
        list.textContent =
          '피드백을 불러오지 못했어요. 다시 시도해 주세요.';
      }
    }

    let submitting = false;

    frame.addEventListener('load', () => {
      if (!submitting) return;

      submitting = false;
      button.disabled = false;

      // iframe의 타 도메인 응답 내용은 읽을 수 없음.
      // 목록에 실제 반영되었는지 다시 확인.
      status.textContent = '제출 결과를 확인하고 있어요...';

      setTimeout(async () => {
        await refresh();
        status.textContent =
          '목록을 확인해 주세요. 반영되지 않았다면 다시 시도해 주세요.';
      }, 900);
    });

    form.addEventListener('submit', () => {
      if (submitting) return;

      submitting = true;
      button.disabled = true;
      status.textContent = '피드백 전송 중...';

      // 전송 실패 시 버튼이 영구 비활성화되지 않도록
      setTimeout(() => {
        if (submitting) {
          submitting = false;
          button.disabled = false;
          status.textContent =
            '응답을 확인하지 못했어요. 목록을 새로고침해 확인해 주세요.';
        }
      }, 20000);
    });

    refresh();
  };
})();
