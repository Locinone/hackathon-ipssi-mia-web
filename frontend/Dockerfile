# Utilise une image Node pour la construction
FROM node:18-alpine AS build

# Définit le dossier de travail
WORKDIR /

# Copie les fichiers nécessaires et installe les dépendances
COPY package.json ./
RUN npm install --force

EXPOSE 3000

# Copie le reste du code et construit l'application
COPY . .

CMD [ "npm", "run", "dev", "--host", "3000"]