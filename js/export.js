

class ExportManager {
    constructor() {
        this.isExporting = false;
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => this.exportCover());
    }

    async exportCover() {
        if (this.isExporting) {
            return;
        }

        this.isExporting = true;
        const exportBtn = document.getElementById('exportBtn');
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '⏳ 生成中...';
        exportBtn.disabled = true;

        try {
       
            const format = document.getElementById('exportFormat').value;
            const quality = 1; 
            const { width, height } = this.getExportSize();

          
            const finalCanvas = window.renderer
                ? window.renderer.renderToCanvas(width, height)
                : null;
            if (!finalCanvas) throw new Error('渲染器未初始化');

      

     
            let mimeType;
            let extension;
            
            switch (format) {
                case 'png':
                    mimeType = 'image/png';
                    extension = 'png';
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    extension = 'webp';
                    break;
                case 'jpg':
                    mimeType = 'image/jpeg';
                    extension = 'jpg';
                    break;
                default:
                    mimeType = 'image/png';
                    extension = 'png';
            }

       
            finalCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
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
                
                link.download = `rsdld-cover-${dateStr}-${randomStr}.${extension}`;
                link.href = url;
                link.click();
                
          
                URL.revokeObjectURL(url);
            }, mimeType, quality);

        } catch (error) {
            console.error('导出失败:', error);
        } finally {
            this.isExporting = false;
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        }
    }

    getExportSize() {
        const sizeSelect = document.getElementById('exportSize').value;
        
        if (sizeSelect === 'custom') {
            return {
                width: parseInt(document.getElementById('customWidth').value) || 1000,
                height: parseInt(document.getElementById('customHeight').value) || 500
            };
        }
        
        const [width, height] = sizeSelect.split('x').map(Number);
        return { width, height };
    }

}


window.exportManager = new ExportManager();
