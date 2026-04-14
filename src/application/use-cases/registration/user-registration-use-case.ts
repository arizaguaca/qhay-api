import { Channel, EntityType } from "../../../domain/entities/verification-code";
import { Role, User } from "../../../domain/entities/user";
import { UserUseCaseImpl } from "../user-use-case-impl";
import { VerificationUseCase } from "../verification-use-case";

export class UserRegistrationUseCase {
  constructor(
    private userUseCase: UserUseCaseImpl,
    private verificationUseCase: VerificationUseCase
  ) {}

  async execute(user: User, channel: Channel): Promise<void> {
    // 1. Create user
    await this.userUseCase.create(user);

    // 2. Determine contact based on channel
    const contact = channel === Channel.EMAIL ? user.email : user.phone;

    // 3. Send verification code only if role is owner
    if (user.role === Role.OWNER) {
      await this.verificationUseCase.sendCode(contact, channel, EntityType.USER);
    }
  }
}
