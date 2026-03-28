package repository

import (
	"context"
	"time"

	"github.com/arizaguaca/qhay-api/internal/domain"
	"github.com/arizaguaca/qhay-api/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) domain.OrderRepository {
	return &orderRepository{
		db: db,
	}
}

func (r *orderRepository) Create(ctx context.Context, order *domain.Order) error {
	var itemModels []mysql.OrderItemModel
	for _, item := range order.Items {
		itemModels = append(itemModels, mysql.OrderItemModel{
			ID:         item.ID,
			OrderID:    order.ID,
			MenuItemID: item.MenuItemID,
			Quantity:   item.Quantity,
			Price:      item.Price,
		})
	}

	model := mysql.OrderModel{
		ID:           order.ID,
		RestaurantID: order.RestaurantID,
		CustomerID:   order.CustomerID,
		TableNumber:  order.TableNumber,
		Status:       order.Status,
		TotalPrice:   order.TotalPrice,
		Items:        itemModels,
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *orderRepository) GetByID(ctx context.Context, id string) (*domain.Order, error) {
	var model mysql.OrderModel
	if err := r.db.WithContext(ctx).Preload("Items").First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	items := make([]*domain.OrderItem, 0, len(model.Items))
	for _, m := range model.Items {
		items = append(items, &domain.OrderItem{
			ID:         m.ID,
			OrderID:    m.OrderID,
			MenuItemID: m.MenuItemID,
			Quantity:   m.Quantity,
			Price:      m.Price,
		})
	}

	return &domain.Order{
		ID:           model.ID,
		RestaurantID: model.RestaurantID,
		CustomerID:   model.CustomerID,
		TableNumber:  model.TableNumber,
		Status:       model.Status,
		TotalPrice:   model.TotalPrice,
		Items:        items,
		CreatedAt:    time.UnixMilli(model.CreatedAt),
		UpdatedAt:    time.UnixMilli(model.UpdatedAt),
	}, nil
}

func (r *orderRepository) FetchByRestaurantID(ctx context.Context, restaurantID string) ([]*domain.Order, error) {
	var models []mysql.OrderModel
	if err := r.db.WithContext(ctx).Preload("Items").Where("restaurant_id = ?", restaurantID).Find(&models).Error; err != nil {
		return nil, err
	}

	orders := make([]*domain.Order, 0, len(models))
	for _, model := range models {
		items := make([]*domain.OrderItem, 0, len(model.Items))
		for _, m := range model.Items {
			items = append(items, &domain.OrderItem{
				ID:         m.ID,
				OrderID:    m.OrderID,
				MenuItemID: m.MenuItemID,
				Quantity:   m.Quantity,
				Price:      m.Price,
			})
		}

		orders = append(orders, &domain.Order{
			ID:           model.ID,
			RestaurantID: model.RestaurantID,
			CustomerID:   model.CustomerID,
			TableNumber:  model.TableNumber,
			Status:       model.Status,
			TotalPrice:   model.TotalPrice,
			Items:        items,
			CreatedAt:    time.UnixMilli(model.CreatedAt),
			UpdatedAt:    time.UnixMilli(model.UpdatedAt),
		})
	}

	return orders, nil
}


func (r *orderRepository) FetchByCustomerID(ctx context.Context, customerID string) ([]*domain.Order, error) {
	var models []mysql.OrderModel
	if err := r.db.WithContext(ctx).Preload("Items").Where("customer_id = ?", customerID).Find(&models).Error; err != nil {
		return nil, err
	}

	orders := make([]*domain.Order, 0, len(models))
	for _, model := range models {
		items := make([]*domain.OrderItem, 0, len(model.Items))
		for _, m := range model.Items {
			items = append(items, &domain.OrderItem{
				ID:         m.ID,
				OrderID:    m.OrderID,
				MenuItemID: m.MenuItemID,
				Quantity:   m.Quantity,
				Price:      m.Price,
			})
		}

		orders = append(orders, &domain.Order{
			ID:           model.ID,
			RestaurantID: model.RestaurantID,
			CustomerID:   model.CustomerID,
			TableNumber:  model.TableNumber,
			Status:       model.Status,
			TotalPrice:   model.TotalPrice,
			Items:        items,
			CreatedAt:    time.UnixMilli(model.CreatedAt),
			UpdatedAt:    time.UnixMilli(model.UpdatedAt),
		})
	}

	return orders, nil
}

func (r *orderRepository) UpdateStatus(ctx context.Context, id string, status string) error {

	return r.db.WithContext(ctx).Model(&mysql.OrderModel{}).Where("id = ?", id).Update("status", status).Error
}

func (r *orderRepository) Update(ctx context.Context, order *domain.Order) error {
	// Simple implementation for now
	return r.db.WithContext(ctx).Save(order).Error
}
