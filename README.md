# 预约排班系统

一个基于 React + Golang(Gin) + SQLite 的完整预约排班管理系统。

## 功能特性

### 1. 服务管理
- 服务项目的增删改查
- 服务时长、价格、描述配置

### 2. 服务者管理
- 服务者信息管理
- 绑定可提供的服务
- 状态管理（启用/禁用）

### 3. 排班日历
- 按日期查看排班情况
- 设置可预约时段
- 休息日标记
- 批量排班功能

### 4. 用户预约
- 选择服务、服务者、日期和时段
- 时段冲突检测
- 预约确认、取消、改期

### 5. 预约提醒
- 站内通知
- 即将到期提醒

### 6. 预约管理
- 全部预约列表
- 按状态筛选
- 手动调整预约状态

### 7. 统计报表
- 每日预约量趋势图
- 服务者工作量统计
- 热门服务排行

## 技术栈

### 后端
- Golang 1.21
- Gin Web Framework
- GORM ORM
- SQLite 数据库

### 前端
- React 18
- Material-UI (MUI)
- React Router
- Axios
- Recharts (图表库)
- Day.js (日期处理)

## 项目结构

```
Booking System/
├── backend/                 # 后端服务
│   ├── main.go             # 主入口文件
│   ├── config/             # 配置
│   │   └── database.go     # 数据库配置
│   ├── models/             # 数据模型
│   │   └── models.go       # 所有数据模型定义
│   └── handlers/           # API 处理器
│       ├── service.go      # 服务管理 API
│       ├── provider.go     # 服务者管理 API
│       ├── schedule.go     # 排班管理 API
│       ├── booking.go      # 预约管理 API
│       └── stats.go        # 统计报表 API
├── frontend/               # 前端应用
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── App.js          # 主应用组件
│       ├── index.js        # 入口文件
│       └── pages/          # 页面组件
│           ├── Dashboard.js    # 仪表盘
│           ├── Services.js     # 服务管理
│           ├── Providers.js    # 服务者管理
│           ├── Schedule.js     # 排班日历
│           ├── Booking.js      # 预约服务
│           ├── BookingsList.js # 预约列表
│           └── Stats.js        # 统计报表
└── README.md               # 项目说明
```

## 快速开始

### 环境要求
- Go 1.21+
- Node.js 16+
- npm 或 yarn

### 后端启动

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
go mod download
```

3. 启动服务
```bash
go run main.go
```

后端服务将在 `http://localhost:8765` 启动

### 前端启动

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

前端应用将在 `http://localhost:3456` 启动

## API 接口文档

### 服务管理
- `GET /api/services` - 获取服务列表
- `GET /api/services/:id` - 获取单个服务
- `POST /api/services` - 创建服务
- `PUT /api/services/:id` - 更新服务
- `DELETE /api/services/:id` - 删除服务

### 服务者管理
- `GET /api/providers` - 获取服务者列表
- `GET /api/providers/:id` - 获取单个服务者
- `GET /api/providers/:id/services` - 获取服务者绑定的服务
- `POST /api/providers` - 创建服务者
- `PUT /api/providers/:id` - 更新服务者
- `POST /api/providers/:id/bind-services` - 绑定服务
- `DELETE /api/providers/:id` - 删除服务者

### 排班管理
- `GET /api/schedules` - 获取排班列表
- `GET /api/schedules/available` - 获取可用时段
- `POST /api/schedules` - 创建排班
- `POST /api/schedules/batch` - 批量创建排班
- `DELETE /api/schedules/:id` - 删除排班

### 休息日管理
- `GET /api/day-offs` - 获取休息日列表
- `POST /api/day-offs` - 创建休息日
- `DELETE /api/day-offs/:id` - 删除休息日

### 预约管理
- `GET /api/bookings` - 获取预约列表
- `GET /api/bookings/:id` - 获取单个预约
- `POST /api/bookings` - 创建预约
- `PUT /api/bookings/:id` - 更新预约
- `POST /api/bookings/:id/cancel` - 取消预约
- `POST /api/bookings/:id/reschedule` - 改期预约

### 通知管理
- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/:id/read` - 标记通知已读

### 统计报表
- `GET /api/stats/overview` - 获取概览统计
- `GET /api/stats/daily-bookings` - 获取每日预约统计
- `GET /api/stats/provider-workload` - 获取服务者工作量统计
- `GET /api/stats/popular-services` - 获取热门服务统计

## 数据库模型

### Service (服务)
- ID: 主键
- Name: 服务名称
- Duration: 时长（分钟）
- Price: 价格
- Description: 描述
- CreatedAt, UpdatedAt: 时间戳

### Provider (服务者)
- ID: 主键
- Name: 姓名
- Phone: 电话
- Email: 邮箱
- Avatar: 头像
- Status: 状态（1启用/0禁用）
- CreatedAt, UpdatedAt: 时间戳

### Schedule (排班)
- ID: 主键
- ProviderID: 服务者ID
- ServiceID: 服务ID
- Date: 日期
- StartTime: 开始时间
- EndTime: 结束时间
- IsAvailable: 是否可用
- CreatedAt, UpdatedAt: 时间戳

### Booking (预约)
- ID: 主键
- BookingNo: 预约编号
- CustomerName: 客户姓名
- CustomerPhone: 客户电话
- CustomerEmail: 客户邮箱
- ProviderID: 服务者ID
- ServiceID: 服务ID
- Date: 日期
- StartTime: 开始时间
- EndTime: 结束时间
- Status: 状态（1待确认/2已确认/3已取消）
- Remark: 备注
- ReminderSent: 提醒是否已发送
- CreatedAt, UpdatedAt: 时间戳

### Notification (通知)
- ID: 主键
- BookingID: 预约ID
- Type: 类型
- Content: 内容
- IsRead: 是否已读
- CreatedAt: 时间戳

## 使用说明

1. 首先启动后端服务，数据库会自动创建和迁移
2. 启动前端服务，访问 http://localhost:3456
3. 在"服务管理"中添加服务项目
4. 在"服务者管理"中添加服务者并绑定服务
5. 在"排班日历"中为服务者设置可预约时段
6. 在"预约服务"中进行客户预约
7. 在"预约列表"中管理所有预约
8. 在"统计报表"中查看业务数据

## 端口说明

- 后端服务：8765
- 前端服务：3456

注意：端口已配置为非常用端口，避免与其他服务冲突。

## License

MIT
