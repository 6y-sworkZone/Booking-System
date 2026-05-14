package handlers

import (
	"booking-system/config"
	"booking-system/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateBookingRequest struct {
	CustomerName  string `json:"customer_name" binding:"required"`
	CustomerPhone string `json:"customer_phone" binding:"required"`
	CustomerEmail string `json:"customer_email"`
	ProviderID    uint   `json:"provider_id" binding:"required"`
	ServiceID     uint   `json:"service_id" binding:"required"`
	Date          string `json:"date" binding:"required"`
	StartTime     string `json:"start_time" binding:"required"`
	EndTime       string `json:"end_time" binding:"required"`
	Remark        string `json:"remark"`
}

type UpdateBookingRequest struct {
	Status *int   `json:"status"`
	Remark string `json:"remark"`
}

type RescheduleRequest struct {
	Date      string `json:"date" binding:"required"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
}

func generateBookingNo() string {
	return fmt.Sprintf("BK%s", uuid.New().String()[:8])
}

func checkTimeConflict(providerID uint, date string, startTime string, endTime string, excludeID uint) bool {
	var count int64
	query := config.DB.Model(&models.Booking{}).
		Where("provider_id = ? AND date = ? AND status IN ?", providerID, date, []int{1, 2})
	
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	
	query.Where("(start_time < ? AND end_time > ?)", endTime, startTime).Count(&count)
	return count > 0
}

func GetBookings(c *gin.Context) {
	status := c.Query("status")
	providerID := c.Query("provider_id")
	date := c.Query("date")

	var bookings []models.Booking
	query := config.DB.Model(&models.Booking{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if providerID != "" {
		query = query.Where("provider_id = ?", providerID)
	}
	if date != "" {
		query = query.Where("date = ?", date)
	}

	query.Order("created_at desc").Find(&bookings)
	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

func GetBooking(c *gin.Context) {
	var booking models.Booking
	if err := config.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": booking})
}

func CreateBooking(c *gin.Context) {
	var req CreateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if checkTimeConflict(req.ProviderID, req.Date, req.StartTime, req.EndTime, 0) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Time slot already booked"})
		return
	}

	booking := models.Booking{
		BookingNo:      generateBookingNo(),
		CustomerName:   req.CustomerName,
		CustomerPhone:  req.CustomerPhone,
		CustomerEmail:  req.CustomerEmail,
		ProviderID:     req.ProviderID,
		ServiceID:      req.ServiceID,
		Date:           req.Date,
		StartTime:      req.StartTime,
		EndTime:        req.EndTime,
		Status:         1,
		Remark:         req.Remark,
		ReminderSent:   false,
	}

	config.DB.Create(&booking)

	notification := models.Notification{
		BookingID: booking.ID,
		Type:      1,
		Content:   fmt.Sprintf("新预约: %s - %s %s", booking.BookingNo, req.Date, req.StartTime),
	}
	config.DB.Create(&notification)

	c.JSON(http.StatusCreated, gin.H{"data": booking})
}

func UpdateBooking(c *gin.Context) {
	var booking models.Booking
	if err := config.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var req UpdateBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != nil {
		booking.Status = *req.Status
	}
	if req.Remark != "" {
		booking.Remark = req.Remark
	}

	config.DB.Save(&booking)
	c.JSON(http.StatusOK, gin.H{"data": booking})
}

func CancelBooking(c *gin.Context) {
	var booking models.Booking
	if err := config.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	booking.Status = 3
	config.DB.Save(&booking)

	notification := models.Notification{
		BookingID: booking.ID,
		Type:      2,
		Content:   fmt.Sprintf("预约已取消: %s", booking.BookingNo),
	}
	config.DB.Create(&notification)

	c.JSON(http.StatusOK, gin.H{"message": "Booking cancelled successfully"})
}

func RescheduleBooking(c *gin.Context) {
	var booking models.Booking
	if err := config.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	var req RescheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if checkTimeConflict(booking.ProviderID, req.Date, req.StartTime, req.EndTime, booking.ID) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Time slot already booked"})
		return
	}

	oldDate := booking.Date
	oldTime := booking.StartTime
	booking.Date = req.Date
	booking.StartTime = req.StartTime
	booking.EndTime = req.EndTime
	config.DB.Save(&booking)

	notification := models.Notification{
		BookingID: booking.ID,
		Type:      3,
		Content:   fmt.Sprintf("预约已改期: %s 从 %s %s 改为 %s %s", 
			booking.BookingNo, oldDate, oldTime, req.Date, req.StartTime),
	}
	config.DB.Create(&notification)

	c.JSON(http.StatusOK, gin.H{"data": booking})
}

func GetNotifications(c *gin.Context) {
	var notifications []models.Notification
	config.DB.Order("created_at desc").Find(&notifications)
	c.JSON(http.StatusOK, gin.H{"data": notifications})
}

func MarkNotificationRead(c *gin.Context) {
	var notification models.Notification
	if err := config.DB.First(&notification, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	notification.IsRead = true
	config.DB.Save(&notification)
	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func CheckUpcomingReminders() {
	var bookings []models.Booking
	today := time.Now().Format("2006-01-02")
	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")

	config.DB.Where("(date = ? OR date = ?) AND status = ? AND reminder_sent = ?",
		today, tomorrow, 1, false).Find(&bookings)

	for _, booking := range bookings {
		notification := models.Notification{
			BookingID: booking.ID,
			Type:      4,
			Content:   fmt.Sprintf("预约提醒: %s 将于 %s %s 开始", 
				booking.BookingNo, booking.Date, booking.StartTime),
		}
		config.DB.Create(&notification)

		booking.ReminderSent = true
		config.DB.Save(&booking)
	}
}
