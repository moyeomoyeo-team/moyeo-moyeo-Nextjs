type Config<Params = Record<string, string>> = { params: Params };

export const helper = <Params = Record<string, string>>(
  fn: (request: Request, config: Config<Params>) => unknown | Promise<unknown>,
) => {
  return async (request: Request, config: Config<Params>) => {
    try {
      const data = await fn(request, config);
      if (data == null) return Response.json({ message: 'success' });
      return Response.json(data);
    } catch (error) {
      console.error(error);
      return new Response('internal error', { status: 500 });
    }
  };
};
