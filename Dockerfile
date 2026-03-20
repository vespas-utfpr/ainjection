FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências uma vez e reaproveita cache quando possível.
COPY package.json package-lock.json ./
RUN npm ci

# Copia o projeto completo apenas na etapa de build.
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# O vite preview ainda carrega o vite.config.ts no runtime. Como esse config
# registra a API local e importa código de server/ e src/, o stage final
# precisa manter esses diretórios disponíveis dentro da imagem.
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/dist ./dist

RUN adduser -D ctf && chown -R ctf:ctf /app
USER ctf

EXPOSE 54322

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "54322"]
