class TextEditor {
    constructor() {
        this.fontLoadCache = new Set();
        this.init();
        this.preloadFonts();
        this.setupFontReadyListener();
    }

    setupFontReadyListener() {
        if (document.fonts) {
            document.fonts.addEventListener('loadingdone', () => {
                if (window.renderer) {
                    setTimeout(() => window.renderer.render(), 50);
                }
            });
        }
    }

    preloadFonts() {
        if (!document.fonts) return;

        const fonts = [
            "'LXGW WenKai Screen', 'SimHei', sans-serif",
            "'DouyinSans', sans-serif",
            "'MaoKenTangYuan (beta)', sans-serif",
            "'Mengshen-Handwritten', cursive",
            "'NanoKongHinhHei', sans-serif",
            "'Maoken Glitch Sans', sans-serif",
            "'KURIYAMAKOUCHIFONT_N', sans-serif",
            "'Huiwen-mincho', serif",
            "'BoutiqueBitmap9x9 3D', monospace",
            "'Fusion Pixel 12px M latin', monospace",
            "'SimHei', sans-serif",
            "'SimSun', serif",
            "'KaiTi', serif",
            "'FangSong', serif"
        ];

        setTimeout(() => {
            fonts.forEach(fontFamily => {
                this.ensureFontLoaded(fontFamily, 160);
            });
        }, 100);
    }

    ensureFontLoaded(fontFamily) {
        if (!document.fonts || !fontFamily) {
            return Promise.resolve();
        }

        const primaryFont = fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
        if (!primaryFont || ['sans-serif', 'serif', 'monospace', 'cursive'].includes(primaryFont.toLowerCase())) {
            return Promise.resolve();
        }

        const cacheKey = primaryFont;

        if (this.fontLoadCache.has(cacheKey)) {
            return Promise.resolve();
        }

        const fontSpecNormal = `400 20px "${primaryFont}"`;
        const fontSpecBold = `900 20px "${primaryFont}"`;

        if (document.fonts.check(fontSpecNormal) && document.fonts.check(fontSpecBold)) {
            this.fontLoadCache.add(cacheKey);
            return Promise.resolve();
        }

        const p1 = this.loadFontWithRetry(fontSpecNormal, null, 3);
        const p2 = this.loadFontWithRetry(fontSpecBold, null, 3);

        return Promise.all([p1, p2]).then(() => {
            this.fontLoadCache.add(cacheKey);
        });
    }

    loadFontWithRetry(fontSpec, cacheKey, retries = 3) {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve();
            }, 5000); 

            document.fonts.load(fontSpec).then((loadedFonts) => {
                clearTimeout(timeout);
                if (loadedFonts.length > 0) {
                    resolve();
                } else {
                    if (retries > 0) {
                        setTimeout(() => {
                            this.loadFontWithRetry(fontSpec, cacheKey, retries - 1).then(resolve);
                        }, 100);
                    } else {
                        resolve();
                    }
                }
            }).catch(() => {
                clearTimeout(timeout);
                if (retries > 0) {
                    setTimeout(() => {
                        this.loadFontWithRetry(fontSpec, cacheKey, retries - 1).then(resolve);
                    }, 100);
                } else {
                    resolve();
                }
            });
        });
    }

    init() {
        const controls = [
            'textColor',
            'letterSpacing',
            'textStroke',
            'strokeColor',
            'strokeOpacity',
            'textShadow',
            'shadowColor',
            'shadowOpacity',
            'textPosition'
        ];

        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateText(false));
                element.addEventListener('change', () => this.updateText(false));
            }
        });

        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', () => {
                this.updateText(false);
            });
        }

        const fontWeightBtn = document.getElementById('fontWeightToggle');
        if (fontWeightBtn) {
            fontWeightBtn.addEventListener('click', () => {
                const currentWeight = fontWeightBtn.getAttribute('data-weight');
                const newWeight = currentWeight === '400' ? '900' : '400';
                fontWeightBtn.setAttribute('data-weight', newWeight);
                
                fontWeightBtn.textContent = newWeight === '900' ? '已加粗' : '加粗';
                
                if (newWeight === '900') {
                    fontWeightBtn.classList.add('active');
                    fontWeightBtn.style.borderColor = 'var(--accent-color)';
                    fontWeightBtn.style.color = 'var(--accent-color)';
                    fontWeightBtn.style.background = 'rgba(37, 99, 235, 0.08)';
                } else {
                    fontWeightBtn.classList.remove('active');
                    fontWeightBtn.style.borderColor = '';
                    fontWeightBtn.style.color = '';
                    fontWeightBtn.style.background = '';
                }
                
                this.updateText(false);
            });
        }

        const textCenter = document.getElementById('textCenter');
        if (textCenter) {
            textCenter.addEventListener('input', () => {
                if (window.renderer) window.renderer.manualFontSize = false;
                this.updateText(true);
            });
            textCenter.addEventListener('change', () => {
                if (window.renderer) window.renderer.manualFontSize = false;
                this.updateText(true);
            });
        }

        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            fontSize.addEventListener('input', () => {
                if (window.renderer) window.renderer.manualFontSize = true;
                this.updateText(false);
            });
            fontSize.addEventListener('change', () => {
                if (window.renderer) window.renderer.manualFontSize = true;
                this.updateText(false);
            });
        }

        this.updateText(true);
    }

    updateText(autoFit = false) {
        const textCenterElement = document.getElementById('textCenterElement');
        const textLayer = document.getElementById('textLayer');
        
        const textCenter = document.getElementById('textCenter').value;
        const fontSize = document.getElementById('fontSize').value;
        const fontSizeNumber = parseInt(fontSize, 10) || 160;
        const textColor = document.getElementById('textColor').value;
        const fontFamily = document.getElementById('fontFamily').value;
        const fontWeightBtn = document.getElementById('fontWeightToggle');
        const fontWeight = fontWeightBtn ? fontWeightBtn.getAttribute('data-weight') : '400';
        const letterSpacing = document.getElementById('letterSpacing').value;
        const textStroke = document.getElementById('textStroke').value;
        const strokeColor = document.getElementById('strokeColor').value;
        const strokeOpacity = document.getElementById('strokeOpacity').value;
        const textShadow = document.getElementById('textShadow').value;
        const shadowColor = document.getElementById('shadowColor').value;
        const shadowOpacity = document.getElementById('shadowOpacity').value;
        const textPosition = document.getElementById('textPosition').value;

        textCenterElement.textContent = textCenter;

        textCenterElement.style.fontFamily = fontFamily;
        textCenterElement.style.fontWeight = fontWeight;
        textCenterElement.style.letterSpacing = `${letterSpacing}px`;
        textCenterElement.style.color = textColor;

        const finalStrokeColor = this.adjustColorOpacity(strokeColor, strokeOpacity / 100);
        textCenterElement.style.webkitTextStroke = `${textStroke}px ${finalStrokeColor}`;

        const finalShadowColor = this.adjustColorOpacity(shadowColor, shadowOpacity / 100);
        textCenterElement.style.textShadow = `0 ${textShadow}px ${textShadow * 2}px ${finalShadowColor}`;

        const pos = parseInt(textPosition) || 50;
        textCenterElement.style.top = `${pos}%`;
        
        const translateY = -pos;
        textCenterElement.style.transform = `translate(-50%, ${translateY}%)`;

        textCenterElement.style.fontSize = `${fontSizeNumber}px`;

        textCenterElement.style.display = textCenter ? 'block' : 'none';

        if (autoFit && textCenter && textCenterElement.offsetWidth > 0) {
            this.autoFitFontSize(textCenterElement, fontSizeNumber);
        }

        if (window.renderer) {
            window.renderer.render();
        }
        
        this.ensureFontLoaded(fontFamily).then(() => {
            if (window.renderer) {
                window.renderer.render();
            }
        });
    }

    adjustColorOpacity(color, opacity) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    autoFitFontSize(element, baseFontSize) {
        if (!element || !baseFontSize) return;
        
        const coverCanvas = document.getElementById('coverCanvas');
        const iconContainer = document.getElementById('iconContainer');
        
        if (!coverCanvas) return;
        
        const canvasWidth = coverCanvas.offsetWidth;
        const iconWidth = iconContainer ? iconContainer.offsetWidth : 0;
        
        if (canvasWidth <= 0) return;
        
        const safetyMargin = 80; 
        const maxWidth = Math.max(canvasWidth - iconWidth - safetyMargin, 200);
        
        let currentFontSize = parseInt(baseFontSize);
        if (isNaN(currentFontSize) || currentFontSize <= 0) {
            currentFontSize = 160; 
        }
        
        element.style.fontSize = `${currentFontSize}px`;
        
        let actualWidth = element.offsetWidth;
        
        if (actualWidth <= 0) return;
        
        if (actualWidth <= maxWidth) return;
        
        let iterations = 0;
        const maxIterations = 30;
        const minFontSize = 30; 
        
        while (actualWidth > maxWidth && currentFontSize > minFontSize && iterations < maxIterations) {
            const ratio = actualWidth / maxWidth;
            let step = 5;
            if (ratio > 2) step = 10;
            else if (ratio > 1.5) step = 7;
            else if (ratio > 1.2) step = 3;
            else step = 2;
            
            currentFontSize -= step;
            
            if (currentFontSize < minFontSize) {
                currentFontSize = minFontSize;
            }
            
            element.style.fontSize = `${currentFontSize}px`;
            actualWidth = element.offsetWidth;
            iterations++;
        }
    }

    getCurrentConfig() {
        const fontWeightBtn = document.getElementById('fontWeightToggle');
        return {
            textCenter: document.getElementById('textCenter').value,
            fontSize: document.getElementById('fontSize').value,
            textColor: document.getElementById('textColor').value,
            fontFamily: document.getElementById('fontFamily').value,
            fontWeight: fontWeightBtn ? fontWeightBtn.getAttribute('data-weight') : '400',
            letterSpacing: document.getElementById('letterSpacing').value,
            textStroke: document.getElementById('textStroke').value,
            strokeColor: document.getElementById('strokeColor').value,
            strokeOpacity: document.getElementById('strokeOpacity').value,
            textShadow: document.getElementById('textShadow').value,
            shadowColor: document.getElementById('shadowColor').value,
            shadowOpacity: document.getElementById('shadowOpacity').value,
            textPosition: document.getElementById('textPosition').value
        };
    }

    setConfig(config) {
        if (config.textLeft !== undefined) document.getElementById('textLeft').value = config.textLeft;
        if (config.textRight !== undefined) document.getElementById('textRight').value = config.textRight;
        if (config.fontSize) document.getElementById('fontSize').value = config.fontSize;
        if (config.textColor) document.getElementById('textColor').value = config.textColor;
        if (config.textStroke) document.getElementById('textStroke').value = config.textStroke;
        if (config.textShadow) document.getElementById('textShadow').value = config.textShadow;
        if (config.textPosition) document.getElementById('textPosition').value = config.textPosition;
        if (config.fontFamily) document.getElementById('fontFamily').value = config.fontFamily;
        if (config.fontWeight) {
            const fontWeightBtn = document.getElementById('fontWeightToggle');
            if (fontWeightBtn) {
                fontWeightBtn.setAttribute('data-weight', config.fontWeight);
                if (config.fontWeight === '900') {
                    fontWeightBtn.classList.add('active');
                } else {
                    fontWeightBtn.classList.remove('active');
                }
            }
        }
        
        ['fontSize', 'textStroke', 'textShadow', 'textPosition'].forEach(key => {
            if (config[key]) {
                const valueElement = document.getElementById(`${key}Value`);
                if (valueElement) {
                    valueElement.textContent = config[key];
                }
            }
        });
        
        this.updateText();
    }
}

window.textEditor = new TextEditor();
