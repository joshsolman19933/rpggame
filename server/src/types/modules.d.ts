// Add type declarations for modules that don't have them
declare module 'bcryptjs' {
  export function compare(s: string, hash: string): Promise<boolean>;
  export function genSalt(rounds: number): Promise<string>;
  export function hash(s: string, salt: string): Promise<string>;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
    iat?: number;
    exp?: number;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: Secret,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): JwtPayload;
}
