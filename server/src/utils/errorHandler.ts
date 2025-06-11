class ErrorResponse extends Error {
  statusCode: number;
  code?: number;
  errors?: any;

  constructor(message: string, statusCode: number, code?: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;

    // Ensure the correct prototype is set
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }
}

export default ErrorResponse;
