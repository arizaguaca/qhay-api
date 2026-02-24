package mysql

type TableModel struct {
	ID        string `gorm:"primaryKey"`
	Name      string
	Columns   string // Guardamos como string (JSON)
	CreatedAt int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt int64  `gorm:"autoUpdateTime:milli"`
}

func (TableModel) TableName() string {
	return "tables"
}
