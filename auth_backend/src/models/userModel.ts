import crypto from 'crypto';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { model, Query, Schema } from 'mongoose';
import { HydratedDocument } from 'mongoose';

// 1. Interface for the document data
interface IUser {
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  active: boolean;
}

// 2. Define model methods
interface IUserMethods {
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  correctPassword(candidatePwd: string): Promise<boolean>;
}

// 3. Combine the interfaces to create the final document type
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

// 4. Create mongoose schema
const userSchema = new Schema<IUser, {}, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address.'],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId && !this.githubId;
      },
      minlength: 8,
      select: false,
      validate: {
        validator: function (val: string): boolean {
          return validator.isStrongPassword(val, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          'Password must be 8 characters or more and include an uppercase letter, lowercase letter, number, and symbol.',
      },
    },
    googleId: {
      type: String,
      required: function (this: IUser) {
        return !this.password && !this.githubId;
      },
      unique: true,
      sparse: true,
    },
    githubId: {
      type: String,
      required: function (this: IUser) {
        return !this.password && !this.googleId;
      },
      unique: true,
      sparse: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: String,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// --- Mongoose Middleware ---

// Hash the password and the refreshToken before saving
userSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('refreshToken') && this.refreshToken) {
    this.refreshToken = await bcrypt.hash(this.refreshToken, 12);
  }
  next();
});

// Set passwordChangedAt slightly in the past to prevent JWT issues
userSchema.pre<UserDocument>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Filter out inactive users from all find queries
userSchema.pre<Query<any, IUser>>(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// --- Instance Methods ---

// Compare the entered password with the user's hashed password in the DB
userSchema.methods.correctPassword = async function (
  candidatePwd: string,
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePwd, this.password);
};

// Check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token and expiry
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

export const User = model<IUser>('User', userSchema);
