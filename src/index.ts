import path from 'path';
import express from 'express';
import cors from 'cors';
import { loadConfig } from './config/config';
import { MySQLConnection } from './infrastructure/database/mysql-connection';
import { MySQLRestaurantRepository } from './infrastructure/database/mysql-restaurant-repository';
import { MySQLUserRepository } from './infrastructure/database/mysql-user-repository';
import { MySQLCustomerRepository } from './infrastructure/database/mysql-customer-repository';
import { MySQLMenuRepository } from './infrastructure/database/mysql-menu-repository';
import { MySQLOperatingHourRepository } from './infrastructure/database/mysql-operating-hour-repository';
import { MySQLOrderRepository } from './infrastructure/database/mysql-order-repository';
import { MySQLQRCodeRepository } from './infrastructure/database/mysql-qrcode-repository';
import { MySQLReservationRepository } from './infrastructure/database/mysql-reservation-repository';
import { MySQLVerificationRepository } from './infrastructure/database/mysql-verification-repository';
import { MySQLCategoryRepository } from './infrastructure/database/mysql-category-repository';
import { MySQLMallRepository } from './infrastructure/database/mysql-mall-repository';
import { MySQLCuisineTypeRepository } from './infrastructure/database/mysql-cuisine-type-repository';
import { MySQLCityRepository } from './infrastructure/database/mysql-city-repository';
import { MySQLOrderReviewRepository } from './infrastructure/database/mysql-order-review-repository';
import { MySQLOrderStatusHistoryRepository } from './infrastructure/database/mysql-order-status-history-repository';
import { MySQLCustomerFavoriteRepository } from './infrastructure/database/mysql-customer-favorite-repository';
import { MySQLNotificationSentLogRepository } from './infrastructure/database/mysql-notification-sent-log-repository';
import { RestaurantUseCaseImpl } from './application/use-cases/restaurant-use-case-impl';
import { UserUseCaseImpl } from './application/use-cases/user-use-case-impl';
import { CustomerUseCaseImpl } from './application/use-cases/customer-use-case-impl';
import { MenuUseCaseImpl } from './application/use-cases/menu-use-case-impl';
import { OperatingHourUseCaseImpl } from './application/use-cases/operating-hour-use-case-impl';
import { OrderUseCaseImpl } from './application/use-cases/order-use-case-impl';
import { QRCodeUseCaseImpl } from './application/use-cases/qrcode-use-case-impl';
import { ReservationUseCaseImpl } from './application/use-cases/reservation-use-case-impl';
import { VerificationUseCaseImpl } from './application/use-cases/verification-use-case-impl';
import { MallUseCase } from './application/use-cases/mall-use-case';
import { CuisineTypeUseCase } from './application/use-cases/cuisine-type-use-case';
import { CityUseCase } from './application/use-cases/city-use-case';
import { OrderReviewUseCaseImpl } from './application/use-cases/order-review-use-case-impl';
import { CustomerFavoriteUseCaseImpl } from './application/use-cases/customer-favorite-use-case-impl';
import { UserRegistrationUseCase } from './application/use-cases/registration/user-registration-use-case';
import { CustomerRegistrationUseCase } from './application/use-cases/registration/customer-registration-use-case';
import { RestaurantController } from './infrastructure/web/controllers/restaurant-controller';
import { UserController } from './infrastructure/web/controllers/user-controller';
import { CustomerController } from './infrastructure/web/controllers/customer-controller';
import { MenuController } from './infrastructure/web/controllers/menu-controller';
import { OperatingHourController } from './infrastructure/web/controllers/operating-hour-controller';
import { OrderController } from './infrastructure/web/controllers/order-controller';
import { QRCodeController } from './infrastructure/web/controllers/qrcode-controller';
import { ReservationController } from './infrastructure/web/controllers/reservation-controller';
import { VerificationController } from './infrastructure/web/controllers/verification-controller';
import { MallController } from './infrastructure/web/controllers/mall-controller';
import { CuisineTypeController } from './infrastructure/web/controllers/cuisine-type-controller';
import { CityController } from './infrastructure/web/controllers/city-controller';
import { OrderReviewController } from './infrastructure/web/controllers/order-review-controller';
import { CustomerFavoriteController } from './infrastructure/web/controllers/customer-favorite-controller';
import { createRestaurantRoutes } from './infrastructure/web/routes/restaurant-routes';
import { createUserRoutes } from './infrastructure/web/routes/user-routes';
import { createCustomerRoutes } from './infrastructure/web/routes/customer-routes';
import { createMenuRoutes } from './infrastructure/web/routes/menu-routes';
import { createOperatingHourRoutes } from './infrastructure/web/routes/operating-hour-routes';
import { createOrderRoutes } from './infrastructure/web/routes/order-routes';
import { createQRCodeRoutes } from './infrastructure/web/routes/qrcode-routes';
import { createReservationRoutes } from './infrastructure/web/routes/reservation-routes';
import { createVerificationRoutes } from './infrastructure/web/routes/verification-routes';
import { createMallRoutes } from './infrastructure/web/routes/mall-routes';
import { createCuisineTypeRoutes } from './infrastructure/web/routes/cuisine-type-routes';
import { createCityRoutes } from './infrastructure/web/routes/city-routes';
import { createOrderReviewRoutes } from './infrastructure/web/routes/order-review-routes';
import { createCustomerFavoriteRoutes } from './infrastructure/web/routes/customer-favorite-routes';
import { SMSNotification } from './infrastructure/notifications/sms-notification';
import { WSPNotification } from './infrastructure/notifications/wsp-notification';
import { EmailNotification } from './infrastructure/notifications/email-notification';
import { TemplateManager } from './infrastructure/notifications/template-manager';
import { UserLookupStrategy } from './application/strategies/user-lookup-strategy';
import { CustomerLookupStrategy } from './application/strategies/customer-lookup-strategy';

async function main() {
  const config = loadConfig();
  console.log(`Starting API in environment: [${config.appEnv}]`);

  // Setup Database
  const db = new MySQLConnection();
  const dbConfig = {
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    port: config.dbPort,
  };

  // Initialize database and tables if they don't exist
  await db.initializeDatabase(dbConfig);

  // Connect to the database
  await db.connect(dbConfig);

  // Setup Repositories
  const restaurantRepo = new MySQLRestaurantRepository(db);
  const userRepo = new MySQLUserRepository(db);
  const customerRepo = new MySQLCustomerRepository(db);
  const menuRepo = new MySQLMenuRepository(db);
  const operatingHourRepo = new MySQLOperatingHourRepository(db);
  const orderRepo = new MySQLOrderRepository(db);
  const qrCodeRepo = new MySQLQRCodeRepository(db);
  const reservationRepo = new MySQLReservationRepository(db);
  const verificationRepo = new MySQLVerificationRepository(db);
  const categoryRepo = new MySQLCategoryRepository(db);
  const mallRepo = new MySQLMallRepository(db);
  const cuisineTypeRepo = new MySQLCuisineTypeRepository(db);
  const cityRepo = new MySQLCityRepository(db);
  const orderReviewRepo = new MySQLOrderReviewRepository(db);
  const orderStatusHistoryRepo = new MySQLOrderStatusHistoryRepository(db);
  const customerFavoriteRepo = new MySQLCustomerFavoriteRepository(db);
  const notificationSentLogRepo = new MySQLNotificationSentLogRepository(db);

  // Setup Infrastructure
  const templateManager = new TemplateManager();
  const notificationProviders = [
    new SMSNotification(config, templateManager),
    new EmailNotification(config, templateManager),
    new WSPNotification(config, templateManager),
  ];

  // Setup Use Cases
  const restaurantUseCase = new RestaurantUseCaseImpl(restaurantRepo);
  const userUseCase = new UserUseCaseImpl(userRepo);
  const customerUseCase = new CustomerUseCaseImpl(customerRepo);
  const menuUseCase = new MenuUseCaseImpl(menuRepo, categoryRepo);
  const operatingHourUseCase = new OperatingHourUseCaseImpl(operatingHourRepo);
  const orderUseCase = new OrderUseCaseImpl(orderRepo);
  const qrCodeUseCase = new QRCodeUseCaseImpl(qrCodeRepo);
  const reservationUseCase = new ReservationUseCaseImpl(reservationRepo);
  const verificationStrategies = [
    new UserLookupStrategy(userRepo),
    new CustomerLookupStrategy(customerRepo),
  ];

  const verificationUseCase = new VerificationUseCaseImpl(
    verificationRepo,
    notificationProviders,
    verificationStrategies,
    config.verificationCodeExpirationMinutes
  );

  const userRegistrationUseCase = new UserRegistrationUseCase(userUseCase, verificationUseCase);
  const customerRegistrationUseCase = new CustomerRegistrationUseCase(customerUseCase, verificationUseCase);
  const mallUseCase = new MallUseCase(mallRepo);
  const cuisineTypeUseCase = new CuisineTypeUseCase(cuisineTypeRepo);
  const cityUseCase = new CityUseCase(cityRepo);
  const orderReviewUseCase = new OrderReviewUseCaseImpl(orderReviewRepo);
  const customerFavoriteUseCase = new CustomerFavoriteUseCaseImpl(customerFavoriteRepo);

  // Setup Controllers
  const restaurantController = new RestaurantController(restaurantUseCase);
  const userController = new UserController(userUseCase, userRegistrationUseCase);
  const customerController = new CustomerController(customerUseCase, customerRegistrationUseCase);
  const menuController = new MenuController(menuUseCase);
  const operatingHourController = new OperatingHourController(operatingHourUseCase);
  const orderController = new OrderController(orderUseCase);
  const qrCodeController = new QRCodeController(qrCodeUseCase);
  const reservationController = new ReservationController(reservationUseCase);
  const verificationController = new VerificationController(verificationUseCase);
  const mallController = new MallController(mallUseCase);
  const cuisineTypeController = new CuisineTypeController(cuisineTypeUseCase);
  const cityController = new CityController(cityUseCase);
  const orderReviewController = new OrderReviewController(orderReviewUseCase);
  const customerFavoriteController = new CustomerFavoriteController(customerFavoriteUseCase);

  // Setup Routes
  const app = express();
  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const apiPrefix = '/api/v1';
  app.use(`${apiPrefix}/restaurants`, createRestaurantRoutes(restaurantController));
  app.use(`${apiPrefix}/users`, createUserRoutes(userController));
  // legacy auth path from Go version
  app.post(`${apiPrefix}/auth/login`, userController.login.bind(userController));

  // direct user owner -> restaurants bridge route (compatibilidad con frontend /api/v1/users/:id/restaurants)
  app.get(`${apiPrefix}/users/:id/restaurants`, async (req, res) => {
    try {
      const ownerId = req.params.id;
      const restaurants = await restaurantUseCase.getByOwnerId(ownerId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.use(`${apiPrefix}/customers`, createCustomerRoutes(customerController));
  app.use(`${apiPrefix}/menus`, createMenuRoutes(menuController));
  app.use(`${apiPrefix}/operating-hours`, createOperatingHourRoutes(operatingHourController));
  app.use(`${apiPrefix}/orders`, createOrderRoutes(orderController));
  app.use(`${apiPrefix}/qrcodes`, createQRCodeRoutes(qrCodeController));
  app.use(`${apiPrefix}/reservations`, createReservationRoutes(reservationController));
  app.use(`${apiPrefix}/verification`, createVerificationRoutes(verificationController));
  app.use(`${apiPrefix}/malls`, createMallRoutes(mallController));
  app.use(`${apiPrefix}/cuisine-types`, createCuisineTypeRoutes(cuisineTypeController));
  app.use(`${apiPrefix}/cities`, createCityRoutes(cityController));
  app.use(`${apiPrefix}/order-reviews`, createOrderReviewRoutes(orderReviewController));
  app.use(`${apiPrefix}/favorites`, createCustomerFavoriteRoutes(customerFavoriteController));

  // Start Server
  const port = config.port;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch(console.error);