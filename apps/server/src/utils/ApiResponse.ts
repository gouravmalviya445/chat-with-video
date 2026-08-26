class ApiResponse {
  public success: boolean;
  public error: any = [];
  public statusCode: number;
  public message: string;
  public data: any;

  constructor(
    statusCode: number,
    message: string = "Internal Server Error",
    data: any = null,
    error: any = null,
  ) {
    this.statusCode = statusCode;
    this.success = this.statusCode <= 400;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}

export { ApiResponse };