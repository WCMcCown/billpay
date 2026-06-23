FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite (if you ever need it)
RUN a2enmod rewrite

# Copy your backend code
COPY . /var/www/html
