
const auth = firebase.auth();
const storage = firebase.storage();

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(() => {
    window.location.href = 'gallery.html';
  });
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  });
}

auth.onAuthStateChanged(user => {
  if (user && document.getElementById('welcome')) {
    document.getElementById('welcome').innerText = `Welcome, ${user.displayName}!`;
    loadGallery();
  }
});

function uploadImage() {
  const file = document.getElementById('imageUpload').files[0];
  const caption = document.getElementById('captionInput').value;
  const timeNow = new Date().toLocaleString();

  if (!file || !caption) {
    alert('Please select a file and write a caption.');
    return;
  }

  const storageRef = storage.ref(`images/${file.name}`);
  storageRef.put(file).then(snapshot => {
    return snapshot.ref.getDownloadURL();
  }).then(url => {
    const gallery = document.getElementById('gallery');
    const div = document.createElement('div');
    div.className = 'polaroid';
    div.innerHTML = `<img src="${url}" alt="memory"><div class='caption'>${caption}</div><div class='time'>${timeNow}</div>`;
    div.onclick = () => openModal(url, caption, timeNow);
    gallery.appendChild(div);
  });
}

function loadGallery() {
  const gallery = document.getElementById('gallery');
  storage.ref('images').listAll().then(res => {
    res.items.forEach(itemRef => {
      itemRef.getDownloadURL().then(url => {
        const caption = "Uploaded memory";
        const timeNow = new Date().toLocaleString(); // Placeholder; ideally store timestamp metadata
        const div = document.createElement('div');
        div.className = 'polaroid';
        div.innerHTML = `<img src="${url}" alt="memory"><div class='caption'>${caption}</div><div class='time'>${timeNow}</div>`;
        div.onclick = () => openModal(url, caption, timeNow);
        gallery.appendChild(div);
      });
    });
  });
}

function openModal(url, caption, time) {
  document.getElementById('modalImage').src = url;
  document.getElementById('modalCaption').innerHTML = `<p class='caption'>${caption}</p><p class='time'>Uploaded on ${time}</p>`;
  document.getElementById('zoomModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('zoomModal').style.display = 'none';
}
