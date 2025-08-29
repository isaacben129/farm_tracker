async function fileToBase64(file) {
    return await new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => {
    const result = reader.result; // data:<mime>;base64,AAAA
    const commaIndex = result.indexOf(',');
    const base64 = result.slice(commaIndex + 1);
    resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
    });
    }
    
    
    async function submitCow({ tag, owner, imagesUrls, file, children }) {
    try {
    let imageBase64 = null;
    let imageName = null;
    if (file) {
    imageBase64 = await fileToBase64(file);
    imageName = file.name;
    }
    
    
    const payload = { tag, owner, imageBase64, imageName, images_url: imagesUrls, children };
    
    
    const res = await fetch('/.netlify/functions/addCow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    });
    
    
    const data = await res.json();
    if (!res.ok) throw data;
    
    
    // success: do UI updates, close modal, append to table, etc.
    return data;
    } catch (err) {
    console.error('Submit cow failed', err);
    throw err;
    }
    }
    
    
    // Export for module environments
    if (typeof module !== 'undefined') module.exports = { submitCow };
    
    