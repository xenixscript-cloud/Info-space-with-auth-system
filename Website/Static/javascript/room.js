  // ---- Composer: appends a message bubble locally ----
  // In production, replace the local append with a POST to your Flask
  // endpoint (e.g. fetch('/api/messages', {method:'POST', body: ...}))
  // or emit over a WebSocket if you're using Flask-SocketIO.
  const form = document.getElementById('composer');
  const input = document.getElementById('messageInput');
  const messages = document.getElementById('messages');

  function addMessage(text) {
    const el = document.createElement('div');
    el.className = 'message own';
    el.innerHTML = `
      <div class="avatar" style="background:#2c5d8a">You</div>
      <div class="bubble-group">
        <div class="message-head">
          <span class="sender">You</span>
          <span class="timestamp">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="bubble"></div>
      </div>`;
    el.querySelector('.bubble').textContent = text; // textContent avoids injecting raw HTML
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text);
    input.value = '';
  });

  // ---- Logout: calls your Flask /logout route ----
  document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", function () {
        this.parentElement.remove();
    });
});


  messages.scrollTop = messages.scrollHeight;







/* =========================================================
     Everything below is client-side only, for the demo.
     In production:
       - GET  /api/posts            -> load the feed on page load
       - POST /api/posts (FormData) -> create a post + upload image
       - POST /api/posts/:id/like   -> toggle a like
       - POST /api/posts/:id/comments -> add a comment
     Swap the local array/DOM writes below for those calls.
     ========================================================= */

  const postText = document.getElementById('postText');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewImg = document.getElementById('imagePreviewImg');
  const removeImageBtn = document.getElementById('removeImage');
  const postSubmit = document.getElementById('postSubmit');
  const feed = document.getElementById('feed');

  let selectedImageDataUrl = null;

  function refreshSubmitState() {
    postSubmit.disabled = postText.value.trim() === '' && !selectedImageDataUrl;
  }

  postText.addEventListener('input', () => {
    postText.style.height = 'auto';
    postText.style.height = postText.scrollHeight + 'px';
    refreshSubmitState();
  });

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImageDataUrl = e.target.result;
      imagePreviewImg.src = selectedImageDataUrl;
      imagePreview.classList.add('visible');
      refreshSubmitState();
    };
    reader.readAsDataURL(file);
  });

  removeImageBtn.addEventListener('click', () => {
    selectedImageDataUrl = null;
    imageInput.value = '';
    imagePreview.classList.remove('visible');
    refreshSubmitState();
  });

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function buildPostCard({ author, avatarBg, timestamp, text, imageSrc }) {
    const card = document.createElement('div');
    card.className = 'post-card';

    card.innerHTML = `
      <div class="post-head">
        <div class="avatar" style="background:${avatarBg}">${author.slice(0, 2).toUpperCase()}</div>
        <div class="post-head-text">
          <span class="post-author"></span>
          <span class="post-timestamp"></span>
        </div>
      </div>
      <div class="post-body"></div>
      ${imageSrc ? `<img class="post-image" src="${imageSrc}" alt="Post image">` : ''}
      <div class="post-engage">
        <button type="button" class="engage-btn like-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          <span class="like-count">0</span>
        </button>
        <button type="button" class="engage-btn comment-toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5H4l3-3.5a8.5 8.5 0 1 1 14-5Z"/></svg>
          <span class="comment-count">0</span>
        </button>
      </div>
      <div class="comment-box">
        <input type="text" placeholder="Write a comment...">
        <button type="button">Send</button>
      </div>
      <div class="comment-list"></div>
    `;

    card.querySelector('.post-author').textContent = author;
    card.querySelector('.post-timestamp').textContent = timestamp;
    card.querySelector('.post-body').textContent = text;

    // like toggle
    const likeBtn = card.querySelector('.like-btn');
    const likeCount = card.querySelector('.like-count');
    let liked = false;
    likeBtn.addEventListener('click', () => {
      liked = !liked;
      likeCount.textContent = liked ? Number(likeCount.textContent) + 1 : Number(likeCount.textContent) - 1;
      likeBtn.classList.toggle('liked', liked);
    });

    // comment toggle + submit
    const commentToggle = card.querySelector('.comment-toggle');
    const commentBox = card.querySelector('.comment-box');
    const commentCount = card.querySelector('.comment-count');
    const commentList = card.querySelector('.comment-list');
    const commentInput = commentBox.querySelector('input');
    const commentSend = commentBox.querySelector('button');

    commentToggle.addEventListener('click', () => {
      commentBox.classList.toggle('visible');
      if (commentBox.classList.contains('visible')) commentInput.focus();
    });

    function submitComment() {
      const value = commentInput.value.trim();
      if (!value) return;
      const item = document.createElement('div');
      item.className = 'comment-item';
      const b = document.createElement('b');
      b.textContent = 'You: ';
      item.appendChild(b);
      item.appendChild(document.createTextNode(value));
      commentList.appendChild(item);
      commentInput.value = '';
      commentCount.textContent = Number(commentCount.textContent) + 1;
    }

    commentSend.addEventListener('click', submitComment);
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitComment();
    });

    return card;
  }

  postSubmit.addEventListener('click', () => {
    const text = postText.value.trim();
    if (!text && !selectedImageDataUrl) return;

    const card = buildPostCard({
      author: 'You',
      avatarBg: '#2c5d8a',
      timestamp: timeNow(),
      text,
      imageSrc: selectedImageDataUrl
    });
