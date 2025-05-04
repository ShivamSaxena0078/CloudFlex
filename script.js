// index.html
if (document.getElementById('loginBtn')) {
    document.getElementById('loginBtn').onclick = async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await firebase.auth().signInWithPopup(provider);
        window.location.href = "gallery.html";
      } catch (err) {
        alert("Login failed!");
      }
    };
  }
  
  // gallery.html
  if (document.getElementById('uploadBtn')) {
    firebase.auth().onAuthStateChanged(user => {
      if (!user) window.location.href = "index.html";
    });
  
    const storage = firebase.storage();
  
    document.getElementById('uploadBtn').onclick = async () => {
      const file = document.getElementById('imageInput').files[0];
      const caption = document.getElementById('captionInput').value;
  
      if (!file || !caption) return alert("Add both image and caption");
  
      const fileRef = storage.ref().child('images/' + Date.now() + '-' + file.name);
      await fileRef.put(file);
      const url = await fileRef.getDownloadURL();
  
      const gallery = document.getElementById('galleryContainer');
      const i = gallery.children.length;
      const card = document.createElement('div');
      card.className = 'polaroid';
      card.style.setProperty('--i', i);
      card.innerHTML = `<img src="${url}" /><div class="caption">${caption}</div>`;
      gallery.prepend(card);
  
      document.getElementById('imageInput').value = '';
      document.getElementById('captionInput').value = '';
    };
  }
  