package main

import (
	"booking-system/config"
	"booking-system/handlers"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.InitDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for {
			handlers.CheckUpcomingReminders()
			<-ticker.C
		}
	}()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		services := api.Group("/services")
		{
			services.GET("", handlers.GetServices)
			services.GET("/:id", handlers.GetService)
			services.POST("", handlers.CreateService)
			services.PUT("/:id", handlers.UpdateService)
			services.DELETE("/:id", handlers.DeleteService)
		}

		providers := api.Group("/providers")
		{
			providers.GET("", handlers.GetProviders)
			providers.GET("/:id", handlers.GetProvider)
			providers.GET("/:id/services", handlers.GetProviderServices)
			providers.POST("", handlers.CreateProvider)
			providers.PUT("/:id", handlers.UpdateProvider)
			providers.POST("/:id/bind-services", handlers.BindServices)
			providers.DELETE("/:id", handlers.DeleteProvider)
		}

		schedules := api.Group("/schedules")
		{
			schedules.GET("", handlers.GetSchedules)
			schedules.GET("/available", handlers.GetAvailableSlots)
			schedules.POST("", handlers.CreateSchedule)
			schedules.POST("/batch", handlers.BatchCreateSchedule)
			schedules.DELETE("/:id", handlers.DeleteSchedule)
		}

		dayOffs := api.Group("/day-offs")
		{
			dayOffs.GET("", handlers.GetDayOffs)
			dayOffs.POST("", handlers.CreateDayOff)
			dayOffs.DELETE("/:id", handlers.DeleteDayOff)
		}

		bookings := api.Group("/bookings")
		{
			bookings.GET("", handlers.GetBookings)
			bookings.GET("/:id", handlers.GetBooking)
			bookings.POST("", handlers.CreateBooking)
			bookings.PUT("/:id", handlers.UpdateBooking)
			bookings.POST("/:id/cancel", handlers.CancelBooking)
			bookings.POST("/:id/reschedule", handlers.RescheduleBooking)
		}

		notifications := api.Group("/notifications")
		{
			notifications.GET("", handlers.GetNotifications)
			notifications.PUT("/:id/read", handlers.MarkNotificationRead)
		}

		stats := api.Group("/stats")
		{
			stats.GET("/overview", handlers.GetOverview)
			stats.GET("/daily-bookings", handlers.GetDailyBookings)
			stats.GET("/provider-workload", handlers.GetProviderWorkload)
			stats.GET("/popular-services", handlers.GetPopularServices)
		}
	}

	log.Println("Server starting on port 8765...")
	r.Run(":8765")
}
