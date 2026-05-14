package config

import (
	"booking-system/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() error {
	db, err := gorm.Open(sqlite.Open("booking.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	err = db.AutoMigrate(
		&models.Service{},
		&models.Provider{},
		&models.ProviderService{},
		&models.Schedule{},
		&models.DayOff{},
		&models.Booking{},
		&models.Notification{},
	)
	if err != nil {
		return err
	}

	DB = db
	return nil
}
