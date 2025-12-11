
class CoverGenerator {
    constructor() {
    this.state = {
      zoom: 1,
      hasIcon: false
    };
        this.init();
  }


  updatePageOverflow() {
    const isMobile = window.innerWidth < 1200;
    const root = document.documentElement;
    const body = document.body;
    const controlPanel = document.querySelector('.control-panel');
    const container = document.querySelector('.container');
    const header = document.querySelector('.app-header');
    const footer = document.querySelector('.app-footer');

    if (isMobile) {

      root.style.overflow = '';
      body.style.overflow = '';
      if (controlPanel) controlPanel.style.maxHeight = '';
      if (container) {
        container.style.position = '';
        container.style.top = '';
        container.style.bottom = '';
        container.style.left = '';
        container.style.right = '';
        container.style.height = '';
      }
      return;
    }


    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

 
    const headerH = header?.offsetHeight ?? 60;
    const footerH = footer?.offsetHeight ?? 40;
    const containerH = Math.max(0, window.innerHeight - headerH - footerH);
    if (controlPanel) controlPanel.style.maxHeight = containerH + 'px';

 
    if (container) {
      container.style.position = 'fixed';
      container.style.top = headerH + 'px';
      container.style.bottom = footerH + 'px';
      container.style.left = '0';
      container.style.right = '0';
      container.style.height = 'auto';
    }
  }


  initRotationModeUI() {
    const btnSync = document.getElementById('rotateModeSync');
    const btnInd = document.getElementById('rotateModeInd');
    const iconRotationControl = document.getElementById('iconRotationControl');
    const followCheckbox = document.getElementById('iconFollowCard'); 
    const cardRotation = document.getElementById('cardRotation');
    const iconRotation = document.getElementById('iconRotation');

    if (!(btnSync && btnInd && iconRotationControl && followCheckbox)) return;

    const setActive = (mode) => {
      btnSync.classList.remove('btn-primary', 'btn-secondary');
      btnInd.classList.remove('btn-primary', 'btn-secondary');

      btnSync.classList.toggle('active', mode === 'sync');
      btnInd.classList.toggle('active', mode === 'ind');

      btnSync.setAttribute('aria-pressed', mode === 'sync');
      btnInd.setAttribute('aria-pressed', mode === 'ind');
    };

    const applyMode = (mode) => {
      if (mode === 'sync') {

        iconRotationControl.style.display = 'none';
        followCheckbox.checked = true;
        if (cardRotation && iconRotation) {
          iconRotation.value = cardRotation.value;
          const val = document.getElementById('iconRotationValue');
          if (val) val.textContent = iconRotation.value;
        }
      } else {

        iconRotationControl.style.display = '';
        followCheckbox.checked = false;
      }
      setActive(mode);
      if (window.iconEffects) window.iconEffects.updateEffects();
    };

    btnSync.addEventListener('click', (e) => { e.preventDefault(); applyMode('sync'); });
    btnInd.addEventListener('click', (e) => { e.preventDefault(); applyMode('ind'); });


    applyMode('sync');
  }


  initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const checkbox = themeToggle?.querySelector('.checkbox');

    const updateTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      if (checkbox) {
        checkbox.checked = isLight;
      }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    }
    updateTheme();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add('theme-anim');
      });
    });

    if (checkbox) {
      checkbox.addEventListener('change', () => {
        document.documentElement.classList.toggle('light-theme');
        const isLight = document.documentElement.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        this.showToast(isLight ? '已切换至浅色模式' : '已切换至深色模式');
      });
    }
  }

  initNavBubble() {
    const tabsContainer = document.querySelector('.panel-tabs');
    const bubble = document.querySelector('.nav-bubble');
    const tabs = document.querySelectorAll('.tab-btn');

    if (!tabsContainer || !bubble || !tabs.length) return;

    const updateBubble = (element) => {
      bubble.style.width = `${element.offsetWidth}px`;
      bubble.style.left = `${element.offsetLeft}px`;
      bubble.style.opacity = '1';
    };

    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
      updateBubble(activeTab);
    } else {
      updateBubble(tabs[0]);
    }

    tabs.forEach(tab => {
      tab.addEventListener('mouseenter', () => {
        updateBubble(tab);
      });
    });

    tabsContainer.addEventListener('mouseleave', () => {
      const currentActive = document.querySelector('.tab-btn.active');
      if (currentActive) {
        updateBubble(currentActive);
      }
    });

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        updateBubble(tab);
      });
    });
  }

  init() {
    this.initNavBubble();


    this.initThemeToggle();
    this.initExportSizeToggle();
    this.initCustomSelects();
    this.bindSliderUpdates();
    this.initRotationModeUI();


    this.setDefaultState();

 
    window.addEventListener('resize', () => {
      const coverCanvas = document.getElementById('coverCanvas');
      if (coverCanvas) {
        const width = parseInt(coverCanvas.style.width) || 1000;
        const height = parseInt(coverCanvas.style.height) || 500;
        this.autoScaleCanvas(width, height);
        if (window.renderer) window.renderer.render();
      }

      this.updatePageOverflow();
    });

 
    this.initRendererAfterIcon();


    this.updatePageOverflow();
  }

  async initRendererAfterIcon() {

    await new Promise(resolve => {
      const checkIcon = setInterval(() => {
        if (window.imageHandler && window.imageHandler.currentImage) {
          clearInterval(checkIcon);
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(checkIcon);
        resolve();
      }, 2000);
    });


    if (!window.renderer) {
      window.renderer = new CanvasRenderer();
    }

 
    document.body.classList.add('canvas-preview');
    const coverCanvas = document.getElementById('coverCanvas');
    const width = parseInt(coverCanvas?.style.width) || 1000;
    const height = parseInt(coverCanvas?.style.height) || 500;
    if (window.renderer) {
      window.renderer.setSize(width, height);
      window.renderer.render();
    }
  }




  autoScaleCanvas(canvasWidth, canvasHeight) {
    const canvasWrapper = document.getElementById('canvasWrapper');
    const previewContainer = document.getElementById('previewContainer');
    if (!canvasWrapper || !previewContainer) return;

    const isMobile = window.innerWidth < 1200;

    if (isMobile) {
      const header = document.querySelector('.app-header');
      const headerH = (header && header.offsetHeight) || 60;
      const controlPanel = document.querySelector('.control-panel');
      const panelHeight = (controlPanel && controlPanel.offsetHeight) || (window.innerHeight * 0.45);
      const footerH = 40; 
      
      const gap = 20;
      
      const safeTop = headerH + gap;
      const occupiedBottom = panelHeight + 40; 
      
      const availableH = window.innerHeight - safeTop - occupiedBottom - gap;
      const availableW = window.innerWidth - (gap * 2);

      const scaleX = Math.max(0, availableW) / canvasWidth;
      const scaleY = Math.max(0, availableH) / canvasHeight;
      const scale = Math.min(scaleX, scaleY, 1) * 0.95;

      const topPos = safeTop + (availableH - canvasHeight * scale) / 2;
      
      const visualHeight = canvasHeight * scale;
      const centerY = topPos + (visualHeight / 2);

      canvasWrapper.style.top = `${Math.max(safeTop + visualHeight/2, centerY)}px`;
      canvasWrapper.style.left = '50%';
      canvasWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
      canvasWrapper.style.transformOrigin = 'center';

      const previewContainer = document.getElementById('previewContainer');
      if (previewContainer) {
          previewContainer.style.minHeight = '';
          previewContainer.style.overflow = 'hidden';
      }

    } else {
      const PANEL_WIDTH = 380;
      const PANEL_MARGIN = 30;
      const HEADER_H = 64;
      const FOOTER_H = 40;
      const UNIFORM_PADDING = 40;

      const rightOccupied = PANEL_WIDTH + PANEL_MARGIN;
      
      const availableScreenWidth = window.innerWidth - rightOccupied;
      
      const availableScreenHeight = window.innerHeight - HEADER_H - FOOTER_H;

      const safeWidth = availableScreenWidth - (UNIFORM_PADDING * 2);
      const safeHeight = availableScreenHeight - (UNIFORM_PADDING * 2);

      const scaleX = safeWidth / canvasWidth;
      const scaleY = safeHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      const centerX = availableScreenWidth / 2;
      const centerY = HEADER_H + (availableScreenHeight / 2);

      canvasWrapper.style.left = `${centerX}px`;
      canvasWrapper.style.top = `${centerY}px`;
      canvasWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
      canvasWrapper.style.transformOrigin = 'center';

      previewContainer.style.minHeight = '';
      previewContainer.style.overflow = 'hidden';
    }

    const coverCanvas = document.getElementById('coverCanvas');
    if (coverCanvas && !coverCanvas.classList.contains('visible')) {
        requestAnimationFrame(() => {
            coverCanvas.classList.add('visible');
        });
    }
  }

  showToast(message) {
      let toast = document.querySelector('.toast-notification');
      if (!toast) {
          toast = document.createElement('div');
          toast.className = 'toast-notification';
          document.body.appendChild(toast);
      }

      const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      
      toast.innerHTML = `${icon}<span>${message}</span>`;
      
      toast.classList.remove('show');
      void toast.offsetWidth;
      toast.classList.add('show');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
          toast.classList.remove('show');
      }, 2000);
  }


  initCustomSelects() {
    const selects = document.querySelectorAll('.select-wrapper select');
    
    selects.forEach(select => {
      if (select.classList.contains('hidden-select')) return;
      
      select.classList.add('hidden-select');
      const wrapper = select.parentElement;
      
      const customSelect = document.createElement('div');
      customSelect.className = 'custom-select';
      
      const trigger = document.createElement('div');
      trigger.className = 'custom-select-trigger';
      const selectedOption = select.options[select.selectedIndex];
      trigger.innerHTML = `<span>${selectedOption ? selectedOption.text : ''}</span>`;
      
      const arrow = document.createElement('div');
      arrow.className = 'custom-select-arrow';
      trigger.appendChild(arrow);
      
      const optionsList = document.createElement('div');
      optionsList.className = 'custom-options';
      
      Array.from(select.options).forEach(option => {
        const customOption = document.createElement('div');
        customOption.className = 'custom-option';
        customOption.textContent = option.text;
        customOption.dataset.value = option.value;
        if (option.selected) customOption.classList.add('selected');
        
        customOption.addEventListener('click', (e) => {
          e.stopPropagation();
          select.value = option.value;
          select.dispatchEvent(new Event('change'));
          select.dispatchEvent(new Event('input'));
          
          trigger.querySelector('span').textContent = option.text;
          customSelect.classList.remove('open');
          
          optionsList.querySelectorAll('.custom-option').forEach(opt => {
             opt.classList.toggle('selected', opt === customOption);
          });
        });
        
        optionsList.appendChild(customOption);
      });

      select.addEventListener('change', () => {
          const newOption = select.options[select.selectedIndex];
          if (newOption) {
              trigger.querySelector('span').textContent = newOption.text;
              optionsList.querySelectorAll('.custom-option').forEach(opt => {
                  opt.classList.toggle('selected', opt.dataset.value === select.value);
              });
          }
      });
      
      customSelect.appendChild(trigger);
      customSelect.appendChild(optionsList);
      wrapper.appendChild(customSelect);
      
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select').forEach(el => {
            if (el !== customSelect) el.classList.remove('open');
        });
        customSelect.classList.toggle('open');
      });
    });
    
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('open'));
    });
  }

  initExportSizeToggle() {
    const exportSize = document.getElementById('exportSize');
    const customSizeInputs = document.getElementById('customSizeInputs');
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    const coverCanvas = document.getElementById('coverCanvas');

    const updateCanvasSize = () => {
      const sizeValue = exportSize.value;
      let width, height;
      if (sizeValue === 'custom') {
        width = parseInt(customWidth.value) || 1000;
        height = parseInt(customHeight.value) || 500;
        customSizeInputs.style.display = 'flex';
      } else {
        const [w, h] = sizeValue.split('x').map(Number);
        width = w; height = h;
        customSizeInputs.style.display = 'none';
      }

      if (coverCanvas) {
        coverCanvas.style.width = `${width}px`;
        coverCanvas.style.height = `${height}px`;
        this.autoScaleCanvas(width, height);
        if (window.renderer) {
          window.renderer.setSize(width, height);
          window.renderer.render();
        }
      }

      if (window.textEditor) {
        window.textEditor.updateText(true);
      }
    };

    exportSize.addEventListener('change', updateCanvasSize);
    if (customWidth) customWidth.addEventListener('input', updateCanvasSize);
    if (customHeight) customHeight.addEventListener('input', updateCanvasSize);
    updateCanvasSize();
  }

    bindSliderUpdates() {
    const sliders = [
      { id: 'iconSize', valueId: 'iconSizeValue' },
      { id: 'imageScale', valueId: 'imageScaleValue' },
      { id: 'iconPositionX', valueId: 'iconPositionXValue' },
      { id: 'iconPositionY', valueId: 'iconPositionYValue' },
      { id: 'iconRadius', valueId: 'iconRadiusValue' },
      { id: 'glassOpacity', valueId: 'glassOpacityValue' },
      { id: 'glow', valueId: 'glowValue' },
      { id: 'insetDepth', valueId: 'insetDepthValue' },
      { id: 'cardRotation', valueId: 'cardRotationValue' },
      { id: 'iconRotation', valueId: 'iconRotationValue' },
      { id: 'gradientAngle', valueId: 'gradientAngleValue' },
      { id: 'highlightPosition', valueId: 'highlightPositionValue' },
      { id: 'highlightWidth', valueId: 'highlightWidthValue' },
      { id: 'edgeGlow', valueId: 'edgeGlowValue' },
      { id: 'edgeGlowSize', valueId: 'edgeGlowSizeValue' },
      { id: 'bgImageScale', valueId: 'bgImageScaleValue' },
      { id: 'bgImageX', valueId: 'bgImageXValue' },
      { id: 'bgImageY', valueId: 'bgImageYValue' },
      { id: 'bgImageBlur', valueId: 'bgImageBlurValue' },
      { id: 'fontSize', valueId: 'fontSizeValue' },
      { id: 'letterSpacing', valueId: 'letterSpacingValue' },
      { id: 'textStroke', valueId: 'textStrokeValue' },
      { id: 'strokeOpacity', valueId: 'strokeOpacityValue' },
      { id: 'textShadow', valueId: 'textShadowValue' },
      { id: 'shadowOpacity', valueId: 'shadowOpacityValue' },
      { id: 'textPosition', valueId: 'textPositionValue' },
      
      { id: 'meshScale', valueId: 'meshScaleValue' },
      { id: 'dotScale', valueId: 'dotScaleValue' },
      { id: 'waveCount', valueId: 'waveCountValue' },
      { id: 'grainAmount', valueId: 'grainAmountValue' },
      { id: 'popCount', valueId: 'popCountValue' },
      { id: 'hexScale', valueId: 'hexScaleValue' },
      { id: 'peaksCount', valueId: 'peaksCountValue' },
      { id: 'topoScale', valueId: 'topoScaleValue' },
      { id: 'paperCount', valueId: 'paperCountValue' },
      { id: 'auroraScale', valueId: 'auroraScaleValue' }
    ];


    sliders.forEach(({ id, valueId }) => {
      const el = document.getElementById(id);
      const val = document.getElementById(valueId);
      if (!el) return;
      const update = () => {
        if (val) val.textContent = el.value;
        if (window.iconEffects) window.iconEffects.updateEffects();

        const min = parseFloat(el.min) || 0;
        const max = parseFloat(el.max) || 100;
        const percent = (el.value - min) / (max - min) * 100;
        el.style.background = `linear-gradient(to right, var(--accent-color) ${percent}%, rgba(0,0,0,0.1) ${percent}%)`;

        this.updateSliderButtons(id);
      };
      el.addEventListener('input', update);
      el.addEventListener('change', update);
      update();
    });


    document.querySelectorAll('.slider-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.target;
        const step = parseInt(btn.dataset.step) || 1;
        const slider = document.getElementById(targetId);
        
        if (!slider) return;
        
        const currentValue = parseInt(slider.value);
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        let newValue = currentValue;
        
        if (btn.classList.contains('minus-btn')) {
          newValue = Math.max(min, currentValue - step);
        } else if (btn.classList.contains('plus-btn')) {
          newValue = Math.min(max, currentValue + step);
        }
        
        slider.value = newValue;
        slider.dispatchEvent(new Event('input'));
        slider.dispatchEvent(new Event('change'));
      });
    });


        const follow = document.getElementById('iconFollowCard');
        if (follow) {
            const update = () => {
                if (window.iconEffects) window.iconEffects.updateEffects();
                const cardRotation = document.getElementById('cardRotation');
                const iconRotation = document.getElementById('iconRotation');
                if (cardRotation && iconRotation && follow.checked) {
                    iconRotation.value = cardRotation.value;
                    const iconRotationValue = document.getElementById('iconRotationValue');
                    if (iconRotationValue) iconRotationValue.textContent = iconRotation.value;
                }
            };
            follow.addEventListener('change', update);
        }
    }

    updateSliderButtons(sliderId) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        
        const minusBtn = document.querySelector(`.slider-btn.minus-btn[data-target="${sliderId}"]`);
        const plusBtn = document.querySelector(`.slider-btn.plus-btn[data-target="${sliderId}"]`);
        
        if (!minusBtn || !plusBtn) return;
        
        const currentValue = parseInt(slider.value);
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        

        minusBtn.disabled = currentValue <= min;
        

        plusBtn.disabled = currentValue >= max;
    }

    setDefaultState() {

        if (window.backgroundManager && window.backgroundManager.updateBackground) {
            window.backgroundManager.updateBackground();
        }


        if (window.textEditor && window.textEditor.updateText) {
            window.textEditor.updateText();
        }


        const iconContainer = document.getElementById('iconContainer');
        if (iconContainer) {
            iconContainer.classList.add('empty');
            iconContainer.classList.remove('has-icon');
        }
    }


    updateIconState(hasIcon) {
        this.state.hasIcon = hasIcon;
        const iconContainer = document.getElementById('iconContainer');
        
        iconContainer.classList.toggle('empty', !hasIcon);
        iconContainer.classList.toggle('has-icon', hasIcon);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const app = new CoverGenerator();
    window.app = app;
});
