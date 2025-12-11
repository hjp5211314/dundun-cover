

class RangeControl {
    constructor(rangeInput, options = {}) {
        this.rangeInput = rangeInput;
        this.options = {
            step: parseFloat(rangeInput.step) || 1,
            min: parseFloat(rangeInput.min) || 0,
            max: parseFloat(rangeInput.max) || 100,
            smallStep: options.smallStep || null,
            largeStep: options.largeStep || null,
            ...options
        };
        
        this.wrapper = null;
        this.minusBtn = null;
        this.plusBtn = null;
        
        this.init();
    }
    
    init() {
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'range-wrapper';
        
        this.minusBtn = document.createElement('button');
        this.minusBtn.className = 'range-btn minus';
        this.minusBtn.type = 'button';
        this.minusBtn.title = '减小';
        
        this.plusBtn = document.createElement('button');
        this.plusBtn.className = 'range-btn plus';
        this.plusBtn.type = 'button';
        this.plusBtn.title = '增加';
        
        const parent = this.rangeInput.parentNode;
        parent.insertBefore(this.wrapper, this.rangeInput);
        
        this.wrapper.appendChild(this.minusBtn);
        this.wrapper.appendChild(this.rangeInput);
        this.wrapper.appendChild(this.plusBtn);
        
        this.bindEvents();
        
        this.updateButtonStates();
    }
    
    bindEvents() {
        this.minusBtn.addEventListener('click', () => {
            this.decrease();
        });
        
        this.plusBtn.addEventListener('click', () => {
            this.increase();
        });
        
        this.rangeInput.addEventListener('input', () => {
            this.updateButtonStates();
        });
        
        this.setupLongPress(this.minusBtn, () => this.decrease());
        this.setupLongPress(this.plusBtn, () => this.increase());
        
        this.rangeInput.addEventListener('keydown', (e) => {
            if (e.shiftKey) {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.decrease(true);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.increase(true);
                }
            }
        });
    }
    
    decrease(useLargeStep = false) {
        const currentValue = parseFloat(this.rangeInput.value);
        let step = this.options.step;
        
        if (useLargeStep && this.options.largeStep) {
            step = this.options.largeStep;
        }
        
        const newValue = Math.max(this.options.min, currentValue - step);
        this.setValue(newValue);
    }
    
    increase(useLargeStep = false) {
        const currentValue = parseFloat(this.rangeInput.value);
        let step = this.options.step;
        
        if (useLargeStep && this.options.largeStep) {
            step = this.options.largeStep;
        }
        
        const newValue = Math.min(this.options.max, currentValue + step);
        this.setValue(newValue);
    }
    
    setValue(value) {
        value = Math.max(this.options.min, Math.min(this.options.max, value));
        
        const step = this.options.step;
        value = Math.round(value / step) * step;
        
        this.rangeInput.value = value;
        
        const inputEvent = new Event('input', { bubbles: true });
        this.rangeInput.dispatchEvent(inputEvent);
        
        const changeEvent = new Event('change', { bubbles: true });
        this.rangeInput.dispatchEvent(changeEvent);
        
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        const currentValue = parseFloat(this.rangeInput.value);
        
        if (currentValue <= this.options.min) {
            this.minusBtn.disabled = true;
        } else {
            this.minusBtn.disabled = false;
        }
        
        if (currentValue >= this.options.max) {
            this.plusBtn.disabled = true;
        } else {
            this.plusBtn.disabled = false;
        }
    }
    
    setupLongPress(button, callback) {
        let pressTimer = null;
        let intervalTimer = null;
        
        const startPress = () => {
            callback();
            
            pressTimer = setTimeout(() => {
                intervalTimer = setInterval(() => {
                    callback();
                }, 100);
            }, 500);
        };
        
        const endPress = () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            if (intervalTimer) {
                clearInterval(intervalTimer);
                intervalTimer = null;
            }
        };
        
        button.addEventListener('mousedown', startPress);
        button.addEventListener('mouseup', endPress);
        button.addEventListener('mouseleave', endPress);
        button.addEventListener('touchstart', startPress);
        button.addEventListener('touchend', endPress);
        button.addEventListener('touchcancel', endPress);
    }
    
    destroy() {
        if (this.wrapper && this.wrapper.parentNode) {
            const parent = this.wrapper.parentNode;
            parent.insertBefore(this.rangeInput, this.wrapper);
            parent.removeChild(this.wrapper);
        }
    }
}

window.RangeControl = RangeControl;
