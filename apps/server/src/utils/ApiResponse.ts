class ApiResponse {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: Record<string, any> | null;

  constructor(
    statusCode: number,
    message: string = "Internal Server Error",
    data: Record<string, any> | null
  ) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };