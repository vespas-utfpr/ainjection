FROM node:20-alpine

# Melhor comportamento para ambiente de container
ENV NODE_ENV=production

# Diretório do desafio
WORKDIR /app

# Copia apenas manifestos primeiro para aproveitar cache de build
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do projeto
COPY . .

# Gera os artefatos estáticos antes de trocar para usuário não-root
RUN npm run build

# Usuário não-root (boa prática para CTF)
RUN adduser -D ctf && chown -R ctf:ctf /app
USER ctf

# Porta do serviço
EXPOSE 54322

# Executa a interface do desafio com a build pronta
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "54322"]
