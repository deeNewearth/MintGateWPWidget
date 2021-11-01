FROM wordpress:5-php7.2-apache

RUN pecl install -f xdebug \
  && echo "zend_extension=$(find /usr/local/lib/php/extensions/ -name xdebug.so)" > /usr/local/etc/php/conf.d/xdebug.ini \
  && echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/xdebug.ini \
  && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/xdebug.ini \
  && echo "xdebug.start_with_request=trigger" >> /usr/local/etc/php/conf.d/xdebug.ini \
  && echo "error_log = /var/log/apache2/error.log" >> /usr/local/etc/php/conf.d/error-logging.ini \
  ;