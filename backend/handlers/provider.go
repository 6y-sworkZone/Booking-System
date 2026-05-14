package handlers

import (
	"booking-system/config"
	"booking-system/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateProviderRequest struct {
	Name   string `json:"name" binding:"required"`
	Phone  string `json:"phone"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
}

type UpdateProviderRequest struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Email  string `json:"email"`
	Avatar string `json:"avatar"`
	Status *int   `json:"status"`
}

type BindServiceRequest struct {
	ServiceIDs []uint `json:"service_ids" binding:"required"`
}

func GetProviders(c *gin.Context) {
	var providers []models.Provider
	config.DB.Find(&providers)
	c.JSON(http.StatusOK, gin.H{"data": providers})
}

func GetProvider(c *gin.Context) {
	var provider models.Provider
	if err := config.DB.First(&provider, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Provider not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": provider})
}

func GetProviderServices(c *gin.Context) {
	providerID := c.Param("id")
	var providerServices []models.ProviderService
	config.DB.Where("provider_id = ?", providerID).Find(&providerServices)

	var serviceIDs []uint
	for _, ps := range providerServices {
		serviceIDs = append(serviceIDs, ps.ServiceID)
	}

	var services []models.Service
	if len(serviceIDs) > 0 {
		config.DB.Where("id IN ?", serviceIDs).Find(&services)
	} else {
		services = []models.Service{}
	}

	c.JSON(http.StatusOK, gin.H{"data": services})
}

func CreateProvider(c *gin.Context) {
	var req CreateProviderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	provider := models.Provider{
		Name:   req.Name,
		Phone:  req.Phone,
		Email:  req.Email,
		Avatar: req.Avatar,
		Status: 1,
	}

	config.DB.Create(&provider)
	c.JSON(http.StatusCreated, gin.H{"data": provider})
}

func UpdateProvider(c *gin.Context) {
	var provider models.Provider
	if err := config.DB.First(&provider, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Provider not found"})
		return
	}

	var req UpdateProviderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		provider.Name = req.Name
	}
	if req.Phone != "" {
		provider.Phone = req.Phone
	}
	if req.Email != "" {
		provider.Email = req.Email
	}
	if req.Avatar != "" {
		provider.Avatar = req.Avatar
	}
	if req.Status != nil {
		provider.Status = *req.Status
	}

	config.DB.Save(&provider)
	c.JSON(http.StatusOK, gin.H{"data": provider})
}

func BindServices(c *gin.Context) {
	providerID := c.Param("id")
	
	var provider models.Provider
	if err := config.DB.First(&provider, providerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Provider not found"})
		return
	}

	var req BindServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Where("provider_id = ?", providerID).Delete(&models.ProviderService{})

	for _, serviceID := range req.ServiceIDs {
		ps := models.ProviderService{
			ProviderID: provider.ID,
			ServiceID:  serviceID,
		}
		config.DB.Create(&ps)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Services bound successfully"})
}

func DeleteProvider(c *gin.Context) {
	var provider models.Provider
	if err := config.DB.First(&provider, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Provider not found"})
		return
	}

	config.DB.Delete(&provider)
	config.DB.Where("provider_id = ?", provider.ID).Delete(&models.ProviderService{})
	c.JSON(http.StatusOK, gin.H{"message": "Provider deleted successfully"})
}
