import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
export class Auth {
  @Field(() => User)
  user: User;

  @Field()
  accessToken: string;
}