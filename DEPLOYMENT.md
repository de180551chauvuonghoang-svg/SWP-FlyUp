# Hướng dẫn Deploy Dự án Chat Real-time

Dưới đây là các bước chi tiết để đưa dự án của bạn lên môi trường internet miễn phí.

## 1. Chuẩn bị

- Đảm bảo bạn đã **Push** toàn bộ code mới nhất lên **GitHub**.
- Code Frontend đã được cập nhật để nhận biến môi trường `VITE_API_URL` (Mình đã làm giúp bạn ở bước trước).

## 2. Deploy Backend (lên Render)

Render là dịch vụ miễn phí tốt để chạy Node.js server.

1.  Truy cập [Render Dashboard](https://dashboard.render.com/) và đăng nhập bằng GitHub.
2.  Chọn **New +** -> **Web Service**.
3.  Kết nối với repository GitHub của bạn (`SWP-FlyUp`).
4.  Điền thông tin:
    - **Name**: `my-chat-backend` (hoặc tên tùy thích).
    - **Region**: Singapore (cho tốc độ về VN nhanh nhất).
    - **Root Directory**: `backend` (Quan trọng).
    - **Runtime**: Node.
    - **Build Command**: `npm install`.
    - **Start Command**: `npm start`.
5.  **Environment Variables** (Kéo xuống dưới để thêm):
    Copy các giá trị từ file `.env` của bạn vào đây:
    - `MONGO_URI`: ...
    - `JWT_SECRET`: ...
    - `CLOUDINARY_CLOUD_NAME`: ...
    - `CLOUDINARY_API_KEY`: ...
    - `CLOUDINARY_API_SECRET`: ...
    - `RESEND_API_KEY`: ...
    - `EMAIL_FROM`: ...
    - `NODE_ENV`: `production`
    - `CLIENT_URL`: `https://YOUR_VERCEL_APP_URL.vercel.app` (Lúc đầu chưa có link Frontend thì để tạm, sau khi deploy Frontend xong quay lại sửa sau).
6.  Bấm **Create Web Service**.
7.  Đợi build xong, copy link Backend (ví dụ: `https://my-chat-backend.onrender.com`).

## 3. Deploy Frontend (lên Vercel)

Vercel tối ưu tốt nhất cho Vite/React.

1.  Truy cập [Vercel Dashboard](https://vercel.com/dashboard) và đăng nhập.
2.  Bấm **Add New...** -> **Project**.
3.  Import repository GitHub của bạn.
4.  Cấu hình:
    - **Framework Preset**: Vite.
    - **Root Directory**: Chọn `frontend`.
    - **Environment Variables**:
      - Key: `VITE_API_URL`
      - Value: Link Backend bạn vừa copy ở bước 2 (Lưu ý: **KHÔNG** có dấu `/` ở cuối. Ví dụ đúng: `https://my-chat-backend.onrender.com`).
5.  Bấm **Deploy**.
6.  Đợi xong, bạn sẽ có link Frontend chính thức.

## 4. Cập nhật lại Backend

1.  Quay lại Render, vào mục **Environment Variables** của Backend.
2.  Sửa `CLIENT_URL` thành link Frontend chính thức bạn vừa có từ Vercel.
3.  Lưu lại (Save Changes), Render sẽ tự động khởi động lại server.

## Lưu ý

- Server miễn phí của Render sẽ "ngủ" sau 15 phút không hoạt động. Lần truy cập đầu tiên sau khi ngủ sẽ mất khoảng 50s để khởi động.
