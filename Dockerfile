FROM alpine:3.20

RUN apk add --no-cache nginx nginx-mod-http-brotli

RUN sed -i 's#error_log .*#error_log /dev/stderr warn;#' /etc/nginx/nginx.conf \
 && sed -i 's#access_log .*#access_log /dev/stdout;#' /etc/nginx/nginx.conf \
 && sed -i '/^user /d' /etc/nginx/nginx.conf \
 && sed -i 's#^pid .*#pid /run/nginx/nginx.pid;#' /etc/nginx/nginx.conf

RUN rm -f /etc/nginx/http.d/default.conf /etc/nginx/conf.d/default.conf || true
RUN mkdir -p \
      /run/nginx \
      /var/lib/nginx/tmp/client_body \
      /var/lib/nginx/tmp/proxy \
      /var/lib/nginx/tmp/fastcgi \
      /var/lib/nginx/tmp/uwsgi \
      /var/lib/nginx/tmp/scgi \
      /usr/share/nginx/html \
 && chown -R nginx:nginx /run/nginx /var/lib/nginx /usr/share/nginx/html

EXPOSE 8080

COPY --chown=nginx:nginx ./dist /usr/share/nginx/html
COPY nginx/site.conf /etc/nginx/http.d/default.conf

HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

STOPSIGNAL SIGTERM
USER nginx
CMD ["nginx", "-g", "daemon off;"]
