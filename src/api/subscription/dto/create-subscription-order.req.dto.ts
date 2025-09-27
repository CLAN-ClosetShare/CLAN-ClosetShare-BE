import { IsNotEmpty, IsString } from 'class-validator';

class CreateSubscriptionOrderReqDto {
  @IsString()
  @IsNotEmpty()
  subscription_plan_id: string;
}

export default CreateSubscriptionOrderReqDto;
