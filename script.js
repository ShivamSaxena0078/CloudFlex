const auth = firebase.auth();
const storage = firebase.storage();

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      window.location.href = "gallery.html";
    })
    .catch(error => {
      console.error("Login failed:", error);
    });
}

function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}

function uploadImage() {
  const fileInput = document.getElementById("imageInput");
  const captionInput = document.getElementById("captionInput");
  const file = fileInput.files[0];
  const caption = captionInput.value;

  if (!file || !caption) {
    alert("Please select an image and write a caption.");
    return;
  }

  const userId = auth.currentUser.uid;
  const timestamp = Date.now();
  const storageRef = storage.ref(`images/${userId}/${timestamp}_${file.name}`);

  storageRef.put(file).then(snapshot => {
    return snapshot.ref.getDownloadURL();
  }).then(url => {
    displayImage(url, caption, storageRef.fullPath);
  }).catch(err => {
    console.error("Upload failed:", err);
  });
}

function displayImage(url, caption, path, time = null) {
  const gallery = document.getElementById("gallery");
  const div = document.createElement("div");
  div.className = "polaroid";

  if (!time) {
    const now = new Date();
    time = now.toLocaleString();
  }

  div.innerHTML = `
    <img src="${url}" alt="memory">
    <div class='caption'>${caption}</div>
    <div class='time'>${time}</div>
    <button class="deleteBtn">🗑️ Delete</button>
  `;

  div.querySelector(".deleteBtn").onclick = (e) => {
    e.stopPropagation(); // prevent zoom when deleting
    deleteImage(path, div);
  };

  div.onclick = () => {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <img src="${url}" alt="Zoomed memory">
        <div class='caption'>${caption}</div>
        <div class='time'>${time}</div>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  };

  gallery.appendChild(div);
}

function loadGallery() {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("welcome").innerText = "Welcome, " + user.displayName + "!";
      const userId = user.uid;
      const galleryRef = storage.ref(`images/${userId}`);

      galleryRef.listAll().then(res => {
        res.items.forEach(itemRef => {
          itemRef.getDownloadURL().then(url => {
            const nameParts = itemRef.name.split("_");
            const caption = nameParts.slice(1).join("_").replace(/\.[^/.]+$/, "");
            const time = new Date(parseInt(nameParts[0])).toLocaleString();
            displayImage(url, caption, itemRef.fullPath, time);
          });
        });
      });
    } else {
      window.location.href = "index.html";
    }
  });
}

function deleteImage(path, element) {
  storage.ref(path).delete().then(() => {
    element.remove();
    alert("Image deleted successfully.");
  }).catch((error) => {
    console.error("Error deleting image:", error);
    alert("Failed to delete image.");
  });
}
