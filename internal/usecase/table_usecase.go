package usecase

import (
	"context"
	"time"

	"github.com/arizaguaca/table/internal/domain"
)

type tableUsecase struct {
	tableRepo      domain.TableRepository
	contextTimeout time.Duration
}

// NewTableUsecase crea una nueva instancia del caso de uso de Table
func NewTableUsecase(tr domain.TableRepository, timeout time.Duration) domain.TableUsecase {
	return &tableUsecase{
		tableRepo:      tr,
		contextTimeout: timeout,
	}
}

func (u *tableUsecase) Create(ctx context.Context, table *domain.Table) error {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	table.CreatedAt = time.Now()
	table.UpdatedAt = time.Now()

	return u.tableRepo.Create(ctx, table)
}

func (u *tableUsecase) GetByID(ctx context.Context, id string) (*domain.Table, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.tableRepo.GetByID(ctx, id)
}

func (u *tableUsecase) Fetch(ctx context.Context) ([]*domain.Table, error) {
	ctx, cancel := context.WithTimeout(ctx, u.contextTimeout)
	defer cancel()

	return u.tableRepo.Fetch(ctx)
}
