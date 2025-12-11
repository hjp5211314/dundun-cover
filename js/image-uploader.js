class ImageUploader {
    constructor() {
        this.workerUrl = 'https://rsdld.filegear-sg.me';
        this.lastSuccessMessage = ''; 
        this.init();
    }

    init() {
        const uploadBtn = document.getElementById('getImageLink');
        const copyBtn = document.getElementById('copyImageLink');
        const closeBtn = document.getElementById('closeImageLink');
        const modal = document.getElementById('imageLinkModal');
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadImage());
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyLink());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    showModal() {
        const modal = document.getElementById('imageLinkModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('imageLinkModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async uploadImage() {
        const uploadBtn = document.getElementById('getImageLink');
        const statusDiv = document.getElementById('uploadStatus');
        const linkInput = document.getElementById('imageLinkInput');
        
        try {

            this.showModal();
            
            uploadBtn.disabled = true;
            uploadBtn.textContent = '上传中...';
            statusDiv.textContent = '正在获取图片外链...';
            statusDiv.style.color = '#667eea';
            linkInput.value = '';
            
            const renderCanvas = document.getElementById('renderCanvas');
            if (!renderCanvas) {
                throw new Error('未找到画布元素');
            }
            
            const format = document.getElementById('exportFormat')?.value || 'webp';
            const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
            const quality = format === 'jpg' ? 0.95 : format === 'webp' ? 0.9 : 1;
            
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;
            
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let randomStr = '';
            for (let i = 0; i < 5; i++) {
                randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            const filename = `rsdld-cover-${dateStr}-${randomStr}.${format}`;
            
            const blob = await new Promise((resolve, reject) => {
                renderCanvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('图片转换失败'));
                }, mimeType, quality);
            });
            

            const fileSizeKB = (blob.size / 1024).toFixed(2);
            const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
            const fileSize = blob.size > 1024 * 1024 ? `${fileSizeMB}MB` : `${fileSizeKB}KB`;
            
            const formData = new FormData();
            formData.append('file', blob, filename);

            const response = await fetch(this.workerUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {

                if (response.status === 507) {
                    throw new Error('STORAGE_FULL');
                }
                if (response.status === 413) {
                    throw new Error('FILE_TOO_LARGE');
                }
                if (response.status === 403) {
                    throw new Error('FORBIDDEN');
                }
                if (response.status === 429) {
                    throw new Error('RATE_LIMIT');
                }
                throw new Error(`上传失败: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.url) {
                linkInput.value = result.url;
                

                let successMsg = `上传成功！本次封面大小: ${fileSize}`;
                if (result.storage) {
                    const { used, total, percent, files } = result.storage;
                    successMsg += ` | 已用: ${used}/${total} (${percent}) | 图床总封面数量: ${files}个`;
                }
                
                this.lastSuccessMessage = successMsg; 
                statusDiv.textContent = successMsg;
                statusDiv.style.color = '#10b981';
            } else {
                throw new Error(result.message || '上传失败，未返回图片链接');
            }
            
        } catch (error) {
            let errorMsg = '获取图片外链失败';
            let useHTML = false;
            
            if (error.message === 'STORAGE_FULL') {
                errorMsg = '为保证图床稳定性，已设定存储容量阈值。当前已达上限，暂时无法上传新图片。如需继续使用，请联系作者扩容或增加新存储桶';
            } else if (error.message === 'FILE_TOO_LARGE') {
                errorMsg = '图片超出设定阈值，请压缩图片后重试';
            } else if (error.message === 'FORBIDDEN') {
                errorMsg = '未授权域名，禁止获取外链。请前往 <a href="https://sb2b.ggff.net/" target="_blank" style="color: #10b981; text-decoration: underline;">官方网站</a> ';
                useHTML = true;
            } else if (error.message === 'RATE_LIMIT') {
                errorMsg = '上传次数超限。系统限制：每小时最多上传20次，每天最多上传100次。请稍后重试（建议等待1小时）';
            } else if (error.message.includes('Failed to fetch')) {
                errorMsg = '获取图片外链失败（网络连接错误）';
            } else if (error.message.includes('未找到')) {
                errorMsg = error.message;
            } else if (error.message.includes('上传失败')) {
                errorMsg = error.message;
            }
            
            if (useHTML) {
                statusDiv.innerHTML = errorMsg;
            } else {
                statusDiv.textContent = errorMsg;
            }
            statusDiv.style.color = '#ef4444';
            console.error('上传错误:', error);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '获取外链';
        }
    }

    copyLink() {
        const linkInput = document.getElementById('imageLinkInput');
        const statusDiv = document.getElementById('uploadStatus');
        
        if (linkInput.value) {
            linkInput.select();
            linkInput.setSelectionRange(0, 99999); 
            
            navigator.clipboard.writeText(linkInput.value).then(() => {
                statusDiv.textContent = '链接已复制到剪贴板！';
                statusDiv.style.color = '#10b981';
            }).catch(() => {
                document.execCommand('copy');
                statusDiv.textContent = '链接已复制到剪贴板！';
                statusDiv.style.color = '#10b981';
            });
            
            setTimeout(() => {
                if (statusDiv.textContent.includes('已复制') && this.lastSuccessMessage) {
                    statusDiv.textContent = this.lastSuccessMessage;
                }
            }, 2000);
        }
    }
}

window.imageUploader = new ImageUploader();
