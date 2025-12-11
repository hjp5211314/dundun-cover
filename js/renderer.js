

class CanvasRenderer {
  constructor() {
    this.canvas = document.getElementById('renderCanvas');
    if (!this.canvas) {
      const cover = document.getElementById('coverCanvas');
      if (cover) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'renderCanvas';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        cover.appendChild(this.canvas);
      }
    }
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.actualFontSize = null;
    this.manualFontSize = false;
    this.renderPending = false;
  }

  setSize(width, height) {
    if (!this.canvas) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }

  render() {
    if (this.renderPending) return;
    
    this.renderPending = true;
    requestAnimationFrame(() => {
      this._doRender();
      this.renderPending = false;
    });
  }

  _doRender() {
    if (!this.canvas || !this.ctx) return;
    const { width, height } = this.getCanvasSize();
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    
    this.drawScene(this.ctx, width, height);
    
    this.updateFontSizeDisplay();
  }

  updateFontSizeDisplay() {
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontSizeSlider = document.getElementById('fontSize');
    if (fontSizeValue && fontSizeSlider) {
      fontSizeValue.textContent = fontSizeSlider.value;
    }
  }
  renderToCanvas(width, height) {
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const ctx = off.getContext('2d');
    this.drawScene(ctx, width, height);
    return off;
  }

  getCanvasSize() {
    const cover = document.getElementById('coverCanvas');
    const w = parseInt(cover && cover.style.width) || this.canvas?.width || 1000;
    const h = parseInt(cover && cover.style.height) || this.canvas?.height || 500;
    return { width: w, height: h };
  }
  collectState() {
    const bg = window.backgroundManager?.getCurrentConfig?.() || {};
    const txt = window.textEditor?.getCurrentConfig?.() || {};
    const ico = window.iconEffects?.getCurrentConfig?.() || {};
    const showCardValue = document.getElementById('showCard')?.value || 'true';
    const showCard = showCardValue === 'true';

    const iconEl = document.getElementById('iconImage');
    const hasIcon = !!(iconEl && iconEl.src && iconEl.src.length > 0);

    return { bg, txt, ico, showCard, showCardValue, iconEl, hasIcon };
  }

  drawScene(ctx, width, height) {
    const state = this.collectState();

    const scale = 1;
    ctx.clearRect(0, 0, width, height);

    this.drawBackground(ctx, width, height, state.bg);

    this.drawText(ctx, width, height, state.txt, state.ico, state.hasIcon, scale);
    
    if (state.showCardValue === 'none') {
      return;
    }
    
    if (state.showCard) {
      this.drawGlassCard(ctx, width, height, state.ico, state.iconEl, scale, state.hasIcon);
    } else if (state.hasIcon) {
      this.drawIconOnly(ctx, width, height, state.ico, state.iconEl, scale);
    }
  }
  drawBackground(ctx, width, height, bg) {
    const type = bg.type || 'linear';
    const c1 = bg.color1 || '#667eea';
    const c2 = bg.color2 || '#764ba2';
    const angle = bg.angle || 135;

    if (type === 'solid') {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'linear') {
      this.fillLinearGradient(ctx, width, height, angle, c1, c2);
      
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      
      const bright1 = this.adjustColorBrightness(c1, 30);
      const dark1 = this.adjustColorBrightness(c1, -20);
      const bright2 = this.adjustColorBrightness(c2, 30);
      const dark2 = this.adjustColorBrightness(c2, -20);
      
      const r = Math.max(width, height) * 0.8;
      
      const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g1.addColorStop(0, this.hexToRgba(bright1, 0.6));
      g1.addColorStop(1, this.hexToRgba(c1, 0));
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);
      
      const g2 = ctx.createRadialGradient(width, height, 0, width, height, r);
      g2.addColorStop(0, this.hexToRgba(bright2, 0.6));
      g2.addColorStop(1, this.hexToRgba(c2, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);
      
      const g3 = ctx.createRadialGradient(width, 0, 0, width, 0, r);
      g3.addColorStop(0, this.hexToRgba(dark2, 0.4));
      g3.addColorStop(1, this.hexToRgba(c2, 0));
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, width, height);
      
      const g4 = ctx.createRadialGradient(0, height, 0, 0, height, r);
      g4.addColorStop(0, this.hexToRgba(dark1, 0.4));
      g4.addColorStop(1, this.hexToRgba(c1, 0));
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, width, height);
      
      ctx.restore();
    } else if (type === 'radial') {
      const hlPos = (bg.highlightPosition !== undefined) ? bg.highlightPosition : 50;
      const hlWidth = (bg.highlightWidth !== undefined) ? bg.highlightWidth : 50;
      
      const posX = width * (hlPos / 100);
      const posY = height * 0.5; 
      
      const r1 = 0;
      const r2 = Math.max(width, height) * (hlWidth / 100) * 1.5;
      
      const g = ctx.createRadialGradient(posX, posY, r1, posX, posY, r2);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'image') {
      this.drawBackgroundImage(ctx, width, height, bg, c1, c2);
    } else if (type === 'mesh') {
      this.drawMeshGradient(ctx, width, height, bg, c1, c2);
    } else if (type === 'dots') {
      this.drawDotMatrix(ctx, width, height, bg, c1, c2);
    } else if (type === 'waves') {
      this.drawAbstractWaves(ctx, width, height, bg, c1, c2);
    } else if (type === 'grain') {
      this.drawGrainyNoise(ctx, width, height, bg, c1, c2);
    } else if (type === 'pop') {
      this.drawGeometricPop(ctx, width, height, bg, c1, c2);
    } else if (type === 'hex') {
      this.drawHexagonGrid(ctx, width, height, bg, c1, c2);
    } else if (type === 'peaks') {
      this.drawLayeredPeaks(ctx, width, height, bg, c1, c2);
    } else if (type === 'topo') {
      this.drawTopography(ctx, width, height, bg, c1, c2);
    } else if (type === 'paper') {
      this.drawPaperCutout(ctx, width, height, bg, c1, c2);
    } else if (type === 'aurora') {
      this.drawAurora(ctx, width, height, bg, c1, c2);
    }

    const edgeGlow = parseFloat(bg.edgeGlow || 0);
    if (edgeGlow > 0) {
        const intensity = edgeGlow / 100;
        const edgeGlowSize = parseFloat(bg.edgeGlowSize || 15) * (width / 1000) * 2;
        const edgeColor = bg.edgeGlowColor || '#ffffff';
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        let r=255, g=255, b=255;
        if (edgeColor.startsWith('#')) {
            const hex = edgeColor.replace('#', '');
            if (hex.length === 6) {
                r = parseInt(hex.substring(0,2), 16);
                g = parseInt(hex.substring(2,4), 16);
                b = parseInt(hex.substring(4,6), 16);
            }
        }

        const topGrd = ctx.createLinearGradient(0, 0, 0, edgeGlowSize);
        topGrd.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity * 0.8})`);
        topGrd.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = topGrd;
        ctx.fillRect(0, 0, width, edgeGlowSize);

        const bottomGrd = ctx.createLinearGradient(0, height - edgeGlowSize, 0, height);
        bottomGrd.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        bottomGrd.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${intensity * 0.8})`);
        ctx.fillStyle = bottomGrd;
        ctx.fillRect(0, height - edgeGlowSize, width, edgeGlowSize);

        const leftGrd = ctx.createLinearGradient(0, 0, edgeGlowSize, 0);
        leftGrd.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${intensity * 0.8})`);
        leftGrd.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = leftGrd;
        ctx.fillRect(0, 0, edgeGlowSize, height);

        const rightGrd = ctx.createLinearGradient(width - edgeGlowSize, 0, width, 0);
        rightGrd.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        rightGrd.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${intensity * 0.8})`);
        ctx.fillStyle = rightGrd;
        ctx.fillRect(width - edgeGlowSize, 0, edgeGlowSize, height);

        ctx.restore();
    }
  }

  drawMeshGradient(ctx, width, height, bg, c1, c2) {
    const angle = bg.angle || 0;
    this.fillLinearGradient(ctx, width, height, angle, c1, c2);

    const scale = (bg.meshScale || 50) / 50; 
    const count = 6;
    
    ctx.save();
    ctx.globalCompositeOperation = 'overlay'; 
    
    const seed = parseInt(c1.slice(1), 16) || 0;
    const random = (() => {
        let s = seed;
        return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    })();
    
    const cx = width / 2;
    const cy = height / 2;
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    for (let i = 0; i < count; i++) {
        const x0 = random() * width;
        const y0 = random() * height;
        const r = Math.min(width, height) * (0.5 + random() * 0.5) * scale;
        
        const dx = x0 - cx;
        const dy = y0 - cy;
        const x = cx + dx * cos - dy * sin;
        const y = cy + dx * sin + dy * cos;
        
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const color = i % 2 === 0 ? c2 : c1;
        
        g.addColorStop(0, this.hexToRgba(color, 0.8));
        g.addColorStop(1, this.hexToRgba(color, 0));
        
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
  }

  fillLinearGradient(ctx, width, height, angle, c1, c2) {
    const rad = angle * Math.PI / 180;
    const cx = width / 2;
    const cy = height / 2;
    const length = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
    const x1 = cx - Math.cos(rad) * length / 2;
    const y1 = cy - Math.sin(rad) * length / 2;
    const x2 = cx + Math.cos(rad) * length / 2;
    const y2 = cy + Math.sin(rad) * length / 2;
    
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  drawDotMatrix(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);

    const gap = Math.max(15, (bg.dotScale || 30) * 2);
    const baseRadius = Math.max(1.5, gap * 0.15);
    
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    
    const seed = (bg.angle || 0);
    const random = (() => {
        let s = seed;
        return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    })();
    
    for (let x = gap/2; x < width; x += gap) {
        for (let y = gap/2; y < height; y += gap) {
            const dx = x - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ratio = 1 - (dist / maxDist);
            
            const r = baseRadius * (ratio * 0.8 + 0.2) * (0.8 + random() * 0.4);
            
            if (r < 0.5) continue;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            
            const alpha = (0.3 + ratio * 0.4) * (0.8 + random() * 0.2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }
    
    ctx.restore();
    
    const overlay = ctx.createRadialGradient(cx, cy, maxDist * 0.4, cx, cy, maxDist);
    overlay.addColorStop(0, 'rgba(0,0,0,0)');
    overlay.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);
  }

  drawAbstractWaves(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);

    const count = bg.waveCount || 5;
    const step = height / (count + 2);
    
    for (let i = 0; i < count; i++) {
        const yBase = height - (i * step) * 1.2;
        
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 20) {
            const y = yBase + Math.sin(x * 0.005 + i) * 40 * ((i+1)*0.5);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        
        ctx.fillStyle = this.hexToRgba(c2, 0.1 + (i / count) * 0.3);
        ctx.fill();
    }
  }

  drawGrainyNoise(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);

    const intensity = (bg.grainAmount || 20) / 100;
    if (intensity <= 0.01) return;

    const noiseCanvas = document.createElement('canvas');
    const scale = 0.5;
    noiseCanvas.width = width * scale;
    noiseCanvas.height = height * scale;
    const nctx = noiseCanvas.getContext('2d');
    
    const imageData = nctx.createImageData(noiseCanvas.width, noiseCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i+1] = val;
        data[i+2] = val;
        data[i+3] = intensity * 40;
    }
    
    nctx.putImageData(imageData, 0, 0);
    
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(noiseCanvas, 0, 0, width, height);
    ctx.restore();
  }

  drawGeometricPop(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);
    
    const count = bg.popCount || 15;
    
    const seed = (bg.angle || 0) + count;
    const random = (() => {
        let s = seed;
        return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    })();

    for (let i = 0; i < count; i++) {
        const type = Math.floor(random() * 6);
        const x = random() * width;
        const y = random() * height;
        const size = (random() * 120 + 30) * (width / 1000);
        const rotation = random() * Math.PI * 2;
        const opacity = random() * 0.15 + 0.05;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        const isWhite = random() > 0.6;
        ctx.fillStyle = this.hexToRgba(isWhite ? '#ffffff' : c2, opacity);
        ctx.strokeStyle = this.hexToRgba(isWhite ? '#ffffff' : c2, opacity);
        ctx.lineWidth = size * 0.1;
        
        ctx.beginPath();
        
        if (type === 0) {
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 1) {
            ctx.rect(-size/2, -size/2, size, size);
            ctx.fill();
        } else if (type === 2) {
            ctx.moveTo(0, -size/2);
            ctx.lineTo(size/2, size/2);
            ctx.lineTo(-size/2, size/2);
            ctx.closePath();
            ctx.fill();
        } else if (type === 3) {
            ctx.arc(0, 0, size/2, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 4) {
            const w = size * 0.2;
            ctx.rect(-w/2, -size/2, w, size);
            ctx.rect(-size/2, -w/2, size, w);
            ctx.fill();
        } else if (type === 5) {
            ctx.moveTo(0, -size/2);
            ctx.lineTo(size/2, 0);
            ctx.lineTo(0, size/2);
            ctx.lineTo(-size/2, 0);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
  }

  drawHexagonGrid(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);
    
    const size = (bg.hexScale || 40) * (width / 1000) * 1.5;
    const h = size * 2;
    const w = Math.sqrt(3) * size;
    
    const cols = Math.ceil(width / w) + 1;
    const rows = Math.ceil(height / (h * 0.75)) + 1;
    
    const seed = (bg.angle || 0);
    const random = (() => {
        let s = seed;
        return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    })();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const xOffset = (row % 2) * (w / 2);
            const x = col * w + xOffset - w/2;
            const y = row * (h * 0.75) - h/2;
            
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI / 3 * i + Math.PI / 6;
                const hx = x + size * Math.cos(angle);
                const hy = y + size * Math.sin(angle);
                if (i === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            
            ctx.stroke();
            
            if (random() > 0.6) {
                ctx.fillStyle = this.hexToRgba('#ffffff', random() * 0.15);
                ctx.fill();
            }
        }
    }
  }

  simpleNoise(x, y, seed = 0) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  drawLayeredPeaks(ctx, width, height, bg, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, c1);
    g.addColorStop(1, this.hexToRgba(c1, 0.5));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const count = bg.peaksCount || 5;
    const seed = (bg.angle || 0) + 123;

    for (let i = 0; i < count; i++) {
        const yBase = height * (0.3 + (i / count) * 0.7);
        const color = i === count - 1 ? c2 : this.interpolateColor(c1, c2, (i + 1) / count);
        
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, yBase);

        const frequency = 0.003 + i * 0.001;
        const amplitude = height * (0.1 + i * 0.05);
        
        for (let x = 0; x <= width; x += 10) {
            const y = yBase - Math.abs(
                Math.sin(x * frequency + seed + i) * amplitude * 0.5 + 
                Math.sin(x * frequency * 2.5 + seed) * amplitude * 0.3 +
                Math.sin(x * frequency * 0.5) * amplitude * 0.2
            );
            ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
  }

  drawTopography(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);
    
    const scale = (bg.topoScale || 30) / 50;
    const seed = 567;
    
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    
    const count = 10;
    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        const centerX = width * this.simpleNoise(i, 1, seed);
        const centerY = height * this.simpleNoise(i, 2, seed);
        const maxR = Math.min(width, height) * (0.2 + this.simpleNoise(i, 3, seed) * 0.6);
        
        const points = 100;
        for (let j = 0; j <= points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const rOffset = this.simpleNoise(Math.cos(angle), Math.sin(angle), i + seed) * 50 * scale;
            const r = maxR + rOffset;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        for (let k = 1; k < 4; k++) {
             ctx.beginPath();
             for (let j = 0; j <= points; j++) {
                const angle = (j / points) * Math.PI * 2;
                const rOffset = this.simpleNoise(Math.cos(angle), Math.sin(angle), i + seed) * 50 * scale;
                const r = (maxR + rOffset) * (1 - k * 0.2);
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
             }
             ctx.closePath();
             ctx.stroke();
        }
    }
  }

  drawPaperCutout(ctx, width, height, bg, c1, c2) {
    this.fillLinearGradient(ctx, width, height, bg.angle || 135, c1, c2);
    
    const count = bg.paperCount || 5;
    const seed = (bg.angle || 0);
    
    for (let i = 0; i < count; i++) {
        ctx.save();
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 5;
        
        const color = this.interpolateColor(c1, c2, i / count);
        ctx.fillStyle = color;
        
        ctx.beginPath();
        const yBase = height * (0.2 + (i / count) * 0.6);
        
        ctx.moveTo(0, height);
        ctx.lineTo(0, yBase);
        
        const segments = 10;
        const step = width / segments;
        
        let prevX = 0;
        let prevY = yBase;
        
        for (let j = 1; j <= segments; j++) {
            const x = j * step;
            const noise = Math.sin(j * 0.5 + i + seed) + Math.cos(j * 0.3 + seed);
            const y = yBase + noise * height * 0.1;
            
            const cp1x = prevX + step / 2;
            const cp1y = prevY;
            const cp2x = x - step / 2;
            const cp2y = y;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            
            prevX = x;
            prevY = y;
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
  }

  drawAurora(ctx, width, height, bg, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#1a1a2e');
    g.addColorStop(1, '#16213e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    
    const scale = (bg.auroraScale || 50) / 50;
    const count = 4;
    const seed = (bg.angle || 0) * Math.PI / 180;
    
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${20 * scale}px)`;
    
    for (let i = 0; i < count; i++) {
        ctx.beginPath();
        
        const xStart = width * 0.2 + i * (width * 0.15);
        ctx.moveTo(xStart, height);
        
        let x = xStart;
        let y = height;
        
        const amplitude = width * 0.3 * scale;
        
        for (let h = height; h >= -100; h -= 50) {
             const phase = (height - h) * 0.005 + i + seed;
             x = xStart + Math.sin(phase) * amplitude;
             ctx.lineTo(x, h);
        }
        
        for (let h = -100; h <= height; h += 50) {
             const phase = (height - h) * 0.005 + i + seed;
             const w = 50 * scale * (1 - h/height);
             x = xStart + Math.sin(phase) * amplitude + w;
             ctx.lineTo(x, h);
        }
        
        ctx.closePath();
        
        const color = i % 2 === 0 ? c1 : c2;
        ctx.fillStyle = this.hexToRgba(color, 0.4);
        ctx.fill();
    }
    
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }

  interpolateColor(c1, c2, factor) {
    const r1 = parseInt(c1.substring(1, 3), 16);
    const g1 = parseInt(c1.substring(3, 5), 16);
    const b1 = parseInt(c1.substring(5, 7), 16);
    
    const r2 = parseInt(c2.substring(1, 3), 16);
    const g2 = parseInt(c2.substring(3, 5), 16);
    const b2 = parseInt(c2.substring(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  adjustColorBrightness(hex, amount) {
    let color = hex.replace('#', '');
    if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
    
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    
    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));
    
    const rr = (r.toString(16).length === 1) ? '0' + r.toString(16) : r.toString(16);
    const gg = (g.toString(16).length === 1) ? '0' + g.toString(16) : g.toString(16);
    const bb = (b.toString(16).length === 1) ? '0' + b.toString(16) : b.toString(16);
    
    return '#' + rr + gg + bb;
  }

  hexToRgba(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  drawBackgroundImage(ctx, width, height, bg, c1, c2) {
    const bgImageEl = document.getElementById('bgImage');
    if (bgImageEl && bgImageEl.src && bgImageEl.complete && bgImageEl.naturalWidth > 0) {
        const scale = (bg.bgImageScale || 100) / 100;
        const posX = (bg.bgImageX || 50) / 100;
        const posY = (bg.bgImageY || 50) / 100;
        const blur = bg.bgImageBlur || 0;

        const imgRatio = bgImageEl.naturalWidth / bgImageEl.naturalHeight;
        const canvasRatio = width / height;

        let imgWidth, imgHeight;
        if (imgRatio > canvasRatio) {
            imgHeight = height * scale;
            imgWidth = imgHeight * imgRatio;
        } else {
            imgWidth = width * scale;
            imgHeight = imgWidth / imgRatio;
        }

        const x = (width - imgWidth) * posX;
        const y = (height - imgHeight) * posY;

        if (blur > 0) {
            ctx.filter = `blur(${blur}px)`;
        }
        ctx.drawImage(bgImageEl, x, y, imgWidth, imgHeight);
        ctx.filter = 'none';
    } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#999';
        ctx.font = `${Math.round(20 * (width/1000))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('请上传背景图片', width / 2, height / 2);
    }
  }

  drawText(ctx, width, height, txt, ico, hasIcon, scale = 1) {
    let text = txt.textCenter || document.getElementById('textCenter')?.value || '';
    if (!text) text = '炖炖封面';

    const fontSize = Math.round(parseInt(txt.fontSize || 160) * scale);
    
    const pos = parseFloat(txt.textPosition || document.getElementById('textPosition')?.value || 50);
    
    const family = (txt.fontFamily || 'sans-serif');
    const fontWeightBtn = document.getElementById('fontWeightToggle');
    const fontWeight = txt.fontWeight || (fontWeightBtn ? fontWeightBtn.getAttribute('data-weight') : '400');
    const letterSpacing = parseFloat(txt.letterSpacing || 0) * scale;
    const color = txt.textColor || '#ffffff';
    const strokeWidth = parseFloat(txt.textStroke || 2) * scale;
    const strokeColor = txt.strokeColor || '#ffffff';
    const strokeOpacity = (parseFloat(txt.strokeOpacity || 30))/100;
    const finalStrokeColor = this.withOpacity(strokeColor, strokeOpacity);

    const shadowY = parseFloat(txt.textShadow || 0) * scale;
    const shadowOpacity = (parseFloat(txt.shadowOpacity || 30))/100;
    const shadowColor = this.withOpacity(txt.shadowColor || '#000000', shadowOpacity);

    ctx.save();
    
    ctx.font = '10px sans-serif';
    ctx.font = `${fontWeight} ${fontSize}px ${family}`;
    
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = finalStrokeColor;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowY * 2;
    ctx.shadowOffsetY = shadowY;

    let metrics = this.measureTextWithSpacing(ctx, text, letterSpacing);
    
    const maxTextWidth = width - 200 * scale;
    let adjustedFontSize = fontSize;
    let scaleFactor = 1;
    
    if (!this.manualFontSize && metrics.total > maxTextWidth && maxTextWidth > 0) {
      scaleFactor = maxTextWidth / metrics.total;
      adjustedFontSize = Math.max(Math.round(fontSize * scaleFactor), Math.round(20 * scale));
      ctx.font = `900 ${adjustedFontSize}px ${family}`;
      ctx.lineWidth = strokeWidth * (adjustedFontSize / fontSize);
      ctx.shadowBlur = (shadowY * 2) * (adjustedFontSize / fontSize);
      ctx.shadowOffsetY = shadowY * (adjustedFontSize / fontSize);
      metrics = this.measureTextWithSpacing(ctx, text, letterSpacing * (adjustedFontSize / fontSize));
    }
    
    this.actualFontSize = Math.round(adjustedFontSize / scale);
    const baselineY = Math.round(adjustedFontSize / 2 + (height - adjustedFontSize) * (pos / 100));
    
    const startX = Math.round(width/2 - metrics.total/2);

    const finalLetterSpacing = adjustedFontSize !== fontSize ? letterSpacing * (adjustedFontSize / fontSize) : letterSpacing;
    this.drawTextWithSpacing(ctx, text, startX, baselineY, finalLetterSpacing, true, true);
    ctx.restore();
  }

  drawGlassCard(ctx, width, height, ico, iconEl, scale = 1, hasIcon = false) {
    const size = Math.round(parseInt(ico.size || 200) * scale);
    const cardShape = ico.cardShape || 'rounded-square';
    let radius = Math.round(parseInt(ico.radius || 50) * scale);
    if (cardShape === 'circle') radius = Math.floor(size / 2);
    if (cardShape === 'square') radius = 0;

    const glowSize = parseFloat(ico.glow || 0);
    const glassOpacity = parseFloat(ico.glassOpacity || 20) / 100;
    const insetDepth = parseFloat(ico.insetDepth || 0);
    const cardRotationDeg = parseFloat(ico.cardRotation || 0);
    const iconRotationDeg = parseFloat(ico.iconRotation || 0);
    const iconFollow = (ico.iconFollow === true || ico.iconFollow === 'true');
    const cardRotRad = cardRotationDeg * Math.PI / 180;
    const iconAbsRotRad = (iconFollow ? cardRotationDeg : iconRotationDeg) * Math.PI / 180;

    const cx = Math.round(width/2 - size/2);
    const cy = Math.round(height/2 - size/2);

    const path = this.buildCardPath(cardShape, cx, cy, size, radius);

    ctx.save();
    ctx.translate(cx + size / 2, cy + size / 2);
    ctx.rotate(cardRotRad);
    ctx.translate(-(cx + size / 2), -(cy + size / 2));

    if (glowSize > 0) {
      const glowWidth = 16 * scale;
      const glowIntensity = glowSize / 50;
      const layers = 8;
      
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = width;
      glowCanvas.height = height;
      const glowCtx = glowCanvas.getContext('2d');
      
      for (let i = layers; i >= 1; i--) {
        const offset = (glowWidth / layers) * i;
        const glowPath = new Path2D();
        this.roundRectPath(glowPath, cx - offset, cy - offset, size + offset * 2, size + offset * 2, radius + offset);
        
        const alpha = ((layers - i + 1) / layers) * 0.2 * glowIntensity;
        glowCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        glowCtx.fill(glowPath);
      }
      
      glowCtx.globalCompositeOperation = 'destination-out';
      glowCtx.fillStyle = 'rgba(0, 0, 0, 1)';
      glowCtx.fill(path);
      
      ctx.drawImage(glowCanvas, 0, 0);
    }

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 60 * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 30 * scale;
    ctx.fillStyle = `rgba(255, 255, 255, ${glassOpacity})`;
    ctx.fill(path);
    ctx.restore();

    const snap = document.createElement('canvas');
    snap.width = width;
    snap.height = height;
    const sctx = snap.getContext('2d');
    sctx.drawImage(ctx.canvas, 0, 0);

    ctx.save();
    ctx.clip(path);
    const blurPx = Math.floor(glassOpacity * 20 * scale);
    if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;
    const prev = ctx.getTransform ? ctx.getTransform() : null;
    if (ctx.setTransform) ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(snap, 0, 0);
    if (prev && ctx.setTransform) ctx.setTransform(prev);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${glassOpacity})`;
    ctx.fill(path);
    ctx.restore();

    if (Math.abs(insetDepth) > 0) {
      const depth = Math.abs(insetDepth) / 100;
      const isConvex = insetDepth > 0;
      
      const shadowDist = Math.max(2, size * 0.08 * depth); 
      const baseOffset = isConvex ? -shadowDist : shadowDist;
      const blurRadius = shadowDist * 1.5;
      
      ctx.save();
      ctx.clip(path);

      const inversePath = new Path2D();
      inversePath.rect(-width, -height, width * 3, height * 3); 
      inversePath.addPath(path); 

      ctx.shadowColor = `rgba(0, 0, 0, ${0.9 * depth})`;
      ctx.shadowBlur = blurRadius;
      ctx.shadowOffsetX = baseOffset;
      ctx.shadowOffsetY = baseOffset;
      ctx.fillStyle = '#000000'; 
      ctx.fill(inversePath, 'evenodd');

      ctx.shadowColor = `rgba(255, 255, 255, ${0.9 * depth})`;
      ctx.shadowBlur = blurRadius;
      ctx.shadowOffsetX = -baseOffset;
      ctx.shadowOffsetY = -baseOffset;
      ctx.fillStyle = '#ffffff';
      ctx.fill(inversePath, 'evenodd');

      const sheen = ctx.createLinearGradient(cx, cy, cx + size, cy + size);
      if (isConvex) {
         sheen.addColorStop(0, `rgba(255, 255, 255, ${0.3 * depth})`);
         sheen.addColorStop(1, `rgba(0, 0, 0, ${0.2 * depth})`);
      } else {
         sheen.addColorStop(0, `rgba(0, 0, 0, ${0.2 * depth})`);
         sheen.addColorStop(1, `rgba(255, 255, 255, ${0.2 * depth})`);
      }
      ctx.fillStyle = sheen;
      ctx.fill(path);

      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke(path);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke(path);
    ctx.restore();

    ctx.restore();

    if (hasIcon && iconEl && iconEl.complete && iconEl.naturalWidth > 0) {
      const scalePct = Math.max(10, Math.min(100, parseInt(ico.imageScale || 70)));
      const factor = scalePct / 100;
      const maxW = Math.floor(size * factor);
      const maxH = Math.floor(size * factor);
      const { dw, dh } = this.fitContain(iconEl.naturalWidth, iconEl.naturalHeight, maxW, maxH);

      ctx.save();
      ctx.translate(cx + size / 2, cy + size / 2);
      ctx.rotate(cardRotRad);
      ctx.translate(-(cx + size / 2), -(cy + size / 2));
      ctx.clip(path);
      ctx.translate(cx + size / 2, cy + size / 2);
      const relRot = iconAbsRotRad - cardRotRad;
      ctx.rotate(relRot);
      ctx.drawImage(iconEl, -dw/2, -dh/2, dw, dh);
      ctx.restore();
    } else {
      ctx.save();
      ctx.font = `${Math.round(14 * scale)}px "Noto Sans SC", sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('点击左侧上传图标', width/2, height/2);
      ctx.restore();
    }
  }

  drawIconOnly(ctx, width, height, ico, iconEl, scale = 1) {
    if (!(iconEl && iconEl.complete && iconEl.naturalWidth > 0)) return;
    
    const scalePct = Math.max(0, Math.min(100, parseInt(ico.imageScale || 100)));
    const factor = scalePct / 100;
    
    const baseSize = Math.min(width, height);
    const maxW = Math.floor(baseSize * factor);
    const maxH = Math.floor(baseSize * factor);
    
    const { dw, dh } = this.fitContain(iconEl.naturalWidth, iconEl.naturalHeight, maxW, maxH);
    const iconRotationDeg = parseFloat(ico.iconRotation || 0);
    const rad = iconRotationDeg * Math.PI / 180;

    const posX = parseFloat(ico.iconPositionX || document.getElementById('iconPositionX')?.value || 50);
    const posY = parseFloat(ico.iconPositionY || document.getElementById('iconPositionY')?.value || 50);
    
    const centerX = Math.round(width * (posX / 100));
    const centerY = Math.round(height * (posY / 100));

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);
    ctx.drawImage(iconEl, -Math.round(dw/2), -Math.round(dh/2), dw, dh);
    ctx.restore();
  }

  roundRectPath(path, x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    path.moveTo(x + rr, y);
    path.arcTo(x + w, y, x + w, y + h, rr);
    path.arcTo(x + w, y + h, x, y + h, rr);
    path.arcTo(x, y + h, x, y, rr);
    path.arcTo(x, y, x + w, y, rr);
    path.closePath();
  }

  circlePath(x, y, size) {
    const p = new Path2D();
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size / 2;
    p.moveTo(cx + r, cy);
    p.arc(cx, cy, r, 0, Math.PI * 2);
    p.closePath();
    return p;
  }

  squirclePath(x, y, w, h, n = 4) {
    const p = new Path2D();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const a = w / 2;
    const b = h / 2;
    const m = 2 / n;
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const ct = Math.cos(t), st = Math.sin(t);
      const px = cx + Math.sign(ct) * Math.pow(Math.abs(ct), m) * a;
      const py = cy + Math.sign(st) * Math.pow(Math.abs(st), m) * b;
      if (i === 0) p.moveTo(px, py); else p.lineTo(px, py);
    }
    p.closePath();
    return p;
  }

  buildCardPath(cardShape, x, y, size, radius) {
    if (cardShape === 'circle') {
      return this.circlePath(x, y, size);
    }
    if (cardShape === 'squircle') {
      return this.squirclePath(x, y, size, size, 4);
    }
    const p = new Path2D();
    const r = cardShape === 'square' ? 0 : radius;
    this.roundRectPath(p, x, y, size, size, r);
    return p;
   }

  measureTextWithSpacing(ctx, text, spacing) {
    let total = 0;
    for (let i = 0; i < text.length; i++) {
      const m = ctx.measureText(text[i]);
      total += m.width;
      if (i < text.length - 1) total += spacing;
    }
    return { total };
  }

  drawTextWithSpacing(ctx, text, x, y, spacing, doStroke, doFill) {
    let cursor = x;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (doStroke) ctx.strokeText(ch, cursor, y);
      if (doFill) ctx.fillText(ch, cursor, y);
      cursor += ctx.measureText(ch).width + spacing;
    }
  }

  fitContain(sw, sh, maxW, maxH) {
    const s = Math.min(maxW / sw, maxH / sh);
    return { dw: Math.round(sw * s), dh: Math.round(sh * s) };
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  withOpacity(hex, alpha) {
    const rgb = this.hexToRgb(hex);
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }
}

window.renderer = new CanvasRenderer();
