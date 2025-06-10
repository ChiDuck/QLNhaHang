async function uploadDishPhotoAndGetPath() {
    const fileInput = document.getElementById("dishPhotoInput");
    if (!fileInput.files.length) return null;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const res = await fetch("/api/upload/dish-photo", {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        alert("Upload ảnh thất bại!");
        return null;
    }

    const result = await res.json();
    document.getElementById("dishPhotoPath").value = result.path; // gán path vào hidden field
}
