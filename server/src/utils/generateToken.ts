import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const generateToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: '30d',
    } as SignOptions
  );
};

export default generateToken;
