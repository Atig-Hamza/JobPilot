export const getClientIp = (req) => {
  let ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket.remoteAddress ||
    '';
    
  if (ip.substr(0, 7) === "::ffff:") {
    ip = ip.substr(7);
  }
  return ip;
};
