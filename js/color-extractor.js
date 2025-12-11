

class ColorExtractor {
    constructor() {
        this.colorThief = null;
        this.init();
    }

    init() {

        const checkColorThief = setInterval(() => {
            if (typeof ColorThief !== 'undefined') {
                this.colorThief = new ColorThief();
                clearInterval(checkColorThief);

            }
        }, 100);

        const autoColorBtn = document.getElementById('autoColor');
        autoColorBtn.addEventListener('click', () => this.extractColors());
    }

    extractColors() {
        if (!window.imageHandler || !window.imageHandler.hasImage()) {
            return;
        }

        if (!this.colorThief) {
            return;
        }

        const iconImage = document.getElementById('iconImage');
        
      
        if (!iconImage.complete) {
            return;
        }

        try {
           
            const dominantColor = this.colorThief.getColor(iconImage);
            
          
            const palette = this.colorThief.getPalette(iconImage, 5);
            
          
            const color1 = this.rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
            
        
            let color2;
            if (palette.length > 1) {
                color2 = this.rgbToHex(palette[1][0], palette[1][1], palette[1][2]);
            } else {
           
                color2 = this.darkenColor(color1, 20);
            }
            
       
            this.applyColors(color1, color2);
        } catch (error) {
            console.error('取色失败:', error);
        }
    }

    applyColors(color1, color2) {
        const bgColor1Input = document.getElementById('bgColor1');
        const bgColor2Input = document.getElementById('bgColor2');
        
        bgColor1Input.value = color1;
        bgColor2Input.value = color2;
        
    
        if (window.backgroundManager) {
            window.backgroundManager.updateBackground();
        }
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    darkenColor(hex, percent) {

        hex = hex.replace('#', '');
        
     
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
       
        r = Math.max(0, Math.floor(r * (100 - percent) / 100));
        g = Math.max(0, Math.floor(g * (100 - percent) / 100));
        b = Math.max(0, Math.floor(b * (100 - percent) / 100));
        
        return this.rgbToHex(r, g, b);
    }

    lightenColor(hex, percent) {
    
        hex = hex.replace('#', '');
        
    
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
    
        r = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
        g = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
        b = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
        
        return this.rgbToHex(r, g, b);
    }
}


window.colorExtractor = new ColorExtractor();
