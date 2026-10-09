# Despliegue AWS: frontend + ALB interno

## Frontend

```bash
cd ~/clinica_cloud/frontend
npm ci
npm run build

sudo rm -rf /usr/share/nginx/html/*
sudo cp -r dist/* /usr/share/nginx/html/
sudo chown -R nginx:nginx /usr/share/nginx/html
```

## Nginx

1. Copiar la plantilla:

```bash
sudo cp ~/clinica_cloud/infra/nginx/clinica.conf.template \
  /etc/nginx/conf.d/clinica.conf
```

2. Editar la configuración:

```bash
sudo nano /etc/nginx/conf.d/clinica.conf
```

3. Reemplazar `REEMPLAZAR_CON_DNS_DEL_ALB_INTERNO` por el DNS real del ALB interno.

4. Validar e iniciar:

```bash
sudo nginx -t
sudo systemctl enable --now nginx
```

## Flujo de red

Navegador → Nginx :80 → `/api` → ALB interno :80 → FastAPI :8000 → PostgreSQL :5432

## Pruebas

```bash
curl -I http://localhost/
curl -i http://localhost/api/health
```
