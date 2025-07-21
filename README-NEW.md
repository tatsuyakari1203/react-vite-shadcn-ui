# Image Name Processor - Vue 3 Version

Ứng dụng xử lý tên ảnh được xây dựng lại bằng Vue 3, Vite, Tailwind CSS và Shadcn UI.

## Tính năng

- ✨ **Xử lý dãy số**: Tự động phân tách và format dãy số tên ảnh
- 📋 **Copy kết quả**: Sao chép toàn bộ hoặc chỉ số hợp lệ
- 💾 **Lưu trữ lịch sử**: Lưu và quản lý các kết quả đã xử lý
- 📤 **Import/Export**: Sao lưu và khôi phục dữ liệu
- ⚠️ **Cảnh báo thông minh**: Phát hiện số không phù hợp
- 📱 **Responsive**: Tối ưu cho mọi thiết bị
- 🎨 **UI hiện đại**: Giao diện đẹp với dark theme

## Công nghệ sử dụng

- **Vue 3** - Framework JavaScript hiện đại <mcreference link="https://www.shadcn-vue.com/docs/installation/vite" index="2">2</mcreference>
- **Vite** - Build tool nhanh chóng <mcreference link="https://www.shadcn-vue.com/docs/installation/vite" index="2">2</mcreference>
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework <mcreference link="https://www.shadcn-vue.com/docs/installation/vite" index="2">2</mcreference>
- **Shadcn UI** - Component library hiện đại <mcreference link="https://www.shadcn-vue.com/docs/installation/vite" index="2">2</mcreference>
- **Lucide Vue** - Icon library

## Cài đặt và chạy

### Yêu cầu
- Node.js >= 16
- npm hoặc pnpm

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd image-name-processor
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Chạy development server**
   ```bash
   npm run dev
   ```

4. **Mở trình duyệt**
   Truy cập `http://localhost:5173`

### Build cho production

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Cách sử dụng

### Xử lý tên ảnh

1. **Nhập dữ liệu**: Dán dãy số tên ảnh vào ô textarea
2. **Xử lý**: Nhấn nút "Xử Lý" để format dữ liệu
3. **Xem kết quả**: Kết quả hiển thị với số lượng ảnh được đếm
4. **Copy**: Sử dụng "Copy" hoặc "Copy Valid" để sao chép
5. **Lưu**: Nhấn "Lưu" để lưu vào lịch sử

### Quản lý lịch sử

- **Xem lịch sử**: Sidebar bên phải hiển thị các box đã lưu
- **Đổi tên**: Click vào tên box để đổi tên
- **Copy nội dung**: Nhấn icon copy để sao chép nội dung box
- **Xóa**: Nhấn icon thùng rác để xóa box
- **Export**: Nhấn icon download để xuất dữ liệu ra file JSON
- **Import**: Nhấn icon upload để nhập dữ liệu từ file JSON

### Sử dụng với Adobe Lightroom

1. Vào tab **Library**, nhấn phím **G**
2. Nhấn phím **"\"** để hiển thị Filter Bar
3. Nhấn vào **Text** để bắt đầu tìm kiếm
4. Chọn **Any Searchable Field** và **Contains**
5. Dán chuỗi tên ảnh và nhấn Enter

## Cấu trúc dự án

```
src/
├── components/
│   └── ui/              # Shadcn UI components
│       ├── button/
│       ├── card/
│       ├── textarea/
│       ├── alert/
│       └── badge/
├── lib/
│   └── utils.ts         # Utility functions
├── App.vue              # Main application
├── main.ts              # Entry point
└── style.css            # Global styles
```

## Tính năng nổi bật

### 🎯 Xử lý thông minh
- Tự động phát hiện và tách các dãy số
- Loại bỏ số trùng lặp
- Thêm số 0 đầu cho số có 3 chữ số
- Cảnh báo số không phù hợp (1-2 chữ số hoặc 5+ chữ số)

### 💾 Lưu trữ bền vững
- Sử dụng localStorage để lưu dữ liệu
- Import/Export dữ liệu dạng JSON
- Quản lý nhiều box lưu trữ

### 🎨 Giao diện hiện đại
- Dark theme mặc định
- Responsive design
- Smooth animations
- Accessible components

## So sánh với phiên bản cũ

| Tính năng | Phiên bản cũ | Phiên bản mới |
|-----------|--------------|---------------|
| Framework | Vanilla HTML/JS | Vue 3 + TypeScript |
| Styling | Custom CSS | Tailwind + Shadcn UI |
| Build Tool | None | Vite |
| Components | Manual DOM | Reactive Components |
| Type Safety | None | Full TypeScript |
| Performance | Good | Excellent |
| Maintainability | Medium | High |

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - xem file LICENSE để biết thêm chi tiết.