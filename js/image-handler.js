class ImageHandler {
    constructor() {
        this.currentImage = null;
        this.init();
    }

    init() {
        const uploadInput = document.getElementById('iconUpload');
        const clearBtn = document.getElementById('clearIcon');
        const iconLibraryBtn = document.getElementById('iconLibraryBtn');
        const iconCodeInput = document.getElementById('iconCode');
        const importSvgBtn = document.getElementById('importSvgBtn');
        this.svgModal = document.getElementById('svgImportModal');
        this.svgCodeInput = document.getElementById('svgCodeInput');
        this.cancelSvgImport = document.getElementById('cancelSvgImport');
        this.confirmSvgImport = document.getElementById('confirmSvgImport');

        uploadInput.addEventListener('change', (e) => this.handleUpload(e));
        clearBtn.addEventListener('click', () => this.clearIcon());
        iconLibraryBtn.addEventListener('click', () => this.openIconLibrary());
        
        let debounceTimer;
        iconCodeInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.loadIconFromCode();
            }, 800);
        });
        
        iconCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                this.loadIconFromCode();
            }
        });

        if (importSvgBtn && this.svgModal && this.svgCodeInput && this.cancelSvgImport && this.confirmSvgImport) {
            importSvgBtn.addEventListener('click', () => this.openSvgModal());
            this.cancelSvgImport.addEventListener('click', () => this.closeSvgModal());
            this.confirmSvgImport.addEventListener('click', () => this.importSvgFromText());
        }

        this.loadDefaultIcon(true);
    }

    async loadDefaultIcon(silent = true) {
        const iconName = 'mingcute:certificate-line';
        const iconUrl = `https://api.iconify.design/${iconName}.svg`;
        try {
            const response = await fetch(iconUrl);
            if (!response.ok) throw new Error('默认图标加载失败');
            const svgText = await response.text();

            let fixedSvg = svgText;
            let widthPx = 0, heightPx = 0;
            const vb = svgText.match(/viewBox=["']\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*["']/i);
            if (vb) {
                widthPx = parseFloat(vb[3]) || 0;
                heightPx = parseFloat(vb[4]) || 0;
            }
            if (!(widthPx > 0 && heightPx > 0)) {
                const w = svgText.match(/width=["']([^"']+)["']/i);
                const h = svgText.match(/height=["']([^"']+)["']/i);
                const num = v => { const m = String(v || '').match(/([\d.]+)/); return m ? parseFloat(m[1]) : 0; };
                widthPx = num(w && w[1]) || 512;
                heightPx = num(h && h[1]) || 512;
            }

            fixedSvg = fixedSvg.replace(/\swidth=["'][^"']*["']/i, '')
                               .replace(/\sheight=["'][^"']*["']/i, '');
            fixedSvg = fixedSvg.replace(/<svg\b([^>]*)>/i, (m, attr) => {
                return `<svg${attr} width="${Math.round(widthPx)}" height="${Math.round(heightPx)}">`;
            });

            const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fixedSvg);
            this.currentImage = dataUrl;
            this.displayIcon(dataUrl, true);
        } catch (e) {
            console.error('默认图标加载失败:', e);
        }
    }

    openIconLibrary() {
        window.open('https://yesicon.app/', '_blank');
    }
    openSvgModal() {
        if (!this.svgModal) return;
        this.svgModal.style.display = 'flex';
        if (this.svgCodeInput) {
            this.svgCodeInput.value = '';
            setTimeout(() => this.svgCodeInput.focus(), 0);
        }
    }

    closeSvgModal() {
        if (!this.svgModal) return;
        this.svgModal.style.display = 'none';
    }

    importSvgFromText() {
        if (!this.svgCodeInput) return;
        const raw = this.svgCodeInput.value.trim();
        if (!raw) {
            return;
        }
        if (!raw.includes('<svg')) {
            return;
        }

        try {
            let fixedSvg = raw;
            let widthPx = 0, heightPx = 0;
            const vb = raw.match(/viewBox=["']\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*["']/i);
            if (vb) {
                widthPx = parseFloat(vb[3]) || 0;
                heightPx = parseFloat(vb[4]) || 0;
            }
            if (!(widthPx > 0 && heightPx > 0)) {
                const w = raw.match(/width=["']([^"']+)["']/i);
                const h = raw.match(/height=["']([^"']+)["']/i);
                const num = v => {
                    const m = String(v || '').match(/([\d.]+)/);
                    return m ? parseFloat(m[1]) : 0;
                };
                widthPx = num(w && w[1]) || 512;
                heightPx = num(h && h[1]) || 512;
            }

            fixedSvg = fixedSvg.replace(/\swidth=["'][^"']*["']/i, '')
                               .replace(/\sheight=["'][^"']*["']/i, '');
            fixedSvg = fixedSvg.replace(/<svg\b([^>]*)>/i, (m, attr) => {
                return `<svg${attr} width="${Math.round(widthPx)}" height="${Math.round(heightPx)}">`;
            });

            const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fixedSvg);
            this.currentImage = dataUrl;
            this.displayIcon(dataUrl);
            this.closeSvgModal();
        } catch (e) {
            console.error('导入SVG失败:', e);
        }
    }

    async loadIconFromCode() {
        const iconCodeInput = document.getElementById('iconCode');
        const iconCode = iconCodeInput.value.trim();

        if (!iconCode) {
            await this.loadDefaultIcon(true);
            return;
        }

        const iconUrl = `https://api.iconify.design/${iconCode}.svg`;

        try {
            const response = await fetch(iconUrl);
            
            if (!response.ok) {
                throw new Error('图标不存在或网络错误');
            }

            const svgText = await response.text();

            let fixedSvg = svgText;
            let widthPx = 0, heightPx = 0;
            const vb = svgText.match(/viewBox=["']\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*["']/i);
            if (vb) {
                widthPx = parseFloat(vb[3]) || 0;
                heightPx = parseFloat(vb[4]) || 0;
            }
            if (!(widthPx > 0 && heightPx > 0)) {
                const w = svgText.match(/width=["']([^"']+)["']/i);
                const h = svgText.match(/height=["']([^"']+)["']/i);
                const num = v => {
                    const m = String(v || '').match(/([\d.]+)/);
                    return m ? parseFloat(m[1]) : 0;
                };
                widthPx = num(w && w[1]) || 512;
                heightPx = num(h && h[1]) || 512;
            }

            fixedSvg = fixedSvg.replace(/\swidth=["'][^"']*["']/i, '')
                               .replace(/\sheight=["'][^"']*["']/i, '');
            fixedSvg = fixedSvg.replace(/<svg\b([^>]*)>/i, (m, attr) => {
                return `<svg${attr} width="${Math.round(widthPx)}" height="${Math.round(heightPx)}">`;
            });

            const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fixedSvg);

            this.currentImage = dataUrl;
            this.displayIcon(dataUrl);
            
        } catch (error) {
            console.error('加载图标失败:', error);
        }
    }

    handleUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            this.displayIcon(e.target.result);
        };

        reader.onerror = () => {};

        reader.readAsDataURL(file);
    }

    displayIcon(imageSrc, silent = false) {
        const iconImage = document.getElementById('iconImage');
        const iconContainer = document.getElementById('iconContainer');
        
        iconContainer.classList.add('loading');
        
        iconImage.onload = () => {
            iconImage.style.display = 'block';
            iconContainer.classList.remove('loading');
            iconContainer.classList.remove('empty');
            iconContainer.classList.add('has-icon');
            
            if (window.app) {
                window.app.updateIconState(true);
            }
            
            if (window.iconEffects) {
                window.iconEffects.updateEffects();
            }
            
            if (window.renderer) window.renderer.render();
        };
        
        iconImage.onerror = () => {
            iconContainer.classList.remove('loading');
        };
        
        iconImage.src = imageSrc;
    }

    clearIcon() {
        const iconImage = document.getElementById('iconImage');
        const uploadInput = document.getElementById('iconUpload');
        const iconContainer = document.getElementById('iconContainer');
        
        iconImage.style.display = 'none';
        iconImage.src = '';
        uploadInput.value = '';
        this.currentImage = null;
        iconContainer.classList.add('empty');
        iconContainer.classList.remove('has-icon');
        
        if (window.app) {
            window.app.updateIconState(false);
        }
        this.loadDefaultIcon(true);
    }

    getCurrentImage() {
        return this.currentImage;
    }

    hasImage() {
        return this.currentImage !== null;
    }
}

window.imageHandler = new ImageHandler();
