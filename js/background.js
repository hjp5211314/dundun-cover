

class BackgroundManager {
    constructor() {
        this.init();
    }

    init() {

        const controls = [
            'bgType',
            'bgColor1',
            'bgColor2',
            'gradientAngle',
            'highlightPosition',
            'highlightWidth',
            'edgeGlowColor',
            'edgeGlow',
            'edgeGlowSize',
            'bgImageScale',
            'bgImageX',
            'bgImageY',
            'bgImageBlur'
        ];

        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateBackground());
                element.addEventListener('change', () => this.updateBackground());
            }
        });


        const bgTypeSelect = document.getElementById('bgType');
        if (bgTypeSelect) {
            bgTypeSelect.addEventListener('change', () => this.toggleControls());
        }

        const randomGradientBtn = document.getElementById('randomGradient');
        if (randomGradientBtn) {
            randomGradientBtn.addEventListener('click', () => this.randomizeGradient());
        }

        this.toggleControls();
        this.updateBackground();
    }

    toggleControls() {
        const bgType = document.getElementById('bgType').value;
        const highlightPositionControl = document.getElementById('highlightPositionControl');
        const highlightWidthControl = document.getElementById('highlightWidthControl');
        const bgImageUploadControl = document.getElementById('bgImageUploadControl');
        const bgImageScaleControl = document.getElementById('bgImageScaleControl');
        const bgImageXControl = document.getElementById('bgImageXControl');
        const bgImageYControl = document.getElementById('bgImageYControl');
        const bgImageBlurControl = document.getElementById('bgImageBlurControl');
        const gradientAngleControl = document.getElementById('gradientAngleControl');
        const randomGradientControl = document.getElementById('randomGradientControl');
        
        const bgColor1 = document.getElementById('bgColor1');
        const bgColor2 = document.getElementById('bgColor2');
        const bgColor1Control = bgColor1?.closest('.control-item');
        const bgColor2Control = bgColor2?.closest('.control-item');
        const colorRow = bgColor1Control?.closest('.control-row'); // 获取包含两个颜色的行

        if (colorRow) {
            if (bgType === 'image') {
                colorRow.style.display = 'none';
            } else {
                colorRow.style.display = '';
                
                if (bgColor2Control) {
                    bgColor2Control.style.display = (bgType === 'solid') ? 'none' : '';
                }
            }
        }

        if (highlightPositionControl && highlightWidthControl) {
            const isHighlight = bgType === 'radial';
            highlightPositionControl.style.display = isHighlight ? '' : 'none';
            highlightWidthControl.style.display = isHighlight ? '' : 'none';
        }
        

        if (bgImageUploadControl && bgImageScaleControl && bgImageXControl && bgImageYControl && bgImageBlurControl) {
            const isImage = bgType === 'image';
            bgImageUploadControl.style.display = isImage ? '' : 'none';
            bgImageScaleControl.style.display = isImage ? '' : 'none';
            bgImageXControl.style.display = isImage ? '' : 'none';
            bgImageYControl.style.display = isImage ? '' : 'none';
            bgImageBlurControl.style.display = isImage ? '' : 'none';
        }
        

        
        if (gradientAngleControl) {
            const hideAngle = ['solid', 'image', 'radial', 'peaks'].includes(bgType);
            gradientAngleControl.style.display = hideAngle ? 'none' : '';
        }

        const meshScaleControl = document.getElementById('meshScaleControl');
        const dotScaleControl = document.getElementById('dotScaleControl');
        const waveCountControl = document.getElementById('waveCountControl');
        const grainAmountControl = document.getElementById('grainAmountControl');
        const popCountControl = document.getElementById('popCountControl');
        const hexScaleControl = document.getElementById('hexScaleControl');
        const peaksCountControl = document.getElementById('peaksCountControl');
        const topoScaleControl = document.getElementById('topoScaleControl');
        const paperCountControl = document.getElementById('paperCountControl');
        const auroraScaleControl = document.getElementById('auroraScaleControl');

        if (meshScaleControl) meshScaleControl.style.display = (bgType === 'mesh') ? '' : 'none';
        if (dotScaleControl) dotScaleControl.style.display = (bgType === 'dots') ? '' : 'none';
        if (waveCountControl) waveCountControl.style.display = (bgType === 'waves') ? '' : 'none';
        if (grainAmountControl) grainAmountControl.style.display = (bgType === 'grain') ? '' : 'none';
        if (popCountControl) popCountControl.style.display = (bgType === 'pop') ? '' : 'none';
        if (hexScaleControl) hexScaleControl.style.display = (bgType === 'hex') ? '' : 'none';
        if (peaksCountControl) peaksCountControl.style.display = (bgType === 'peaks') ? '' : 'none';
        if (topoScaleControl) topoScaleControl.style.display = (bgType === 'topo') ? '' : 'none';
        if (paperCountControl) paperCountControl.style.display = (bgType === 'paper') ? '' : 'none';
        if (auroraScaleControl) auroraScaleControl.style.display = (bgType === 'aurora') ? '' : 'none';
        
        if (randomGradientControl) {
            const showRandom = bgType !== 'solid' && bgType !== 'image';
            randomGradientControl.style.display = showRandom ? '' : 'none';
        }
    }

    updateBackground() {

        if (window.renderer) window.renderer.render();
    }

    randomizeGradient() {
        const bgType = document.getElementById('bgType').value;
        
        const randomColor1 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        const randomColor2 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        
        const bgColor1 = document.getElementById('bgColor1');
        const bgColor2 = document.getElementById('bgColor2');
        if (bgColor1) {
            bgColor1.value = randomColor1;
            bgColor1.dispatchEvent(new Event('input'));
            bgColor1.dispatchEvent(new Event('change'));
        }
        if (bgColor2) {
            bgColor2.value = randomColor2;
            bgColor2.dispatchEvent(new Event('input'));
            bgColor2.dispatchEvent(new Event('change'));
        }
        
        const randomAngle = Math.floor(Math.random() * 361);
        const gradientAngle = document.getElementById('gradientAngle');
        const gradientAngleValue = document.getElementById('gradientAngleValue');
        if (gradientAngle) {
            gradientAngle.value = randomAngle;
            if (gradientAngleValue) {
                gradientAngleValue.textContent = randomAngle;
            }
            gradientAngle.dispatchEvent(new Event('input'));
        }

        const randomizeSlider = (id, min, max) => {
            const el = document.getElementById(id);
            const valEl = document.getElementById(id + 'Value');
            if (el) {
                const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
                el.value = randomVal;
                if (valEl) valEl.textContent = randomVal;
                el.dispatchEvent(new Event('input'));
            }
        };
        
        if (bgType === 'radial') {
            randomizeSlider('highlightPosition', 0, 100);
            randomizeSlider('highlightWidth', 10, 80);
        } else if (bgType === 'mesh') {
            randomizeSlider('meshScale', 30, 80);
        } else if (bgType === 'dots') {
            randomizeSlider('dotScale', 20, 60);
        } else if (bgType === 'waves') {
            randomizeSlider('waveCount', 3, 8);
        } else if (bgType === 'grain') {
            randomizeSlider('grainAmount', 10, 40);
        } else if (bgType === 'pop') {
            randomizeSlider('popCount', 10, 30);
        } else if (bgType === 'hex') {
            randomizeSlider('hexScale', 20, 60);
        } else if (bgType === 'peaks') {
            randomizeSlider('peaksCount', 3, 8);
        } else if (bgType === 'topo') {
            randomizeSlider('topoScale', 20, 60);
        } else if (bgType === 'paper') {
            randomizeSlider('paperCount', 3, 6);
        } else if (bgType === 'aurora') {
            randomizeSlider('auroraScale', 30, 80);
        }
        
        this.updateBackground();
    }


    getCurrentConfig() {
        return {
            type: document.getElementById('bgType').value,
            color1: document.getElementById('bgColor1').value,
            color2: document.getElementById('bgColor2').value,
            angle: parseInt(document.getElementById('gradientAngle').value),
            
            highlightPosition: parseInt(document.getElementById('highlightPosition')?.value || 50),
            highlightWidth: parseInt(document.getElementById('highlightWidth')?.value || 50),
            
            bgImageScale: parseInt(document.getElementById('bgImageScale')?.value || 100),
            bgImageX: parseInt(document.getElementById('bgImageX')?.value || 50),
            bgImageY: parseInt(document.getElementById('bgImageY')?.value || 50),
            bgImageBlur: parseInt(document.getElementById('bgImageBlur')?.value || 0),

            edgeGlow: parseInt(document.getElementById('edgeGlow')?.value || 0),
            edgeGlowSize: parseInt(document.getElementById('edgeGlowSize')?.value || 20),
            edgeGlowColor: document.getElementById('edgeGlowColor')?.value || '#ffffff',

            meshScale: parseInt(document.getElementById('meshScale')?.value || 50),
            dotScale: parseInt(document.getElementById('dotScale')?.value || 30),
            waveCount: parseInt(document.getElementById('waveCount')?.value || 5),
            grainAmount: parseInt(document.getElementById('grainAmount')?.value || 20),
            popCount: parseInt(document.getElementById('popCount')?.value || 15),
            hexScale: parseInt(document.getElementById('hexScale')?.value || 40),
            peaksCount: parseInt(document.getElementById('peaksCount')?.value || 5),
            topoScale: parseInt(document.getElementById('topoScale')?.value || 30),
            paperCount: parseInt(document.getElementById('paperCount')?.value || 5),
            auroraScale: parseInt(document.getElementById('auroraScale')?.value || 50)
        };
    }

    setConfig(config) {
        if (config.type) document.getElementById('bgType').value = config.type;
        if (config.color1) document.getElementById('bgColor1').value = config.color1;
        if (config.color2) document.getElementById('bgColor2').value = config.color2;
        if (config.angle) document.getElementById('gradientAngle').value = config.angle;
        
        this.updateBackground();
    }
}


window.backgroundManager = new BackgroundManager();
