package models

import (
	"time"

	"gorm.io/gorm"
)

type Service struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Duration    int       `gorm:"not null" json:"duration"`
	Price       float64   `gorm:"not null" json:"price"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Provider struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Email     string    `gorm:"size:100" json:"email"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	Status    int       `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ProviderService struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	ProviderID uint `gorm:"not null;index" json:"provider_id"`
	ServiceID  uint `gorm:"not null;index" json:"service_id"`
}

type Schedule struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProviderID  uint      `gorm:"not null;index" json:"provider_id"`
	ServiceID   uint      `gorm:"not null;index" json:"service_id"`
	Date        string    `gorm:"size:10;not null;index" json:"date"`
	StartTime   string    `gorm:"size:5;not null" json:"start_time"`
	EndTime     string    `gorm:"size:5;not null" json:"end_time"`
	IsAvailable bool     `gorm:"default:true" json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DayOff struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ProviderID  uint      `gorm:"not null;index" json:"provider_id"`
	Date        string    `gorm:"size:10;not null;index" json:"date"`
	Reason      string    `gorm:"size:255" json:"reason"`
	CreatedAt   time.Time `json:"created_at"`
}

type Booking struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	BookingNo      string    `gorm:"size:50;unique;not null" json:"booking_no"`
	CustomerName   string    `gorm:"size:100;not null" json:"customer_name"`
	CustomerPhone  string    `gorm:"size:20;not null" json:"customer_phone"`
	CustomerEmail  string    `gorm:"size:100" json:"customer_email"`
	ProviderID     uint      `gorm:"not null;index" json:"provider_id"`
	ServiceID      uint      `gorm:"not null;index" json:"service_id"`
	Date           string    `gorm:"size:10;not null;index" json:"date"`
	StartTime      string    `gorm:"size:5;not null" json:"start_time"`
	EndTime        string    `gorm:"size:5;not null" json:"end_time"`
	Status         int       `gorm:"default:1" json:"status"`
	Remark         string    `gorm:"type:text" json:"remark"`
	ReminderSent  bool      `gorm:"default:false" json:"reminder_sent"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	BookingID  uint      `gorm:"not null;index" json:"booking_id"`
	Type      int       `gorm:"not null" json:"type"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
