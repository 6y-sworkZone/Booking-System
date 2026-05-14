package handlers

import (
	"booking-system/config"
	"booking-system/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GetDailyBookings(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" {
		startDate = time.Now().AddDate(0, 0, -30).Format("2006-01-02")
	}
	if endDate == "" {
		endDate = time.Now().Format("2006-01-02")
	}

	type DailyStats struct {
		Date  string `json:"date"`
		Count int64  `json:"count"`
	}

	var stats []DailyStats
	config.DB.Model(&models.Booking{}).
		Select("date, COUNT(*) as count").
		Where("date BETWEEN ? AND ?", startDate, endDate).
		Group("date").
		Order("date").
		Scan(&stats)

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func GetProviderWorkload(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" {
		startDate = time.Now().AddDate(0, 0, -30).Format("2006-01-02")
	}
	if endDate == "" {
		endDate = time.Now().Format("2006-01-02")
	}

	type ProviderWorkload struct {
		ProviderID   uint   `json:"provider_id"`
		ProviderName string `json:"provider_name"`
		Count        int64  `json:"count"`
	}

	var stats []ProviderWorkload
	config.DB.Model(&models.Booking{}).
		Select("bookings.provider_id, providers.name as provider_name, COUNT(*) as count").
		Joins("LEFT JOIN providers ON providers.id = bookings.provider_id").
		Where("bookings.date BETWEEN ? AND ?", startDate, endDate).
		Group("bookings.provider_id").
		Order("count desc").
		Scan(&stats)

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func GetPopularServices(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" {
		startDate = time.Now().AddDate(0, 0, -30).Format("2006-01-02")
	}
	if endDate == "" {
		endDate = time.Now().Format("2006-01-02")
	}

	type ServiceStats struct {
		ServiceID   uint   `json:"service_id"`
		ServiceName string `json:"service_name"`
		Count       int64  `json:"count"`
		Revenue     float64 `json:"revenue"`
	}

	var stats []ServiceStats
	config.DB.Model(&models.Booking{}).
		Select("bookings.service_id, services.name as service_name, COUNT(*) as count, SUM(services.price) as revenue").
		Joins("LEFT JOIN services ON services.id = bookings.service_id").
		Where("bookings.date BETWEEN ? AND ?", startDate, endDate).
		Group("bookings.service_id").
		Order("count desc").
		Scan(&stats)

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

func GetOverview(c *gin.Context) {
	today := time.Now().Format("2006-01-02")

	var totalBookings int64
	config.DB.Model(&models.Booking{}).Count(&totalBookings)

	var todayBookings int64
	config.DB.Model(&models.Booking{}).Where("date = ?", today).Count(&todayBookings)

	var pendingBookings int64
	config.DB.Model(&models.Booking{}).Where("status = ?", 1).Count(&pendingBookings)

	var totalRevenue float64
	config.DB.Model(&models.Booking{}).
		Select("COALESCE(SUM(services.price), 0)").
		Joins("LEFT JOIN services ON services.id = bookings.service_id").
		Scan(&totalRevenue)

	var providerCount int64
	config.DB.Model(&models.Provider{}).Count(&providerCount)

	var serviceCount int64
	config.DB.Model(&models.Service{}).Count(&serviceCount)

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"total_bookings":   totalBookings,
			"today_bookings":   todayBookings,
			"pending_bookings": pendingBookings,
			"total_revenue":    totalRevenue,
			"provider_count":   providerCount,
			"service_count":    serviceCount,
		},
	})
}
