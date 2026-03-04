FROM node:20-alpine

# Melhor comportamento para ambiente de container
ENV NODE_ENV=development

# Diretorio do desafio
WORKDIR /app

# Copia apenas manifestos primeiro para aproveitar cache de build
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do projeto
COPY . .

# Usuario nao-root (boa pratica para CTF)
RUN adduser -D ctf && chown -R ctf:ctf /app
USER ctf

# Porta do servico
EXPOSE 54322

# Executa a interface do desafio
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "54322"]
