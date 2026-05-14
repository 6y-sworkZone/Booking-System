package handlers

import (
	"booking-system/config"
	"booking-system/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateScheduleRequest struct {
	ProviderID uint   `json:"provider_id" binding:"required"`
	ServiceID  uint   `json:"service_id" binding:"required"`
	Date       string `json:"date" binding:"required"`
	StartTime  string `json:"start_time" binding:"required"`
	EndTime    string `json:"end_time" binding:"required"`
}

type BatchScheduleRequest struct {
	ProviderID  uint     `json:"provider_id" binding:"required"`
	ServiceID   uint     `json:"service_id" binding:"required"`
	Dates       []string `json:"dates" binding:"required"`
	StartTime   string   `json:"start_time" binding:"required"`
	EndTime     string   `json:"end_time" binding:"required"`
}

type DayOffRequest struct {
	ProviderID uint   `json:"provider_id" binding:"required"`
	Date       string `json:"date" binding:"required"`
	Reason     string `json:"reason"`
}

func GetSchedules(c *gin.Context) {
	providerID := c.Query("provider_id")
	serviceID := c.Query("service_id")
	date := c.Query("date")

	var schedules []models.Schedule
	query := config.DB.Model(&models.Schedule{})

	if providerID != "" {
		query = query.Where("provider_id = ?", providerID)
	}
	if serviceID != "" {
		query = query.Where("service_id = ?", serviceID)
	}
	if date != "" {
		query = query.Where("date = ?", date)
	}

	query.Find(&schedules)
	c.JSON(http.StatusOK, gin.H{"data": schedules})
}

func GetAvailableSlots(c *gin.Context) {
	providerID := c.Query("provider_id")
	serviceID := c.Query("service_id")
	date := c.Query("date")

	if providerID == "" || serviceID == "" || date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required parameters"})
		return
	}

	var dayOff models.DayOff
	result := config.DB.Where("provider_id = ? AND date = ?", providerID, date).First(&dayOff)
	if result.Error == nil {
		c.JSON(http.StatusOK, gin.H{"data": []models.Schedule{}, "is_day_off": true})
		return
	}

	var schedules []models.Schedule
	config.DB.Where("provider_id = ? AND service_id = ? AND date = ? AND is_available = ?", 
		providerID, serviceID, date, true).Find(&schedules)

	var bookedSlots []models.Booking
	config.DB.Where("provider_id = ? AND service_id = ? AND date = ? AND status IN ?", 
		providerID, serviceID, date, []int{1, 2}).Select("start_time, end_time").Find(&bookedSlots)

	availableSlots := make([]map[string]interface{}, 0)
	for _, schedule := range schedules {
		booked := false
		for _, bookedSlot := range bookedSlots {
			if schedule.StartTime == bookedSlot.StartTime && schedule.EndTime == bookedSlot.EndTime {
				booked = true
				break
			}
		}
		if !booked {
			availableSlots = append(availableSlots, map[string]interface{}{
				"id":         schedule.ID,
				"start_time": schedule.StartTime,
				"end_time":   schedule.EndTime,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": availableSlots, "is_day_off": false})
}

func CreateSchedule(c *gin.Context) {
	var req CreateScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	schedule := models.Schedule{
		ProviderID:  req.ProviderID,
		ServiceID:   req.ServiceID,
		Date:        req.Date,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		IsAvailable: true,
	}

	config.DB.Create(&schedule)
	c.JSON(http.StatusCreated, gin.H{"data": schedule})
}

func BatchCreateSchedule(c *gin.Context) {
	var req BatchScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var createdSchedules []models.Schedule
	for _, date := range req.Dates {
		schedule := models.Schedule{
			ProviderID:  req.ProviderID,
			ServiceID:   req.ServiceID,
			Date:        date,
			StartTime:   req.StartTime,
			EndTime:     req.EndTime,
			IsAvailable: true,
		}
		config.DB.Create(&schedule)
		createdSchedules = append(createdSchedules, schedule)
	}

	c.JSON(http.StatusCreated, gin.H{"data": createdSchedules})
}

func DeleteSchedule(c *gin.Context) {
	var schedule models.Schedule
	if err := config.DB.First(&schedule, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	config.DB.Delete(&schedule)
	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}

func GetDayOffs(c *gin.Context) {
	providerID := c.Query("provider_id")
	date := c.Query("date")

	var dayOffs []models.DayOff
	query := config.DB.Model(&models.DayOff{})

	if providerID != "" {
		query = query.Where("provider_id = ?", providerID)
	}
	if date != "" {
		query = query.Where("date = ?", date)
	}

	query.Find(&dayOffs)
	c.JSON(http.StatusOK, gin.H{"data": dayOffs})
}

func CreateDayOff(c *gin.Context) {
	var req DayOffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dayOff := models.DayOff{
		ProviderID: req.ProviderID,
		Date:       req.Date,
		Reason:     req.Reason,
	}

	config.DB.Create(&dayOff)
	c.JSON(http.StatusCreated, gin.H{"data": dayOff})
}

func DeleteDayOff(c *gin.Context) {
	var dayOff models.DayOff
	if err := config.DB.First(&dayOff, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Day off not found"})
		return
	}

	config.DB.Delete(&dayOff)
	c.JSON(http.StatusOK, gin.H{"message": "Day off deleted successfully"})
}
