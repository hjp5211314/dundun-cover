<div align="center">

# Cloudflare 配置指南

**炖炖封面 - 图床功能配置**

配置 Cloudflare R2 + Workers + KV 实现图片上传和存储

[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![R2](https://img.shields.io/badge/Cloudflare-R2-F38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/products/r2/)

</div>

---

## 目录

- [准备工作](#准备工作)
- [创建 R2 存储桶](#创建-r2-存储桶)
- [创建 KV 命名空间](#创建-kv-命名空间)
- [创建和配置 Worker](#创建和配置-worker)
- [前端配置](#前端配置)
- [测试验证](#测试验证)
- [常见问题](#常见问题)

---

## 准备工作

### 前置要求

- Cloudflare 账号（免费版即可）
- 已验证的邮箱
- 项目已在本地运行

### 费用说明

| 服务 | 免费额度 | 超出计费 |
|------|----------|----------|
| R2 存储 | 10GB / 月 | $0.015/GB/月 |
| Workers | 100,000 次请求 / 天 | $0.50/百万次 |
| KV | 100,000 次读取 / 天 | 按量计费 |

> 对于个人博客项目，免费额度完全够用！

---

## 创建 R2 存储桶

### 步骤 1：进入 R2 控制台

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **R2**
3. 首次使用点击 **Purchase R2**（有免费额度）

### 步骤 2：创建存储桶

1. 点击 **Create bucket**
2. 填写信息：
   - **Bucket name**：`blog-cover-images`
   - **Location**：选择 **Asia Pacific**（推荐）
3. 点击 **Create bucket**

### 步骤 3：配置公开访问

1. 进入存储桶 → **Settings**
2. 找到 **Public access** → 点击 **Allow Access**
3. 记下 **Public Bucket URL**（类似：`https://pub-xxx.r2.dev`）

> 这个 URL 后面会用到，建议复制保存！

---

## 创建 KV 命名空间

1. 左侧菜单 **Workers & Pages** → **KV**
2. 点击 **Create namespace**
3. 名称：`image-storage-stats`
4. 点击 **Add**

> KV 用于存储上传速率限制计数，防止滥用。

---

## 创建和配置 Worker

### 步骤 1：创建 Worker

1. **Workers & Pages** → **Create application**
2. 选择 **Create Worker**
3. 名称：`image-uploader`
4. 点击 **Deploy**

### 步骤 2：绑定 R2 存储桶

1. Worker 详情页 → **Settings** → **Bindings** → **Add**
2. 选择 **R2 bucket**
3. **Variable name**：`MY_BUCKET`
4. 选择 `blog-cover-images`
5. 保存

### 步骤 3：绑定 KV 命名空间

1. 同样在 **Bindings** → **Add**
2. 选择 **KV Namespace**
3. **Variable name**：`STATS_KV`
4. 选择 `image-storage-stats`
5. 保存

### 步骤 4：部署 Worker 代码

点击 **Quick edit**，粘贴以下代码：

```javascript
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 配置项 - 根据需求修改
    const MAX_SIZE_GB = 9.5;
    const MAX_SIZE_BYTES = MAX_SIZE_GB * 1024 * 1024 * 1024;
    const MAX_FILE_SIZE_MB = 8;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    
    // 修改为你的网站域名
    const REDIRECT_URL = 'https://你的网站.com';
    
    // 域名白名单
    const ALLOWED_DOMAINS = [
      'https://你的网站.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];
    
    // 速率限制
    const MAX_UPLOADS_PER_HOUR = 20;
    const MAX_UPLOADS_PER_DAY = 100;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === 'GET') {
      return Response.redirect(REDIRECT_URL, 302);
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      // 检查来源域名
      const origin = request.headers.get('Origin');
      const referer = request.headers.get('Referer');
      
      let isAllowed = false;
      if (origin && ALLOWED_DOMAINS.includes(origin)) {
        isAllowed = true;
      }
      if (!isAllowed && referer) {
        for (const domain of ALLOWED_DOMAINS) {
          if (referer.startsWith(domain)) {
            isAllowed = true;
            break;
          }
        }
      }
      
      if (!isAllowed) {
        return new Response(JSON.stringify({
          success: false,
          message: '访问被拒绝：未授权的来源域名'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 检查上传频率
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const hourKey = `rate:hour:${clientIP}`;
      const dayKey = `rate:day:${clientIP}`;
      
      const hourCount = await env.STATS_KV.get(hourKey);
      if (hourCount && parseInt(hourCount) >= MAX_UPLOADS_PER_HOUR) {
        return new Response(JSON.stringify({
          success: false,
          message: `上传次数超限（每小时最多${MAX_UPLOADS_PER_HOUR}次），请稍后再试`
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const dayCount = await env.STATS_KV.get(dayKey);
      if (dayCount && parseInt(dayCount) >= MAX_UPLOADS_PER_DAY) {
        return new Response(JSON.stringify({
          success: false,
          message: `上传次数超限（每天最多${MAX_UPLOADS_PER_DAY}次），请明天再试`
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '未找到文件' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 检查文件大小
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const fileMB = (file.size / 1024 / 1024).toFixed(2);
        return new Response(JSON.stringify({
          success: false,
          message: `文件过大（${fileMB}MB），单个文件不得超过 ${MAX_FILE_SIZE_MB}MB`
        }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 检查总容量
      let totalSize = 0;
      let fileCount = 0;
      let cursor = undefined;
      
      do {
        const list = await env.MY_BUCKET.list({ cursor, limit: 1000 });
        fileCount += list.objects.length;
        for (const obj of list.objects) {
          totalSize += obj.size;
        }
        cursor = list.truncated ? list.cursor : undefined;
      } while (cursor);

      const newTotalSize = totalSize + file.size;
      if (newTotalSize > MAX_SIZE_BYTES) {
        const usedGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);
        const fileMB = (file.size / 1024 / 1024).toFixed(2);
        return new Response(JSON.stringify({
          success: false,
          message: `存储空间不足（已使用 ${usedGB}GB/${MAX_SIZE_GB}GB，本次文件 ${fileMB}MB）`
        }), {
          status: 507,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const objectKey = file.name || `cover-${Date.now()}.jpg`;

      // 上传文件
      await env.MY_BUCKET.put(objectKey, file.stream(), {
        httpMetadata: { contentType: file.type || 'image/jpeg' },
      });

      // 更新速率限制计数
      await env.STATS_KV.put(hourKey, (parseInt(hourCount || 0) + 1).toString(), {
        expirationTtl: 3600
      });
      
      await env.STATS_KV.put(dayKey, (parseInt(dayCount || 0) + 1).toString(), {
        expirationTtl: 86400
      });

      // 修改为你的 R2 公开域名
      const publicUrl = `https://pub-你的R2域名.r2.dev/${objectKey}`;
      const usedGB = (newTotalSize / 1024 / 1024 / 1024).toFixed(2);
      const usagePercent = ((newTotalSize / MAX_SIZE_BYTES) * 100).toFixed(1);

      return new Response(JSON.stringify({
        success: true,
        url: publicUrl,
        key: objectKey,
        storage: {
          used: `${usedGB}GB`,
          total: `${MAX_SIZE_GB}GB`,
          percent: `${usagePercent}%`,
          files: fileCount + 1
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        message: `服务器错误: ${err.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
```

修改代码中的配置：
- `REDIRECT_URL`：你的网站域名
- `ALLOWED_DOMAINS`：添加你的域名
- `publicUrl`：你的 R2 公开域名

点击 **Save and Deploy**

---

## 前端配置

编辑 `js/image-uploader.js`：

```javascript
class ImageUploader {
    constructor() {
        // 改为你的 Worker URL
        this.workerUrl = 'https://image-uploader.你的账号.workers.dev';
        // ...
    }
}
```

重新构建：

```bash
npm run build
```

---

## 测试验证

1. 访问你的网站
2. 制作一个封面
3. 点击"获取外链"按钮
4. 检查结果

### 错误码说明

| 状态码 | 说明 | 解决方法 |
|--------|------|----------|
| 403 | 未授权域名 | 检查 ALLOWED_DOMAINS 配置 |
| 413 | 文件过大 | 压缩图片后重试 |
| 429 | 频率超限 | 等待后重试 |
| 507 | 存储已满 | 清理 R2 存储桶 |

---

## 常见问题

**Q: 上传后显示 500 错误？**

检查 Worker 的 Bindings：
- R2 变量名必须是 `MY_BUCKET`
- KV 变量名必须是 `STATS_KV`

**Q: 图片上传成功但无法访问？**

检查 R2 存储桶的 Public access 是否已开启。

**Q: 会产生费用吗？**

个人博客使用免费额度完全够用。

---

## 架构总结

```
用户浏览器
    ↓ POST 请求 + 图片
Cloudflare Worker
    ↓ 检查域名/频率/大小/容量
Cloudflare R2
    ↓ 存储图片
返回公开 URL
```

---

## 配置清单

- [ ] 创建 R2 存储桶并开启公开访问
- [ ] 创建 KV 命名空间 `image-storage-stats`
- [ ] 创建 Worker 并绑定 R2（`MY_BUCKET`）和 KV（`STATS_KV`）
- [ ] 修改 Worker 代码中的域名配置
- [ ] 修改前端 `workerUrl`
- [ ] 重新构建并部署

---

<div align="center">

### 配置完成后即可使用图床功能！

</div>
