package mysql

type UserModel struct {
	ID           string `gorm:"primaryKey;type:varchar(36)"`
	Name         string `gorm:"type:varchar(255)"`
	Email        string `gorm:"uniqueIndex;type:varchar(255)"`
	Phone        string `gorm:"index;type:varchar(20)"`
	Password     string `gorm:"type:varchar(255)"`
	Role         string `gorm:"type:varchar(50)"`
	RestaurantID string `gorm:"index;type:varchar(36)"`
	IsVerified   bool   `gorm:"default:false"`
	CreatedAt    int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt    int64  `gorm:"autoUpdateTime:milli"`
}


func (UserModel) TableName() string {
	return "users"
}

type RestaurantModel struct {
	ID          string `gorm:"primaryKey;type:varchar(36)"`
	Name        string `gorm:"type:varchar(255)"`
	Description string `gorm:"type:text"`
	Address     string `gorm:"type:varchar(255)"`
	Phone       string `gorm:"type:varchar(20)"`
	OwnerID     string `gorm:"index;type:varchar(36)"`
	LogoURL     string `gorm:"type:varchar(255)"`
	CreatedAt   int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt   int64  `gorm:"autoUpdateTime:milli"`
}

func (RestaurantModel) TableName() string {
	return "restaurants"
}

type MenuItemModel struct {
	ID           string  `gorm:"primaryKey;type:varchar(36)"`
	RestaurantID string  `gorm:"index;type:varchar(36)"`
	Name         string  `gorm:"type:varchar(255)"`
	Description  string  `gorm:"type:text"`
	Price        float64 `gorm:"type:decimal(10,2)"`
	PrepTime     int     `gorm:"type:int"`
	ImageURL     string  `gorm:"type:varchar(255)"`
	IsAvailable  bool    `gorm:"default:true"`
	CreatedAt    int64   `gorm:"autoCreateTime:milli"`
	UpdatedAt    int64   `gorm:"autoUpdateTime:milli"`
}

func (MenuItemModel) TableName() string {
	return "menu_items"
}

type QRCodeModel struct {
	ID           string `gorm:"primaryKey;type:varchar(36)"`
	RestaurantID string `gorm:"index;type:varchar(36)"`
	TableNumber  int    `gorm:"type:int"`
	Label        string `gorm:"type:varchar(100)"`
	Code         string `gorm:"type:varchar(255)"`
	IsActive     bool   `gorm:"default:true"`
	CreatedAt    int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt    int64  `gorm:"autoUpdateTime:milli"`
}

func (QRCodeModel) TableName() string {
	return "qrcodes"
}

type OperatingHourModel struct {
	ID           string `gorm:"primaryKey;type:varchar(36)"`
	RestaurantID string `gorm:"index;type:varchar(36)"`
	DayOfWeek    int    `gorm:"type:int"`
	OpenTime     string `gorm:"type:varchar(5)"`
	CloseTime    string `gorm:"type:varchar(5)"`
	IsClosed     bool   `gorm:"default:false"`
	CreatedAt    int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt    int64  `gorm:"autoUpdateTime:milli"`
}

func (OperatingHourModel) TableName() string {
	return "operating_hours"
}

type VerificationCodeModel struct {
	ID        string `gorm:"primaryKey;type:varchar(36)"`
	Phone     string `gorm:"index;type:varchar(20)"`
	Code      string `gorm:"type:varchar(6)"`
	ExpiresAt int64  `gorm:"type:bigint"`
	CreatedAt int64  `gorm:"autoCreateTime:milli"`
}

func (VerificationCodeModel) TableName() string {
	return "verification_codes"
}

type ReservationModel struct {
	ID              string `gorm:"primaryKey;type:varchar(36)"`
	UserID          string `gorm:"index;type:varchar(36)"`
	RestaurantID    string `gorm:"index;type:varchar(36)"`
	TableNumber     int    `gorm:"type:int"`
	ReservationDate int64  `gorm:"type:bigint"`
	Guests          int    `gorm:"type:int"`
	Status          string `gorm:"type:varchar(20);default:'pending'"`
	CreatedAt       int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt       int64  `gorm:"autoUpdateTime:milli"`
}

func (ReservationModel) TableName() string {
	return "reservations"
}

type OrderModel struct {
	ID           string           `gorm:"primaryKey;type:varchar(36)"`
	RestaurantID string           `gorm:"index;type:varchar(36)"`
	CustomerID   string           `gorm:"index;type:varchar(36)"`
	TableNumber  int              `gorm:"type:int"`
	Status       string           `gorm:"type:varchar(20);default:'pending'"`
	TotalPrice   float64          `gorm:"type:decimal(10,2)"`
	CreatedAt    int64            `gorm:"autoCreateTime:milli"`
	UpdatedAt    int64            `gorm:"autoUpdateTime:milli"`
	Items        []OrderItemModel `gorm:"foreignKey:OrderID"`
	Customer     CustomerModel    `gorm:"foreignKey:CustomerID"`
}



func (OrderModel) TableName() string {
	return "orders"
}

type OrderItemModel struct {
	ID         string  `gorm:"primaryKey;type:varchar(36)"`
	OrderID    string  `gorm:"index;type:varchar(36)"`
	MenuItemID string  `gorm:"index;type:varchar(36)"`
	Quantity   int     `gorm:"type:int"`
	Price      float64 `gorm:"type:decimal(10,2)"`
}

func (OrderItemModel) TableName() string {
	return "order_items"
}

type CustomerModel struct {
	ID        string `gorm:"primaryKey;type:varchar(36)"`
	Name      string `gorm:"type:varchar(255)"`
	Phone     string `gorm:"uniqueIndex;type:varchar(20)"`
	IsActive  bool   `gorm:"default:true"`
	CreatedAt int64  `gorm:"autoCreateTime:milli"`
	UpdatedAt int64  `gorm:"autoUpdateTime:milli"`
}

func (CustomerModel) TableName() string {
	return "customers"
}


