export type ApiResponse =
  | Readonly<{
      status: number;
      success: boolean;
      data: Record<string, any> | string;
    }>
  | Readonly<{
      status: number;
      success: boolean;
      error: string;
    }>;
