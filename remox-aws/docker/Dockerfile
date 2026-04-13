FROM node:20-alpine

WORKDIR /app

# Instalar dependencias
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --omit=dev

# Copiar código backend y frontend
COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 3000

CMD ["node", "backend/src/server.js"]
