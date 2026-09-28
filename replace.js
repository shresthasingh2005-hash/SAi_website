const fs = require('fs');
let code = fs.readFileSync('f:/BuddyLLM/SAi_website/src/App.jsx', 'utf8');

const oldCode =                                 <button onClick={() => {
                                  if(data.type === 'file' && data.content.startsWith('data:image')) {
                                    const w = window.open();
                                    w.document.write(\<img src=\"\\" style=\"max-width:100%; height:auto;\" />\);
                                  } else {
                                    alert(data.content.substring(0, 500) + (data.content.length > 500 ? '...' : ''));
                                  }
                                }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>;

const newCode =                                 <button onClick={() => {
                                  if(data.type === 'file' && data.content.startsWith('data:image')) {
                                    const w = window.open();
                                    w.document.write(\<img src=\"\\" style=\"max-width:100%; height:auto;\" />\);
                                  } else if (data.type === 'file' && data.content.startsWith('data:application/pdf')) {
                                    try {
                                      const byteString = atob(data.content.split(',')[1]);
                                      const ab = new ArrayBuffer(byteString.length);
                                      const ia = new Uint8Array(ab);
                                      for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
                                      const blob = new Blob([ab], {type: 'application/pdf'});
                                      const url = URL.createObjectURL(blob);
                                      window.open(url, '_blank');
                                    } catch(e) {
                                      const w = window.open();
                                      if(w) w.document.write(\<iframe src=\"\\" style=\"width:100%;height:100vh;border:none;\"></iframe>\);
                                    }
                                  } else if (data.content.trim().startsWith('<') || data.content.includes('<!DOCTYPE')) {
                                    const w = window.open('', '_blank');
                                    if(w) {
                                      w.document.write(data.content);
                                      w.document.close();
                                    } else {
                                      alert("Popup blocked. Please allow popups to view this document.");
                                    }
                                  } else {
                                    alert(data.content.substring(0, 500) + (data.content.length > 500 ? '...' : ''));
                                  }
                                }} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>View</button>;

if (code.includes(oldCode)) {
    code = code.replace(oldCode, newCode);
    fs.writeFileSync('f:/BuddyLLM/SAi_website/src/App.jsx', code);
    console.log('Replaced successfully via JS!');
} else {
    console.log('Old code not found.');
}
