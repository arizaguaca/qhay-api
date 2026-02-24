package repository

import (
	"context"
	"encoding/json"

	"github.com/arizaguaca/table/internal/domain"
	"github.com/arizaguaca/table/internal/infrastructure/mysql"
	"gorm.io/gorm"
)

type gormTableRepository struct {
	db *gorm.DB
}

// NewGormTableRepository crea un repositorio GORM para Table
func NewGormTableRepository(db *gorm.DB) domain.TableRepository {
	return &gormTableRepository{
		db: db,
	}
}

func (r *gormTableRepository) Create(ctx context.Context, table *domain.Table) error {
	columnsJSON, err := json.Marshal(table.Columns)
	if err != nil {
		return err
	}

	model := mysql.TableModel{
		ID:      table.ID,
		Name:    table.Name,
		Columns: string(columnsJSON),
	}

	return r.db.WithContext(ctx).Create(&model).Error
}

func (r *gormTableRepository) GetByID(ctx context.Context, id string) (*domain.Table, error) {
	var model mysql.TableModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, err
	}

	var columns []string
	if err := json.Unmarshal([]byte(model.Columns), &columns); err != nil {
		return nil, err
	}

	return &domain.Table{
		ID:      model.ID,
		Name:    model.Name,
		Columns: columns,
	}, nil
}

func (r *gormTableRepository) Fetch(ctx context.Context) ([]*domain.Table, error) {
	var models []mysql.TableModel
	if err := r.db.WithContext(ctx).Find(&models).Error; err != nil {
		return nil, err
	}

	tables := make([]*domain.Table, 0, len(models))
	for _, m := range models {
		var columns []string
		_ = json.Unmarshal([]byte(m.Columns), &columns)

		tables = append(tables, &domain.Table{
			ID:      m.ID,
			Name:    m.Name,
			Columns: columns,
		})
	}

	return tables, nil
}
