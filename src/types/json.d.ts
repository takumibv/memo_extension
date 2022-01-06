declare module "*/messages.json" {
  type Message = {
    [key: string]: {
      message: string;
      description?: string;
    };
  };
  const value: Message;
  export = value;
}
