import mongoose, { Mongoose } from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a user Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a User Document
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // this is for ensureing that retun data is formated in the way we need. Suppress password , change id name etc.
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password; // json format will remove the password property
        delete ret.__v;
      },
    },
  }
);

// hash the password before saving
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    // to avoid rehashing of a already hashed password
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);

    done(); // Mongoose expexts this
  }
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

//E.g.
// const user = User.build({
//   email: 'asasa@aaa.com',
//   password: 'spdpd',
// });

export { User };
