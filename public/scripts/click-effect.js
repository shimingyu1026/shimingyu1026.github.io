/**
 * 鼠标点击烟花特效
 * 在用户点击时创建烟花粒子效果
 */

class FireworkEffect {
  constructor() {
    this.colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];
    this.particleCount = 12; // 粒子数量
    this.maxDistance = 120; // 最大扩散距离
    this.duration = 1000; // 动画持续时间(ms)
    
    this.init();
  }

  init() {
    // 监听点击事件
    document.addEventListener('click', (e) => {
      this.createFirework(e.clientX, e.clientY);
    });
  }

  createFirework(x, y) {
    // 创建中心爆炸效果
    this.createExplosion(x, y);
    
    // 创建向外扩散的粒子
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle(x, y, i);
    }
  }

  createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'firework-particle';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    explosion.style.color = this.getRandomColor();
    explosion.style.animation = 'firework-explode 0.6s ease-out forwards';
    
    document.body.appendChild(explosion);
    
    // 清理元素
    setTimeout(() => {
      if (explosion.parentNode) {
        explosion.parentNode.removeChild(explosion);
      }
    }, 600);
  }

  createParticle(x, y, index) {
    const particle = document.createElement('div');
    particle.className = 'firework-particle';
    
    // 计算粒子的随机方向
    const angle = (360 / this.particleCount) * index + Math.random() * 30 - 15;
    const distance = this.maxDistance + Math.random() * 40 - 20;
    const radians = (angle * Math.PI) / 180;
    
    const dx = Math.cos(radians) * distance;
    const dy = Math.sin(radians) * distance;
    
    // 设置粒子样式
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.color = this.getRandomColor();
    particle.style.setProperty('--dx', dx + 'px');
    particle.style.setProperty('--dy', dy + 'px');
    particle.style.animation = `firework-trail ${this.duration}ms ease-out forwards`;
    
    // 添加随机延迟，让粒子效果更自然
    const delay = Math.random() * 100;
    particle.style.animationDelay = delay + 'ms';
    
    document.body.appendChild(particle);
    
    // 清理元素
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, this.duration + delay);
  }

  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}

// 页面加载完成后初始化特效
document.addEventListener('DOMContentLoaded', () => {
  new FireworkEffect();
});

// 如果DOM已经加载完成，立即初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FireworkEffect();
  });
} else {
  new FireworkEffect();
}