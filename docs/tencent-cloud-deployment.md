# 腾讯云部署指南

## 一、服务器准备

### 1. 选购腾讯云服务器

推荐配置：
- **轻量应用服务器**（适合初创项目）：
  - 2核4G内存，80GB SSD，4Mbps带宽
  - 操作系统：Ubuntu 22.04 LTS

- **云服务器 CVM**（适合正式生产环境）：
  - 2核4G内存，100GB SSD，5Mbps带宽
  - 操作系统：Ubuntu 22.04 LTS

### 2. 安全组配置

在腾讯云控制台 → 云服务器 → 安全组，添加以下规则：

| 协议 | 端口 | 来源 | 说明 |
|------|------|------|------|
| TCP | 22 | 0.0.0.0/0 | SSH |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 3000 | 127.0.0.1/32 | Next.js（仅本地） |

**注意**：生产环境不要直接暴露 3000 端口，使用反向代理。

## 二、服务器初始化

### 1. SSH 连接服务器

```bash
# 使用腾讯云提供的密钥或密码登录
ssh ubuntu@你的服务器IP
```

### 2. 系统更新

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. 安装 Docker

```bash
# 安装依赖
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release -y

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 软件源
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# 验证安装
docker --version
docker compose version

# 添加用户到 docker 组（免 sudo 运行）
sudo usermod -aG docker $USER
# 重新登录生效
```

## 三、域名和 SSL 证书

### 1. 域名配置

在腾讯云 DNS 解析控制台：
1. 添加 A 记录：`@` → 指向服务器 IP
2. 添加 A 记录：`www` → 指向服务器 IP

### 2. 申请 SSL 证书（两种方式）

#### 方式一：腾讯云 SSL 证书（推荐）

1. 进入 [腾讯云 SSL 证书控制台](https://console.cloud.tencent.com/ssl)
2. 申请免费 SSL 证书（TrustAsia DV SSL）
3. 验证域名所有权（DNS 验证或文件验证）
4. 下载 Nginx 格式的证书文件
5. 解压后将 `.crt` 和 `.key` 文件上传到服务器 `/opt/ssl/` 目录

```bash
# 在服务器上创建 SSL 目录
sudo mkdir -p /opt/ssl
sudo chmod 700 /opt/ssl

# 本地上传证书（使用 scp）
scp /本地路径/证书.crt ubuntu@服务器IP:/opt/ssl/watchbird.crt
scp /本地路径/证书.key ubuntu@服务器IP:/opt/ssl/watchbird.key
```

#### 方式二：Let's Encrypt（自动续期）

使用 Caddy 服务器，它会自动申请和续期 Let's Encrypt 证书。

## 四、部署应用

### 1. 上传项目代码

```bash
# 方式一：使用 Git（推荐）
# 在服务器上
mkdir -p /opt/watchbird && cd /opt/watchbird
git clone https://github.com/你的用户名/watchbird.git .

# 方式二：使用 SCP 打包上传
# 本地执行
tar -czf watchbird.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' .
scp watchbird.tar.gz ubuntu@服务器IP:/opt/

# 服务器上解压
ssh ubuntu@服务器IP "cd /opt && tar -xzf watchbird.tar.gz && rm watchbird.tar.gz"
```

### 2. 配置环境变量

```bash
cd /opt/watchbird

# 复制示例配置
cp .env.example .env

# 编辑配置文件
nano .env
```

`.env` 文件内容示例：

```env
# 基础配置
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://watchbird.cn

# 生成强密码：openssl rand -base64 32
NEXTAUTH_SECRET=你的32位随机字符串

# 数据库（使用 Docker Compose 内部网络）
DB_PASSWORD=你的强密码
DATABASE_URL="postgresql://postgres:你的强密码@db:5432/watchbird?schema=public"

# 可选：微信支付配置
WECHAT_APP_ID="wx你的appid"
WECHAT_APP_SECRET="你的appsecret"
WECHAT_MCH_ID="你的商户号"
WECHAT_API_KEY="你的API密钥"

# 可选：腾讯云 COS 配置（图片存储）
COS_SECRET_ID="你的SecretId"
COS_SECRET_KEY="你的SecretKey"
COS_REGION="ap-beijing"
COS_BUCKET="你的bucket名称"
```

### 3. 启动应用

```bash
cd /opt/watchbird

# 构建镜像
docker compose build

# 后台启动
docker compose up -d

# 查看状态
docker compose ps

# 运行数据库迁移
docker compose exec app npx prisma migrate deploy

# 查看日志
docker compose logs -f app
```

## 五、配置反向代理（Caddy）

使用 Caddy 可以自动处理 HTTPS 和证书续期。

### 1. 安装 Caddy

```bash
# 安装 Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy -y
```

### 2. 配置 Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
```

内容：

```caddy
# 你的域名
watchbird.cn {
    # 反向代理到 Next.js
    reverse_proxy localhost:3000

    # 压缩
    encode gzip

    # 安全响应头
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
    }

    # 静态文件缓存
    @static {
        file
        path *.ico *.css *.js *.gif *.jpg *.jpeg *.png *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    # 日志
    log {
        output file /var/log/caddy/watchbird.log
        format json
    }
}

# www 重定向到主域名
www.watchbird.cn {
    redir https://watchbird.cn{uri}
}
```

### 3. 启动 Caddy

```bash
# 验证配置
sudo caddy validate --config /etc/caddy/Caddyfile

# 重载配置
sudo systemctl reload caddy

# 查看状态
sudo systemctl status caddy
```

Caddy 会自动申请 Let's Encrypt 证书并续期。

## 六、配置反向代理（Nginx）

如果使用腾讯云 SSL 证书，推荐使用 Nginx。

### 1. 安装 Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### 2. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/watchbird
```

内容：

```nginx
upstream nextjs {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name watchbird.cn www.watchbird.cn;

    # HTTP 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name watchbird.cn;

    # SSL 证书（腾讯云下载的证书）
    ssl_certificate /opt/ssl/watchbird.crt;
    ssl_certificate_key /opt/ssl/watchbird.key;

    # SSL 优化
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 日志
    access_log /var/log/nginx/watchbird-access.log;
    error_log /var/log/nginx/watchbird-error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://nextjs;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
        proxy_pass http://nextjs;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# www 重定向
server {
    listen 443 ssl http2;
    server_name www.watchbird.cn;

    ssl_certificate /opt/ssl/watchbird.crt;
    ssl_certificate_key /opt/ssl/watchbird.key;

    return 301 https://watchbird.cn$request_uri;
}
```

### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/watchbird /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 七、更新部署脚本

创建一键部署脚本：

```bash
nano /opt/watchbird/deploy.sh
```

内容：

```bash
#!/bin/bash
set -e

echo "🚀 开始部署 WatchBird..."

# 拉取最新代码
echo "📥 拉取代码..."
cd /opt/watchbird
git pull origin main

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker compose build --no-cache

# 停止旧容器
echo "🛑 停止旧容器..."
docker compose down

# 启动新容器
echo "▶️ 启动新容器..."
docker compose up -d

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
docker compose exec -T app npx prisma migrate deploy

# 清理旧镜像
echo "🧹 清理旧镜像..."
docker image prune -f

echo "✅ 部署完成！"
echo "查看日志: docker compose logs -f app"
```

赋予执行权限：

```bash
chmod +x /opt/watchbird/deploy.sh
```

## 八、监控和维护

### 1. 查看日志

```bash
# 应用日志
docker compose logs -f app

# Nginx 日志（如果使用 Nginx）
sudo tail -f /var/log/nginx/watchbird-error.log

# Caddy 日志（如果使用 Caddy）
sudo tail -f /var/log/caddy/watchbird.log
```

### 2. 数据库备份

```bash
# 创建备份脚本
nano /opt/watchbird/backup.sh
```

内容：

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "🔄 备份数据库..."
cd /opt/watchbird
docker compose exec -T db pg_dump -U postgres watchbird > $BACKUP_DIR/watchbird_$DATE.sql

# 保留最近 7 天的备份
echo "🧹 清理旧备份..."
find $BACKUP_DIR -name "watchbird_*.sql" -mtime +7 -delete

echo "✅ 备份完成: $BACKUP_DIR/watchbird_$DATE.sql"
```

添加定时任务：

```bash
chmod +x /opt/watchbird/backup.sh

# 添加定时任务（每天凌晨 3 点备份）
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/watchbird/backup.sh >> /var/log/backup.log 2>&1") | crontab -

# 查看定时任务
crontab -l
```

### 3. 系统监控

```bash
# 安装 htop 查看系统状态
sudo apt install htop -y
htop

# 查看 Docker 容器状态
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

## 九、故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker compose logs app

# 检查端口占用
sudo netstat -tlnp | grep 3000

# 重启容器
docker compose restart app
```

### 2. 数据库连接失败

```bash
# 检查数据库容器状态
docker compose ps db

# 查看数据库日志
docker compose logs db

# 测试数据库连接
docker compose exec app node -e "console.log(process.env.DATABASE_URL)"
```

### 3. HTTPS 无法访问

```bash
# 检查防火墙
sudo ufw status

# 检查安全组配置（在腾讯云控制台）

# 检查 Nginx/Caddy 状态
sudo systemctl status nginx
sudo systemctl status caddy

# 检查证书
curl -v https://watchbird.cn
```

## 十、CI/CD 自动化部署（可选）

可以使用腾讯云 DevOps、GitHub Actions 或 GitLab CI 实现自动化部署。

详见 `docs/ci-cd.md`。
