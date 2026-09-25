# Môi trường phát triển Windows, macOS và Docker

## Mục tiêu

Một source tree và lockfile chạy nhất quán trên Windows, macOS, Linux CI và Linux container. Docker là lựa chọn phát triển chuẩn hóa, không phải runtime cho mã học sinh.

## Phiên bản nền tảng

- Node.js 24.x; production container `node:24-alpine`.
- pnpm 11.19.0 qua Corepack.
- TypeScript 6.0.3, React 19.3.0, Vite 8.3.0.
- Không pin `platform` trong Compose để Docker Desktop chọn `linux/amd64` hoặc `linux/arm64` phù hợp máy.

## Quy ước filesystem

Workspace có thể nằm trên NTFS, APFS hoặc exFAT. Vì exFAT trên Windows không hỗ trợ symlink cần thiết cho pnpm mặc định:

- pnpm dùng `nodeLinker: hoisted`.
- App import shared source qua TypeScript/Vite aliases, không phụ thuộc workspace symlink.
- Không commit `node_modules` hay pnpm store.
- Nếu di chuyển repo sang filesystem khác, không tự ý đổi linker nếu chưa kiểm tra cả host và Docker.

Production build dùng Vite `--configLoader native` với Node 24 đã pin. Thiết lập này chạy trên
Windows, macOS và Linux, đồng thời tránh việc bundle loader gọi lệnh ánh xạ ổ đĩa Windows trong môi
trường phát triển bị giới hạn quyền.

## Docker development

`compose.yaml` chạy hai Vite dev server, bind mount source, giữ `node_modules` Linux trong named volume và bật polling cho Docker Desktop. Có thể đổi host ports bằng `ADMIN_PORT` và `LEARNER_PORT`.

Không đặt key vào Compose. `.env.example` chỉ chứa tên biến. Khi backend được triển khai, secrets dùng cơ chế environment/secret của môi trường chạy và không commit vào Git.

## Production image

`Dockerfile` có các stage:

1. `base`: Node và pnpm đã pin.
2. `dependencies`: cài đúng lockfile với cache BuildKit.
3. `dev`: source + Vite development.
4. `build`: build app được chọn bằng `APP_NAME` allowlist.
5. `runtime`: chỉ chứa static output và server Node tối thiểu chạy bằng user `node`.

Hai app là hai image riêng nhưng dùng cùng Dockerfile. Đây chưa phải cấu hình production deployment, TLS, CDN hay backend.

## Lệnh xác minh

```bash
pnpm quality
pnpm e2e
docker compose config
docker build --build-arg APP_NAME=admin-studio -t ilp/admin:local .
docker build --build-arg APP_NAME=learning-workspace -t ilp/learner:local .
```

Trên máy có xung đột cổng, đặt `ADMIN_PORT`/`LEARNER_PORT` trước `docker compose up`.

## Python runner

Local development phục vụ `python-runner.html` từ cùng Vite server và chỉ tạo iframe/Worker khi học
sinh bấm `Chạy mã`. Pyodide được pin `0.29.5`; `input()` chưa có stdin UI nên trả lỗi tiếng Việt rõ
ràng. Stop/timeout terminate Worker và lượt chạy tiếp theo tạo Worker mới.

Production không fallback về app origin. Cấu hình URL đầy đủ trong biến sau:

```bash
VITE_PYTHON_RUNNER_URL=https://python-runner.example.edu/python-runner.html
```

Runner origin phải không nhận platform cookie/token, chỉ cho phép parent origin đã cấu hình và gửi CSP
bằng HTTP response header cho cả HTML lẫn Worker assets. Cho tới khi hạ tầng đó tồn tại, production
build giữ nút chạy ở trạng thái tắt có giải thích; không coi Worker đơn lẻ là security sandbox.
