declare global {
  namespace Express {
    interface Request {
      storeId?: string; // or number if you store numeric IDs
      role?: string;
    }
  }
}

export {}; // 👈 required so this file is treated as a module
