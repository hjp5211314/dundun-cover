

class IconEffects {
    constructor() {
        this.init();
    }

    init() {

        const controls = [
            'showCard',
            'cardShape',
            'iconSize',
            'imageScale',
            'iconPositionX',
            'iconPositionY',
            'iconRadius',
            'glassOpacity',
            'glow',
            'insetDepth',
            'cardRotation',
            'iconRotation'
        ];

        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateEffects());
            }
        });


        this.updateEffects();
    }

    updateEffects() {
        const iconContainer = document.getElementById('iconContainer');
        const iconImage = document.getElementById('iconImage');
        const cardRadiusControl = document.getElementById('cardRadiusControl');
        const cardEffectsGroup = document.getElementById('cardEffectsGroup');
        const cardSizeControl = document.getElementById('cardSizeControl');
        const iconPositionXControl = document.getElementById('iconPositionXControl');
        const iconPositionYControl = document.getElementById('iconPositionYControl');
        const imageScaleControl = document.querySelector('[data-target="imageScale"]')?.closest('.control-item');

        const showCardValue = document.getElementById('showCard').value;
        const showCard = showCardValue === 'true';
        const cardShape = document.getElementById('cardShape').value;
        const size = document.getElementById('iconSize').value;
        const imageScale = document.getElementById('imageScale').value;
        const radius = document.getElementById('iconRadius').value;
        const glassOpacity = document.getElementById('glassOpacity').value;
        const glow = document.getElementById('glow').value;
        const insetDepth = document.getElementById('insetDepth').value;
        const cardRotation = parseFloat(document.getElementById('cardRotation')?.value || 0);
        const iconRotation = parseFloat(document.getElementById('iconRotation')?.value || 0);
        const iconFollow = !!document.getElementById('iconFollowCard')?.checked;

        const cardShapeSelect = document.getElementById('cardShape');
        const cardShapeControl = cardShapeSelect && (cardShapeSelect.closest?.('.control-item') || cardShapeSelect.parentElement);

        if (showCardValue === 'none') {
            iconContainer.style.display = 'none';
            cardRadiusControl.style.display = 'none';
            cardEffectsGroup.style.display = 'none';
            if (cardSizeControl) cardSizeControl.style.display = 'none';
            if (cardShapeControl) cardShapeControl.style.display = 'none';
            if (iconPositionXControl) iconPositionXControl.style.display = 'none';
            if (iconPositionYControl) iconPositionYControl.style.display = 'none';
            if (imageScaleControl) imageScaleControl.style.display = 'none';
            if (window.renderer) window.renderer.render();
            return;
        }

        iconContainer.style.display = 'block';
        if (imageScaleControl) imageScaleControl.style.display = 'block';

        iconContainer.style.width = `${size}px`;
        iconContainer.style.height = `${size}px`;

        if (iconImage) {
            iconImage.style.maxWidth = `${imageScale}%`;
            iconImage.style.maxHeight = `${imageScale}%`;
        }

        iconContainer.classList.remove(
            'image-only',
            'shape-circle',
            'shape-square',
            'shape-squircle'
        );

        if (!showCard) {
         
            iconContainer.classList.add('image-only');
            cardRadiusControl.style.display = 'none';
            cardEffectsGroup.style.display = 'none';
            if (cardSizeControl) cardSizeControl.style.display = 'none';
            if (cardShapeControl) cardShapeControl.style.display = 'none';
            
            if (iconPositionXControl) iconPositionXControl.style.display = 'block';
            if (iconPositionYControl) iconPositionYControl.style.display = 'block';
            if (iconImage) {
                iconImage.style.transformOrigin = 'center';
                iconImage.style.transform = `rotate(${iconRotation}deg)`;
            }
            if (window.renderer) window.renderer.render();
            return;
        } else {
            cardRadiusControl.style.display = 'block';
            cardEffectsGroup.style.display = 'block';
            if (cardShapeControl) cardShapeControl.style.display = 'block';
            if (cardSizeControl) cardSizeControl.style.display = 'block';
            
            if (iconPositionXControl) iconPositionXControl.style.display = 'none';
            if (iconPositionYControl) iconPositionYControl.style.display = 'none';
        }
        if (cardShape === 'rounded-square') {
            iconContainer.style.borderRadius = `${radius}px`;
            cardRadiusControl.style.display = 'block';
        } else if (cardShape === 'circle') {
            iconContainer.classList.add('shape-circle');
            cardRadiusControl.style.display = 'none';
        } else if (cardShape === 'square') {
            iconContainer.classList.add('shape-square');
            cardRadiusControl.style.display = 'none';
        } else if (cardShape === 'squircle') {
            iconContainer.classList.add('shape-squircle');
            cardRadiusControl.style.display = 'none';
        }

        iconContainer.style.boxShadow = `
            0 30px 60px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `;

        if (glow > 0) {
            const currentShadow = iconContainer.style.boxShadow;
            iconContainer.style.boxShadow = `
                ${currentShadow},
                0 0 ${glow}px ${glow / 2}px rgba(255, 255, 255, 0.5)
            `;
        }

        iconContainer.style.background = `rgba(255, 255, 255, ${glassOpacity / 100})`;
        iconContainer.style.backdropFilter = `blur(${Math.floor(glassOpacity / 5)}px)`;

        iconContainer.style.setProperty('--highlight-opacity', 0);

        iconContainer.style.transformOrigin = 'center';
        iconContainer.style.transform = `rotate(${cardRotation}deg)`;
        if (iconImage) {
            const delta = iconFollow ? 0 : (iconRotation - cardRotation);
            iconImage.style.transform = `translate(-50%, -50%) rotate(${delta}deg)`;
            iconImage.style.transformOrigin = 'center';
        }

        const hasIcon = !!(iconImage && iconImage.src && iconImage.style.display !== 'none');
        iconContainer.classList.toggle('has-icon', hasIcon);
        iconContainer.classList.toggle('empty', !hasIcon);

        if (window.renderer) window.renderer.render();
    }

    getCurrentConfig() {
        return {
            size: document.getElementById('iconSize').value,
            cardShape: document.getElementById('cardShape').value,
            radius: document.getElementById('iconRadius').value,
            glassOpacity: document.getElementById('glassOpacity').value,
            glow: document.getElementById('glow').value,
            insetDepth: document.getElementById('insetDepth').value,
            imageScale: document.getElementById('imageScale').value,
            cardRotation: document.getElementById('cardRotation')?.value || 0,
            iconRotation: document.getElementById('iconRotation')?.value || 0,
            iconFollow: !!document.getElementById('iconFollowCard')?.checked
        };
    }

    setConfig(config) {
        if (config.size) document.getElementById('iconSize').value = config.size;
        if (config.radius) document.getElementById('iconRadius').value = config.radius;
        if (config.shadowDepth) document.getElementById('shadowDepth').value = config.shadowDepth;
        if (config.shadowBlur) document.getElementById('shadowBlur').value = config.shadowBlur;
        if (config.highlight) document.getElementById('highlight').value = config.highlight;
        if (config.glassOpacity) document.getElementById('glassOpacity').value = config.glassOpacity;
        if (config.glow) document.getElementById('glow').value = config.glow;
        
        Object.keys(config).forEach(key => {
            const valueElement = document.getElementById(`${key}Value`);
            if (valueElement) {
                valueElement.textContent = config[key];
            }
        });
        
        this.updateEffects();
    }
}

window.iconEffects = new IconEffects();
