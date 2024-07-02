# Используем официальный образ Node.js версии 22 в качестве базового образа
FROM node:22 AS build

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json (если он есть) в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Копируем остальные файлы проекта в рабочую директорию
COPY . ./

# Собираем приложение
RUN npm run build

# Используем nginx для сервировки собранного приложения
FROM nginx:alpine

# Копируем конфигурацию nginx для виртуального хоста
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение в nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Экспонируем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
