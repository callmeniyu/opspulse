export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.log(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
