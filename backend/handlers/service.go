package handlers

import (
	"booking-system/config"
	"booking-system/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateServiceRequest struct {
	Name        string  `json:"name" binding:"required"`
	Duration    int     `json:"duration" binding:"required,min=1"`
	Price       float64 `json:"price" binding:"required,min=0"`
	Description string  `json:"description"`
}

type UpdateServiceRequest struct {
	Name        string  `json:"name"`
	Duration    int     `json:"duration" binding:"omitempty,min=1"`
	Price       float64 `json:"price" binding:"omitempty,min=0"`
	Description string  `json:"description"`
}

func GetServices(c *gin.Context) {
	var services []models.Service
	config.DB.Find(&services)
	c.JSON(http.StatusOK, gin.H{"data": services})
}

func GetService(c *gin.Context) {
	var service models.Service
	if err := config.DB.First(&service, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": service})
}

func CreateService(c *gin.Context) {
	var req CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	service := models.Service{
		Name:        req.Name,
		Duration:    req.Duration,
		Price:       req.Price,
		Description: req.Description,
	}

	config.DB.Create(&service)
	c.JSON(http.StatusCreated, gin.H{"data": service})
}

func UpdateService(c *gin.Context) {
	var service models.Service
	if err := config.DB.First(&service, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	var req UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		service.Name = req.Name
	}
	if req.Duration > 0 {
		service.Duration = req.Duration
	}
	if req.Price > 0 {
		service.Price = req.Price
	}
	if req.Description != "" {
		service.Description = req.Description
	}

	config.DB.Save(&service)
	c.JSON(http.StatusOK, gin.H{"data": service})
}

func DeleteService(c *gin.Context) {
	var service models.Service
	if err := config.DB.First(&service, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	config.DB.Delete(&service)
	c.JSON(http.StatusOK, gin.H{"message": "Service deleted successfully"})
}
