class ColorSync {
    constructor() {
        this.colorPairs = [
            { colorId: 'bgColor1', hexId: 'bgColor1Hex' },
            { colorId: 'bgColor2', hexId: 'bgColor2Hex' },
            { colorId: 'edgeGlowColor', hexId: 'edgeGlowColorHex' },
            { colorId: 'textColor', hexId: 'textColorHex' },
            { colorId: 'strokeColor', hexId: 'strokeColorHex' },
            { colorId: 'shadowColor', hexId: 'shadowColorHex' }
        ];
        
        this.init();
    }

    init() {
        this.colorPairs.forEach(pair => {
            const colorInput = document.getElementById(pair.colorId);
            const hexInput = document.getElementById(pair.hexId);
            
            if (!colorInput || !hexInput) return;

            colorInput.addEventListener('input', () => {
                hexInput.value = colorInput.value.toUpperCase();
            });

            hexInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                
                if (value.length === 0) {
                    hexInput.style.borderColor = '';
                } else if (this.isValidHex(value)) {
                    colorInput.value = value.toUpperCase();
                    colorInput.dispatchEvent(new Event('input', { bubbles: true }));
                    hexInput.value = value.toUpperCase();
                    hexInput.style.borderColor = '';
                } else {
                    hexInput.style.borderColor = '#ef4444';
                }
            });

            hexInput.addEventListener('blur', () => {
                this.applyHexColor(hexInput, colorInput);
            });

            hexInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyHexColor(hexInput, colorInput);
                    hexInput.blur();
                }
            });

            hexInput.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.applyHexColor(hexInput, colorInput);
                }, 0);
            });
        });
    }

    applyHexColor(hexInput, colorInput) {
        let value = hexInput.value.trim();
        
        if (!value || value === '#') {
            hexInput.value = colorInput.value.toUpperCase();
            hexInput.style.borderColor = '';
            return;
        }
        
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        
        if (this.isValidHex(value)) {
            colorInput.value = value.toUpperCase();
            colorInput.dispatchEvent(new Event('input', { bubbles: true }));
            hexInput.value = value.toUpperCase();
            hexInput.style.borderColor = '';
        } else {
            hexInput.value = colorInput.value.toUpperCase();
            hexInput.style.borderColor = '';
        }
    }

    isValidHex(hex) {
        if (!hex) return false;
        const regex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
        return regex.test(hex);
    }
}

window.colorSync = new ColorSync();
