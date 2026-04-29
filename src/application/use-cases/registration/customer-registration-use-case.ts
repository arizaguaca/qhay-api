import { Channel, EntityType } from "../../../domain/entities/verification-code";
import { Customer } from "../../../domain/entities/customer";
import { CustomerUseCaseImpl } from "../customer-use-case-impl";
import { VerificationUseCase } from "../verification-use-case";

export class CustomerRegistrationUseCase {
  constructor(
    private customerUseCase: CustomerUseCaseImpl,
    private verificationUseCase: VerificationUseCase
  ) {}

  async execute(customer: Customer, channel: Channel): Promise<void> {
    // 1. Verificar si el cliente ya existe por teléfono
    const existing = await this.customerUseCase.getByPhone(customer.phone);

    if (existing) {
      // 2. Si existe, actualizamos el nombre y enviamos el código
      existing.fullName = customer.fullName;
      await this.customerUseCase.update(existing);
    } else {
      // 3. Si no existe, creamos el nuevo cliente
      await this.customerUseCase.create(customer);
    }

    // 4. Enviar código de verificación
    await this.verificationUseCase.sendCode(customer.phone, channel, EntityType.CUSTOMER);
  }
}
