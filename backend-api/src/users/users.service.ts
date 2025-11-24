import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}



  async findOne(email: string): Promise<UserDocument | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(email: string, pass: string): Promise<UserDocument> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(pass, salt);
    
    const newUser = new this.userModel({ email, password: hash });
    return newUser.save();
  }
}