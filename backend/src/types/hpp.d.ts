declare module 'hpp' {
  import { RequestHandler } from 'express';
  
  interface HppOptions {
    whitelist?: string[];
  }
  
  function hpp(options?: HppOptions): RequestHandler;
  export default hpp;
} 