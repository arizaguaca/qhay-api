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
    // 1. Create customer
    await this.customerUseCase.create(customer);

    // 2. Send verification code
    await this.verificationUseCase.sendCode(customer.phone, channel, EntityType.CUSTOMER);
  }
}
