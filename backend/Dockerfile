# syntax=docker/dockerfile:1
# backend/Dockerfile
# Builds a PHP 8.2 Apache image with PDO MySQL for deployment on Render.
# Local development uses XAMPP directly — Docker is for production.

FROM php:8.2-apache

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql && \
    a2enmod rewrite headers

# Copy Apache virtual host config
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Copy backend source code into webroot
COPY . /var/www/html/

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
