# QlyThietBiCNTT - IT Equipment Management Design Spec

## 1. Mục tiêu Dự án (Goal Description)
Ứng dụng web nâng cao dùng để quản lý thiết bị công nghệ thông tin (CNTT). Hệ thống thay thế quy trình quản lý bằng Excel hiện tại, giúp dữ liệu được chuẩn hóa, quản lý thiết bị theo vòng đời (Lifecycle) và hiển thị trực quan dưới dạng bảng cây phân cấp (Tree Table).

## 2. Kiến trúc Công nghệ (Architecture)
- **Frontend Stack**: ReactJS (Vite), Tailwind CSS, ShadCN UI
- **Data Table**: `@tanstack/react-table` để xử lý gom nhóm tự động (Tree Table rendering)
- **Backend/DB**: Supabase (PostgreSQL, Authentication & Row Level Security)

## 3. Kiến trúc CSDL (Database Schema)
Sử dụng mô hình chuẩn hóa với Bảng Mật (Core Table) và các Bảng Danh mục (Lookup Tables).

### 3.1 Bảng Danh mục (Lookup Tables)
- `categories`: Bảng Cây phân cấp (id, name, parent_id). Hỗ trợ phân cấp n-cấp.
- `device_types`: Loại thiết bị (Switch/router, Server...).
- `functions`: Nhiệm vụ chức năng.
- `locations`: Vị trí đặt/gắn thiết bị.
- `license_statuses`: Trạng thái bản quyền.

### 3.2 Bảng Thiết bị (Core: `equipments`)
- `id` (UUID, Primary Key)
- `category_id` (FK -> categories)
- `device_type_id` (FK -> device_types)
- `model` (Text)
- `ip_address` (Text)
- `quantity` (Integer)
- `function_id` (FK -> functions)
- `location_id` (FK -> locations)
- `location_qty` (Integer)
- `eol_date`, `eoss_date`, `license_end_date` (Date)
- `license_status_id` (FK -> license_statuses)
- `replacement_phase` (Text/Integer)
- `replaced_by_id` (FK -> equipments.id, tự tham chiếu đến thiết bị thay mới)

## 4. UI/UX Flow & Nhóm Màn hình chính
1. **Dashboard & Bảng Thiết bị chính**:
   - Dữ liệu phẳng lấy từ Supabase qua Join APIs, giao UI client đẩy qua TanStack render thành dạng Danh mục Cha-Con (Grouped Rows).
   - Nút chức năng: Thêm mới, Sửa, Xóa thiết bị.
2. **Form Thêm/Sửa Thiết bị (Modal/Dialog)**:
   - Các trường tham chiếu đến danh mục được hiển thị dưới dạng Dropdown Select (chọn `category`, chọn `location`...) nhằm ngăn chặn việc sai lệch dữ liệu hệ thống.
3. **Màn hình Quản trị Danh mục (Data Dictionary Admin)**:
   - Hệ thống Màn hình Cài đặt (Settings) độc lập.
   - Cho phép định nghĩa (Thêm/Sửa/Xóa) nội dung của các bảng `categories`, `device_types`, `functions`, `locations`, `license_statuses`.
