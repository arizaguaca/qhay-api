package repository

import (
	"context"
	"errors"
	"sync"

	"github.com/arizaguaca/table/internal/domain"
)

type memoryTableRepository struct {
	mu     sync.RWMutex
	tables map[string]*domain.Table
}

// NewMemoryTableRepository crea un repositorio en memoria para Table
func NewMemoryTableRepository() domain.TableRepository {
	return &memoryTableRepository{
		tables: make(map[string]*domain.Table),
	}
}

func (m *memoryTableRepository) Create(ctx context.Context, table *domain.Table) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.tables[table.ID]; ok {
		return errors.New("table already exists")
	}

	m.tables[table.ID] = table
	return nil
}

func (m *memoryTableRepository) GetByID(ctx context.Context, id string) (*domain.Table, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	table, ok := m.tables[id]
	if !ok {
		return nil, errors.New("table not found")
	}

	return table, nil
}

func (m *memoryTableRepository) Fetch(ctx context.Context) ([]*domain.Table, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	res := make([]*domain.Table, 0, len(m.tables))
	for _, t := range m.tables {
		res = append(res, t)
	}

	return res, nil
}
