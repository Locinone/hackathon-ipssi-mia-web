# Utilise une image Node pour la construction
FROM node:18 AS build

# Définit le dossier de travail
WORKDIR /

# Copie les fichiers nécessaires et installe les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copie le reste du code et construit l'application
COPY . .
RUN npm run dev