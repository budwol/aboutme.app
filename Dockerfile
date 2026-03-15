FROM alpine:3.20

RUN apk add --no-cache nginx nginx-mod-http-brotli curl

RUN sed -i 's#error_log .*#error_log /dev/stderr warn;#' /etc/nginx/nginx.conf \
 && sed -i 's#access_log .*#access_log /dev/stdout;#' /etc/nginx/nginx.conf

RUN rm -f /etc/nginx/http.d/default.conf /etc/nginx/conf.d/default.conf || true

COPY ./dist /usr/share/nginx/html
COPY nginx/site.conf /etc/nginx/http.d/default.conf

HEALTHCHECK --interval=10s --timeout=3s --retries=10 \
  CMD curl --fail http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
