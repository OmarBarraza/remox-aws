# 🚀 Guía de Despliegue en AWS EC2 — Remox

Esta guía asume que partes de cero con una cuenta de AWS.

---

## PASO 1 — Crear la instancia EC2

1. Entra a https://console.aws.amazon.com y ve a **EC2 → Launch Instance**.
2. Configura:
   - **Name:** `remox-server`
   - **AMI:** Ubuntu Server 24.04 LTS (Free Tier eligible)
   - **Instance type:** `t2.micro` (gratis hasta 750 h/mes)
   - **Key pair:** Crea uno nuevo, llámalo `remox-key`, descarga el `.pem`
3. En **Network settings → Edit**:
   - Crea un Security Group llamado `remox-sg`
   - Agrega estas reglas de entrada (Inbound rules):
     | Type  | Port | Source    |
     |-------|------|-----------|
     | SSH   | 22   | My IP     |
     | HTTP  | 80   | 0.0.0.0/0 |
     | HTTPS | 443  | 0.0.0.0/0 |
4. Haz clic en **Launch Instance**.
5. Copia la **Public IPv4 address** de tu instancia (ej. `54.123.45.67`).

---

## PASO 2 — Conectarte a la instancia por SSH

En tu computadora (terminal / PowerShell):

```bash
# Mac/Linux
chmod 400 ~/Downloads/remox-key.pem
ssh -i ~/Downloads/remox-key.pem ubuntu@TU_IP_PUBLICA

# Windows (PowerShell)
ssh -i C:\Users\TU_USUARIO\Downloads\remox-key.pem ubuntu@TU_IP_PUBLICA
```

---

## PASO 3 — Instalar dependencias en el servidor

Una vez conectado por SSH, ejecuta estos comandos uno por uno:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar versiones
node -v   # debe mostrar v20.x.x
npm -v

# Instalar Nginx
sudo apt install -y nginx

# Instalar PM2 (gestor de procesos Node.js)
sudo npm install -g pm2

# Instalar Git
sudo apt install -y git
```

---

## PASO 4 — Subir tu proyecto al servidor

### Opción A — Usando Git (recomendado)

En tu PC, primero sube el proyecto a GitHub:
```bash
cd remox-aws
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/TU_USUARIO/remox.git
git push -u origin main
```

En el servidor:
```bash
cd ~
git clone https://github.com/TU_USUARIO/remox.git remox-aws
cd remox-aws
```

### Opción B — Usando SCP (copia directa)

En tu PC (terminal local, no SSH):
```bash
scp -i ~/Downloads/remox-key.pem -r ./remox-aws ubuntu@TU_IP_PUBLICA:~/remox-aws
```

---

## PASO 5 — Instalar dependencias Node.js

En el servidor:
```bash
cd ~/remox-aws/backend
npm install
```

---

## PASO 6 — Configurar Nginx

```bash
# Copiar la configuración
sudo cp ~/remox-aws/nginx/default.conf /etc/nginx/conf.d/remox.conf

# Eliminar el archivo default que trae Nginx
sudo rm -f /etc/nginx/sites-enabled/default

# Crear la carpeta donde Nginx servirá el frontend
sudo mkdir -p /var/www/remox/frontend
sudo cp -r ~/remox-aws/frontend/public /var/www/remox/frontend/public

# Dar permisos
sudo chown -R www-data:www-data /var/www/remox

# Probar que la configuración no tenga errores
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## PASO 7 — Iniciar el backend con PM2

```bash
cd ~/remox-aws

# Iniciar el servidor
pm2 start backend/src/server.js --name remox-api

# Verificar que está corriendo
pm2 status

# Ver logs en tiempo real
pm2 logs remox-api

# Hacer que PM2 inicie automáticamente al reiniciar el servidor
pm2 save
pm2 startup   # copia y ejecuta el comando que te muestre
```

---

## PASO 8 — Verificar que todo funciona

En tu navegador, abre:
- `http://TU_IP_PUBLICA` → debe mostrar el frontend RE/MAX
- `http://TU_IP_PUBLICA/api/health` → debe responder `{"ok":true}`
- `http://TU_IP_PUBLICA/api/propiedades` → debe devolver propiedades

---

## PASO 9 (Opcional) — Dominio propio + HTTPS

Si tienes un dominio (ej. `remox.tudominio.com`):

1. En tu proveedor de DNS, crea un registro **A** apuntando a `TU_IP_PUBLICA`.
2. En el servidor:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d remox.tudominio.com
```
Certbot configura HTTPS automáticamente y renueva el certificado solo.

---

## Comandos útiles del día a día

```bash
# Ver estado de la app
pm2 status

# Reiniciar la app (tras actualizar código)
pm2 restart remox-api

# Ver logs
pm2 logs remox-api --lines 50

# Actualizar código desde Git
cd ~/remox-aws && git pull && pm2 restart remox-api

# Reiniciar Nginx
sudo systemctl reload nginx
```

---

## Estructura final del proyecto

```
remox-aws/
├── frontend/
│   └── public/          ← HTML, CSS, JS, imágenes (servido por Nginx)
├── backend/
│   ├── src/
│   │   └── server.js    ← Proxy Node.js (corriendo con PM2)
│   └── package.json
├── nginx/
│   └── default.conf     ← Configuración de Nginx
├── docker/
│   └── Dockerfile       ← (opcional, para Docker)
├── docker-compose.yml
├── .env
└── .env.production
```
