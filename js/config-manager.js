
export class ConfigManager {
    constructor() {
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('exportConfigBtn');
        const importInput = document.getElementById('importConfigInput');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportConfig());
        }

        if (importInput) {
            importInput.addEventListener('change', (e) => this.importConfig(e));
        }
    }

    collectConfig() {
        const config = {};

        const getValue = (id) => {
            const el = document.getElementById(id);
            if (!el) return null;
            if (el.type === 'checkbox') return el.checked;
            return el.value;
        };

        config.size = {
            exportSize: getValue('exportSize'),
            customWidth: getValue('customWidth'),
            customHeight: getValue('customHeight')
        };

        config.icon = {
            showCard: getValue('showCard'),
            iconShape: getValue('cardShape'),
            cardSize: getValue('iconSize'),
            iconScale: getValue('imageScale'),
            cardRadius: getValue('iconRadius'),
            cardOpacity: getValue('glassOpacity'),
            cardRotation: getValue('cardRotation'),
            iconRotation: getValue('iconRotation'),
            iconFollowCard: getValue('iconFollowCard'),
            iconPositionX: getValue('iconPositionX'),
            iconPositionY: getValue('iconPositionY')
        };

        const bgType = getValue('bgType');
        config.background = {
            bgType: bgType,
            bgColor1: getValue('bgColor1'),
            bgColor2: getValue('bgColor2'),
            gradientAngle: getValue('gradientAngle'),
            
            meshScale: getValue('meshScale'),
            dotScale: getValue('dotScale'),
            waveCount: getValue('waveCount'),
            grainAmount: getValue('grainAmount'),
            
            popCount: getValue('popCount'),
            hexScale: getValue('hexScale'),
            peaksCount: getValue('peaksCount'),
            topoScale: getValue('topoScale'),
            paperCount: getValue('paperCount'),
            auroraScale: getValue('auroraScale'),
            
            highlightPosition: getValue('highlightPosition'),
            highlightWidth: getValue('highlightWidth'),
            
            bgImageScale: getValue('bgImageScale'),
            bgImageX: getValue('bgImageX'),
            bgImageY: getValue('bgImageY'),
            bgImageBlur: getValue('bgImageBlur'),
            
            edgeGlowColor: getValue('edgeGlowColor'),
            edgeGlow: getValue('edgeGlow'),
            edgeGlowSize: getValue('edgeGlowSize')
        };

        const fontWeightBtn = document.getElementById('fontWeightToggle');
        config.text = {
            fontFamily: getValue('fontFamily'),
            textColor: getValue('textColor'),
            fontSize: getValue('fontSize'),
            letterSpacing: getValue('letterSpacing'), 
            textStroke: getValue('textStroke'),
            strokeColor: getValue('strokeColor'),
            strokeOpacity: getValue('strokeOpacity'),
            textShadow: getValue('textShadow'),
            shadowColor: getValue('shadowColor'),
            shadowOpacity: getValue('shadowOpacity'),
            textPosition: getValue('textPosition'),
            fontWeight: fontWeightBtn ? fontWeightBtn.getAttribute('data-weight') : '400'
        };
        
        config.effects = {
            glow: getValue('glow'),
            insetDepth: getValue('insetDepth')
        };

        return config;
    }

    exportConfig() {
        try {
            const config = this.collectConfig();
            const jsonStr = JSON.stringify(config, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const now = new Date();
            const date = now.toISOString().slice(0, 10);
            const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
            const filename = `rsdld-cover-config-${date}-${time}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.app) window.app.showToast('配置导出成功');
        } catch (e) {
            console.error('导出失败:', e);
            if (window.app) window.app.showToast('导出失败');
        }
    }

    importConfig(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                this.applyConfig(config);
                if (window.app) window.app.showToast('配置导入成功');
            } catch (err) {
                console.error('导入配置解析失败:', err);
                if (window.app) window.app.showToast('配置文件格式错误');
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    applyConfig(config) {
        const applyValue = (id, value, eventType = 'input') => {
            const el = document.getElementById(id);
            if (!el || value === null || value === undefined) return;
            
            if (el.type === 'checkbox') {
                el.checked = value;
                el.dispatchEvent(new Event('change'));
            } else {
                el.value = value;
                el.dispatchEvent(new Event('input'));
                if (eventType === 'change') {
                    el.dispatchEvent(new Event('change'));
                }
            }
        };

        if (config.size) {
            applyValue('customWidth', config.size.customWidth);
            applyValue('customHeight', config.size.customHeight);
            applyValue('exportSize', config.size.exportSize, 'change');
        }

        if (config.icon) {
            applyValue('showCard', config.icon.showCard, 'change');
            applyValue('cardShape', config.icon.iconShape, 'change');
            applyValue('iconSize', config.icon.cardSize);
            applyValue('imageScale', config.icon.iconScale);
            applyValue('iconRadius', config.icon.cardRadius);
            applyValue('glassOpacity', config.icon.cardOpacity);
            applyValue('cardRotation', config.icon.cardRotation);
            applyValue('iconRotation', config.icon.iconRotation);
            applyValue('iconFollowCard', config.icon.iconFollowCard);
            applyValue('iconPositionX', config.icon.iconPositionX);
            applyValue('iconPositionY', config.icon.iconPositionY);
            
            const syncBtn = document.getElementById('rotateModeSync');
            const indBtn = document.getElementById('rotateModeInd');
            if (config.icon.iconFollowCard && syncBtn) syncBtn.click();
            else if (!config.icon.iconFollowCard && indBtn) indBtn.click();
        }

        if (config.background) {
            let type = config.background.bgType;
            applyValue('bgColor1', config.background.bgColor1); 
            applyValue('bgColor2', config.background.bgColor2); 
            applyValue('gradientAngle', config.background.gradientAngle);
            
            applyValue('meshScale', config.background.meshScale);
            applyValue('dotScale', config.background.dotScale);
            applyValue('waveCount', config.background.waveCount);
            applyValue('grainAmount', config.background.grainAmount);
            
            applyValue('popCount', config.background.popCount);
            applyValue('hexScale', config.background.hexScale);
            applyValue('peaksCount', config.background.peaksCount);
            applyValue('topoScale', config.background.topoScale);
            applyValue('paperCount', config.background.paperCount);
            applyValue('auroraScale', config.background.auroraScale);
            
            applyValue('highlightPosition', config.background.highlightPosition);
            applyValue('highlightWidth', config.background.highlightWidth);
            
            applyValue('bgImageScale', config.background.bgImageScale);
            applyValue('bgImageX', config.background.bgImageX);
            applyValue('bgImageY', config.background.bgImageY);
            applyValue('bgImageBlur', config.background.bgImageBlur);
            
            applyValue('edgeGlowColor', config.background.edgeGlowColor);
            applyValue('edgeGlow', config.background.edgeGlow);
            applyValue('edgeGlowSize', config.background.edgeGlowSize);
            
            applyValue('bgType', type, 'change');
        }

        if (config.text) {
            applyValue('fontFamily', config.text.fontFamily, 'change');
            applyValue('textColor', config.text.textColor);
            applyValue('fontSize', config.text.fontSize);
            applyValue('letterSpacing', config.text.letterSpacing);
            applyValue('textStroke', config.text.textStroke);
            applyValue('strokeColor', config.text.strokeColor);
            applyValue('strokeOpacity', config.text.strokeOpacity);
            applyValue('textShadow', config.text.textShadow);
            applyValue('shadowColor', config.text.shadowColor);
            applyValue('shadowOpacity', config.text.shadowOpacity);
            applyValue('textPosition', config.text.textPosition);
            
            if (config.text.fontWeight !== undefined) {
                 const btn = document.getElementById('fontWeightToggle');
                 if (btn) {
                     const current = btn.getAttribute('data-weight');
                     if (current !== config.text.fontWeight) {
                         btn.click(); 
                     }
                 }
            }
        }

        if (config.effects) {
            applyValue('glow', config.effects.glow);
            applyValue('insetDepth', config.effects.insetDepth);
        }

        if (window.renderer) window.renderer.render();
    }
}

window.configManager = new ConfigManager();
