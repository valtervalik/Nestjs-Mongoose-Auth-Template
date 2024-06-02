import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Params } from 'src/base/base-interfaces';
import { HashingModule } from 'src/common/hashing/hashing.module';
import { HashingService } from 'src/common/hashing/hashing.service';
import { User, UserDocument, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: (hashingService: HashingService) => {
          const schema = UserSchema;

          schema.pre<UserDocument>('save', async function () {
            const doc = this;
            if (doc.password) {
              doc.password = await hashingService.hash(doc.password);
            }
          });

          schema.pre<UserDocument & Params>(
            'findOneAndUpdate',
            async function () {
              const doc = this._update;

              if (doc.password) {
                doc.password = await hashingService.hash(doc.password);
              }
            },
          );
          return schema;
        },
        imports: [HashingModule],
        inject: [HashingService],
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [MongooseModule, UsersService],
})
export class UsersModule {}
